import { getUserBookings } from "../actions/parking-actions"
import { getCurrentUser } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { clearAllBookings } from "../actions/clear-data"

export default async function MyBookingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
        <Card>
          <CardContent className="pt-6">
            <p>Please log in to view your bookings.</p>
            <Button className="mt-4">Log In</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const bookings = await getUserBookings(user.id)

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <div className="flex gap-2">
          <Link href="/">
            <Button variant="outline">Back to Parking Map</Button>
          </Link>
          {bookings.length > 0 && (
            <form action={clearAllBookings}>
              <Button type="submit" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50">
                Clear All Bookings
              </Button>
            </form>
          )}
        </div>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p>You don&apos;t have any bookings yet.</p>
            <Link href="/">
              <Button className="mt-4">Book a Parking Slot</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => {
            // Ensure total_price is a number
            const totalPrice =
              typeof booking.total_price === "string" ? Number.parseFloat(booking.total_price) : booking.total_price

            return (
              <Card key={booking.id}>
                <CardHeader className="pb-2">
                  <CardTitle>
                    Slot {booking.slot_number} - Section {booking.section_name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm text-muted-foreground">Start Time</div>
                    <div className="text-sm">{format(new Date(booking.start_time), "PPP p")}</div>

                    <div className="text-sm text-muted-foreground">End Time</div>
                    <div className="text-sm">{format(new Date(booking.end_time), "PPP p")}</div>

                    <div className="text-sm text-muted-foreground">Status</div>
                    <div className="text-sm capitalize">{booking.status}</div>

                    <div className="text-sm text-muted-foreground">Total Price</div>
                    <div className="text-sm">${isNaN(totalPrice) ? "0.00" : totalPrice.toFixed(2)}</div>
                  </div>

                  {booking.status === "confirmed" && (
                    <form
                      action={async () => {
                        "use server"
                        const { cancelBooking } = await import("../actions/parking-actions")
                        await cancelBooking(booking.id)
                      }}
                    >
                      <Button variant="outline" className="mt-4 w-full" type="submit">
                        Cancel Booking
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

