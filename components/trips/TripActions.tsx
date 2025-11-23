'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Pencil, Trash2, Loader2 } from 'lucide-react';

interface TripActionsProps {
  trip: {
    id: string;
    name: string;
    description: string | null;
    startDate: Date | null;
    endDate: Date | null;
  };
}

export default function TripActions({ trip }: TripActionsProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Edit Form State
  const [name, setName] = useState(trip.name);
  const [description, setDescription] = useState(trip.description || '');
  const [startDate, setStartDate] = useState(trip.startDate ? new Date(trip.startDate).toISOString().split('T')[0] : '');
  const [endDate, setEndDate] = useState(trip.endDate ? new Date(trip.endDate).toISOString().split('T')[0] : '');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE ?? '';
      const payload = { name, description, startDate, endDate };
      const res = await fetch(`${base}/api/trips/${trip.id}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success) {
        setIsEditOpen(false);
        router.refresh();
      } else {
        alert(data.error || 'Gagal memperbarui trip');
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert('Gagal memperbarui trip');
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE ?? '';
      const res = await fetch(`${base}/api/trips/${trip.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        router.push('/trips');
      } else {
        setLoading(false);
        alert(data.error || 'Gagal menghapus trip');
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert('Gagal menghapus trip');
    }
  };

  return (
    <div className="flex gap-2">
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Pencil className="h-4 w-4 mr-2" /> Edit Trip
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Trip</DialogTitle>
            <DialogDescription>Perbarui detail trip Anda di sini.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nama Trip</Label>
              <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-desc">Deskripsi</Label>
              <Textarea id="edit-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-start">Mulai</Label>
                <Input id="edit-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-end">Selesai</Label>
                <Input id="edit-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Simpan Perubahan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-2" /> Hapus Trip
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>Tindakan ini tidak dapat dibatalkan. Trip ini beserta semua booking di dalamnya akan dihapus permanen.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Ya, Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
