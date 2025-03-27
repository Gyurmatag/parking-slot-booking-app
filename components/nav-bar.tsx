import Link from "next/link"
import { Button } from "@/components/ui/button"

export function NavBar() {
  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold">
          ParkEasy
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost">Home</Button>
          </Link>
          <Link href="/my-bookings">
            <Button variant="ghost">My Bookings</Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}

