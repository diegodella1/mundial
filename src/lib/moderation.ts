import { supabaseAdmin } from "./supabase/admin";

let blockedWords: string[] = [];
let lastFetch = 0;

// Refresh blocked words cache every 60 seconds
async function getBlockedWords(): Promise<string[]> {
  if (Date.now() - lastFetch > 60_000) {
    const { data } = await supabaseAdmin.from("blocked_words").select("word");
    blockedWords = (data || []).map((w) => w.word.toLowerCase());
    lastFetch = Date.now();
  }
  return blockedWords;
}

export async function containsBlockedWord(text: string): Promise<boolean> {
  const words = await getBlockedWords();
  const lower = text.toLowerCase();
  return words.some((w) => lower.includes(w));
}
