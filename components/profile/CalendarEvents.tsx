'use client';

import { useState } from 'react';
import { CalendarEvent } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, Loader2, Clock, Calendar as CalendarIcon, AlignLeft } from 'lucide-react';
import { addCalendarEvent, deleteCalendarEvent } from '@/lib/data/profile';
import { Badge } from '@/components/ui/badge';

export default function CalendarEvents({ events }: { events: CalendarEvent[] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleAdd(formData: FormData) {
    setLoading(true);
    try {
      // Fix Timezone: Convert local input to ISO string (UTC)
      const startLocal = formData.get('start') as string;
      const endLocal = formData.get('end') as string;

      if (startLocal && endLocal) {
        const startDate = new Date(startLocal);
        const endDate = new Date(endLocal);

        if (endDate < startDate) {
          alert('End time cannot be earlier than start time.');
          setLoading(false);
          return;
        }

        formData.set('start', startDate.toISOString());
        formData.set('end', endDate.toISOString());
      }

      await addCalendarEvent(formData);
      setIsAdding(false);
    } catch (error) {
      console.error(error);
      alert('Failed to add event.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await deleteCalendarEvent(id);
    } catch (error) {
      console.error(error);
      alert('Failed to delete event.');
    }
  }

  return (
    <div className="grid lg:grid-cols-1 gap-8">
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>My Agenda</CardTitle>
              <CardDescription>List of all your activities and trips.</CardDescription>
            </div>
            {!isAdding && (
              <Button onClick={() => setIsAdding(true)} size="sm">
                <Plus className="mr-2 h-4 w-4" /> Add Event
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isAdding && (
              <Card className="mb-6 border-dashed bg-gray-50/50">
                <CardContent className="pt-6">
                  <form action={handleAdd} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Event Title</Label>
                      <Input id="title" name="title" placeholder="Example: Vacation to Bali" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="start">Start</Label>
                        <Input id="start" name="start" type="datetime-local" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end">End</Label>
                        <Input id="end" name="end" type="datetime-local" required />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Input id="description" name="description" placeholder="Event details..." />
                    </div>

                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="isAllDay" name="isAllDay" className="rounded border-gray-300" />
                      <Label htmlFor="isAllDay" className="font-normal">
                        All Day
                      </Label>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {events.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CalendarIcon className="mx-auto h-12 w-12 mb-3 opacity-20" />
                  <p>No events saved yet.</p>
                </div>
              ) : (
                events.map((event) => (
                  <div key={event.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-base">{event.title}</h4>
                        {event.isAllDay && (
                          <Badge variant="secondary" className="text-[10px]">
                            All Day
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        {new Date(event.start).toDateString() === new Date(event.end).toDateString() ? (
                          <>
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="h-3.5 w-3.5" />
                              <span>{new Date(event.start).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </div>
                            {!event.isAllDay && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                <span>
                                  {new Date(event.start).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - {new Date(event.end).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-3.5 w-3.5" />
                            <span>
                              {new Date(event.start).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                              {!event.isAllDay && ` ${new Date(event.start).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`}
                              {' - '}
                              {new Date(event.end).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                              {!event.isAllDay && ` ${new Date(event.end).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`}
                            </span>
                          </div>
                        )}
                      </div>

                      {event.description && (
                        <div className="flex items-start gap-1 text-sm text-gray-600 mt-1">
                          <AlignLeft className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                          <p className="line-clamp-2">{event.description}</p>
                        </div>
                      )}
                    </div>

                    <Button variant="ghost" size="icon" onClick={() => handleDelete(event.id)} className="text-gray-400 hover:text-red-600 hover:bg-red-50 shrink-0 self-end sm:self-center">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
