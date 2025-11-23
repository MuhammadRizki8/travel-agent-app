import { prisma } from '@/lib/prisma';

export async function getUserId() {
  try {
    // Development convenience: allow overriding demo user email via env var
    // If not provided, fall back to finding ANY user in the DB (dev only).
    const demoEmail = process.env.DEMO_USER_EMAIL ?? process.env.NEXT_PUBLIC_DEMO_USER_EMAIL ?? 'demo@travel.com';
    let user = await prisma.user.findUnique({ where: { email: demoEmail } });

    if (!user) {
      // If the configured demo email isn't present, try to return the first user (development convenience)
      user = await prisma.user.findFirst();
    }

    return user?.id || null;
  } catch (e) {
    console.error('Failed to fetch user ID', e);
    return null;
  }
}

export async function getUserProfile() {
  // get user id emo@travel.com  hacked for demo
  const userId = (await getUserId()) || '';
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      paymentMethods: true,
      calendar: {
        orderBy: { start: 'asc' },
      },
    },
  });
}

export async function getCurrentUser() {
  try {
    const userId = await getUserId();
    if (!userId) return null;

    return prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, id: true },
    });
  } catch (error) {
    console.error('Failed to fetch current user', error);
    return null;
  }
}
