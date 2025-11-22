'use client';

import { useState } from 'react';
import { PaymentMethod } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Trash2, Plus, Loader2 } from 'lucide-react';
import { addPaymentMethod, deletePaymentMethod } from '@/app/profile/actions';

export default function PaymentMethods({ methods }: { methods: PaymentMethod[] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleAdd(formData: FormData) {
    setLoading(true);
    try {
      await addPaymentMethod(formData);
      setIsAdding(false);
    } catch (error) {
      console.error(error);
      alert('Failed to add payment method.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this payment method?')) return;
    try {
      await deletePaymentMethod(id);
    } catch (error) {
      console.error(error);
      alert('Failed to delete payment method.');
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
        <CardDescription>Manage your credit cards and payment options.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {methods.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No payment methods added yet.</p>
          ) : (
            methods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded border">
                    <CreditCard className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">{method.brand}</p>
                    <p className="text-sm text-muted-foreground">•••• •••• •••• {method.last4Digits}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(method.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {isAdding ? (
          <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
            <h4 className="font-medium text-sm">Add New Card</h4>
            <form action={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Card Brand</Label>
                  <Input id="brand" name="brand" placeholder="Visa, Mastercard" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last4Digits">Last 4 Digits</Label>
                  <Input id="last4Digits" name="last4Digits" placeholder="1234" maxLength={4} required />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Card
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <Button onClick={() => setIsAdding(true)} variant="outline" className="w-full border-dashed">
            <Plus className="mr-2 h-4 w-4" /> Add Payment Method
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
