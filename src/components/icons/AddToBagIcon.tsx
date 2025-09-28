type AddToBagIconProps = {
  bagSize?: number // size in px for the bag
  plusSize?: number // diameter in px for the plus circle
  className?: string
}

export function AddToBagIcon({
  bagSize = 24,
  plusSize = 14,
  className,
}: AddToBagIconProps) {
  // Bag is a 24x24 viewBox originally
  const bagScale = bagSize / 24

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 32 32" // extra space for badge
    >
      {/* Bag icon */}
      <g
        transform={`scale(${bagScale}) translate(2,2)`} // center bag a bit
        stroke="currentColor"
        strokeWidth="1.75"
        fill="none"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993
             1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125
             1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125
             0 0 1 5.513 7.5h12.974c.576 0 1.059.435
             1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75
             0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375
             0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
        />
      </g>

      {/* Plus badge */}
      <g transform="translate(22,22)">
        <circle r={plusSize / 2} fill="currentColor" />
        <path
          d="M0 -2.5v5M-2.5 0h5"
          stroke="white"
          strokeWidth={1.75}
          strokeLinecap="round"
        />
      </g>
    </svg>
  )
}
