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
          <img
            src={avatarUrl}
            alt=""
            className="h-20 w-20 rounded-full ring-2 ring-zinc-700"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="h-20 w-20 rounded-full bg-zinc-800 flex items-center justify-center">
            <span className="text-2xl text-zinc-500">
              {displayName.charAt(0).toUpperCase()}
            </span>
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
      <div className="flex gap-8 mb-8">
        <div className="text-center">
          <p className="text-2xl font-bold text-white">
            {totalReactions.toLocaleString("es-AR")}
          </p>
          <p className="text-xs text-zinc-500 uppercase tracking-wider">
            Reacciones
          </p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{receipts.length}</p>
          <p className="text-xs text-zinc-500 uppercase tracking-wider">
            Partidos
          </p>
        </div>
      </div>

      {/* Receipt history */}
      <div className="w-full max-w-md">
        <h2 className="text-sm uppercase tracking-widest text-zinc-500 mb-3">
          Tus receipts
        </h2>

        {receipts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-zinc-600 text-sm">
              Todavia no tenes receipts. Reacciona en un partido para obtener
              tu primer receipt.
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
                  className="block rounded-xl bg-zinc-900 border border-zinc-800 p-4 transition hover:border-zinc-700 hover:bg-zinc-800/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {r.topEmoji && (
                        <span className="text-2xl">{r.topEmoji}</span>
                      )}
                      <div>
                        <p className="text-sm text-white font-medium">
                          {r.homeCode} {r.homeScore} - {r.awayScore} {r.awayCode}
                        </p>
                        <p className="text-[10px] text-zinc-500">{date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-zinc-400 font-mono">
                        x{r.totalUserReactions}
                      </p>
                      <p className="text-[10px] text-zinc-600">reacciones</p>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
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
