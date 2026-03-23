"use client";

interface ReceiptSummary {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  homeCode: string;
  awayCode: string;
  homeScore: number;
  awayScore: number;
  kickoffAt: string;
  topEmoji: string;
  totalUserReactions: number;
}

interface ProfileData {
  displayName: string;
  avatarUrl: string | null;
  countryCode: string | null;
  totalReactions: number;
  receipts: ReceiptSummary[];
}

export default function ProfileClient({
  data,
  locale,
}: {
  data: ProfileData;
  locale: string;
}) {
  const { displayName, avatarUrl, countryCode, totalReactions, receipts } = data;

  return (
    <div className="flex flex-col items-center min-h-screen pt-20 pb-8 px-4">
      {/* User info */}
      <div className="flex flex-col items-center gap-3 mb-8">
        {avatarUrl ? (
          <div className="rounded-full p-[2px] bg-gradient-to-br from-orange-500 via-purple-500 to-pink-500">
            <img
              src={avatarUrl}
              alt=""
              className="h-20 w-20 rounded-full ring-2 ring-zinc-950"
              referrerPolicy="no-referrer"
            />
          </div>
        ) : (
          <div className="rounded-full p-[2px] bg-gradient-to-br from-orange-500 via-purple-500 to-pink-500">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center ring-2 ring-zinc-950">
              <span className="text-2xl font-bold text-white">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        )}

        <h1 className="text-xl font-bold text-white">{displayName}</h1>

        {countryCode && (
          <span className="text-sm text-zinc-400 uppercase tracking-widest">
            {countryCode}
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="flex gap-4 mb-8 w-full max-w-md justify-center">
        <div className="bg-zinc-900 border border-zinc-800/50 rounded-xl px-6 py-3 text-center flex-1 max-w-[160px]">
          <p className="text-2xl font-bold text-white">
            {totalReactions.toLocaleString("es-AR")}
          </p>
          <p className="text-[11px] text-zinc-500 uppercase tracking-wider">
            Reacciones
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800/50 rounded-xl px-6 py-3 text-center flex-1 max-w-[160px]">
          <p className="text-2xl font-bold text-white">{receipts.length}</p>
          <p className="text-[11px] text-zinc-500 uppercase tracking-wider">
            Partidos
          </p>
        </div>
      </div>

      {/* Receipt history */}
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="text-sm uppercase tracking-widest text-zinc-500 mb-3">
            Tus receipts
          </h2>

          {receipts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-5xl mb-4">🧾</p>
              <p className="text-zinc-400 text-sm font-medium mb-1">
                Todavia no tenes receipts
              </p>
              <p className="text-zinc-600 text-xs">
                Reacciona en un partido para obtener tu primer receipt.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {receipts.map((r) => {
                const date = new Date(r.kickoffAt).toLocaleDateString("es-AR", {
                  day: "numeric",
                  month: "short",
                });

                return (
                  <a
                    key={r.matchId}
                    href={`/${locale}/match/${r.matchId}/receipt`}
                    className="group block rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-800/50 hover:-translate-y-0.5"
                  >
                    <div className="flex items-center">
                      {/* Gradient left border */}
                      <div className="w-1 self-stretch bg-gradient-to-b from-orange-500 to-pink-500 shrink-0" />
                      <div className="flex items-center justify-between flex-1 p-4">
                        <div className="flex items-center gap-3">
                          {r.topEmoji && (
                            <span className="text-2xl">{r.topEmoji}</span>
                          )}
                          <div>
                            <p className="text-sm text-white font-medium">
                              {r.homeCode}{" "}
                              <span className="text-base font-bold">{r.homeScore}</span>
                              {" - "}
                              <span className="text-base font-bold">{r.awayScore}</span>
                              {" "}{r.awayCode}
                            </p>
                            <p className="text-[10px] text-zinc-500">{date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm text-zinc-400 font-mono">
                              x{r.totalUserReactions}
                            </p>
                            <p className="text-[10px] text-zinc-600">reacciones</p>
                          </div>
                          {/* Arrow */}
                          <svg
                            className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Back link */}
      <a
        href={`/${locale}`}
        className="mt-8 text-zinc-500 hover:text-zinc-400 text-sm underline"
      >
        Volver al inicio
      </a>
    </div>
  );
}
