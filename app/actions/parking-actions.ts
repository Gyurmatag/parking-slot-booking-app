"use server"

import { executeQuery } from "@/lib/db"
import { revalidatePath } from "next/cache"

export type ParkingSection = {
  id: number
  name: string
  description: string | null
}

export type ParkingSlot = {
  id: number
  slot_number: string
  section_id: number
  type: "standard" | "handicap" | "electric"
  status: "available" | "booked" | "unavailable" | "maintenance"
  price_per_hour: number
}

export type Booking = {
  id: number
  user_id: number
  slot_id: number
  start_time: Date
  end_time: Date
  status: "pending" | "confirmed" | "cancelled" | "completed"
  total_price: number
}

// Get all parking sections
export async function getParkingSections(): Promise<ParkingSection[]> {
  const sections = await executeQuery<ParkingSection>("SELECT * FROM parking_sections ORDER BY name")
  return sections
}

// Get all parking slots with section info
export async function getParkingSlots(): Promise<(ParkingSlot & { section_name: string })[]> {
  const slots = await executeQuery<ParkingSlot & { section_name: string }>(`
    SELECT ps.*, pse.name as section_name 
    FROM parking_slots ps
    JOIN parking_sections pse ON ps.section_id = pse.id
    ORDER BY ps.section_id, ps.slot_number
  `)
  return slots
}

// Get available parking slots for a specific time range
export async function getAvailableSlots(date: string, startTime: string, duration: number): Promise<ParkingSlot[]> {
  const startDateTime = new Date(`${date}T${startTime}`)
  const endDateTime = new Date(startDateTime.getTime() + duration * 60 * 60 * 1000)

  const slots = await executeQuery<ParkingSlot>(
    `
    SELECT ps.* FROM parking_slots ps
    WHERE ps.status = 'available'
    AND ps.id NOT IN (
      SELECT b.slot_id FROM bookings b
      WHERE b.status IN ('pending', 'confirmed')
      AND (
        (b.start_time <= $1 AND b.end_time > $1) OR
        (b.start_time < $2 AND b.end_time >= $2) OR
        (b.start_time >= $1 AND b.end_time <= $2)
      )
    )
    ORDER BY ps.section_id, ps.slot_number
  `,
    [endDateTime.toISOString(), startDateTime.toISOString()],
  )

  return slots
}

// Book a parking slot
export async function bookParkingSlot(
  slotId: number,
  userId: number,
  startTime: Date,
  endTime: Date,
): Promise<Booking | null> {
  try {
    // Check if slot is available
    const slot = await executeQuery<ParkingSlot>("SELECT * FROM parking_slots WHERE id = $1", [slotId])

    if (!slot || slot.length === 0 || slot[0].status !== "available") {
      throw new Error("Parking slot is not available")
    }

    // Calculate total price
    const hours = Math.ceil((endTime.getTime() - startTime.getTime()) / (60 * 60 * 1000))
    const totalPrice = hours * slot[0].price_per_hour

    // Create booking
    const booking = await executeQuery<Booking>(
      `
      INSERT INTO bookings (user_id, slot_id, start_time, end_time, status, total_price)
      VALUES ($1, $2, $3, $4, 'confirmed', $5)
      RETURNING *
    `,
      [userId, slotId, startTime.toISOString(), endTime.toISOString(), totalPrice],
    )

    // Update slot status
    await executeQuery("UPDATE parking_slots SET status = $1 WHERE id = $2", ["booked", slotId])

    // Revalidate paths to ensure UI updates
    revalidatePath("/")
    revalidatePath("/my-bookings")

    return booking[0]
  } catch (error) {
    console.error("Error booking slot:", error)
    return null
  }
}

// Get user bookings
export async function getUserBookings(
  userId: number,
): Promise<(Booking & { slot_number: string; section_name: string })[]> {
  const bookings = await executeQuery<Booking & { slot_number: string; section_name: string }>(
    `
    SELECT b.*, ps.slot_number, pse.name as section_name
    FROM bookings b
    JOIN parking_slots ps ON b.slot_id = ps.id
    JOIN parking_sections pse ON ps.section_id = pse.id
    WHERE b.user_id = $1
    ORDER BY b.start_time DESC
  `,
    [userId],
  )

  return bookings
}

// Cancel booking
export async function cancelBooking(bookingId: number): Promise<boolean> {
  try {
    const booking = await executeQuery<Booking>("SELECT * FROM bookings WHERE id = $1", [bookingId])

    if (!booking || booking.length === 0) {
      return false
    }

    await executeQuery("UPDATE bookings SET status = $1 WHERE id = $2", ["cancelled", bookingId])
    await executeQuery("UPDATE parking_slots SET status = $1 WHERE id = $2", ["available", booking[0].slot_id])

    // Revalidate paths to ensure UI updates
    revalidatePath("/")
    revalidatePath("/my-bookings")

    return true
  } catch (error) {
    console.error("Error cancelling booking:", error)
    return false
  }
}

