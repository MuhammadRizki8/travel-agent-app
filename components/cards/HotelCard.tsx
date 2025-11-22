import Link from 'next/link';
import { Hotel, Star, MapPin, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import BookingButton from '@/components/BookingButton';
import { formatRupiah } from '@/lib/utils';

export interface HotelCardProps {
  item: {
    id: string;
    name: string;
    rating: number;
    location: { name: string };
    pricePerNight: number;
    address?: string;
  };
  userId: string | null;
}

export function HotelCard({ item, userId }: HotelCardProps) {
  return (
    <Card className="hover:shadow-md transition-all overflow-hidden flex flex-col md:flex-row">
      <div className="h-48 md:h-auto md:w-64 bg-zinc-100 flex items-center justify-center">
        <Hotel className="w-12 h-12 text-zinc-400" />
      </div>

      <div className="flex-1 p-6 flex flex-col justify-between gap-4">
        <div>
          <div className="flex justify-between items-start">
            <div>
              <Link href={`/hotels/${item.id}`} className="hover:underline">
                <h3 className="font-bold text-xl text-gray-900">{item.name}</h3>
              </Link>
              <div className="flex items-center gap-1 text-amber-500 mt-1">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-medium text-sm">{item.rating}</span>
                <span className="text-muted-foreground text-sm ml-2">• {item.location?.name}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-teal-700">{formatRupiah(item.pricePerNight)}</p>
              <p className="text-xs text-muted-foreground">/ malam</p>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Badge variant="outline" className="gap-1">
              <MapPin className="w-3 h-3" /> {item.address || 'Pusat Kota'}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Users className="w-3 h-3" /> Family Friendly
            </Badge>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t gap-2">
          {userId ? (
            <BookingButton itemId={item.id} type="HOTEL" price={item.pricePerNight} userId={userId} />
          ) : (
            <Button disabled variant="secondary">
              Login
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href={`/hotels/${item.id}`}>Detail</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
