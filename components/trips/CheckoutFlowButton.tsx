'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2, AlertTriangle } from 'lucide-react';
import { validateTripConflicts } from '@/lib/data/checkout';

export default function CheckoutFlowButton({ tripId }: { tripId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [showWarning, setShowWarning] = useState(false);

  async function handleCheckoutClick() {
    setLoading(true);
    try {
      // 1. Cek Konflik di Server
      const foundConflicts = await validateTripConflicts(tripId);

      if (foundConflicts.length > 0) {
        // 2. Jika ada konflik, tampilkan warning
        setConflicts(foundConflicts);
        setShowWarning(true);
      } else {
        // 3. Jika aman, langsung ke halaman checkout
        router.push(`/checkout/${tripId}`);
      }
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan saat memvalidasi jadwal.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={handleCheckoutClick} disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Checkout
      </Button>

      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Jadwal Bentrok Terdeteksi
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Sistem mendeteksi jadwal perjalanan ini bentrok dengan agenda Anda:</p>
              <ul className="list-disc pl-5 text-sm text-gray-700 bg-amber-50 p-2 rounded border border-amber-100">
                {conflicts.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
              <p className="mt-2">Apakah Anda yakin ingin tetap melanjutkan ke pembayaran?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push(`/checkout/${tripId}`)} className="bg-amber-600 hover:bg-amber-700">
              Ya, Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
