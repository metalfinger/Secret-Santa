import type { Participant } from '../data/participants'

export function LeaderboardMini({
  leaderboard,
}: {
  leaderboard: Array<{ participant: Participant; bestScore: number | null }>
}) {
  const top = leaderboard.slice(0, 5)
  const leader = top[0]

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="rounded-3xl bg-white/6 p-4 ring-1 ring-white/10 backdrop-blur">
        <div className="flex flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
          <div>
            <div className="text-xs font-medium tracking-wide text-white/60">Leaderboard</div>
            <div className="mt-1 text-base font-semibold">
              {leader?.participant?.name ? (
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

          <div className="text-xs text-white/60">Top 5</div>
        </div>

        {top.length ? (
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {top.map((row, i) => (
              <div
                key={row.participant.id}
                className="flex items-center justify-between rounded-2xl bg-white/5 px-3 py-2 ring-1 ring-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 text-center text-xs text-white/55">{i + 1}</div>
                  <div className="text-sm font-medium text-white/90">{row.participant.name}</div>
                </div>
                <div className="text-sm font-semibold text-white">{row.bestScore}</div>
              </div>
            ))}
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
