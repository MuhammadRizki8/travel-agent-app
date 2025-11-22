import { Plane } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import BookingButton from '@/components/BookingButton';
import { formatRupiah } from '@/lib/utils';

export interface FlightCardProps {
  item: {
    id: string;
    airline: string;
    flightCode: string;
    departure: Date;
    arrival: Date;
    originCode: string;
    destCode: string;
    price: number;
    availableSeats: number;
    origin: { city: string };
    destination: { city: string };
  };
  userId: string | null;
}

export function FlightCard({ item, userId }: FlightCardProps) {
  const duration = Math.abs(new Date(item.arrival).getTime() - new Date(item.departure).getTime()) / 36e5;

  return (
    <Card className="hover:shadow-md transition-all group border-l-4 border-l-blue-600">
      <div className="flex flex-col md:flex-row">
        <div className="flex-1 p-6 flex flex-col justify-center gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 font-bold text-xs">{item.airline.substring(0, 2).toUpperCase()}</div>
              <div>
                <h3 className="font-semibold text-gray-900">{item.airline}</h3>
                <p className="text-xs text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-full w-fit">{item.flightCode}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8 mt-2">
            <div className="text-center">
              <p className="text-xl font-bold">{new Date(item.departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              <Badge variant="secondary" className="text-xs font-mono">
                {item.originCode}
              </Badge>
            </div>

            <div className="flex-1 flex flex-col items-center px-4">
              <p className="text-xs text-muted-foreground mb-1">{duration.toFixed(1)} jam</p>
              <div className="w-full h-px bg-gray-300 relative">
                <Plane className="w-3 h-3 text-gray-400 absolute -top-1.5 right-0 rotate-90 md:rotate-0" />
              </div>
              <p className="text-xs text-blue-600 mt-1 font-medium">Langsung</p>
            </div>

            <div className="text-center">
              <p className="text-xl font-bold">{new Date(item.arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              <Badge variant="secondary" className="text-xs font-mono">
                {item.destCode}
              </Badge>
            </div>
          </div>
        </div>

        <Separator orientation="vertical" className="hidden md:block h-auto" />
        <Separator orientation="horizontal" className="md:hidden w-full" />

        <div className="md:w-64 p-6 bg-gray-50/50 flex flex-col justify-center items-end md:items-center gap-3">
          <div className="text-right md:text-center">
            <p className="text-sm text-muted-foreground">Harga per orang</p>
            <p className="text-2xl font-bold text-blue-700">{formatRupiah(item.price)}</p>
          </div>
          {userId ? (
            <BookingButton itemId={item.id} type="FLIGHT" price={item.price} userId={userId} />
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
