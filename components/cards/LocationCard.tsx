import Link from 'next/link';
import { Map } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export interface LocationCardProps {
  item: {
    id: string;
    name: string;
    country: string;
    image?: string | null;
    description?: string | null;
  };
}

export function LocationCard({ item }: LocationCardProps) {
  return (
    <Card className="hover:shadow-md transition-all overflow-hidden group cursor-pointer">
      <Link href={`/locations/${item.id}`}>
        <div className="relative h-48 overflow-hidden">
          {item.image ? (
            <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <Map className="w-12 h-12 text-gray-400" />
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
            <h3 className="text-white font-bold text-xl">{item.name}</h3>
            <p className="text-white/80 text-sm">{item.country}</p>
          </div>
        </div>
      </Link>
      <div className="p-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{item.description || 'Destinasi wisata menarik untuk dikunjungi.'}</p>
        <div className="flex gap-2 mt-2">
          {/* <Button variant="link" className="px-0 text-blue-600" asChild>
            <Link href={`/?type=hotel&q=${item.name}`}>Lihat Hotel &rarr;</Link>
          </Button> */}
          <Button variant="link" className="px-0 text-blue-600 ml-auto" asChild>
            <Link href={`/locations/${item.id}`}>Detail &rarr;</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
