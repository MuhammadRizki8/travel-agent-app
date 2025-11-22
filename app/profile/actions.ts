'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/data';

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
