import { motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Participant } from '../data/participants'
import type { GameResult } from './ResultsScreen'
import { Button } from '../components/Button'
import { HolidayCard } from '../components/HolidayCard'

type Card = {
  id: string
  face: string
  pairId: string
}

const EMOJIS = ['🎁', '🎄', '❄️', '🦌', '🍪', '🔔']

const shuffle = <T,>(arr: T[]) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const buildDeck = (): Card[] => {
  const pairs = EMOJIS.flatMap((e, idx) => {
    const pairId = `p${idx}`
    return [
      { id: `${pairId}-a`, face: e, pairId },
      { id: `${pairId}-b`, face: e, pairId },
    ]
  })
  return shuffle(pairs)
}

export function GameScreen({
  participant,
  onFinished,
}: {
  participant: Participant | null
  onFinished: (result: GameResult) => void
}) {
  const [deck, setDeck] = useState<Card[]>(() => buildDeck())
  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState<Set<string>>(() => new Set())
  const [moves, setMoves] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [locked, setLocked] = useState(false)

  const startedAtRef = useRef<number | null>(null)
  const timerRef = useRef<number | null>(null)

  const done = matched.size === EMOJIS.length

  const reset = () => {
    if (timerRef.current) window.clearInterval(timerRef.current)
    timerRef.current = null
    startedAtRef.current = null
    setSeconds(0)
    setMoves(0)
    setMatched(new Set())
    setFlipped([])
    setDeck(buildDeck())
    setLocked(false)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!done) return
    if (timerRef.current) window.clearInterval(timerRef.current)
    timerRef.current = null

    const score = Math.max(0, 1000 - seconds * 5 - moves * 10)
    onFinished({ score, moves, seconds })
  }, [done, moves, onFinished, seconds])

  const title = useMemo(() => {
    if (!participant) return 'Match the cards'
    return `Good luck, ${participant.name}`
  }, [participant])

  return (
    <div className="mx-auto w-full max-w-4xl">
      <HolidayCard>
        <div className="text-center">
          <h2 className="text-2xl font-semibold">{title}</h2>
          <p className="mt-2 text-sm text-white/75">
            Find all pairs. Faster + fewer moves = higher score.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <div className="rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm ring-1 ring-emerald-200/20">
              <div className="text-white/70">Time</div>
              <div className="font-semibold">{seconds}s</div>
            </div>
            <div className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm ring-1 ring-red-200/20">
              <div className="text-white/70">Moves</div>
              <div className="font-semibold">{moves}</div>
            </div>
            <Button variant="secondary" onClick={reset}>
              Restart
            </Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {deck.map((card, index) => {
            const isFlipped = flipped.includes(index)
            const isMatched = matched.has(card.pairId)

            return (
              <button
                key={card.id}
                className="group relative aspect-square overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/15 transition hover:bg-white/10 hover:ring-white/25 active:scale-[0.99] disabled:cursor-not-allowed"
                disabled={isMatched || locked}
                onClick={() => {
                  if (done) return
                  if (locked) return
                  if (isMatched) return
                  if (flipped.includes(index)) return

                  if (startedAtRef.current === null) {
                    startedAtRef.current = Date.now()
                    timerRef.current = window.setInterval(() => {
                      if (startedAtRef.current === null) return
                      setSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000))
                    }, 250)
                  }

                  const next = [...flipped, index]
                  setFlipped(next)

                  if (next.length === 2) {
                    setMoves((m) => m + 1)
                    setLocked(true)

                    const [a, b] = next
                    const ca = deck[a]
                    const cb = deck[b]

                    const match = ca.pairId === cb.pairId

                    window.setTimeout(() => {
                      if (match) {
                        setMatched((prev) => {
                          const copy = new Set(prev)
                          copy.add(ca.pairId)
                          return copy
                        })
                      }
                      setFlipped([])
                      setLocked(false)
                    }, match ? 350 : 700)
                  }
                }}
              >
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ rotateY: isFlipped || isMatched ? 180 : 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div
                    className="absolute inset-0 flex items-center justify-center text-4xl font-semibold text-white/85 sm:text-5xl"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    ?
                  </div>
                  <div
                    className="absolute inset-0 flex items-center justify-center text-5xl sm:text-6xl"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                    {card.face}
                  </div>
                </motion.div>
              </button>
            )
          })}
        </div>
      </HolidayCard>
    </div>
  )
}
