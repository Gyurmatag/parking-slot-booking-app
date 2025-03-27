"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface FilterContextType {
  date: Date | undefined
  startTime: string
  duration: number
  showHandicap: boolean
  showElectric: boolean
  setDate: (date: Date | undefined) => void
  setStartTime: (time: string) => void
  setDuration: (duration: number) => void
  setShowHandicap: (show: boolean) => void
  setShowElectric: (show: boolean) => void
}

const FilterContext = createContext<FilterContextType | undefined>(undefined)

export function FilterProvider({ children }: { children: ReactNode }) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [startTime, setStartTime] = useState("09:00")
  const [duration, setDuration] = useState(1)
  const [showHandicap, setShowHandicap] = useState(true)
  const [showElectric, setShowElectric] = useState(true)

  return (
    <FilterContext.Provider
      value={{
        date,
        startTime,
        duration,
        showHandicap,
        showElectric,
        setDate,
        setStartTime,
        setDuration,
        setShowHandicap,
        setShowElectric,
      }}
    >
      {children}
    </FilterContext.Provider>
  )
}

export function useFilters() {
  const context = useContext(FilterContext)
  if (context === undefined) {
    throw new Error("useFilters must be used within a FilterProvider")
  }
  return context
}

