// File: prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Memulai proses seeding...');

  // 1. BERSIHKAN DATA LAMA (Clean Up)
  // Urutan delete SANGAT PENTING karena Foreign Key constraints.
  // Hapus anak dulu, baru induknya.
  try {
    await prisma.auditLog.deleteMany();
    await prisma.booking.deleteMany(); // Hapus Booking dulu
    await prisma.trip.deleteMany(); // Baru hapus Trip
    await prisma.paymentMethod.deleteMany(); // Baru hapus Payment
    await prisma.calendarEvent.deleteMany();

    // Hapus Inventory
    await prisma.flight.deleteMany();
    await prisma.hotel.deleteMany();
    await prisma.activity.deleteMany();

    // Terakhir hapus User
    await prisma.user.deleteMany();

    console.log('🧹 Database lama berhasil dibersihkan.');
  } catch (error) {
    console.log('⚠️ Gagal membersihkan data lama (mungkin database masih kosong), lanjut seeding...');
  }

  // 2. BUAT USER DEMO & PAYMENT METHOD
  const user = await prisma.user.create({
    data: {
      email: 'demo@travel.com',
      name: 'Sultan Traveler',
      preferences: JSON.stringify({
        seat: 'window',
        class: 'business',
        food: 'halal',
        interests: ['beach', 'culture', 'luxury'],
      }),
      // Langsung buat Payment Method-nya
      paymentMethods: {
        create: {
          brand: 'VISA',
          last4Digits: '4242',
          token: 'tok_visa_mock_secure_123',
          isDefault: true,
        },
      },
      // Langsung buat Calendar Event (Jebakan Jadwal)
      calendar: {
        create: [
          {
            title: 'Rapat Direksi Tahunan (PENTING)',
            start: new Date(new Date().setDate(new Date().getDate() + 2)), // 2 hari lagi
            end: new Date(new Date().setDate(new Date().getDate() + 2)), // Selesai hari yang sama
            isAllDay: true,
            description: 'Tidak bisa diganggu gugat.',
          },
        ],
      },
    },
  });
  console.log(`👤 User created: ${user.name}`);

  // 3. BUAT MOCK INVENTORY: FLIGHTS (Penerbangan)
  // Kita buat penerbangan untuk 7 hari ke depan
  const airlines = [
    { name: 'Garuda Indonesia', code: 'GA' },
    { name: 'Singapore Airlines', code: 'SQ' },
    { name: 'AirAsia', code: 'QZ' },
  ];

  // Destinasi Populer
  const routes = [
    { origin: 'CGK', dest: 'DPS', price: 1500000 }, // Jkt -> Bali
    { origin: 'CGK', dest: 'SIN', price: 2500000 }, // Jkt -> Singapore
    { origin: 'SIN', dest: 'DPS', price: 3000000 }, // Singapore -> Bali
  ];

  for (let i = 1; i <= 7; i++) {
    const flightDate = new Date();
    flightDate.setDate(flightDate.getDate() + i); // H+1 sampai H+7

    for (const route of routes) {
      for (const airline of airlines) {
        // Random variation harga & jam
        const randomPrice = route.price + Math.floor(Math.random() * 500000);
        const randomHour = 7 + Math.floor(Math.random() * 10); // Jam 07.00 - 17.00

        const departureTime = new Date(flightDate);
        departureTime.setHours(randomHour, 0, 0, 0);

        const arrivalTime = new Date(departureTime);
        arrivalTime.setHours(randomHour + 2, 30, 0, 0); // Asumsi flight 2.5 jam

        await prisma.flight.create({
          data: {
            airline: airline.name,
            flightCode: `${airline.code}-${100 + i + Math.floor(Math.random() * 900)}`,
            origin: route.origin,
            destination: route.dest,
            departure: departureTime,
            arrival: arrivalTime,
            price: randomPrice,
          },
        });
      }
    }
  }
  console.log('✈️ Flights inventory populated');

  // 4. BUAT MOCK INVENTORY: HOTELS
  const hotels = [
    { name: 'The Apurva Kempinski', city: 'Bali', rating: 5.0, price: 5500000 },
    { name: 'Hard Rock Hotel', city: 'Bali', rating: 4.5, price: 2500000 },
    { name: 'Ubud Village Resort', city: 'Bali', rating: 4.8, price: 1800000 },
    { name: 'Marina Bay Sands', city: 'Singapore', rating: 5.0, price: 9000000 },
    { name: 'Pop Hotel', city: 'Jakarta', rating: 3.0, price: 450000 },
  ];

  for (const h of hotels) {
    await prisma.hotel.create({
      data: {
        name: h.name,
        city: h.city,
        address: `Jalan Utama ${h.city} No. 1`,
        rating: h.rating,
        pricePerNight: h.price,
        amenities: JSON.stringify(['WiFi', 'Pool', 'Breakfast']),
      },
    });
  }
  console.log('🏨 Hotels inventory populated');

  // 5. BUAT MOCK INVENTORY: ACTIVITIES
  await prisma.activity.createMany({
    data: [
      { name: 'Kecak Fire Dance Uluwatu', city: 'Bali', durationMin: 60, price: 150000 },
      { name: 'Snorkeling Nusa Penida', city: 'Bali', durationMin: 180, price: 450000 },
      { name: 'Universal Studios Pass', city: 'Singapore', durationMin: 480, price: 1200000 },
    ],
  });
  console.log('surfing Activities populated');

  console.log('✅ Seeding selesai! Database siap digunakan.');
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
