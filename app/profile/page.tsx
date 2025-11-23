import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileForm from '@/components/profile/ProfileForm';
import PaymentMethods from '@/components/profile/PaymentMethods';
import CalendarEvents from '@/components/profile/CalendarEvents';
import { User } from '@/lib/types';

export default async function ProfilePage() {
  const envBase = process.env.NEXT_PUBLIC_API_BASE;
  const hdrs = await (await import('next/headers')).headers();
  const proto = hdrs.get('x-forwarded-proto') ?? 'http';
  const host = hdrs.get('host') ?? 'localhost:3000';
  const base = envBase ?? `${proto}://${host}`;
  const res = await fetch(new URL('/api/user', base).toString());
  const user: User | null = res.ok ? await res.json() : null;

  if (!user) {
    return <div className="p-8 text-center">User not found.</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="profile">Profile Details</TabsTrigger>
            <TabsTrigger value="payment">Payment Methods</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileForm user={user} />
          </TabsContent>

          <TabsContent value="payment">
            <PaymentMethods methods={user?.paymentMethods ?? []} />
          </TabsContent>

          <TabsContent value="calendar">
            <CalendarEvents events={user?.calendar ?? []} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
