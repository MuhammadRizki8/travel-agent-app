// Shared TypeScript interfaces derived from Prisma schema (for frontend usage)

export type ISODateString = string;

export interface User {
  id: string;
  email: string;
  name: string;
  // stored as JSON string in DB; client components expect a string here
  preferences: string | null;
  createdAt: Date;
  updatedAt: Date;
  // Optional relations populated by some API endpoints
  paymentMethods?: PaymentMethod[];
  trips?: Trip[];
  calendar?: CalendarEvent[];
  auditLogs?: { id: string; action: string; timestamp: ISODateString }[];
}

export interface PaymentMethod {
  id: string;
  userId: string;
  last4Digits: string;
  token: string;
  brand: string;
  isDefault: boolean;
}

export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  start: Date;
  end: Date;
  description: string | null;
  isAllDay: boolean;
}

export interface Trip {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  status?: 'DRAFT' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  startDate?: ISODateString | null;
  endDate?: ISODateString | null;
  paymentMethodId?: string | null;
  bookings?: Booking[];
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
  // Optional expanded user relation
  user?: { paymentMethods?: PaymentMethod[] } | null;
}

export interface Location {
  id: string;
  name: string;
  code: string;
  country: string;
  image?: string | null;
  description?: string | null;
}

export interface Flight {
  id: string;
  airline: string;
  flightCode: string;
  originCode: string;
  destCode: string;
  departure: ISODateString;
  arrival: ISODateString;
  price: number;
  availableSeats: number;
}

export interface Hotel {
  id: string;
  name: string;
  locationId: string;
  address?: string | null;
  rating: number;
  pricePerNight: number;
  amenities?: string | null;
}

export interface Activity {
  id: string;
  name: string;
  locationId: string;
  durationMin: number;
  price: number;
}

export type BookingType = 'FLIGHT' | 'HOTEL' | 'ACTIVITY';

export interface Booking {
  id: string;
  tripId: string;
  type: BookingType;
  flightId?: string | null;
  hotelId?: string | null;
  activityId?: string | null;
  totalAmount: number;
  bookingDetails?: Record<string, unknown> | null;
  startDate: ISODateString;
  endDate: ISODateString;
  status?: string;
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
  // Optional expanded relations included by some API endpoints
  flight?: (Flight & { origin?: Location; destination?: Location }) | null;
  hotel?: (Hotel & { location?: Location }) | null;
  activity?: (Activity & { location?: Location }) | null;
}

export interface SearchPreference {
  id: string;
  userId: string;
  parameters: Record<string, unknown>;
}
