import Provider, { ProviderBookFlightPayload, ProviderBookingResult } from './provider';

const mockProvider: Provider = {
  name: 'mock-provider',
  async bookFlight(_payload: ProviderBookFlightPayload): Promise<ProviderBookingResult> {
    // Simulate network/provider latency
    await new Promise((res) => setTimeout(res, 120));
    return { success: true, providerBookingId: `mock_${Date.now()}`, raw: { simulated: true } };
  },
};

export default mockProvider;
