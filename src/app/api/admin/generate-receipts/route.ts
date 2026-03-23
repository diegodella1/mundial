import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { generateReceiptData } from "@/lib/receipts";

export async function POST(request: NextRequest) {
  // 1. Auth: verify admin
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[]
        ) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check admin
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 2. Parse body
  let body: { match_id: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { match_id } = body;
  if (!match_id) {
    return NextResponse.json(
      { error: "match_id is required" },
      { status: 400 }
    );
  }

  // 3. Verify match is finished
  const { data: match } = await supabaseAdmin
    .from("matches")
    .select("status")
    .eq("id", match_id)
    .single();

  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  if (match.status !== "finished") {
    return NextResponse.json(
      { error: "Match not finished yet" },
      { status: 400 }
    );
  }

  // 4. Get all unique users who reacted in this match
  const { data: userRows } = await supabaseAdmin
    .from("reactions")
    .select("user_id")
    .eq("match_id", match_id);

  const uniqueUserIds = [...new Set((userRows ?? []).map((r) => r.user_id))];

  if (uniqueUserIds.length === 0) {
    return NextResponse.json({
      ok: true,
      generated: 0,
      message: "No reactions found for this match",
    });
  }

  // 5. Check which users already have receipts
  const { data: existingReceipts } = await supabaseAdmin
    .from("receipts")
    .select("user_id")
    .eq("match_id", match_id);

  const existingUserIds = new Set(
    (existingReceipts ?? []).map((r) => r.user_id)
  );
  const missingUserIds = uniqueUserIds.filter((id) => !existingUserIds.has(id));

  if (missingUserIds.length === 0) {
    return NextResponse.json({
      ok: true,
      generated: 0,
      total: uniqueUserIds.length,
      message: "All receipts already generated",
    });
  }

  // 6. Generate receipts for missing users
  let generated = 0;
  let errors = 0;

  for (const userId of missingUserIds) {
    try {
      const receiptData = await generateReceiptData(
        supabaseAdmin,
        userId,
        match_id
      );

      await supabaseAdmin.from("receipts").upsert(
        {
          user_id: userId,
          match_id: match_id,
          data: receiptData,
        },
        { onConflict: "user_id,match_id" }
      );

      generated++;
    } catch (err) {
      console.error(
        `[generate-receipts] Failed for user ${userId}:`,
        err
      );
      errors++;
    }
  }

  return NextResponse.json({
    ok: true,
    generated,
    errors,
    total: uniqueUserIds.length,
    alreadyExisted: existingUserIds.size,
  });
}
