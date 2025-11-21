import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  // Di real app, kita ambil session user.
  // Di PoC ini, kita hardcode ambil user "Sultan Traveler" yang baru kita seed.
  const email = 'demo@travel.com';

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      calendar: true, // Penting: AI perlu baca ini untuk cek jadwal bentrok
      paymentMethods: {
        // Penting: AI perlu tahu user punya metode bayar (tapi token masked)
        select: {
          brand: true,
          last4Digits: true,
          isDefault: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json(user);
}
