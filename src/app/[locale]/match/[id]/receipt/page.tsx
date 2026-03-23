import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { generateReceiptData, type ReceiptData } from "@/lib/receipts";
import ReceiptCard from "@/components/receipt/ReceiptCard";

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id: matchId } = await params;
  const supabase = await createClient();

  // 1. Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}`);
  }

  // 2. Check match exists and is finished
  const { data: match } = await supabase
    .from("matches")
    .select("id, status, home_team, away_team")
    .eq("id", matchId)
    .single();

  if (!match) {
    notFound();
  }

  if (match.status !== "finished") {
    redirect(`/${locale}/match/${matchId}`);
  }

  // 3. Try to get cached receipt
  let receiptData: ReceiptData | null = null;

  const { data: existingReceipt } = await supabaseAdmin
    .from("receipts")
    .select("data")
    .eq("user_id", user.id)
    .eq("match_id", matchId)
    .single();

  if (existingReceipt?.data) {
    receiptData = existingReceipt.data as ReceiptData;
  } else {
    // Check user has reactions
    const { count } = await supabaseAdmin
      .from("reactions")
      .select("id", { count: "exact", head: true })
      .eq("match_id", matchId)
      .eq("user_id", user.id);

    if (!count || count === 0) {
      // No reactions, show message
      return (
        <div className="flex flex-col items-center justify-center min-h-screen pt-14 px-4">
          <div className="text-center">
            <p className="text-zinc-400 text-lg mb-2">
              No reaccionaste en este partido
            </p>
            <a
              href={`/${locale}`}
              className="text-orange-400 hover:text-orange-300 text-sm underline"
            >
              Volver al inicio
            </a>
          </div>
        </div>
      );
    }

    // Generate receipt on the fly
    try {
      receiptData = await generateReceiptData(supabaseAdmin, user.id, matchId);

      // Cache it
      await supabaseAdmin.from("receipts").upsert(
        {
          user_id: user.id,
          match_id: matchId,
          data: receiptData,
        },
        { onConflict: "user_id,match_id" }
      );
    } catch (err) {
      console.error("[receipt-page] Generation failed:", err);
      return (
        <div className="flex flex-col items-center justify-center min-h-screen pt-14 px-4">
          <div className="text-center">
            <p className="text-zinc-400 text-lg">
              Error al generar tu receipt
            </p>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen pt-14 pb-8 px-4">
      <ReceiptCard data={receiptData} matchId={matchId} />

      <a
        href={`/${locale}`}
        className="mt-6 text-zinc-500 hover:text-zinc-400 text-sm underline"
      >
        Volver al inicio
      </a>
    </div>
  );
}
