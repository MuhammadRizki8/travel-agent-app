'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// Use API route instead of importing server action

import { Flight, Hotel, Activity } from '@/lib/types';

interface BookingFormProps {
  tripId: string;
  type: 'FLIGHT' | 'HOTEL' | 'ACTIVITY';
  item: Flight | Hotel | Activity;
}

export default function BookingForm({ tripId, type, item }: BookingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Initialize state based on type
  const [startDate, setStartDate] = useState<string>(() => {
    if (type === 'FLIGHT') return new Date((item as Flight).departure).toISOString();
    if (type === 'ACTIVITY') return new Date().toISOString().split('T')[0];
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [endDate, setEndDate] = useState<string>(() => {
    if (type === 'FLIGHT') return new Date((item as Flight).arrival).toISOString();
    if (type === 'HOTEL') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    }
    return '';
  });

  // Flight State
  const [passengerName, setPassengerName] = useState('');
  const [seatNumber, setSeatNumber] = useState('');

  // Hotel State
  const [roomType, setRoomType] = useState('Standard');
  const [guests, setGuests] = useState(1);

  // Activity State
  const [ticketQty, setTicketQty] = useState(1);

  // Calculate Total Amount (Derived State)
  const totalAmount = (() => {
    if (type === 'FLIGHT') return (item as Flight).price;
    if (type === 'HOTEL' && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end.getTime() - start.getTime(); // Can be negative if user picks wrong dates
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const nights = diffDays > 0 ? diffDays : 1;
      return (item as Hotel).pricePerNight * nights;
    }
    if (type === 'ACTIVITY') return (item as Activity).price * ticketQty;
    return 0;
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload: {
      tripId: string;
      type: 'FLIGHT' | 'HOTEL' | 'ACTIVITY';
      itemId: string;
      totalAmount: string;
      details?: Record<string, unknown> | string;
      startDate?: string;
      endDate?: string;
    } = {
      tripId,
      type,
      itemId: item.id,
      totalAmount: totalAmount.toString(),
    };
    let details: Record<string, unknown> = {};
    const finalStartDate = startDate;
    let finalEndDate = endDate;

    if (type === 'FLIGHT') {
      details = { passengerName, seatNumber };
    } else if (type === 'HOTEL') {
      details = { roomType, guests };
    } else if (type === 'ACTIVITY') {
      details = { ticketQty };
      const start = new Date(startDate);
      const end = new Date(start.getTime() + (item as Activity).durationMin * 60000);
      finalEndDate = end.toISOString();
    }

    payload.details = JSON.stringify(details);
    payload.startDate = finalStartDate;
    payload.endDate = finalEndDate;

    try {
      const base = process.env.NEXT_PUBLIC_API_BASE ?? '';
      const res = await fetch(`${base}/api/bookings`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data?.success) {
        router.push(`/trips/${tripId}`);
      } else {
        alert(data?.error || 'Gagal membuat booking');
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      alert('Gagal membuat booking');
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lengkapi Data Booking</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* FLIGHT FORM */}
          {type === 'FLIGHT' && (
            <>
              <div className="grid gap-2">
                <Label>Nama Penumpang</Label>
                <Input required value={passengerName} onChange={(e) => setPassengerName(e.target.value)} placeholder="Sesuai KTP/Paspor" />
              </div>
              <div className="grid gap-2">
                <Label>Nomor Kursi</Label>
                <Input required value={seatNumber} onChange={(e) => setSeatNumber(e.target.value)} placeholder="Contoh: 12A" />
              </div>
            </>
          )}

          {/* HOTEL FORM */}
          {type === 'HOTEL' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Check-in</Label>
                  <Input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Check-out</Label>
                  <Input type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Tipe Kamar</Label>
                <Select value={roomType} onValueChange={setRoomType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Standard">Standard Room</SelectItem>
                    <SelectItem value="Deluxe">Deluxe Room</SelectItem>
                    <SelectItem value="Suite">Suite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Jumlah Tamu</Label>
                <Input type="number" min={1} required value={guests} onChange={(e) => setGuests(parseInt(e.target.value))} />
              </div>
            </>
          )}

          {/* ACTIVITY FORM */}
          {type === 'ACTIVITY' && (
            <>
              <div className="grid gap-2">
                <Label>Tanggal Aktivitas</Label>
                <Input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Jumlah Tiket</Label>
                <Input type="number" min={1} required value={ticketQty} onChange={(e) => setTicketQty(parseInt(e.target.value))} />
              </div>
            </>
          )}

          <div className="pt-4 border-t">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Total Harga</span>
              <span className="text-2xl font-bold text-blue-600">Rp {totalAmount.toLocaleString('id-ID')}</span>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Konfirmasi Booking'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
