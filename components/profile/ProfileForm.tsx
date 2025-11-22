'use client';

import { useState } from 'react';
import { User } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateProfile } from '@/app/profile/actions';
import { Loader2, Plane, Utensils, Armchair, Wallet, Heart, Coins } from 'lucide-react';

const INTERESTS_LIST = ['Beach', 'Mountain', 'City', 'Culture', 'Luxury', 'Shopping', 'Nature', 'Food', 'Adventure', 'Relaxation'];

interface UserPreferences {
  seat?: string;
  meal?: string;
  class?: string;
  currency?: string;
  interests?: string[];
  maxBudget?: string;
  [key: string]: string | string[] | undefined;
}

export default function ProfileForm({ user }: { user: User }) {
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      return JSON.parse(user.preferences || '{}');
    } catch {
      return {};
    }
  });

  const handlePreferenceChange = (key: string, value: string | string[]) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const handleInterestToggle = (interest: string) => {
    setPreferences((prev) => {
      const currentInterests = (prev.interests as string[]) || [];
      if (currentInterests.includes(interest)) {
        return { ...prev, interests: currentInterests.filter((i) => i !== interest) };
      } else {
        return { ...prev, interests: [...currentInterests, interest] };
      }
    });
  };

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      await updateProfile(formData);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your personal details and travel preferences.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user.email} disabled className="bg-gray-100" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" defaultValue={user.name} required />
            </div>
          </div>

          <div className="space-y-6 border-t pt-6">
            <h3 className="text-lg font-medium">Travel Preferences</h3>

            {/* Hidden input to submit the JSON string */}
            <input type="hidden" name="preferences" value={JSON.stringify(preferences)} />

            <div className="grid gap-6 md:grid-cols-2">
              {/* Seat Preference */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <Plane className="h-4 w-4" /> Seat Preference
                </Label>
                <Select value={preferences.seat || 'any'} onValueChange={(val) => handlePreferenceChange('seat', val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select seat preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">No Preference</SelectItem>
                    <SelectItem value="window">Window</SelectItem>
                    <SelectItem value="aisle">Aisle</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Meal Preference */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <Utensils className="h-4 w-4" /> Meal Preference
                </Label>
                <Select value={preferences.meal || 'standard'} onValueChange={(val) => handlePreferenceChange('meal', val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select meal preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="vegetarian">Vegetarian</SelectItem>
                    <SelectItem value="vegan">Vegan</SelectItem>
                    <SelectItem value="halal">Halal</SelectItem>
                    <SelectItem value="kosher">Kosher</SelectItem>
                    <SelectItem value="gluten_free">Gluten Free</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Flight Class */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <Armchair className="h-4 w-4" /> Flight Class
                </Label>
                <Select value={preferences.class || 'economy'} onValueChange={(val) => handlePreferenceChange('class', val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select flight class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="economy">Economy</SelectItem>
                    <SelectItem value="premium_economy">Premium Economy</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="first">First Class</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Currency */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <Coins className="h-4 w-4" /> Preferred Currency
                </Label>
                <Select value={preferences.currency || 'IDR'} onValueChange={(val) => handlePreferenceChange('currency', val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IDR">IDR (Indonesian Rupiah)</SelectItem>
                    <SelectItem value="USD">USD (US Dollar)</SelectItem>
                    <SelectItem value="SGD">SGD (Singapore Dollar)</SelectItem>
                    <SelectItem value="JPY">JPY (Japanese Yen)</SelectItem>
                    <SelectItem value="EUR">EUR (Euro)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Max Budget */}
              <div className="space-y-2 md:col-span-2">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <Wallet className="h-4 w-4" /> Max Budget Per Trip (Estimate)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500 text-sm">{preferences.currency || 'IDR'}</span>
                  <Input type="number" className="pl-12" placeholder="e.g. 5000000" value={preferences.maxBudget || ''} onChange={(e) => handlePreferenceChange('maxBudget', e.target.value)} />
                </div>
              </div>

              {/* Interests */}
              <div className="space-y-3 md:col-span-2">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <Heart className="h-4 w-4" /> Travel Interests
                </Label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS_LIST.map((interest) => {
                    const isSelected = (preferences.interests || []).includes(interest);
                    return (
                      <div
                        key={interest}
                        onClick={() => handleInterestToggle(interest)}
                        className={`cursor-pointer px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                          isSelected ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {interest}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
