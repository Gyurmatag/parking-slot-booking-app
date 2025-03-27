"use client"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ShipWheelIcon as Wheelchair, Zap } from "lucide-react"

interface ParkingSlotProps {
  slot: {
    id: string
    status: "available" | "booked" | "unavailable" | "maintenance"
    label: string
    type: "standard" | "handicap" | "electric"
    price: number | string // Accept either number or string
  }
  onClick: () => void
}

export function ParkingSlot({ slot, onClick }: ParkingSlotProps) {
  // Determine background color based on status
  const bgColor =
    slot.status === "available"
      ? "bg-green-500 hover:bg-green-600"
      : slot.status === "booked"
        ? "bg-red-500"
        : "bg-gray-400"

  // Determine cursor style based on status
  const cursor = slot.status === "unavailable" ? "cursor-not-allowed" : "cursor-pointer"

  // Ensure price is a number for formatting
  const priceAsNumber = typeof slot.price === "string" ? Number.parseFloat(slot.price) : slot.price
  const formattedPrice = isNaN(priceAsNumber) ? "0.00" : priceAsNumber.toFixed(2)

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`${bgColor} ${cursor} aspect-[4/3] rounded-md flex flex-col items-center justify-center text-white transition-colors`}
            onClick={onClick}
          >
            <div className="text-sm font-medium">{slot.label}</div>
            {slot.type === "handicap" && <Wheelchair className="w-4 h-4 mt-1" />}
            {slot.type === "electric" && <Zap className="w-4 h-4 mt-1" />}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p className="font-medium">{slot.label}</p>
            <p className="capitalize">{slot.status}</p>
            <p>
              {slot.type === "handicap" && "Handicap Accessible"}
              {slot.type === "electric" && "Electric Vehicle Charging"}
              {slot.type === "standard" && "Standard Parking"}
            </p>
            <p>${formattedPrice}/hr</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

