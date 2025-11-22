import Link from 'next/link';
import { Map } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface LocationCardProps {
  item: {
    name: string;
    country: string;
    image?: string | null;
    description?: string | null;
  };
}

export function LocationCard({ item }: LocationCardProps) {
  return (
    <Card className="hover:shadow-md transition-all overflow-hidden group cursor-pointer">
      <div className="relative h-48 overflow-hidden">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
      <div className="p-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{item.description || 'Destinasi wisata menarik untuk dikunjungi.'}</p>
        <Button variant="link" className="px-0 mt-2 text-blue-600" asChild>
          <Link href={`/?type=hotel&q=${item.name}`}>Lihat Hotel di sini &rarr;</Link>
        </Button>
      </div>
    </Card>
  );
}
