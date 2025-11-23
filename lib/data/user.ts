import { prisma } from '@/lib/prisma';

export async function getUserId() {
  try {
    // Hardcoded for demo purposes as per original code
    const user = await prisma.user.findUnique({
      where: { email: 'demo@travel.com' },
    });
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
