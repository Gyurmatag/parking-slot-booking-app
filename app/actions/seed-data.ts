"use server"

import { executeQuery } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function seedParkingData() {
  try {
    // Check if data already exists
    const sectionsCount = await executeQuery<{ count: string }>("SELECT COUNT(*) as count FROM parking_sections")
    if (Number(sectionsCount[0].count) > 0) {
      // Data already exists, just revalidate the path
      revalidatePath("/")
      return
    }

    // Create parking sections
    await executeQuery(`
      INSERT INTO parking_sections (name, description)
      VALUES 
        ('A', 'Ground Floor - Standard Parking'),
        ('B', 'Ground Floor - Mixed Parking'),
        ('C', 'First Floor - Mixed Parking')
    `)

    // Get section IDs
    const sections = await executeQuery("SELECT * FROM parking_sections")

    // Create parking slots for section A
    for (let i = 1; i <= 10; i++) {
      await executeQuery(
        `
        INSERT INTO parking_slots (slot_number, section_id, type, status, price_per_hour)
        VALUES ($1, $2, 'standard', $3, 5.00)
      `,
        [`A${i}`, sections[0].id, Math.random() > 0.7 ? "available" : Math.random() > 0.5 ? "booked" : "unavailable"],
      )
    }

    // Create parking slots for section B
    for (let i = 1; i <= 8; i++) {
      await executeQuery(
        `
        INSERT INTO parking_slots (slot_number, section_id, type, status, price_per_hour)
        VALUES ($1, $2, $3, $4, $5)
      `,
        [
          `B${i}`,
          sections[1].id,
          i <= 2 ? "handicap" : "standard",
          Math.random() > 0.6 ? "available" : Math.random() > 0.5 ? "booked" : "unavailable",
          i <= 2 ? 6.5 : 5.0,
        ],
      )
    }

    // Create parking slots for section C
    for (let i = 1; i <= 12; i++) {
      await executeQuery(
        `
        INSERT INTO parking_slots (slot_number, section_id, type, status, price_per_hour)
        VALUES ($1, $2, $3, $4, $5)
      `,
        [
          `C${i}`,
          sections[2].id,
          i <= 3 ? "electric" : "standard",
          Math.random() > 0.5 ? "available" : Math.random() > 0.5 ? "booked" : "unavailable",
          i <= 3 ? 7.5 : 5.0,
        ],
      )
    }

    revalidatePath("/")
  } catch (error) {
    console.error("Error seeding data:", error)
  }
}

