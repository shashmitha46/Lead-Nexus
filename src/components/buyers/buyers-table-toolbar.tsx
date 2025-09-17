
"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ListFilter, Search, Upload, Download } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useDebounce } from "@/hooks/use-debounce"
import {
  CITIES,
  PROPERTY_TYPES,
  STATUSES,
  TIMELINES,
} from "@/lib/constants"
import { CSVImportDialog } from "./csv-import-dialog"
import Link from "next/link"

export function BuyersTableToolbar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [query, setQuery] = useState(searchParams.get("query") || "")
  const debouncedQuery = useDebounce(query, 500)

  const [city, setCity] = useState(searchParams.get("city") || "")
  const [propertyType, setPropertyType] = useState(searchParams.get("propertyType") || "")
  const [status, setStatus] = useState(searchParams.get("status") || "")
  const [timeline, setTimeline] = useState(searchParams.get("timeline") || "")

  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    
    const updateParam = (key: string, value: string) => {
        if (value) {
            params.set(key, value)
        } else {
            params.delete(key)
        }
    }

    updateParam("query", debouncedQuery)
    updateParam("city", city)
    updateParam("propertyType", propertyType)
    updateParam("status", status)
    updateParam("timeline", timeline)
    params.set("page", "1")

    router.replace(`${pathname}?${params.toString()}`)
  }, [debouncedQuery, city, propertyType, status, timeline, router, pathname, searchParams])

  const FilterDropdown = ({
    label,
    value,
    onValueChange,
    options,
  }: {
    label: string
    value: string
    onValueChange: (value: string) => void
    options: readonly string[]
  }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <ListFilter className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            {label}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option}
            checked={value === option}
            onCheckedChange={() => onValueChange(value === option ? "" : option)}
          >
            {option}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <div className="flex items-center justify-between gap-2 md:gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by name, phone, or email..."
          className="w-full rounded-lg bg-background pl-8"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2">
            <FilterDropdown label="City" value={city} onValueChange={setCity} options={CITIES} />
            <FilterDropdown label="Type" value={propertyType} onValueChange={setPropertyType} options={PROPERTY_TYPES} />
            <FilterDropdown label="Status" value={status} onValueChange={setStatus} options={STATUSES} />
            <FilterDropdown label="Timeline" value={timeline} onValueChange={setTimeline} options={TIMELINES} />
        </div>
        <CSVImportDialog />
        <Button size="sm" variant="outline" className="h-8 gap-1" asChild>
          <Link href="/buyers/export">
            <Upload className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Export
            </span>
          </Link>
        </Button>
      </div>
    </div>
  )
}
