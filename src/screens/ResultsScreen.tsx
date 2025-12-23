import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import type { Participant } from '../data/participants'
import { Button } from '../components/Button'
import { HolidayCard } from '../components/HolidayCard'
import { useRankMemes } from '../lib/leaderboardMemes'
import { getTenorKey, searchTenorGifs, type TenorGif } from '../lib/tenor.ts'

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
  onChooseMeme,
  onPlayAgain,
}: {
  participant: Participant | null
  result: GameResult | null
  leaderboard: Array<{
    participant: Participant
    bestScore: number | null
    memeUrl?: string | null
    memeTinyUrl?: string | null
  }>
  assignedRecipient: Participant | null
  onChooseMeme?: (meme: { url: string; tinyUrl?: string | null; alt?: string }) => Promise<void>
  onPlayAgain: () => void
}) {
  const rankMemes = useRankMemes()
  const [revealOpen, setRevealOpen] = useState(false)
  const [confirm, setConfirm] = useState(false)

  const [memeOptions, setMemeOptions] = useState<TenorGif[] | null>(null)
  const [memeError, setMemeError] = useState<string | null>(null)
  const [selectedMeme, setSelectedMeme] = useState<TenorGif | null>(null)
  const [savingMeme, setSavingMeme] = useState(false)
  const [savedMeme, setSavedMeme] = useState(false)

  const yourName = participant?.name ?? 'Player'

  const rank = useMemo(() => {
    if (!participant) return null
    const idx = leaderboard.findIndex((r) => r.participant.id === participant.id)
    if (idx === -1) return null
    return idx + 1
  }, [leaderboard, participant])

  const tenorKey = getTenorKey()
  useEffect(() => {
    let cancelled = false
    setSavedMeme(false)
    setSelectedMeme(null)

    if (!participant || !result) return
    if (!tenorKey) {
      setMemeOptions(null)
      setMemeError('Set VITE_TENOR_KEY to enable meme selection.')
      return
    }

    setMemeError(null)
    searchTenorGifs({ query: 'christmas meme', limit: 24 })
      .then((opts: TenorGif[]) => {
        if (cancelled) return
        setMemeOptions(opts)
        if (!opts.length) setMemeError('No memes found.')
      })
      .catch(() => {
        if (cancelled) return
        setMemeOptions(null)
        setMemeError('Could not load meme options.')
      })

    return () => {
      cancelled = true
    }
  }, [participant, result, tenorKey])

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


            {participant && result ? (
              <div className="mt-6 rounded-3xl bg-white/5 p-5 ring-1 ring-white/10">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">Pick your meme</h3>
                    <p className="mt-1 text-xs text-white/70">
                      Choose one to attach to your leaderboard row. You can change it next time you play.
                    </p>
                  </div>
                  {savingMeme ? (
                    <div className="text-xs text-white/70">Saving…</div>
                  ) : savedMeme ? (
                    <div className="text-xs text-emerald-200">Saved</div>
                  ) : null}
                </div>

                {memeError ? (
                  <div className="mt-3 text-xs text-red-200/80">{memeError}</div>
                ) : null}

                {memeOptions?.length ? (
                  <div className="mt-4 max-h-80 overflow-y-auto pr-1">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {memeOptions.map((m) => {
                      const isSelected = selectedMeme?.url === m.url
                      return (
                        <button
                          key={m.url}
                          type="button"
                          className={
                            'relative overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10 transition focus:outline-none ' +
                            (isSelected ? 'ring-2 ring-emerald-200/70' : 'hover:bg-white/10')
                          }
                          onClick={async () => {
                            if (!onChooseMeme) return
                            setSelectedMeme(m)
                            setSavedMeme(false)
                            setSavingMeme(true)
                            try {
                              await onChooseMeme({ url: m.url, tinyUrl: m.tinyUrl ?? null, alt: m.alt })
                              setSavedMeme(true)
                            } catch {
                              setMemeError('Could not save meme to leaderboard.')
                              setSavedMeme(false)
                            } finally {
                              setSavingMeme(false)
                            }
                          }}
                          disabled={savingMeme || !onChooseMeme}
                        >
                          <img
                            src={m.tinyUrl ?? m.url}
                            alt={m.alt}
                            className="h-28 w-full bg-black/20 object-contain p-2 sm:h-32"
                            loading="lazy"
                            decoding="async"
                          />
                        </button>
                      )
                    })}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
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
                    (() => {
                      const rank = i + 1
                      const meme = rankMemes[rank] ?? null
                      const chosen = row.memeTinyUrl || row.memeUrl
                      return (
                    <div
                      key={row.participant.id}
                      className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/10"
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

                        <div className="w-8 text-center text-sm text-white/70">{rank}</div>
                        <div className="min-w-0 font-medium truncate">{row.participant.name}</div>
                      </div>
                      <div className="font-semibold">{row.bestScore}</div>
                    </div>
                      )
                    })()
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
