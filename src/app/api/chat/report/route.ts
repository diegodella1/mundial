import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  // 1. Parse body
  let body: { message_id: string; match_id: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { message_id, match_id } = body;
  if (!message_id || !match_id) {
    return NextResponse.json(
      { error: "message_id and match_id are required" },
      { status: 400 }
    );
  }

  // 2. Auth check
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[]
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

  // 3. Insert report (DB trigger check_auto_ban handles auto-ban logic)
  const { error: insertError } = await supabaseAdmin
    .from("chat_reports")
    .insert({
      message_id,
      reporter_id: user.id,
      match_id,
    });

  if (insertError) {
    // Unique constraint = already reported
    if (insertError.code === "23505") {
      return NextResponse.json(
        { error: "Already reported" },
        { status: 409 }
      );
    }
    console.error("Failed to insert chat report:", insertError.message);
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
