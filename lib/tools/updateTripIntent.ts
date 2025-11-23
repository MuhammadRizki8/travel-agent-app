import { getSearchPreferencesByUserId, upsertSearchPreferences } from '@/lib/data/preferences';
import { Prisma } from '@prisma/client';

type UserLike = { id?: string | null; name?: string | null } | null;

function normalizeActivityType(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  const raw = value.toLowerCase().trim();
  if (/advent|hike|trek|outdoor/.test(raw)) return 'adventure';
  if (/food|culin|eat|restaurant|dine/.test(raw)) return 'culinary';
  if (/shop|mall|shopping/.test(raw)) return 'shopping';
  if (/culture|museum|history|historic|heritage|art/.test(raw)) return 'culture';
  if (/relax|rest|spa|beach|chill|leisure/.test(raw)) return 'relax';
  return value;
}

function diffObjects(oldObj: Record<string, unknown>, newObj: Record<string, unknown>) {
  const changed: Record<string, { from: unknown; to: unknown }> = {};
  const keys = new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})]);
  keys.forEach((k) => {
    const a = (oldObj || {})[k];
    const b = (newObj || {})[k];
    const aJson = typeof a === 'undefined' ? '__undefined__' : JSON.stringify(a);
    const bJson = typeof b === 'undefined' ? '__undefined__' : JSON.stringify(b);
    if (aJson !== bJson) changed[k] = { from: a, to: b };
  });
  return changed;
}

export async function handleUpdateTripIntent(input: unknown, user: UserLike, toolCallId?: string) {
  const callId = toolCallId ?? 'unknown';
  console.group && console.group(`Tool:update_trip_intent ${callId}`);
  try {
    console.log('-> Incoming raw input:', input);

    const normalized = { ...(input as Record<string, unknown>) } as Record<string, unknown>;
    if ('activityType' in normalized) {
      normalized.activityType = normalizeActivityType(normalized.activityType);
    }

    // console.log('-> Normalized input:', JSON.stringify(normalized, null, 2));

    if (!user || !user.id) {
      console.log('-> No authenticated user found; returning normalized input without persistence.');
      return normalized;
    }

    // Read existing preferences from dedicated table
    const existingParams = (await getSearchPreferencesByUserId(user.id)) || {};
    // console.log('-> Existing searchParameters (db):', JSON.stringify(existingParams, null, 2));

    const mergedParams = { ...(existingParams as Record<string, unknown>), ...normalized };

    // Log the diff so we can see what's changed vs full state
    const changes = diffObjects(existingParams as Record<string, unknown>, mergedParams);
    if (Object.keys(changes).length === 0) {
      console.log('-> No changes detected (merged equals existing).');
    } else {
      console.log('-> Changes to apply:', JSON.stringify(changes, null, 2));
    }

    // Persist updated preferences into SearchPreference table
    await upsertSearchPreferences(user.id, mergedParams as Prisma.InputJsonValue);
    console.log('-> Persisted merged searchParameters for user', user.id);

    return mergedParams;
  } catch (err) {
    console.error('-> Error in handleUpdateTripIntent:', err);
    throw err;
  } finally {
    // close console group if supported
    try {
      // call as a function to satisfy linter
      const c: Console = console;
      if (typeof c.groupEnd === 'function') c.groupEnd();
    } catch {
      /* ignore */
    }
  }
}

export default handleUpdateTripIntent;
