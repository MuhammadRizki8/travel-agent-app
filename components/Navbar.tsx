import Link from 'next/link';
import { Plane, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { headers } from 'next/headers';

export default async function Navbar() {
  const envBase = process.env.NEXT_PUBLIC_API_BASE;
  const hdrs = await headers();
  const proto = hdrs.get('x-forwarded-proto') ?? 'http';
  const host = hdrs.get('host') ?? 'localhost:3000';
  const base = envBase ?? `${proto}://${host}`;
  const res = await fetch(new URL('/api/user', base).toString());
  const user = res.ok ? await res.json() : null;

  return (
    <nav className="border-b bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo Area */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-600 hover:text-blue-700 transition-colors">
          <Plane className="h-6 w-6" />
          <span>TravelAgent.ai</span>
        </Link>

        {/* Menu Items */}
        <div className="flex items-center gap-4">
          <Link href="/trips" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
            My Trips
          </Link>
          {/* link chat with ai */}
          <Link href="/chat" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
            Chat with AI
          </Link>

          <div className="h-8 w-px bg-gray-200 mx-2"></div>

          {user ? (
            <Button variant="ghost" size="sm" className="flex gap-2 pl-1 pr-3 rounded-full hover:bg-blue-50" asChild>
              <Link href="/profile">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 border border-blue-200">
                  <User className="h-4 w-4" />
                </div>
                <div className="flex flex-col items-start text-xs">
                  <span className="font-semibold text-gray-900">{user?.name}</span>
                  <span className="text-gray-500 font-normal">Member</span>
                </div>
              </Link>
            </Button>
          ) : (
            <Button size="sm" asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
