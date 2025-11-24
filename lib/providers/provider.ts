export interface ProviderBookFlightPayload {
  optionId: string;
  userId?: string;
  paymentMethodId?: string;
  metadata?: Record<string, unknown>;
}

export type ProviderBookingResult = {
  success: boolean;
  providerBookingId?: string;
  raw?: any;
  error?: string;
};

export interface Provider {
  name: string;
  bookFlight(payload: ProviderBookFlightPayload): Promise<ProviderBookingResult>;
  // Future: bookHotel, bookActivity, cancel, refund, etc.
}

export default Provider;
