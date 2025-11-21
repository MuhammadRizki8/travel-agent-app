import Link from 'next/link';
import { Plane, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  return (
    <nav className="border-b bg-white">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo Area */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
          <Plane className="h-6 w-6" />
          <span>TravelAgent.ai</span>
        </Link>

        {/* Menu Items */}
        <div className="flex items-center gap-4">
          <Link href="/history" className="text-sm font-medium text-gray-600 hover:text-blue-600">
            My Bookings
          </Link>

          <div className="h-8 w-px bg-gray-200 mx-2"></div>

          <Button variant="ghost" size="sm" className="flex gap-2">
            <div className="h-7 w-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <User className="h-4 w-4" />
            </div>
            <span className="text-sm">Sultan Traveler</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}
