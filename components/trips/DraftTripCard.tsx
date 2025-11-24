'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import DeleteBookingButton from '@/components/trips/DeleteBookingButton';
import { parseBookingDetails, getBookingCardFields, formatPrice } from '@/lib/utils/bookingHelpers';

type BookingItem = {
  id: string;
  type?: string;
  totalAmount?: number;
  bookingDetails?: string | Record<string, unknown>;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  status?: string;
};

type DraftTrip = {
  id: string;
  userId?: string;
  name?: string;
  description?: string;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  bookings?: BookingItem[];
};

interface Props {
  draftTrip: DraftTrip;
  onDeleted?: () => void;
  onCheckoutSuccess?: (data: any) => void;
}

export default function DraftTripCard({ draftTrip, onDeleted, onCheckoutSuccess }: Props) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isConflictDialogOpen, setIsConflictDialogOpen] = useState(false);
  const [conflicts, setConflicts] = useState<Array<Record<string, unknown>>>([]);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const tripName = draftTrip?.name ?? '';
  const tripDescription = draftTrip?.description ?? '';
  const tripStart = draftTrip?.startDate ? String(draftTrip.startDate) : null;
  const tripEnd = draftTrip?.endDate ? String(draftTrip.endDate) : null;
  const tripBookings = Array.isArray(draftTrip?.bookings) ? (draftTrip.bookings as BookingItem[]) : [];

  const handleDelete = async () => {
    if (!draftTrip?.id) return;
    try {
      const res = await fetch('/api/trips/draft', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId: draftTrip.id }),
      });
      if (!res.ok) throw new Error('delete failed');
      setIsDeleteDialogOpen(false);
      if (onDeleted) onDeleted();
      alert('Draft trip deleted');
    } catch (err) {
      console.error('Failed to delete draft', err);
      alert('Failed to delete draft');
    }
  };

  const handleCheckout = async (proceedIfConflicts = false) => {
    if (!draftTrip?.id) return;
    setCheckoutLoading(true);
    let toolCallId: string;
    try {
      const maybeCrypto = typeof window !== 'undefined' && window.crypto ? (window.crypto as unknown as { randomUUID?: () => string }) : undefined;
      toolCallId = maybeCrypto && typeof maybeCrypto.randomUUID === 'function' ? maybeCrypto.randomUUID() : `client-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    } catch {
      toolCallId = `client-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }

    try {
      const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tripId: draftTrip.id, proceedIfConflicts, toolCallId }) });
      const data = await res.json().catch(() => ({}));
      if (res.status === 409 && data?.error === 'conflict') {
        setConflicts(Array.isArray(data.conflicts) ? data.conflicts : []);
        setIsConflictDialogOpen(true);
      } else if (res.status === 400 && data?.error === 'no_payment_method') {
        window.location.href = data.redirect ?? '/profile';
      } else if (!res.ok) {
        throw new Error('checkout failed');
      } else {
        if (onCheckoutSuccess) onCheckoutSuccess(data);
        alert('Checkout complete');
      }
    } catch (err) {
      console.error('Checkout error', err);
      alert('Checkout failed — see console for details.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const parseBooking = (b: BookingItem) => {
    const details = parseBookingDetails(b.bookingDetails);
    const { title, provider, image, rating } = getBookingCardFields(details);
    const total = Number(b.totalAmount ?? 0);
    return { title, provider, image, rating, total, details };
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">Draft trip</div>
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>{tripName}</span>
            <Badge variant="outline">{tripBookings.length} items</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground">{tripDescription}</div>
          <div className="mt-2 text-sm">Start: {tripStart ? new Date(String(tripStart)).toLocaleDateString() : '—'}</div>
          <div className="text-sm">End: {tripEnd ? new Date(String(tripEnd)).toLocaleDateString() : '—'}</div>
          <Separator className="my-3" />

          <div className="space-y-3">
            {tripBookings.length > 0 ? (
              tripBookings.map((b, idx) => {
                const id = String(b.id ?? `item-${idx}`);
                const type = b.type ?? 'ITEM';
                const { title, provider, image, rating, total } = parseBooking(b);

                return (
                  <Card key={id} className="p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
                        {image ? <Image src={String(image)} alt={title} width={96} height={64} className="object-cover rounded" /> : null}
                        <div>
                          <div className="text-sm font-semibold">{title}</div>
                          <div className="text-xs text-muted-foreground">
                            {type}
                            {provider ? ` • ${provider}` : ''}
                          </div>
                          <div className="text-sm mt-1">Price: {formatPrice(total)}</div>
                          {rating ? <div className="text-xs text-muted-foreground">Rating: {rating}</div> : null}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex gap-2">
                          <DeleteBookingButton bookingId={id} />
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            ) : (
              <div className="text-sm text-muted-foreground">No items yet</div>
            )}
          </div>

          <div className="flex gap-2 mt-4">
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="flex-1">
                  Tolak
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete draft trip?</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button
              className="flex-1"
              onClick={async () => {
                await handleCheckout(false);
              }}
            >
              {checkoutLoading ? 'Processing...' : 'Checkout'}
            </Button>
          </div>

          {/* Conflict confirmation dialog */}
          <AlertDialog open={isConflictDialogOpen} onOpenChange={setIsConflictDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Calendar conflicts detected</AlertDialogTitle>
              </AlertDialogHeader>
              <div className="max-h-48 overflow-auto mt-2">
                {conflicts.length > 0 ? (
                  conflicts.map((c, i) => (
                    <div key={i} className="p-2 border-b last:border-b-0">
                      <div className="text-sm font-medium">{String(c.title ?? c.name ?? 'Event')}</div>
                      <div className="text-xs text-muted-foreground">
                        {String(c.start ?? c.time ?? '')} — {String(c.end ?? '')}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground p-2">No details available</div>
                )}
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    await handleCheckout(true);
                    setIsConflictDialogOpen(false);
                  }}
                >
                  Proceed
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
