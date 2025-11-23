'use client';

import { useState } from 'react';
import { PaymentMethod } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
// Use internal API route to process checkout instead of importing server helpers directly
import { Loader2, CreditCard, Plus } from 'lucide-react';
import Link from 'next/link';

interface CheckoutFormProps {
  tripId: string;
  paymentMethods: PaymentMethod[];
  totalAmount: number;
}

export default function CheckoutForm({ tripId, paymentMethods, totalAmount }: CheckoutFormProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>(paymentMethods.length > 0 ? paymentMethods[0].id : '');
  const [loading, setLoading] = useState(false);

  async function handlePay() {
    if (!selectedMethod) return;
    setLoading(true);
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE ?? '';
      const res = await fetch(`${base}/api/checkout/${tripId}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ paymentMethodId: selectedMethod }),
      });

      if (!res.ok) throw new Error('Checkout failed');
      const data = await res.json();
      if (!data?.success) throw new Error('Checkout failed');

      // If server included a redirect URL, navigate there (server now returns JSON redirect)
      if (data.redirect) {
        // If redirect is absolute or relative, assign to location to navigate
        window.location.href = data.redirect;
        return;
      }

      alert('Pembayaran berhasil');
    } catch (error) {
      console.error(error);
      alert('Pembayaran Gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Metode Pembayaran</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {paymentMethods.length === 0 ? (
          <div className="text-center py-6 space-y-4">
            <p className="text-gray-500 text-sm">Anda belum memiliki metode pembayaran.</p>
            <Button variant="outline" asChild>
              <Link href="/profile">
                <Plus className="mr-2 h-4 w-4" /> Tambah Kartu di Profil
              </Link>
            </Button>
          </div>
        ) : (
          <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value={method.id} id={method.id} />
                <Label htmlFor={method.id} className="flex items-center gap-3 cursor-pointer flex-1">
                  <CreditCard className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium">{method.brand}</p>
                    <p className="text-xs text-gray-500">•••• {method.last4Digits}</p>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}

        <Button className="w-full bg-green-600 hover:bg-green-700" size="lg" disabled={loading || !selectedMethod} onClick={handlePay}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Bayar Sekarang
        </Button>
      </CardContent>
    </Card>
  );
}
