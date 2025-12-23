import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import type { Participant } from '../data/participants'
import { Button } from '../components/Button'
import { HolidayCard } from '../components/HolidayCard'

export function LoginScreen({
  participants,
  onLogin,
}: {
  participants: Participant[]
  onLogin: (participantId: string) => void
}) {
  const [selectedId, setSelectedId] = useState(participants[0]?.id ?? '')
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)

  const selected = useMemo(
    () => participants.find((p) => p.id === selectedId) ?? null,
    [participants, selectedId],
  )

  return (
    <div className="mx-auto w-full max-w-xl">
      <HolidayCard>
        <div className="text-center">
          <motion.div
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs ring-1 ring-white/10"
          >
            <span className="text-emerald-200">●</span>
            <span className="text-white/80">Login</span>
            <span className="text-red-200">●</span>
          </motion.div>

          <h2 className="mt-4 text-2xl font-semibold">Enter your PIN</h2>
          <p className="mt-2 text-sm text-white/75">Choose your name and enter your office PIN.</p>
        </div>

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            setError(null)

            if (!selected) {
              setError('Please pick your name.')
              return
            }

            if (pin.trim() !== selected.pin) {
              setError('Incorrect PIN. Try again.')
              return
            }

            onLogin(selected.id)
          }}
        >
          <label className="block">
            <div className="mb-1 text-sm text-white/80">Your name</div>
            <select
              className="w-full rounded-2xl bg-white/10 px-4 py-3 text-white outline-none ring-1 ring-white/15 focus:ring-2 focus:ring-white/30"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              {participants.map((p) => (
                <option key={p.id} value={p.id} className="bg-neutral-900">
                  {p.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <div className="mb-1 text-sm text-white/80">PIN</div>
            <input
              inputMode="numeric"
              className="w-full rounded-2xl bg-white/10 px-4 py-3 text-white placeholder:text-white/40 outline-none ring-1 ring-white/15 focus:ring-2 focus:ring-white/30"
              placeholder="e.g. 1015"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              autoComplete="off"
            />
          </label>

          {error ? (
            <div className="rounded-2xl bg-red-500/20 px-4 py-3 text-sm text-white ring-1 ring-white/10">
              {error}
            </div>
          ) : null}

          <Button type="submit" variant="primary" className="w-full">
            Start
          </Button>

        </form>
      </HolidayCard>
    </div>
  )
}
