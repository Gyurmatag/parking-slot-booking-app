"use server"

import { executeQuery } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function clearAllBookings() {
  try {
    // Delete all records from the bookings table
    await executeQuery("DELETE FROM bookings")

    // Reset all parking slots to available status
    await executeQuery("UPDATE parking_slots SET status = $1 WHERE status = $2", ["available", "booked"])

    // Revalidate paths to ensure UI updates
    revalidatePath("/")
    revalidatePath("/my-bookings")
  } catch (error) {
    console.error("Error clearing bookings:", error)
  }
}

