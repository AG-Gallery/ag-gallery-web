export function PlusIcon({ classes }: { classes?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={classes}
      viewBox="0 0 24 24"
    >
      {/* Circle Background */}
      <circle cx="12" cy="12" r="10" fill="currentColor" />

      {/* Plus sign */}
      <path
        d="M12 8v8M8 12h8"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
