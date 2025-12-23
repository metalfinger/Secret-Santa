import type { ReactNode } from 'react'
import { HolidayMark } from './HolidayMark'

export function HolidayCard({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <div className="relative overflow-hidden rounded-3xl bg-white/8 p-6 shadow-xl shadow-black/25 ring-1 ring-white/12 backdrop-blur">
        {/* subtle pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.10]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.9)_1px,transparent_1px)] [background-size:22px_22px]" />
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-emerald-500/20 to-transparent" />
        </div>

        {/* holly corners */}
        <HolidayMark className="pointer-events-none absolute -left-6 -top-6 h-24 w-24 rotate-12 text-emerald-300/40" />
        <HolidayMark className="pointer-events-none absolute -right-7 -top-7 h-24 w-24 -rotate-12 text-red-300/35" />

        <div className="relative">{children}</div>
      </div>
    </div>
  )
}
