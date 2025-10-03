import type {
  ArtworksFilterOptions,
  ArtworksFilterState,
  ArtworksSortOption,
} from '@/types/filters'
import type { ChangeEvent } from 'react'

import { ChevronDown } from 'lucide-react'

import { slugify, toggleArrayValue } from '@/lib/utils'

type ArtworksFiltersSidebarProps = {
  sortOption: ArtworksSortOption
  onSortChange: (option: ArtworksSortOption) => void
  filters: ArtworksFilterState
  onFiltersChange: (filters: ArtworksFilterState) => void
  availableOptions: ArtworksFilterOptions
  onClearFilters?: () => void
}

const sortOptions: { label: string; value: ArtworksSortOption }[] = [
  { label: 'Default', value: 'default' },
  { label: 'Title (A → Z)', value: 'title-asc' },
  { label: 'Title (Z → A)', value: 'title-desc' },
  { label: 'Price (low → high)', value: 'price-asc' },
  { label: 'Price (high → low)', value: 'price-desc' },
]

type FilterSectionProps = {
  label: string
  name: keyof ArtworksFilterState
  options: string[]
  selected: string[]
  onToggle: (name: keyof ArtworksFilterState, value: string) => void
}

function FilterSection({
  label,
  name,
  options,
  selected,
  onToggle,
}: FilterSectionProps) {
  if (options.length === 0) return null

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-medium text-neutral-700">{label}</h3>
      <ul className="space-y-2">
        {options.map((option) => {
          const id = `${name}-${slugify(option)}`
          const isChecked = selected.includes(option)

          return (
            <li key={option} className="flex items-center gap-2">
              <input
                id={id}
                type="checkbox"
                checked={isChecked}
                onChange={() => onToggle(name, option)}
                className="h-4 w-4 cursor-pointer rounded border-neutral-300 accent-neutral-900"
              />
              <label
                htmlFor={id}
                className="cursor-pointer text-sm text-neutral-700"
              >
                {option}
              </label>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default function ArtworksFiltersSidebar({
  sortOption,
  onSortChange,
  filters,
  onFiltersChange,
  availableOptions,
  onClearFilters,
}: ArtworksFiltersSidebarProps) {
  const handleSortChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onSortChange(event.target.value as ArtworksSortOption)
  }

  const handleToggle = (name: keyof ArtworksFilterState, value: string) => {
    onFiltersChange({
      ...filters,
      [name]: toggleArrayValue(filters[name], value),
    })
  }

  const handleClearFilters = () => {
    if (onClearFilters) {
      onClearFilters()
    } else {
      onFiltersChange({
        styles: [],
        categories: [],
        themes: [],
        artists: [],
      })
    }
  }

  const hasActiveFilters =
    filters.artists.length > 0 ||
    filters.categories.length > 0 ||
    filters.styles.length > 0 ||
    filters.themes.length > 0

  return (
    <aside className="space-y-6 rounded-lg border border-neutral-200 p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-neutral-900">Refine</h2>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-sm font-medium text-neutral-500 underline-offset-2 hover:text-neutral-700 hover:underline"
              type="button"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="artworks-sort"
            className="text-sm font-medium text-neutral-700"
          >
            Sort by
          </label>
          <div className="relative">
            <select
              id="artworks-sort"
              value={sortOption}
              onChange={handleSortChange}
              className="w-full cursor-pointer appearance-none rounded-md border border-neutral-300 bg-white px-3 py-2 pr-10 text-sm text-neutral-800 shadow-xs focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden
              className="pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-[45%] text-neutral-500"
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <FilterSection
          label="Style"
          name="styles"
          options={availableOptions.styles}
          selected={filters.styles}
          onToggle={handleToggle}
        />
        <FilterSection
          label="Category"
          name="categories"
          options={availableOptions.categories}
          selected={filters.categories}
          onToggle={handleToggle}
        />
        <FilterSection
          label="Theme"
          name="themes"
          options={availableOptions.themes}
          selected={filters.themes}
          onToggle={handleToggle}
        />
        <FilterSection
          label="Artist"
          name="artists"
          options={availableOptions.artists}
          selected={filters.artists}
          onToggle={handleToggle}
        />
      </div>
    </aside>
  )
}
