// This is a mock authentication module
// In a real application, you would use NextAuth.js or a similar solution

import { executeQuery } from "./db"

export type User = {
  id: number
  email: string
  name: string
}

// Mock current user (in a real app, this would come from a session)
export const getCurrentUser = async (): Promise<User | null> => {
  // For demo purposes, we'll create a mock user if it doesn't exist
  try {
    let user = await executeQuery<User>("SELECT * FROM users WHERE email = $1", ["demo@example.com"])

    if (!user || user.length === 0) {
      // Create a demo user
      user = await executeQuery<User>(
        `
        INSERT INTO users (email, name, password_hash)
        VALUES ($1, $2, $3)
        RETURNING id, email, name
      `,
        ["demo@example.com", "Demo User", "hashed_password"],
      )
    }

    return user[0]
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

// Mock login function
export const login = async (email: string): Promise<User | null> => {
  try {
    // In a real app, you would verify the password hash
    const user = await executeQuery<User>("SELECT id, email, name FROM users WHERE email = $1", [email])
    return user.length > 0 ? user[0] : null
  } catch (error) {
    console.error("Error logging in:", error)
    return null
  }
}

// Mock register function
export const register = async (email: string, name: string): Promise<User | null> => {
  try {
    // In a real app, you would hash the password
    const user = await executeQuery<User>(
      `
      INSERT INTO users (email, name, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, email, name
    `,
      [email, name, "hashed_password"],
    )

    return user[0]
  } catch (error) {
    console.error("Error registering user:", error)
    return null
  }
}

