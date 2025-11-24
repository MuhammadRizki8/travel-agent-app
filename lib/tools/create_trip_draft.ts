import bookingTools, { BookingRequest } from '@/lib/tools/bookingTools';
import { createTripForUser, createBookingForTrip } from '@/lib/data/bookings';
import type { User } from '@/lib/types';

/**
 * Factory that produces the execute function for the `create_trip_draft` tool.
 * Accepts the current `user` (may be null) so the route can pass its context.
 */
export function makeCreateTripDraftTool(user: Partial<User> | null) {
  return async (input: unknown, options?: { toolCallId?: string }) => {
    console.log('✅ Tool create_trip_draft (SEARCH-ONLY) called with:', input, 'toolCallId:', options?.toolCallId);
    try {
      const paramsWithUser = { ...(input as Record<string, unknown>), userId: user?.id } as BookingRequest & { userId?: string };
      const searchResult = await bookingTools.searchRelevant(paramsWithUser);
      console.log('🔎 create_trip_draft SEARCH results:', JSON.stringify(searchResult, null, 2));

      // If there are any results and we have a user id, create a trip draft and add bookings
      let tripDraft: Record<string, unknown> | null = null;
      const createdBookings: Record<string, unknown>[] = [];

      if (user?.id && (searchResult.flights?.length || searchResult.hotels?.length || searchResult.activities?.length)) {
        try {
          const trip = await createTripForUser(user.id, {
            name: `Draft: ${paramsWithUser.origin ?? ''}-${paramsWithUser.destination ?? ''}`,
            startDate: paramsWithUser.startDate ? new Date(String(paramsWithUser.startDate)) : null,
            endDate: paramsWithUser.endDate ? new Date(String(paramsWithUser.endDate)) : null,
          });
          console.log('✅ Created trip draft:', trip.id);

          // Helper to safely create a booking from an item
          const tryCreateBooking = async (type: 'FLIGHT' | 'HOTEL' | 'ACTIVITY', item: Record<string, unknown> | undefined) => {
            try {
              if (!item) return null;
              const getVal = (obj: Record<string, unknown>, key: string) => {
                const v = obj[key];
                return v === undefined || v === null ? undefined : String(v);
              };
              let totalAmount = 0;
              let startDate: Date | undefined = undefined;
              let endDate: Date | undefined = undefined;

              if (type === 'FLIGHT') {
                totalAmount = Number(item.price ?? 0);
                const dep = getVal(item, 'departure');
                const arr = getVal(item, 'arrival');
                startDate = dep ? new Date(dep) : paramsWithUser.startDate ? new Date(String(paramsWithUser.startDate)) : undefined;
                endDate = arr ? new Date(arr) : paramsWithUser.endDate ? new Date(String(paramsWithUser.endDate)) : undefined;
              }

              if (type === 'HOTEL') {
                const pricePerNight = Number(item.pricePerNight ?? item.price ?? 0);
                const sd = paramsWithUser.startDate ? new Date(String(paramsWithUser.startDate)) : undefined;
                const ed = paramsWithUser.endDate ? new Date(String(paramsWithUser.endDate)) : undefined;
                let nights = 1;
                if (sd && ed) {
                  const diffMs = ed.getTime() - sd.getTime();
                  nights = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
                }
                totalAmount = pricePerNight * nights;
                startDate = sd;
                endDate = ed;
              }

              if (type === 'ACTIVITY') {
                totalAmount = Number(item.price ?? 0);
                startDate = paramsWithUser.startDate ? new Date(String(paramsWithUser.startDate)) : undefined;
                endDate = startDate;
              }

              // Build bookingDetails to match BookingForm structure
              const detailsPayload: Record<string, unknown> = { itemId: getVal(item, 'id'), raw: item };
              if (type === 'FLIGHT') {
                detailsPayload.passengerName = '';
                detailsPayload.seatNumber = '';
                detailsPayload.provider = getVal(item, 'airline') ?? getVal(item, 'provider');
                detailsPayload.flightNumber = getVal(item, 'flightCode') ?? getVal(item, 'flightNumber');
              }
              if (type === 'HOTEL') {
                detailsPayload.roomType = 'Standard';
                detailsPayload.guests = 1;
              }
              if (type === 'ACTIVITY') {
                detailsPayload.ticketQty = 1;
              }

              const booking = await createBookingForTrip(trip.id, {
                type,
                totalAmount: Math.max(0, Math.round(totalAmount)),
                bookingDetails: JSON.stringify(detailsPayload),
                startDate: startDate ?? new Date(),
                endDate: endDate ?? startDate ?? new Date(),
              });
              console.log(`✅ Created booking ${type} id=${booking.id} for trip=${trip.id}`);
              return booking;
            } catch (err) {
              console.error('Failed to create booking:', err);
              return null;
            }
          };

          // Prefer first candidate of each type (if any)
          if (searchResult.flights?.length) {
            const b = await tryCreateBooking('FLIGHT', searchResult.flights[0]);
            if (b) createdBookings.push(b);
          }
          if (searchResult.hotels?.length) {
            const b = await tryCreateBooking('HOTEL', searchResult.hotels[0]);
            if (b) createdBookings.push(b);
          }
          if (searchResult.activities?.length) {
            const b = await tryCreateBooking('ACTIVITY', searchResult.activities[0]);
            if (b) createdBookings.push(b);
          }

          tripDraft = { trip, bookings: createdBookings };
        } catch (err) {
          console.error('Failed to create trip draft or bookings:', err);
        }
      }

      // Return search result and optionally trip draft with created bookings
      return { searchResult, tripDraft };
    } catch (err) {
      console.error('create_trip_draft search failed:', err);
      return { error: 'search_failed', details: String(err) };
    }
  };
}

export default makeCreateTripDraftTool;
