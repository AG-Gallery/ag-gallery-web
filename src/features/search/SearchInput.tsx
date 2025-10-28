import { Search } from 'lucide-react'

type SearchInputProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function SearchInputComponent({
  value,
  onChange,
  placeholder = 'Search artworks, artists, exhibitions, fairs...',
}: SearchInputProps) {
  return (
    <div className="relative">
      <Search className="absolute top-3 left-3 h-4 w-4 text-neutral-400" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-neutral-200 py-2 pr-4 pl-10 focus:border-neutral-400 focus:outline-none"
        autoFocus
      />
    </div>
  )
}
