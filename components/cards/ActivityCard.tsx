import { Ticket, MapPin, CalendarClock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import BookingButton from '@/components/BookingButton';
import { formatRupiah } from '@/lib/utils';

export interface ActivityCardProps {
  item: {
    id: string;
    name: string;
    location: { name: string };
    price: number;
    durationMin: number;
  };
  userId: string | null;
}

export function ActivityCard({ item, userId }: ActivityCardProps) {
  return (
    <Card className="hover:shadow-md transition-all overflow-hidden flex flex-col md:flex-row">
      <div className="h-48 md:h-auto md:w-64 bg-orange-100 flex items-center justify-center">
        <Ticket className="w-12 h-12 text-orange-400" />
      </div>

      <div className="flex-1 p-6 flex flex-col justify-between gap-4">
        <div>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-xl text-gray-900">{item.name}</h3>
              <div className="flex items-center gap-1 text-muted-foreground mt-1">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{item.location?.name}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-orange-700">{formatRupiah(item.price)}</p>
              <p className="text-xs text-muted-foreground">/ orang</p>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Badge variant="outline" className="gap-1">
              <CalendarClock className="w-3 h-3" /> {item.durationMin} Menit
            </Badge>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          {userId ? (
            <BookingButton itemId={item.id} type="ACTIVITY" price={item.price} userId={userId} />
          ) : (
            <Button disabled variant="secondary">
              Login
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
