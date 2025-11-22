'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, Lock } from 'lucide-react';

export default function PaymentAction({ tripId, amount }: { tripId: string; amount: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/trips/confirm', {
        method: 'PATCH',
        body: JSON.stringify({ tripId }),
      });

      if (!res.ok) throw new Error('Gagal bayar');

      // Refresh halaman untuk update UI jadi "Sukses"
      router.refresh();
    } catch (error) {
      alert('Gagal memproses pembayaran.');
      setLoading(false);
    }
  };

  return (
    <Button className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-base shadow-green-200 shadow-lg" onClick={handleConfirm} disabled={loading}>
      {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
      {loading ? 'Memproses Pembayaran...' : `Bayar ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)}`}
    </Button>
  );
}
