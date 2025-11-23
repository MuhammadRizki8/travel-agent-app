import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Ticket, MapPin, CalendarClock, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import BookingButton from '@/components/BookingButton';
import { formatRupiah } from '@/lib/utils';

export default async function ActivityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const envBase = process.env.NEXT_PUBLIC_API_BASE;
  const hdrs = await (await import('next/headers')).headers();
  const proto = hdrs.get('x-forwarded-proto') ?? 'http';
  const host = hdrs.get('host') ?? 'localhost:3000';
  const base = envBase ?? `${proto}://${host}`;
  const { id } = await params;
  const activityRes = await fetch(new URL(`/api/activities/${id}`, base).toString());
  if (!activityRes.ok) return notFound();
  const activity = await activityRes.json();

  const userRes = await fetch(new URL('/api/user', base).toString());
  const user = userRes.ok ? await userRes.json() : null;
  const userId = user?.id ?? null;

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Card className="overflow-hidden shadow-lg">
          <div className="h-64 bg-orange-100 flex items-center justify-center">
            <Ticket className="w-24 h-24 text-orange-400" />
          </div>

          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{activity.name}</h1>
                <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{activity.location.name}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-orange-700">{formatRupiah(activity.price)}</p>
                <p className="text-sm text-muted-foreground">per orang</p>
              </div>
            </div>

            <div className="flex gap-4 mb-8">
              <Badge variant="secondary" className="px-3 py-1 text-sm flex items-center gap-2">
                <CalendarClock className="w-4 h-4" />
                {activity.durationMin} Menit
              </Badge>
              <Badge variant="secondary" className="px-3 py-1 text-sm flex items-center gap-2">
                <Info className="w-4 h-4" />
                Termasuk Pemandu
              </Badge>
            </div>

            <Separator className="my-6" />

            <div className="mb-8">
              <h3 className="font-semibold text-lg mb-4">Tentang Aktivitas Ini</h3>
              <p className="text-gray-600 leading-relaxed">
                Jelajahi keindahan dan keseruan {activity.name} di {activity.location.name}. Aktivitas ini dirancang untuk memberikan pengalaman terbaik bagi Anda, dengan durasi sekitar {activity.durationMin} menit yang penuh kesan.
              </p>
            </div>

            <div className="flex justify-end gap-4">
              <Button variant="outline" asChild>
                <Link href="/">Kembali</Link>
              </Button>
              {userId ? <BookingButton itemId={activity.id} type="ACTIVITY" price={activity.price} userId={userId} /> : <Button disabled>Login untuk Pesan</Button>}
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
