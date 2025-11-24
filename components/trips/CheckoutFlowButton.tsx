'use client';

import { useState } from 'react';
import type { ConflictItem } from '@/lib/data/checkout';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2, AlertTriangle } from 'lucide-react';

export default function CheckoutFlowButton({ tripId }: { tripId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [showWarning, setShowWarning] = useState(false);

  async function handleCheckoutClick() {
    setLoading(true);
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE ?? '';
      const res = await fetch(`${base}/api/checkout/validate?tripId=${encodeURIComponent(tripId)}`);
      const foundConflicts = res.ok ? ((await res.json()) as ConflictItem[]) : [];

      // API may return structured conflict objects; normalize to strings for rendering
      const messages: string[] = Array.isArray(foundConflicts)
        ? foundConflicts.map((it) => {
            if (it == null) return String(it);
            if (typeof it === 'string') return it;
            if (typeof it === 'object' && it !== null && 'message' in it) {
              const msg = (it as { message?: unknown }).message;
              return typeof msg === 'string' ? msg : String(msg);
            }
            return JSON.stringify(it);
          })
        : [];

      if (messages.length > 0) {
        setConflicts(messages);
        setShowWarning(true);
      } else {
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
            <div className="space-y-2">
              <div>Sistem mendeteksi jadwal perjalanan ini bentrok dengan agenda Anda:</div>
              <ul className="list-disc pl-5 text-sm text-gray-700 bg-amber-50 p-2 rounded border border-amber-100">
                {conflicts.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
              <div className="mt-2">Apakah Anda yakin ingin tetap melanjutkan ke pembayaran?</div>
            </div>
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
