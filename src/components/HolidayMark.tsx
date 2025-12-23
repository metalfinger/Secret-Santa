export function HolidayMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* simple holly + berry mark (original) */}
      <path
        d="M25 34c-7-2-12-8-12-15 8-1 15 3 18 10-1-7 2-14 10-18 3 7 2 15-5 20 6-2 13 0 18 6-6 4-14 5-20 0 2 6 0 13-6 18-4-6-5-14 0-21z"
        fill="currentColor"
        opacity="0.65"
      />
      <circle cx="34" cy="30" r="4" fill="currentColor" />
      <circle cx="41" cy="33" r="3" fill="currentColor" opacity="0.9" />
      <circle cx="28" cy="28" r="3" fill="currentColor" opacity="0.9" />
    </svg>
  )
}
