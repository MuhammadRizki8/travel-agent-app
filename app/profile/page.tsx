import { getUserProfile } from '@/lib/data/index';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileForm from '@/components/profile/ProfileForm';
import PaymentMethods from '@/components/profile/PaymentMethods';
import CalendarEvents from '@/components/profile/CalendarEvents';

export default async function ProfilePage() {
  const user = await getUserProfile();

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
            <PaymentMethods methods={user.paymentMethods} />
          </TabsContent>

          <TabsContent value="calendar">
            <CalendarEvents events={user.calendar} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
