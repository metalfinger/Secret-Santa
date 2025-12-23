import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { ChristmasBackground } from './components/ChristmasBackground'
import { LeaderboardMini } from './components/LeaderboardMini'
import { GameScreen } from './screens/GameScreen'
import { LoginScreen } from './screens/LoginScreen'
import { ResultsScreen, type GameResult } from './screens/ResultsScreen'
import { fixedAssignments, participants } from './data/participants'
import { fetchRemoteLeaderboard, submitRemoteBestScore } from './lib/remoteLeaderboard'

type Screen = 'login' | 'game' | 'results'

const EVENT_ID = 'vmt-secret-santa-2025'

function App() {
  const [screen, setScreen] = useState<Screen>('login')

  // No localStorage: a refresh returns you to login (intentional).
  const [participantId, setParticipantId] = useState<string | null>(null)

  const [lastResult, setLastResult] = useState<GameResult | null>(null)

  const [remoteRows, setRemoteRows] = useState<
    Array<{
      participantId: string
      bestScore: number
      name: string
      memeUrl?: string | null
      memeTinyUrl?: string | null
    }> | null
  >(null)
  const [remoteError, setRemoteError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setRemoteError(null)
        const rows = await fetchRemoteLeaderboard(EVENT_ID)
        if (cancelled) return
        setRemoteRows(
          rows.map((r) => ({
            participantId: r.participantId,
            bestScore: r.bestScore,
            name: r.name,
            memeUrl: r.memeUrl ?? null,
            memeTinyUrl: r.memeTinyUrl ?? null,
          })),
        )
      } catch {
        if (cancelled) return
        setRemoteRows(null)
        setRemoteError('Leaderboard unavailable (check Netlify env vars).')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [lastResult, participantId])

  const leaderboard = useMemo(() => {
    const remoteMap = new Map(remoteRows?.map((r) => [r.participantId, r]) ?? [])

    return participants
      .map((p) => ({
        participant: p,
        bestScore: remoteMap.get(p.id)?.bestScore ?? null,
        memeUrl: remoteMap.get(p.id)?.memeUrl ?? null,
        memeTinyUrl: remoteMap.get(p.id)?.memeTinyUrl ?? null,
      }))
      .sort((a, b) => {
        const as = a.bestScore
        const bs = b.bestScore
        if (as === null && bs === null) return a.participant.name.localeCompare(b.participant.name)
        if (as === null) return 1
        if (bs === null) return -1
        return bs - as
      })
  }, [remoteRows])

  const currentParticipant = participants.find((p) => p.id === participantId) ?? null
  const assignedRecipientId = participantId ? fixedAssignments[participantId] : null
  const assignedRecipient = participants.find((p) => p.id === assignedRecipientId) ?? null

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950 text-white">
      <ChristmasBackground />

      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-10">
        <header className="mb-8 flex flex-col items-center gap-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium tracking-wide ring-1 ring-emerald-200/20 backdrop-blur">
            <span className="text-emerald-100">VMT</span>
            <span className="text-white/60">•</span>
            <span className="text-red-100">2025</span>
          </div>

          <h1 className="font-festive text-5xl font-bold tracking-tight sm:text-6xl">Secret Santa</h1>

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
              <div className="space-y-6">
                <LoginScreen
                  participants={participants}
                  onLogin={(id) => {
                    setParticipantId(id)
                    setLastResult(null)
                    setScreen('game')
                  }}
                />
                <div>
                  <LeaderboardMini leaderboard={leaderboard} />
                  {remoteError ? (
                    <div className="mx-auto mt-2 w-full max-w-xl text-center text-xs text-red-200/80">
                      {remoteError}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            {screen === 'game' ? (
              <GameScreen
                participant={currentParticipant}
                onFinished={(result) => {
                  setLastResult(result)
                  if (currentParticipant) {
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
                        setRemoteError(null)
                        setRemoteRows(
                          rows.map((r) => ({
                            participantId: r.participantId,
                            bestScore: r.bestScore,
                            name: r.name,
                            memeUrl: r.memeUrl ?? null,
                            memeTinyUrl: r.memeTinyUrl ?? null,
                          })),
                        )
                      })
                      .catch(() => {
                        setRemoteError('Score submit failed (check Supabase/Netlify env).')
                      })
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
                onChooseMeme={async (meme) => {
                  if (!currentParticipant || !lastResult) return
                  await submitRemoteBestScore({
                    eventId: EVENT_ID,
                    participantId: currentParticipant.id,
                    name: currentParticipant.name,
                    bestScore: lastResult.score,
                    moves: lastResult.moves,
                    seconds: lastResult.seconds,
                    memeUrl: meme.url,
                    memeTinyUrl: meme.tinyUrl ?? null,
                  })
                  const rows = await fetchRemoteLeaderboard(EVENT_ID)
                  setRemoteError(null)
                  setRemoteRows(
                    rows.map((r) => ({
                      participantId: r.participantId,
                      bestScore: r.bestScore,
                      name: r.name,
                      memeUrl: r.memeUrl ?? null,
                      memeTinyUrl: r.memeTinyUrl ?? null,
                    })),
                  )
                }}
                onPlayAgain={() => {
                  setLastResult(null)
                  setScreen('game')
                }}
              />
            ) : null}
          </motion.main>
        </AnimatePresence>

        <footer className="mt-10 text-center text-xs text-white/60">
          
        </footer>
      </div>
    </div>
  )
}

export default App
