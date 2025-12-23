import type { Participant } from '../data/participants'
import { useRankMemes } from '../lib/leaderboardMemes'

export function LeaderboardMini({
  leaderboard,
}: {
  leaderboard: Array<{
    participant: Participant
    bestScore: number | null
    memeUrl?: string | null
    memeTinyUrl?: string | null
  }>
}) {
  const rankMemes = useRankMemes()
  const leader = leaderboard[0]

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="rounded-3xl bg-white/6 p-4 ring-1 ring-white/10 backdrop-blur">
        <div className="flex flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
          <div>
            <div className="text-xs font-medium tracking-wide text-white/60">Leaderboard</div>
            <div className="mt-1 text-base font-semibold">
              {leader?.participant?.name && leader.bestScore !== null ? (
                <>
                  Leading: <span className="text-emerald-200">{leader.participant.name}</span>
                  <span className="text-white/60"> — </span>
                  <span className="text-white">{leader.bestScore}</span>
                </>
              ) : (
                <span className="text-white/75">No scores yet</span>
              )}
            </div>
          </div>

          <div className="text-xs text-white/60">All players</div>
        </div>

        {leaderboard.length ? (
          <div className="mt-3 max-h-[28rem] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 gap-3">
            {leaderboard.map((row, i) => (
              (() => {
                const rank = i + 1
                const meme = rankMemes[rank] ?? null
                const chosen = row.memeTinyUrl || row.memeUrl
                return (
              <div
                key={row.participant.id}
                className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/10"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="h-20 w-20 overflow-hidden rounded-2xl bg-white/5 p-1 ring-1 ring-white/10">
                    {chosen ? (
                      <img
                        src={chosen}
                        alt={`${row.participant.name} meme`}
                        className="h-full w-full object-contain"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : meme ? (
                      <img
                        src={meme.src}
                        alt={meme.alt}
                        className="h-full w-full object-contain"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-3xl text-white/40">
                        🎭
                      </div>
                    )}
                  </div>
                  <div className="w-6 text-center text-sm text-white/60">{rank}</div>
                  <div className="min-w-0 text-base font-semibold text-white/90 truncate">{row.participant.name}</div>
                </div>
                <div className="text-base font-semibold text-white">
                  {row.bestScore === null ? '—' : row.bestScore}
                </div>
              </div>
                )
              })()
            ))}
            </div>
          </div>
        ) : (
          <div className="mt-3 text-sm text-white/60">
            Play once to create the first score.
          </div>
        )}
      </div>
    </div>
  )
}
