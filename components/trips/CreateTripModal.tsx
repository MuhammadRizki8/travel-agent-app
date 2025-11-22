'use client';

import { useState, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { createTripAction } from '@/app/trips/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, Plane, Hotel, MapPin, Loader2 } from 'lucide-react';

// Types for props
type Props = {
  flights: any[];
  hotels: any[];
  activities: any[];
  paymentMethods: any[];
};

const initialState = {
  error: '',
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Buat Trip'}
    </Button>
  );
}

export default function CreateTripModal({ flights, hotels, activities, paymentMethods }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [addBooking, setAddBooking] = useState(false);
  const [bookingType, setBookingType] = useState<'FLIGHT' | 'HOTEL' | 'ACTIVITY'>('FLIGHT');

  const [state, formAction] = useFormState(createTripAction, initialState);

  useEffect(() => {
    if (state?.success && isOpen) {
      setIsOpen(false);
    }
  }, [state, isOpen]);

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="mr-2 h-4 w-4" /> Buat Trip Baru
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-white z-10 border-b">
          <CardTitle>Buat Trip Baru</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <form action={formAction} className="space-y-6">
            {state?.error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm font-medium">{state.error}</div>}

            <div className="space-y-2">
              <Label htmlFor="name">Nama Trip</Label>
              <Input id="name" name="name" placeholder="Contoh: Liburan Bali 2025" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Metode Pembayaran (Opsional)</Label>
              <Select name="paymentMethodId">
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Kartu" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((pm) => (
                    <SelectItem key={pm.id} value={pm.id}>
                      {pm.brand} •••• {pm.last4Digits}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 border p-4 rounded-lg bg-gray-50">
              <input type="checkbox" id="addBooking" name="addBooking" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={addBooking} onChange={(e) => setAddBooking(e.target.checked)} />
              <Label htmlFor="addBooking" className="cursor-pointer font-medium">
                Tambahkan Booking Pertama Sekarang
              </Label>
            </div>

            {addBooking && (
              <div className="space-y-4 border-l-2 border-blue-200 pl-4 ml-2">
                <div className="space-y-2">
                  <Label>Tipe Booking</Label>
                  <div className="flex gap-2">
                    <Button type="button" variant={bookingType === 'FLIGHT' ? 'default' : 'outline'} onClick={() => setBookingType('FLIGHT')} className="flex-1">
                      <Plane className="mr-2 h-4 w-4" /> Penerbangan
                    </Button>
                    <Button type="button" variant={bookingType === 'HOTEL' ? 'default' : 'outline'} onClick={() => setBookingType('HOTEL')} className="flex-1">
                      <Hotel className="mr-2 h-4 w-4" /> Hotel
                    </Button>
                    <Button type="button" variant={bookingType === 'ACTIVITY' ? 'default' : 'outline'} onClick={() => setBookingType('ACTIVITY')} className="flex-1">
                      <MapPin className="mr-2 h-4 w-4" /> Aktivitas
                    </Button>
                  </div>
                  <input type="hidden" name="type" value={bookingType} />
                </div>

                {bookingType === 'FLIGHT' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Pilih Penerbangan</Label>
                      <Select name="itemId">
                        <SelectTrigger>
                          <SelectValue placeholder="Cari penerbangan..." />
                        </SelectTrigger>
                        <SelectContent>
                          {flights.map((f) => (
                            <SelectItem key={f.id} value={f.id}>
                              {f.airline} ({f.originCode} ➝ {f.destCode}) - {new Date(f.departure).toLocaleString()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {bookingType === 'HOTEL' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Pilih Hotel</Label>
                      <Select name="itemId">
                        <SelectTrigger>
                          <SelectValue placeholder="Cari hotel..." />
                        </SelectTrigger>
                        <SelectContent>
                          {hotels.map((h) => (
                            <SelectItem key={h.id} value={h.id}>
                              {h.name} - {h.location.name} (⭐{h.rating})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Check-in</Label>
                        <Input type="date" name="checkIn" required />
                      </div>
                      <div className="space-y-2">
                        <Label>Check-out</Label>
                        <Input type="date" name="checkOut" required />
                      </div>
                    </div>
                  </div>
                )}

                {bookingType === 'ACTIVITY' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Pilih Aktivitas</Label>
                      <Select name="itemId">
                        <SelectTrigger>
                          <SelectValue placeholder="Cari aktivitas..." />
                        </SelectTrigger>
                        <SelectContent>
                          {activities.map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.name} - {a.location.name} ({a.durationMin} min)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tanggal</Label>
                      <Input type="datetime-local" name="date" required />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="pt-4">
              <SubmitButton />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
