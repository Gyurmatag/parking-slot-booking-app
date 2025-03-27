import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

// Initialize the SQL client
export const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql)

type DatabaseValue = string | number | boolean | Date | null

// Helper function to execute raw SQL queries with proper parameter handling
export async function executeQuery<T = Record<string, DatabaseValue>>(
  queryText: string,
  params: (string | number | boolean | Date | null)[] = []
): Promise<T[]> {
  try {
    // Convert the conventional query to a tagged template query
    // This builds a query string with the correct parameter placeholders
    const query = queryText
    const values = [...params]

    // Use sql.query for parameterized queries
    const result = await sql.query(query, values)
    return result as T[]
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

