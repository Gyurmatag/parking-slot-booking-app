"use client"

import { useState, useEffect, useCallback } from "react"
import { ParkingSlot } from "@/components/parking-slot"
import { ParkingSlotInfo } from "@/components/parking-slot-info"
import { getParkingSlots, getAvailableSlots, type ParkingSlot as ParkingSlotType } from "@/app/actions/parking-actions"
import { Skeleton } from "@/components/ui/skeleton"
import { useFilters } from "@/contexts/filter-context"
import { format } from "date-fns"

export default function ParkingLot() {
  const [parkingSlots, setParkingSlots] = useState<(ParkingSlotType & { section_name: string })[]>([])
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlotType | null>(null)
  const [loading, setLoading] = useState(true)
  const [filtersApplied, setFiltersApplied] = useState(false)

  const { date, startTime, duration, showHandicap, showElectric } = useFilters()

  // Function to load all parking slots
  const loadAllParkingSlots = async () => {
    try {
      setLoading(true)
      setFiltersApplied(false)
      const slots = await getParkingSlots()
      setParkingSlots(slots)
    } catch (error) {
      console.error("Failed to load parking slots:", error)
    } finally {
      setLoading(false)
    }
  }

  // Function to load filtered parking slots
  const loadFilteredParkingSlots = useCallback(async () => {
    if (!date) return

    try {
      setLoading(true)
      setFiltersApplied(true)

      const formattedDate = format(date, "yyyy-MM-dd")
      const availableSlots = await getAvailableSlots(formattedDate, startTime, duration)

      // Get all slots to maintain the structure
      const allSlots = await getParkingSlots()

      // Create a set of available slot IDs for quick lookup
      const availableSlotIds = new Set(availableSlots.map((slot) => slot.id))

      // Mark slots as unavailable if they're not in the available slots
      const filteredSlots = allSlots.map((slot) => {
        // Apply type filters
        const typeFiltered = (slot.type === "handicap" && !showHandicap) || (slot.type === "electric" && !showElectric)

        // If the slot is already booked or unavailable, keep its status
        if (slot.status === "booked" || slot.status === "unavailable") {
          return slot
        }

        // If the slot is filtered out by type, mark it as unavailable
        if (typeFiltered) {
          return { ...slot, status: "unavailable" as const }
        }

        // If the slot is not in the available slots, mark it as unavailable
        if (!availableSlotIds.has(slot.id)) {
          return { ...slot, status: "unavailable" as const }
        }

        return slot
      })

      setParkingSlots(filteredSlots)
    } catch (error) {
      console.error("Failed to load filtered parking slots:", error)
    } finally {
      setLoading(false)
    }
  }, [date, startTime, duration, showHandicap, showElectric])

  // Load parking slots on initial render
  useEffect(() => {
    loadAllParkingSlots()
  }, [])

  // Handle filter changes
  useEffect(() => {
    if (date) {
      loadFilteredParkingSlots()
    }
  }, [date, startTime, duration, showHandicap, showElectric, loadFilteredParkingSlots])

  const handleSlotClick = (slot: ParkingSlotType) => {
    if (slot.status !== "unavailable") {
      setSelectedSlot(slot)
    }
  }

  const handleCloseInfo = () => {
    setSelectedSlot(null)
    // Refresh data when closing the info panel
    if (filtersApplied) {
      loadFilteredParkingSlots()
    } else {
      loadAllParkingSlots()
    }
  }

  const handleBookingComplete = () => {
    // Refresh data after booking is complete
    if (filtersApplied) {
      loadFilteredParkingSlots()
    } else {
      loadAllParkingSlots()
    }
    setSelectedSlot(null)
  }

  // Group slots by section
  const sectionA = parkingSlots.filter((slot) => slot.section_name === "A")
  const sectionB = parkingSlots.filter((slot) => slot.section_name === "B")
  const sectionC = parkingSlots.filter((slot) => slot.section_name === "C")

  if (loading && parkingSlots.length === 0) {
    return <ParkingLotSkeleton />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Parking Lot Map</h2>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span>Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-400"></div>
            <span>Unavailable</span>
          </div>
        </div>
      </div>

      {filtersApplied && (
        <div className="bg-blue-50 p-3 rounded-md text-sm">
          <p className="font-medium">Showing availability for:</p>
          <p>Date: {date ? format(date, "PPP") : "Any"}</p>
          <p>
            Time: {startTime} for {duration} hour{duration !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      <div className="relative">
        {/* Entrance and exit */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-100 px-4 py-1 rounded-t-md text-sm font-medium">
          Entrance/Exit
        </div>

        {/* Parking lot layout */}
        <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
          {/* Section A */}
          <div className="mb-8">
            <div className="mb-2 font-medium">Section A</div>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
              {sectionA.map((slot) => (
                <ParkingSlot
                  key={slot.id}
                  slot={{
                    id: slot.id.toString(),
                    status: slot.status,
                    label: slot.slot_number,
                    type: slot.type,
                    price: Number(slot.price_per_hour), // Ensure price is a number
                  }}
                  onClick={() => handleSlotClick(slot)}
                />
              ))}
            </div>
          </div>

          {/* Driving lane */}
          <div className="h-8 bg-gray-200 rounded-md mb-8 flex items-center justify-center">
            <div className="w-full border-dashed border-t-2 border-gray-400"></div>
          </div>

          {/* Section B */}
          <div className="mb-8">
            <div className="mb-2 font-medium">Section B</div>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
              {sectionB.map((slot) => (
                <ParkingSlot
                  key={slot.id}
                  slot={{
                    id: slot.id.toString(),
                    status: slot.status,
                    label: slot.slot_number,
                    type: slot.type,
                    price: Number(slot.price_per_hour), // Ensure price is a number
                  }}
                  onClick={() => handleSlotClick(slot)}
                />
              ))}
            </div>
          </div>

          {/* Driving lane */}
          <div className="h-8 bg-gray-200 rounded-md mb-8 flex items-center justify-center">
            <div className="w-full border-dashed border-t-2 border-gray-400"></div>
          </div>

          {/* Section C */}
          <div>
            <div className="mb-2 font-medium">Section C</div>
            <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
              {sectionC.map((slot) => (
                <ParkingSlot
                  key={slot.id}
                  slot={{
                    id: slot.id.toString(),
                    status: slot.status,
                    label: slot.slot_number,
                    type: slot.type,
                    price: Number(slot.price_per_hour), // Ensure price is a number
                  }}
                  onClick={() => handleSlotClick(slot)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedSlot && (
        <ParkingSlotInfo
          slot={{
            id: selectedSlot.id.toString(),
            status: selectedSlot.status,
            label: selectedSlot.slot_number,
            type: selectedSlot.type,
            price: Number(selectedSlot.price_per_hour), // Ensure price is a number
          }}
          onClose={handleCloseInfo}
          onBookingComplete={handleBookingComplete}
          bookingDetails={
            filtersApplied
              ? {
                  date: date!,
                  startTime,
                  duration,
                }
              : undefined
          }
        />
      )}

      <div className="flex justify-center mt-4">
        <button
          onClick={filtersApplied ? loadFilteredParkingSlots : loadAllParkingSlots}
          className="text-sm text-blue-500 hover:text-blue-700 flex items-center gap-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh Parking Map
        </button>
      </div>
    </div>
  )
}

function ParkingLotSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-40" />
        <div className="flex items-center gap-6">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>

      <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
        {/* Section A */}
        <div className="mb-8">
          <Skeleton className="h-6 w-24 mb-2" />
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-md" />
            ))}
          </div>
        </div>

        {/* Driving lane */}
        <Skeleton className="h-8 w-full mb-8" />

        {/* Section B */}
        <div className="mb-8">
          <Skeleton className="h-6 w-24 mb-2" />
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-md" />
            ))}
          </div>
        </div>

        {/* Driving lane */}
        <Skeleton className="h-8 w-full mb-8" />

        {/* Section C */}
        <div>
          <Skeleton className="h-6 w-24 mb-2" />
          <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-md" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

