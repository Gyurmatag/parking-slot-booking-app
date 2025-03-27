import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

// Initialize the SQL client
export const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql)

// Helper function to execute raw SQL queries with proper parameter handling
export async function executeQuery(queryText: string, params: any[] = []) {
  try {
    // Convert the conventional query to a tagged template query
    // This builds a query string with the correct parameter placeholders
    const query = queryText
    const values = [...params]

    // Use sql.query for parameterized queries
    return await sql.query(query, values)
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

