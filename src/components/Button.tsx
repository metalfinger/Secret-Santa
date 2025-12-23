import { motion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'
import { cx } from '../lib/cx'

type Variant = 'primary' | 'secondary' | 'reveal' | 'ghost'

type Props = HTMLMotionProps<'button'> & {
  variant?: Variant
  children: ReactNode
}

const base =
  'relative inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold ring-1 transition focus:outline-none focus-visible:ring-2 active:translate-y-[1px]'

export function Button({ variant = 'secondary', className, children, ...props }: Props) {
  const v =
    variant === 'primary'
      ? 'bg-emerald-500/22 text-white ring-emerald-200/25 hover:bg-emerald-500/28 active:bg-emerald-500/34'
      : variant === 'reveal'
        ? 'bg-red-500/18 text-white ring-red-200/25 hover:bg-red-500/24 active:bg-red-500/30'
        : variant === 'ghost'
          ? 'bg-white/0 text-white/85 ring-white/15 hover:bg-white/8 active:bg-white/12'
          : 'bg-white/8 text-white ring-white/15 hover:bg-white/12 active:bg-white/16'

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.15 }}
      className={cx(base, v, className)}
      {...props}
    >
      {variant === 'reveal' ? (
        <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
          <motion.span
            className="absolute -left-1/2 top-0 h-full w-1/2 -skew-x-12 bg-white/20 blur-sm"
            animate={{ x: ['0%', '220%'] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.2 }}
          />
        </span>
      ) : null}
      <span className="relative">{children}</span>
    </motion.button>
  )
}
