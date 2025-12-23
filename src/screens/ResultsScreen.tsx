import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import type { Participant } from '../data/participants'
import { Button } from '../components/Button'
import { HolidayCard } from '../components/HolidayCard'

export type GameResult = {
  score: number
  moves: number
  seconds: number
}

export function ResultsScreen({
  participant,
  result,
  leaderboard,
  assignedRecipient,
  onPlayAgain,
}: {
  participant: Participant | null
  result: GameResult | null
  leaderboard: Array<{ participant: Participant; bestScore: number | null }>
  assignedRecipient: Participant | null
  onPlayAgain: () => void
}) {
  const [revealOpen, setRevealOpen] = useState(false)
  const [confirm, setConfirm] = useState(false)

  const yourName = participant?.name ?? 'Player'

  const rank = useMemo(() => {
    if (!participant) return null
    const idx = leaderboard.findIndex((r) => r.participant.id === participant.id)
    if (idx === -1) return null
    return idx + 1
  }, [leaderboard, participant])

  return (
    <div className="mx-auto w-full max-w-4xl">
      <HolidayCard>
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-semibold">Nice work, {yourName}</h2>
            <p className="mt-2 text-sm text-white/75">Here’s your result and the current leaderboard.</p>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-emerald-500/10 px-4 py-3 ring-1 ring-emerald-200/20">
                <div className="text-xs text-white/70">Score</div>
                <div className="text-lg font-semibold">{result?.score ?? '—'}</div>
              </div>
              <div className="rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/15">
                <div className="text-xs text-white/70">Time</div>
                <div className="text-lg font-semibold">{result ? `${result.seconds}s` : '—'}</div>
              </div>
              <div className="rounded-2xl bg-red-500/10 px-4 py-3 ring-1 ring-red-200/20">
                <div className="text-xs text-white/70">Moves</div>
                <div className="text-lg font-semibold">{result?.moves ?? '—'}</div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
              <Button variant="primary" onClick={onPlayAgain}>
                Play again
              </Button>

              <Button
                variant="reveal"
                onClick={() => {
                  setRevealOpen(true)
                  setConfirm(false)
                }}
              >
                <span className="text-lg">🎁</span>
                Reveal my Secret Santa
              </Button>

              {rank ? (
                <div className="flex items-center rounded-2xl bg-white/5 px-4 py-3 text-sm ring-1 ring-white/15">
                  <span className="text-white/80">Rank</span>
                  <span className="ml-2 font-semibold">#{rank}</span>
                </div>
              ) : null}
            </div>

            <p className="mt-4 text-xs text-white/70">
              (Note) This app is a fun office game. If someone opens DevTools they could inspect the assignment.
            </p>
          </div>

          <div className="w-full md:max-w-sm">
            <div className="rounded-3xl bg-white/10 p-5 ring-1 ring-white/15">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Leaderboard</h3>
                <div className="text-xs text-white/70">Best score</div>
              </div>

              <div className="mt-3 space-y-2">
                {leaderboard.length === 0 ? (
                  <div className="text-sm text-white/70">No scores yet.</div>
                ) : (
                  leaderboard.slice(0, 10).map((row, i) => (
                    <div
                      key={row.participant.id}
                      className="flex items-center justify-between rounded-2xl bg-white/10 px-3 py-2 ring-1 ring-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 text-center text-sm text-white/70">{i + 1}</div>
                        <div className="font-medium">{row.participant.name}</div>
                      </div>
                      <div className="font-semibold">{row.bestScore}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </HolidayCard>

      <AnimatePresence>
        {revealOpen ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-lg rounded-3xl bg-neutral-950/80 p-6 text-white shadow-2xl shadow-black/30 ring-1 ring-white/15 backdrop-blur"
              initial={{ scale: 0.98, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.98, y: 10, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">Secret Santa Reveal</h3>
                  <p className="mt-1 text-sm text-white/70">
                    Confirm, then reveal who you’re Secret Santa for.
                  </p>
                </div>
                <button
                  className="rounded-2xl bg-white/10 px-3 py-2 text-sm ring-1 ring-white/15 hover:bg-white/15"
                  onClick={() => setRevealOpen(false)}
                >
                  Close
                </button>
              </div>

              <label className="mt-5 flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={confirm}
                  onChange={(e) => setConfirm(e.target.checked)}
                />
                <span className="text-sm text-white/80">
                  I’m ready to reveal (don’t spoil it for others).
                </span>
              </label>

              <div className="mt-5">
                {!confirm ? (
                  <div className="rounded-2xl bg-white/5 px-4 py-6 text-center text-sm text-white/70 ring-1 ring-white/10">
                    Check the box to unlock the reveal.
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="rounded-2xl bg-white/10 px-4 py-6 text-center ring-1 ring-white/15"
                  >
                    <div className="text-sm text-white/70">You are Secret Santa for</div>
                    <div className="mt-2 text-3xl font-semibold tracking-tight">
                      {assignedRecipient?.name ?? '—'}
                    </div>
                    <div className="mt-4 text-4xl">🎁</div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
