export function parseBookingDetails(raw: unknown): Record<string, unknown> {
  if (!raw) return {};
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : { raw };
    } catch {
      return { raw };
    }
  }
  if (typeof raw === 'object') return raw as Record<string, unknown>;
  return { raw };
}

export function getBookingCardFields(details: Record<string, unknown>) {
  const title = (details.summary as string) || (details.name as string) || (details.title as string) || '';
  const provider = (details.provider as string) || (details.airline as string) || (details.vendor as string) || '';
  const image = (details.image as string) || (details.thumbnail as string) || (details.photo as string) || null;
  const rating = typeof details.rating === 'number' ? (details.rating as number) : undefined;
  return { title, provider, image, rating };
}

export function formatPrice(value: unknown) {
  if (typeof value === 'number') return value.toLocaleString();
  if (typeof value === 'string' && !isNaN(Number(value))) return Number(value).toLocaleString();
  return String(value ?? '—');
}
