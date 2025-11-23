import { prisma } from '@/lib/prisma';

export async function getSearchPreferencesByUserId(userId: string) {
  try {
    const rec = await prisma.searchPreference.findUnique({ where: { userId } });
    return rec?.parameters ?? null;
  } catch (err) {
    console.error('getSearchPreferencesByUserId failed:', err);
    throw err;
  }
}

export async function upsertSearchPreferences(userId: string, parameters: Record<string, unknown>) {
  try {
    const rec = await prisma.searchPreference.upsert({
      where: { userId },
      create: { userId, parameters },
      update: { parameters },
    });
    return rec;
  } catch (err) {
    console.error('upsertSearchPreferences failed:', err);
    throw err;
  }
}

export async function clearSearchPreferences(userId: string) {
  try {
    await prisma.searchPreference.deleteMany({ where: { userId } });
    return true;
  } catch (err) {
    console.error('clearSearchPreferences failed:', err);
    throw err;
  }
}

export default {
  getSearchPreferencesByUserId,
  upsertSearchPreferences,
  clearSearchPreferences,
};
