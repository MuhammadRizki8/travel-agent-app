import { z } from 'zod';
import { validateTripConflicts, processCheckoutAction } from '@/lib/data/checkout';
import type { User } from '@/lib/types';

// Idempotency helpers (no-op stubs exist but we'll keep hooks available)
import { findIdempotencyKey, createIdempotencyKey, markIdempotencyUsed } from '@/lib/providers/idempotency';

export const checkoutSchema = z.object({
  tripId: z.string(),
  paymentMethodId: z.string().optional(),
  confirmOnConflict: z.boolean().optional().default(false),
  idempotencyKey: z.string().optional(),
});

/**
 * Factory that produces the execute function for the `checkout_trip` tool.
 * Accepts the current `user` (may be null) so the route can pass its context.
 */
export function makeCheckoutTripTool(user: Partial<User> | null) {
  return async (input: unknown, options?: { toolCallId?: string }) => {
    console.log('✅ Tool checkout_trip called with:', input, 'toolCallId:', options?.toolCallId);

    // Validate input shape
    const parsed = checkoutSchema.safeParse(input);
    if (!parsed.success) {
      console.error('checkout_trip: invalid input', parsed.error);
      return { success: false, error: 'invalid_input', details: parsed.error.format() };
    }

    const { tripId, paymentMethodId, confirmOnConflict, idempotencyKey } = parsed.data;

    // Optionally respect idempotency key (stubs)
    if (idempotencyKey) {
      try {
        const found = await findIdempotencyKey(idempotencyKey);
        if (found) {
          console.log('checkout_trip: idempotency key found, returning cached result');
          return { success: true, idempotency: 'found' };
        }
        await createIdempotencyKey(idempotencyKey, { toolCallId: options?.toolCallId });
      } catch (err) {
        console.warn('checkout_trip: idempotency helper failed (continuing):', err);
      }
    }

    // Determine payment method: prefer explicit input, then user's first saved method
    const resolvedPaymentMethodId = paymentMethodId ?? (user?.paymentMethods && user.paymentMethods.length ? user.paymentMethods[0].id : undefined);

    if (!resolvedPaymentMethodId) {
      return {
        success: false,
        action: 'missing_payment',
        message: 'User has no saved payment method. Please add a payment method in your profile before checkout.',
        profileUrl: '/profile',
      };
    }

    // 1. Check calendar conflicts
    let conflicts: string[] = [];
    try {
      conflicts = await validateTripConflicts(tripId);
    } catch (err) {
      console.error('checkout_trip: validateTripConflicts failed:', err);
      return { success: false, error: 'validate_conflict_failed', details: String(err) };
    }

    if (conflicts.length > 0 && !confirmOnConflict) {
      return { success: false, action: 'confirm_conflicts', conflicts };
    }

    // 2. Proceed to finalize checkout (this may trigger Next redirect internally)
    try {
      await processCheckoutAction(tripId, resolvedPaymentMethodId);
      // If processCheckoutAction completes without throwing redirect, return success
      if (idempotencyKey) await markIdempotencyUsed(idempotencyKey);
      return { success: true };
    } catch (innerErr: unknown) {
      const maybeErr = innerErr as { digest?: unknown; message?: unknown } | undefined;
      const digest = typeof maybeErr?.digest === 'string' ? maybeErr.digest : typeof maybeErr?.message === 'string' ? maybeErr.message : undefined;

      // Detect Next.js redirect triggered by `redirect()` in server actions
      if (typeof digest === 'string' && digest.includes('NEXT_REDIRECT')) {
        const m = (digest as string).match(/NEXT_REDIRECT;[^;]*;([^;]+);(\d+);/);
        if (m) {
          let url = m[1];
          try {
            if (url.startsWith('/')) {
              const origin = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
              url = new URL(url, origin).toString();
            }
          } catch {
            url = `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'}/trips/${tripId}`;
          }

          if (idempotencyKey) await markIdempotencyUsed(idempotencyKey);
          return { success: true, redirect: url };
        }
      }

      console.error('checkout_trip: processCheckoutAction failed:', String(innerErr));
      return { success: false, error: 'checkout_failed', details: String(innerErr) };
    }
  };
}

export default makeCheckoutTripTool;
