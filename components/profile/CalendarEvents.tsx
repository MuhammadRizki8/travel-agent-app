'use client';

import { useState } from 'react';
import { CalendarEvent } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, Loader2, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { addCalendarEvent, deleteCalendarEvent } from '@/app/profile/actions';

export default function CalendarEvents({ events }: { events: CalendarEvent[] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Calendar Logic
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const getEventsForDay = (day: number) => {
    return events.filter((e) => {
      const eventDate = new Date(e.start);
      return eventDate.getDate() === day && eventDate.getMonth() === currentDate.getMonth() && eventDate.getFullYear() === currentDate.getFullYear();
    });
  };

  async function handleAdd(formData: FormData) {
    setLoading(true);
    try {
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
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Left Column: Visual Calendar */}
      <Card className="lg:col-span-2 h-fit">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base font-semibold">{monthName}</CardTitle>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-muted-foreground font-medium py-1">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-24 bg-gray-50/50 rounded-md" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDay(day);
              const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();

              return (
                <div key={day} className={`h-24 border rounded-md p-1 relative group hover:border-blue-300 transition-colors ${isToday ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}>
                  <span className={`text-xs font-medium block mb-1 ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>{day}</span>
                  <div className="space-y-1 overflow-y-auto max-h-[calc(100%-20px)] no-scrollbar">
                    {dayEvents.map((ev) => (
                      <div key={ev.id} className="text-[10px] bg-blue-100 text-blue-700 px-1 py-0.5 rounded truncate" title={ev.title}>
                        {ev.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Right Column: List & Add Form */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Your schedule for this month.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[400px] overflow-y-auto">
            {events
              .filter((e) => new Date(e.start).getMonth() === currentDate.getMonth())
              .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
              .map((event) => (
                <div key={event.id} className="flex items-start justify-between p-3 border rounded-lg bg-gray-50 text-sm">
                  <div>
                    <h4 className="font-medium">{event.title}</h4>
                    <div className="flex items-center gap-1 text-muted-foreground mt-1 text-xs">
                      <Clock className="h-3 w-3" />
                      <span>
                        {new Date(event.start).toLocaleDateString()}
                        {!event.isAllDay && ` ${new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(event.id)} className="h-6 w-6 text-red-500 hover:text-red-700">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            {events.filter((e) => new Date(e.start).getMonth() === currentDate.getMonth()).length === 0 && <p className="text-sm text-muted-foreground italic text-center py-4">No events this month.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add New Event</CardTitle>
          </CardHeader>
          <CardContent>
            {isAdding ? (
              <form action={handleAdd} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="title" className="text-xs">
                    Title
                  </Label>
                  <Input id="title" name="title" placeholder="Trip to Bali" required className="h-8 text-sm" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="start" className="text-xs">
                      Start
                    </Label>
                    <Input id="start" name="start" type="datetime-local" required className="h-8 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="end" className="text-xs">
                      End
                    </Label>
                    <Input id="end" name="end" type="datetime-local" required className="h-8 text-xs" />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isAllDay" name="isAllDay" className="rounded border-gray-300" />
                  <Label htmlFor="isAllDay" className="font-normal text-xs">
                    All Day
                  </Label>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setIsAdding(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                    Add
                  </Button>
                </div>
              </form>
            ) : (
              <Button onClick={() => setIsAdding(true)} variant="outline" className="w-full border-dashed">
                <Plus className="mr-2 h-4 w-4" /> Add Event
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
