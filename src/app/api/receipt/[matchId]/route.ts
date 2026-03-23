import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { generateReceiptData } from "@/lib/receipts";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params;

  // 1. Auth: get user from cookies
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

  // 2. Check if receipt already exists (cached)
  const { data: existingReceipt } = await supabaseAdmin
    .from("receipts")
    .select("data")
    .eq("user_id", user.id)
    .eq("match_id", matchId)
    .single();

  if (existingReceipt?.data) {
    return NextResponse.json(existingReceipt.data);
  }

  // 3. Verify match exists and is finished
  const { data: match } = await supabaseAdmin
    .from("matches")
    .select("status")
    .eq("id", matchId)
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

  // 4. Check user has reactions for this match
  const { count } = await supabaseAdmin
    .from("reactions")
    .select("id", { count: "exact", head: true })
    .eq("match_id", matchId)
    .eq("user_id", user.id);

  if (!count || count === 0) {
    return NextResponse.json(
      { error: "No reactions found for this match" },
      { status: 404 }
    );
  }

  // 5. Generate receipt data
  try {
    const receiptData = await generateReceiptData(
      supabaseAdmin,
      user.id,
      matchId
    );

    // 6. Cache in DB
    await supabaseAdmin.from("receipts").upsert(
      {
        user_id: user.id,
        match_id: matchId,
        data: receiptData,
      },
      { onConflict: "user_id,match_id" }
    );

    return NextResponse.json(receiptData);
  } catch (err) {
    console.error("[receipt] Generation failed:", err);
    return NextResponse.json(
      { error: "Failed to generate receipt" },
      { status: 500 }
    );
  }
}
