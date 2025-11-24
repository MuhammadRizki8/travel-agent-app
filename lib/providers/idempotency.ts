// Idempotency helpers replaced with no-op stubs.
// These stubs keep import sites working but disable idempotency behavior
// for assistant-initiated actions. Manual checkout flow will still call
// these functions but they will be harmless.

export async function findIdempotencyKey(_key: string) {
  void _key;
  return null;
}

export async function createIdempotencyKey(_key: string, _data?: { toolCallId?: string; metadata?: Record<string, unknown> }) {
  void _key;
  void _data;
  return null;
}

export async function markIdempotencyUsed(_key: string) {
  void _key;
  return null;
}

export async function updateIdempotencyMetadata(_key: string, _metadata: Record<string, unknown>) {
  void _key;
  void _metadata;
  return null;
}
