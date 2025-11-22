'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { FormEvent } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SearchFiltersProps {
  type: string;
  countries: string[];
  locations: { id: string; name: string; code: string }[];
  airlines: string[];
}

export function SearchFilters({ type, countries, locations, airlines }: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams(searchParams.toString());

    // Common filters
    const minPrice = formData.get('minPrice') as string;
    const maxPrice = formData.get('maxPrice') as string;

    if (minPrice) params.set('minPrice', minPrice);
    else params.delete('minPrice');
    if (maxPrice) params.set('maxPrice', maxPrice);
    else params.delete('maxPrice');

    // Type specific filters
    if (type === 'location') {
      const country = formData.get('country') as string;
      if (country && country !== 'all') params.set('country', country);
      else params.delete('country');
    }

    if (type === 'hotel' || type === 'activity') {
      const location = formData.get('location') as string;
      if (location && location !== 'all') params.set('location', location);
      else params.delete('location');
    }

    if (type === 'hotel') {
      const minRating = formData.get('minRating') as string;
      if (minRating) params.set('minRating', minRating);
      else params.delete('minRating');
    }

    if (type === 'flight') {
      const airline = formData.get('airline') as string;
      const origin = formData.get('origin') as string;
      const destination = formData.get('destination') as string;
      const date = formData.get('date') as string;

      if (airline && airline !== 'all') params.set('airline', airline);
      else params.delete('airline');
      if (origin && origin !== 'all') params.set('origin', origin);
      else params.delete('origin');
      if (destination && destination !== 'all') params.set('destination', destination);
      else params.delete('destination');
      if (date) params.set('date', date);
      else params.delete('date');
    }

    params.set('page', '1');
    router.push(`/?${params.toString()}`);
  };

  return (
    <Card className="p-4 h-fit space-y-6 sticky top-20 self-start">
      <form onSubmit={handleSubmit}>
        <h3 className="font-semibold mb-4">Filter</h3>

        {/* PRICE FILTER (Except Location) */}
        {type !== 'location' && (
          <div className="space-y-4 mb-6">
            <Label>Rentang Harga</Label>
            <div className="flex items-center gap-2">
              <Input name="minPrice" type="number" placeholder="Min" defaultValue={searchParams.get('minPrice') || ''} className="h-8 text-sm" />
              <span>-</span>
              <Input name="maxPrice" type="number" placeholder="Max" defaultValue={searchParams.get('maxPrice') || ''} className="h-8 text-sm" />
            </div>
          </div>
        )}

        {/* LOCATION FILTER (Country) */}
        {type === 'location' && (
          <div className="space-y-4 mb-6">
            <Label>Negara</Label>
            <Select name="country" defaultValue={searchParams.get('country') || ''}>
              <SelectTrigger className="h-8 text-sm w-full">
                <SelectValue placeholder="Pilih Negara" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Negara</SelectItem>
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* HOTEL & ACTIVITY FILTER (Location) */}
        {(type === 'hotel' || type === 'activity') && (
          <div className="space-y-4 mb-6">
            <Label>Lokasi</Label>
            <Select name="location" defaultValue={searchParams.get('location') || ''}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Pilih Lokasi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Lokasi</SelectItem>
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.name}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* FLIGHT FILTERS */}
        {type === 'flight' && (
          <div className="space-y-4 mb-6">
            <div className="space-y-2">
              <Label>Maskapai</Label>
              <Select name="airline" defaultValue={searchParams.get('airline') || ''}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Pilih Maskapai" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Maskapai</SelectItem>
                  {airlines.map((airline) => (
                    <SelectItem key={airline} value={airline}>
                      {airline}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Asal</Label>
              <Select name="origin" defaultValue={searchParams.get('origin') || ''}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Pilih Kota Asal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kota</SelectItem>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.name}>
                      {loc.name} ({loc.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tujuan</Label>
              <Select name="destination" defaultValue={searchParams.get('destination') || ''}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Pilih Kota Tujuan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kota</SelectItem>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.name}>
                      {loc.name} ({loc.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tanggal Keberangkatan</Label>
              <Input name="date" type="date" defaultValue={searchParams.get('date') || ''} className="h-8 text-sm" min={new Date().toISOString().split('T')[0]} />
            </div>
          </div>
        )}

        {/* RATING FILTER (HOTEL ONLY) */}
        {type === 'hotel' && (
          <div className="space-y-4 mt-6">
            <Label>Rating Minimal</Label>
            <div className="flex gap-2">
              <Input type="hidden" name="minRating" defaultValue={searchParams.get('minRating') || ''} />
              {[3, 4, 5].map((rating) => {
                const currentRating = Number(searchParams.get('minRating'));
                const isActive = currentRating === rating;
                return (
                  <Button
                    key={rating}
                    type="button"
                    variant={isActive ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      if (isActive) params.delete('minRating');
                      else params.set('minRating', rating.toString());
                      router.push(`/?${params.toString()}`);
                    }}
                    className="flex-1"
                  >
                    {rating}+ <Star className="w-3 h-3 ml-1 fill-current" />
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        <Button type="submit" className="w-full mt-6">
          Terapkan Filter
        </Button>
      </form>
    </Card>
  );
}
