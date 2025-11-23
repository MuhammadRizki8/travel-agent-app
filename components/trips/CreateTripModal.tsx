'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, Loader2 } from 'lucide-react';

function SubmitButton({ loading }: { loading: boolean }) {
  return (
    <Button type="submit" className="w-full" disabled={loading}>
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Buat Trip'}
    </Button>
  );
}

function CreateTripForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = { name, description, startDate, endDate };
      const base = process.env.NEXT_PUBLIC_API_BASE ?? '';
      const res = await fetch(`${base}/api/trips`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data?.success) {
        onSuccess();
      } else {
        setError(data?.error || 'Gagal membuat trip');
      }
    } catch (err) {
      console.error(err);
      setError('Gagal membuat trip');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm font-medium">{error}</div>}

      <div className="space-y-2">
        <Label htmlFor="name">Nama Trip</Label>
        <Input id="name" name="name" placeholder="Contoh: Liburan Bali 2025" required value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Input id="description" name="description" placeholder="Deskripsi singkat trip..." value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Tanggal Mulai</Label>
          <Input type="date" id="startDate" name="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">Tanggal Selesai</Label>
          <Input type="date" id="endDate" name="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>

      <div className="pt-4">
        <SubmitButton loading={loading} />
      </div>
    </form>
  );
}

export default function CreateTripModal() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="mr-2 h-4 w-4" /> Buat Trip Baru
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-white z-10 border-b">
          <CardTitle>Buat Trip Baru</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <CreateTripForm onSuccess={() => setIsOpen(false)} />
        </CardContent>
      </Card>
    </div>
  );
}
