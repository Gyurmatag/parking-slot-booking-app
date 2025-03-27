"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { CalendarIcon, ShipWheelIcon as Wheelchair, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { format, addDays } from "date-fns"
import { useFilters } from "@/contexts/filter-context"

export function ParkingFilters() {
  const {
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
  } = useFilters()

  const [isLoading, setIsLoading] = useState(false)

  const handleApplyFilters = async () => {
    if (!date) return

    setIsLoading(true)

    try {
      // We don't need to do anything here as the parent component will react to the filter changes
      // Just simulate a loading state for better UX
      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (error) {
      console.error("Error applying filters:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Picker */}
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) => date < new Date() || date > addDays(new Date(), 30)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Start Time */}
        <div className="space-y-2">
          <Label htmlFor="start-time">Start Time</Label>
          <Select value={startTime} onValueChange={(value) => setStartTime(value)}>
            <SelectTrigger id="start-time" className="w-full">
              <SelectValue placeholder="Select start time" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 24 }).map((_, i) => {
                const hour = i.toString().padStart(2, "0")
                return (
                  <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                    {`${hour}:00`}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (hours)</Label>
          <Select value={duration.toString()} onValueChange={(value) => setDuration(Number.parseInt(value))}>
            <SelectTrigger id="duration" className="w-full">
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((hours) => (
                <SelectItem key={hours} value={hours.toString()}>
                  {hours} {hours === 1 ? "hour" : "hours"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Slot Type Filters */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-handicap" className="flex items-center gap-2">
              <Wheelchair className="h-4 w-4" />
              Show Handicap Slots
            </Label>
            <Switch id="show-handicap" checked={showHandicap} onCheckedChange={setShowHandicap} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-electric" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Show Electric Slots
            </Label>
            <Switch id="show-electric" checked={showElectric} onCheckedChange={setShowElectric} />
          </div>
        </div>

        <Button className="w-full mt-4" onClick={handleApplyFilters} disabled={isLoading}>
          {isLoading ? "Loading..." : "Apply Filters"}
        </Button>
      </CardContent>
    </Card>
  )
}

