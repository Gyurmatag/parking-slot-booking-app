import ParkingLot from "@/components/parking-lot"
import { ParkingFilters } from "@/components/parking-filters"
import { seedParkingData } from "./actions/seed-data"
import { clearAllBookings } from "./actions/clear-data"
import { Button } from "@/components/ui/button"
import { FilterProvider } from "@/contexts/filter-context"

export default function Home() {
  return (
    <FilterProvider>
      <main className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold">Parking Slot Booking</h1>
          <div className="flex gap-2">
            <form action={seedParkingData}>
              <Button type="submit" variant="outline" size="sm">
                Initialize Demo Data
              </Button>
            </form>
            <form action={clearAllBookings}>
              <Button type="submit" variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50">
                Clear All Bookings
              </Button>
            </form>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <div className="space-y-6">
            <ParkingFilters />
          </div>
          <div className="bg-card rounded-lg border shadow-sm p-4">
            <ParkingLot />
          </div>
        </div>
      </main>
    </FilterProvider>
  )
}

