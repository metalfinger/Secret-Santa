import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { ChristmasBackground } from './components/ChristmasBackground'
import { GameScreen } from './screens/GameScreen'
import { LoginScreen } from './screens/LoginScreen'
import { ResultsScreen, type GameResult } from './screens/ResultsScreen'
import { participants } from './data/participants'
import { getBestScores, setBestScore } from './lib/storage'
import { buildAssignments } from './lib/secretSanta'
import {
  fetchRemoteLeaderboard,
  isRemoteLeaderboardEnabled,
  submitRemoteBestScore,
} from './lib/remoteLeaderboard'

type Screen = 'login' | 'game' | 'results'

const SESSION_KEY = 'ss.session.participantId'
const ASSIGNMENT_SEED = 'office-secret-santa-2025'
const EVENT_ID = 'vmt-secret-santa-2025'

function App() {
  const [screen, setScreen] = useState<Screen>(() => {
    const hasSession = Boolean(localStorage.getItem(SESSION_KEY))
    return hasSession ? 'game' : 'login'
  })

  const [participantId, setParticipantId] = useState<string | null>(() =>
    localStorage.getItem(SESSION_KEY),
  )

  const [lastResult, setLastResult] = useState<GameResult | null>(null)

  const [remoteRows, setRemoteRows] = useState<
    Array<{ participantId: string; bestScore: number }> | null
  >(null)

  const assignments = useMemo(
    () => buildAssignments(participants, ASSIGNMENT_SEED),
    [],
  )

  useEffect(() => {
    if (!isRemoteLeaderboardEnabled()) return

    let cancelled = false
    ;(async () => {
      try {
        const rows = await fetchRemoteLeaderboard(EVENT_ID)
        if (cancelled) return
        setRemoteRows(rows.map((r) => ({ participantId: r.participantId, bestScore: r.bestScore })))
      } catch {
        if (cancelled) return
        setRemoteRows(null)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [lastResult, participantId])

  const bestScores = getBestScores()

  const leaderboard = useMemo(() => {
    const remoteMap = new Map(remoteRows?.map((r) => [r.participantId, r.bestScore]) ?? [])

    return participants
      .map((p) => {
        const remote = remoteMap.get(p.id)
        const local = bestScores[p.id]?.score ?? null
        const best = isRemoteLeaderboardEnabled() ? remote ?? local : local

        return {
          participant: p,
          bestScore: best ?? null,
        }
      })
      .filter((row) => row.bestScore !== null)
      .sort((a, b) => (b.bestScore ?? 0) - (a.bestScore ?? 0))
  }, [bestScores, remoteRows])

  const currentParticipant = participants.find((p) => p.id === participantId) ?? null
  const assignedRecipientId = participantId ? assignments[participantId] : null
  const assignedRecipient = participants.find((p) => p.id === assignedRecipientId) ?? null

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950 text-white">
      <ChristmasBackground />

      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-10">
        <header className="mb-8 flex flex-col items-center gap-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium tracking-wide ring-1 ring-emerald-200/20 backdrop-blur">
            <span className="text-emerald-100">VMT</span>
            <span className="text-white/60">•</span>
            <span className="text-white/85">Secret Santa</span>
            <span className="text-white/60">•</span>
            <span className="text-red-100">2025</span>
          </div>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">VMT Secret Santa</h1>

          <p className="max-w-2xl text-white/75">
            Play the game, get your score, then reveal your Secret Santa.
          </p>

          {currentParticipant ? (
            <div className="inline-flex items-center gap-3 rounded-2xl bg-white/8 px-4 py-3 ring-1 ring-white/15 backdrop-blur">
              <div className="text-sm text-white/75">Logged in as</div>
              <div className="font-medium">{currentParticipant.name}</div>
              <button
                className="ml-2 rounded-full bg-red-500/10 px-3 py-1 text-sm text-red-100 ring-1 ring-red-200/20 transition hover:bg-red-500/15 active:bg-red-500/20"
                onClick={() => {
                  localStorage.removeItem(SESSION_KEY)
                  setParticipantId(null)
                  setLastResult(null)
                  setScreen('login')
                }}
              >
                Switch
              </button>
            </div>
          ) : null}
        </header>

        <AnimatePresence mode="wait">
          <motion.main
            key={screen}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="flex-1"
          >
            {screen === 'login' ? (
              <LoginScreen
                participants={participants}
                onLogin={(id) => {
                  localStorage.setItem(SESSION_KEY, id)
                  setParticipantId(id)
                  setLastResult(null)
                  setScreen('game')
                }}
              />
            ) : null}

            {screen === 'game' ? (
              <GameScreen
                participant={currentParticipant}
                onFinished={(result) => {
                  setLastResult(result)
                  if (currentParticipant) {
                    setBestScore(currentParticipant.id, result)

                    if (isRemoteLeaderboardEnabled()) {
                      submitRemoteBestScore({
                        eventId: EVENT_ID,
                        participantId: currentParticipant.id,
                        name: currentParticipant.name,
                        bestScore: result.score,
                        moves: result.moves,
                        seconds: result.seconds,
                      })
                        .then(() => fetchRemoteLeaderboard(EVENT_ID))
                        .then((rows) => {
                          setRemoteRows(
                            rows.map((r) => ({
                              participantId: r.participantId,
                              bestScore: r.bestScore,
                            })),
                          )
                        })
                        .catch(() => {
                          // stay local-only if remote fails
                        })
                    }
                  }
                  setScreen('results')
                }}
              />
            ) : null}

            {screen === 'results' ? (
              <ResultsScreen
                participant={currentParticipant}
                result={lastResult}
                leaderboard={leaderboard}
                assignedRecipient={assignedRecipient}
                onPlayAgain={() => {
                  setLastResult(null)
                  setScreen('game')
                }}
              />
            ) : null}
          </motion.main>
        </AnimatePresence>

        <footer className="mt-10 text-center text-xs text-white/60">
          Scores are saved on this device (localStorage).
        </footer>
      </div>
    </div>
  )
}

export default App
