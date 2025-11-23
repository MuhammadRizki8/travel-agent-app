'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/data/index';

export async function updateProfile(formData: FormData) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  const name = formData.get('name') as string;
  const preferences = formData.get('preferences') as string;

  await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      preferences,
    },
  });

  revalidatePath('/profile');
}

export async function addPaymentMethod(formData: FormData) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  const brand = formData.get('brand') as string;
  const last4Digits = formData.get('last4Digits') as string;
  // In a real app, we would handle tokenization here.
  // For this demo, we'll mock the token.
  const token = `tok_${Math.random().toString(36).substring(7)}`;

  await prisma.paymentMethod.create({
    data: {
      userId,
      brand,
      last4Digits,
      token,
      isDefault: false,
    },
  });

  revalidatePath('/profile');
}

export async function deletePaymentMethod(id: string) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  await prisma.paymentMethod.delete({
    where: { id, userId },
  });

  revalidatePath('/profile');
}

export async function addCalendarEvent(formData: FormData) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  const title = formData.get('title') as string;
  const start = new Date(formData.get('start') as string);
  const end = new Date(formData.get('end') as string);
  const description = formData.get('description') as string;
  const isAllDay = formData.get('isAllDay') === 'on';

  await prisma.calendarEvent.create({
    data: {
      userId,
      title,
      start,
      end,
      description,
      isAllDay,
    },
  });

  revalidatePath('/profile');
}

export async function deleteCalendarEvent(id: string) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  await prisma.calendarEvent.delete({
    where: { id, userId },
  });

  revalidatePath('/profile');
}

export async function getCalendarEvents() {
  const userId = await getUserId();
  if (!userId) return [];

  return prisma.calendarEvent.findMany({
    where: { userId },
    orderBy: { start: 'asc' },
  });
}

// Check if there is a schedule conflict with the user's Calendar Events
export async function validateDateConflict(startDate: Date, endDate: Date) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  // 1. Get all user calendar events
  const calendarEvents = await prisma.calendarEvent.findMany({
    where: { userId },
  });

  const conflicts: { title: string; start: Date; end: Date }[] = [];

  // 2. Check for overlap
  for (const event of calendarEvents) {
    // Overlap logic: (StartA < EndB) and (EndA > StartB)
    const isOverlapping = startDate < event.end && endDate > event.start;

    if (isOverlapping) {
      conflicts.push({
        title: event.title,
        start: event.start,
        end: event.end,
      });
    }
  }

  return conflicts;
}
