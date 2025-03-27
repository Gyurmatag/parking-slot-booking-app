"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ShipWheelIcon as Wheelchair, Zap, X } from "lucide-react"
import { bookParkingSlot } from "@/app/actions/parking-actions"
import { toast } from "sonner"
import { format } from "date-fns"

interface BookingDetails {
  date: Date
  startTime: string
  duration: number
}

interface ParkingSlotInfoProps {
  slot: {
    id: string
    status: "available" | "booked" | "unavailable" | "maintenance"
    label: string
    type: "standard" | "handicap" | "electric"
    price: number | string // Accept either number or string
  }
  onClose: () => void
  onBookingComplete?: () => void
  bookingDetails?: BookingDetails
}

export function ParkingSlotInfo({ slot, onClose, onBookingComplete, bookingDetails }: ParkingSlotInfoProps) {
  const [isBooking, setIsBooking] = useState(false)

  // Ensure price is a number for formatting
  const priceAsNumber = typeof slot.price === "string" ? Number.parseFloat(slot.price) : slot.price

  const handleBookSlot = async () => {
    setIsBooking(true)
    try {
      // In a real app, you would get the user ID from authentication
      const userId = 1 // Mock user ID

      let startTime: Date
      let endTime: Date

      if (bookingDetails) {
        // Use the selected date and time from filters
        const [hours, minutes] = bookingDetails.startTime.split(":").map(Number)
        startTime = new Date(bookingDetails.date)
        startTime.setHours(hours, minutes, 0, 0)

        // Calculate end time based on duration
        endTime = new Date(startTime)
        endTime.setHours(endTime.getHours() + bookingDetails.duration)
      } else {
        // Use current time as fallback
        startTime = new Date()
        endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000) // 2 hours later
      }

      const booking = await bookParkingSlot(Number.parseInt(slot.id), userId, startTime, endTime)

      if (booking) {
        const durationText = bookingDetails
          ? `${bookingDetails.duration} hour${bookingDetails.duration !== 1 ? "s" : ""}`
          : "2 hours"

        toast.success("Booking Successful", {
          description: `You have booked slot ${slot.label} for ${durationText}.`,
        })

        // Call the onBookingComplete callback if provided
        if (onBookingComplete) {
          onBookingComplete()
        } else {
          onClose()
        }
      } else {
        toast.error("Booking Failed", {
          description: "Unable to book this slot. Please try again.",
        })
      }
    } catch (error) {
      console.error("Error booking slot:", error)
      toast.error("Booking Error", {
        description: "An error occurred while booking. Please try again.",
      })
    } finally {
      setIsBooking(false)
    }
  }

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">Slot {slot.label}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="text-sm text-muted-foreground">Status</div>
            <div className="text-sm font-medium capitalize">{slot.status}</div>

            <div className="text-sm text-muted-foreground">Type</div>
            <div className="text-sm font-medium flex items-center gap-2">
              {slot.type === "handicap" && (
                <>
                  <Wheelchair className="h-4 w-4" />
                  <span>Handicap Accessible</span>
                </>
              )}
              {slot.type === "electric" && (
                <>
                  <Zap className="h-4 w-4" />
                  <span>Electric Vehicle Charging</span>
                </>
              )}
              {slot.type === "standard" && "Standard Parking"}
            </div>

            <div className="text-sm text-muted-foreground">Price</div>
            <div className="text-sm font-medium">
              ${isNaN(priceAsNumber) ? "0.00" : priceAsNumber.toFixed(2)} / hour
            </div>

            {bookingDetails && (
              <>
                <div className="text-sm text-muted-foreground">Date</div>
                <div className="text-sm font-medium">{format(bookingDetails.date, "PPP")}</div>

                <div className="text-sm text-muted-foreground">Time</div>
                <div className="text-sm font-medium">
                  {bookingDetails.startTime} for {bookingDetails.duration} hour
                  {bookingDetails.duration !== 1 ? "s" : ""}
                </div>

                <div className="text-sm text-muted-foreground">Total Price</div>
                <div className="text-sm font-medium">
                  ${isNaN(priceAsNumber) ? "0.00" : (priceAsNumber * bookingDetails.duration).toFixed(2)}
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {slot.status === "available" ? (
          <Button className="w-full" onClick={handleBookSlot} disabled={isBooking}>
            {isBooking ? "Processing..." : "Book This Slot"}
          </Button>
        ) : slot.status === "booked" ? (
          <Button className="w-full" variant="outline" disabled>
            Already Booked
          </Button>
        ) : (
          <Button className="w-full" variant="outline" disabled>
            Unavailable
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

