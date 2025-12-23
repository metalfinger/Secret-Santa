import { motion } from 'framer-motion'
import { useMemo } from 'react'

type Snowflake = {
  key: string
  leftPct: number
  sizePx: number
  durationSec: number
  delaySec: number
  opacity: number
}

export function ChristmasBackground() {
  const flakes = useMemo<Snowflake[]>(() => {
    const count = 28
    const out: Snowflake[] = []

    for (let i = 0; i < count; i++) {
      out.push({
        key: `flake-${i}`,
        leftPct: (i * 97) % 100,
        sizePx: 2 + ((i * 7) % 4),
        durationSec: 7 + ((i * 13) % 8),
        delaySec: -((i * 11) % 10),
        opacity: 0.35 + (((i * 9) % 40) / 100) * 0.9,
      })
    }

    return out
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* soft holiday glows */}
      <motion.div
        className="absolute -left-24 -top-28 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl"
        animate={{ x: [0, 24, 0], y: [0, 10, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-red-500/20 blur-3xl"
        animate={{ x: [0, -18, 0], y: [0, 14, 0], scale: [1, 1.06, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-32 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-amber-300/10 blur-3xl"
        animate={{ y: [0, -14, 0], scale: [1, 1.04, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* subtle snow */}
      {flakes.map((f) => (
        <motion.span
          key={f.key}
          className="absolute top-[-12vh] rounded-full bg-white"
          style={{
            left: `${f.leftPct}%`,
            width: f.sizePx,
            height: f.sizePx,
            opacity: f.opacity,
          }}
          animate={{ y: ['-12vh', '112vh'] }}
          transition={{
            duration: f.durationSec,
            repeat: Infinity,
            ease: 'linear',
            delay: f.delaySec,
          }}
        />
      ))}

      {/* top vignette for neatness */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/35 to-transparent" />
    </div>
  )
}
