'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getUserTrips, createTripAction } from '@/lib/data/trip';

export default function BookingButton({ itemId, type, userId, className }: { itemId: string; type: 'FLIGHT' | 'HOTEL' | 'ACTIVITY'; price: number; userId: string; className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [trips, setTrips] = useState<any[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [isNewTrip, setIsNewTrip] = useState(false);
  const [newTripName, setNewTripName] = useState('');

  const handleOpen = async () => {
    setLoading(true);
    try {
      const userTrips = await getUserTrips(userId);
      setTrips(userTrips);
      setIsOpen(true);
    } catch (error) {
      console.error(error);
      alert('Gagal memuat daftar trip.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    if (isNewTrip) {
      if (!newTripName) {
        alert('Nama trip wajib diisi');
        return;
      }
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append('name', newTripName);
        const res = await createTripAction(null, formData);
        if (res.success && res.tripId) {
          router.push(`/trips/${res.tripId}/book?type=${type}&itemId=${itemId}`);
        } else {
          alert(res.error || 'Gagal membuat trip');
          setLoading(false);
        }
      } catch (error) {
        console.error(error);
        alert('Terjadi kesalahan');
        setLoading(false);
      }
    } else {
      if (!selectedTripId) {
        alert('Pilih trip terlebih dahulu');
        return;
      }
      router.push(`/trips/${selectedTripId}/book?type=${type}&itemId=${itemId}`);
    }
  };

  return (
    <>
      <Button onClick={handleOpen} disabled={loading} className={`bg-blue-600 hover:bg-blue-700 ${className || ''}`}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...
          </>
        ) : (
          <>
            Pilih Tiket <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <CardTitle>Tambahkan ke Trip</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input type="radio" id="existing" name="tripType" checked={!isNewTrip} onChange={() => setIsNewTrip(false)} className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <Label htmlFor="existing" className="cursor-pointer">
                    Pilih Trip yang Ada
                  </Label>
                </div>

                {!isNewTrip && (
                  <Select value={selectedTripId} onValueChange={setSelectedTripId} disabled={trips.length === 0}>
                    <SelectTrigger>
                      <SelectValue placeholder={trips.length === 0 ? 'Belum ada trip' : 'Pilih Trip...'} />
                    </SelectTrigger>
                    <SelectContent>
                      {trips.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name} ({new Date(t.createdAt).toLocaleDateString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <div className="flex items-center space-x-2 pt-2">
                  <input type="radio" id="new" name="tripType" checked={isNewTrip} onChange={() => setIsNewTrip(true)} className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <Label htmlFor="new" className="cursor-pointer">
                    Buat Trip Baru
                  </Label>
                </div>

                {isNewTrip && (
                  <div className="pl-6">
                    <Input placeholder="Nama Trip (misal: Liburan Bali)" value={newTripName} onChange={(e) => setNewTripName(e.target.value)} />
                  </div>
                )}
              </div>

              <Button onClick={handleContinue} className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Lanjut ke Booking'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
