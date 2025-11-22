import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DAYS_TO_GENERATE = 30; // Generate data for the next 30 days

async function main() {
  console.log('Starting database seeding');

  // 1. Clear all the data, in order
  try {
    await prisma.auditLog.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.trip.deleteMany();
    await prisma.paymentMethod.deleteMany();
    await prisma.calendarEvent.deleteMany();
    await prisma.flight.deleteMany();
    await prisma.hotel.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.location.deleteMany();
    await prisma.user.deleteMany();
    console.log('Old data cleared from database');
  } catch (e) {
    console.log('Info: Database is already clean or error clearing data', e);
  }

  // 2. Create demo user
  const user = await prisma.user.create({
    data: {
      email: 'demo@travel.com',
      name: 'Sultan Traveler',
      preferences: JSON.stringify({
        seat: 'window',
        class: 'business',
        food: 'halal',
        interests: ['beach', 'culture', 'luxury', 'shopping'],
        currency: 'IDR',
      }),
      paymentMethods: {
        create: {
          brand: 'VISA',
          last4Digits: '4242',
          token: 'tok_visa_mock_secure_123',
          isDefault: true,
        },
      },
      calendar: {
        create: [
          {
            title: 'Annual Board Meeting',
            start: new Date(new Date().setDate(new Date().getDate() + 2)), // 2 days later
            end: new Date(new Date().setDate(new Date().getDate() + 2)),
            isAllDay: true,
            description: 'Critical meeting, cannot be rescheduled.',
          },
          {
            title: 'Tech Conference Keynote',
            start: new Date(new Date().setDate(new Date().getDate() + 15)),
            end: new Date(new Date().setDate(new Date().getDate() + 17)),
            isAllDay: true,
            description: 'Speaking engagement in Jakarta.',
          },
        ],
      },
    },
  });
  console.log(`Demo user created: ${user.name}`);

  // 3. Create Locations
  console.log('Seeding Locations...');
  const locationsData = [
    { name: 'Jakarta', code: 'CGK', country: 'Indonesia', description: 'The bustling capital of Indonesia.', image: 'https://images.unsplash.com/photo-1555899434-94d1368d7efe' },
    { name: 'Bali', code: 'DPS', country: 'Indonesia', description: 'Island of the Gods.', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4' },
    { name: 'Singapore', code: 'SIN', country: 'Singapore', description: 'A global financial center with a tropical climate.', image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd' },
    { name: 'Tokyo', code: 'HND', country: 'Japan', description: "Japan's busy capital, mixes the ultramodern and the traditional.", image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf' },
    { name: 'Bangkok', code: 'BKK', country: 'Thailand', description: 'Capital of Thailand, known for ornate shrines and vibrant street life.', image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365' },
  ];

  const locationMap: Record<string, string> = {}; // City Name -> ID

  for (const loc of locationsData) {
    const created = await prisma.location.create({
      data: loc,
    });
    locationMap[loc.name] = created.id;
  }
  console.log(`Created ${locationsData.length} locations.`);

  // 4. Generate Flights (High Volume)
  const airlines = [
    { name: 'Garuda Indonesia', code: 'GA' },
    { name: 'Singapore Airlines', code: 'SQ' },
    { name: 'AirAsia', code: 'QZ' },
    { name: 'All Nippon Airways', code: 'NH' },
    { name: 'Emirates', code: 'EK' },
  ];

  const routes = [
    { origin: 'CGK', dest: 'DPS', basePrice: 1500000 },
    { origin: 'CGK', dest: 'SIN', basePrice: 2500000 },
    { origin: 'CGK', dest: 'HND', basePrice: 7500000 }, // Tokyo
    { origin: 'DPS', dest: 'SIN', basePrice: 3000000 },
    { origin: 'SIN', dest: 'HND', basePrice: 8000000 },
    { origin: 'SIN', dest: 'BKK', basePrice: 2000000 }, // Bangkok
  ];

  let flightCount = 0;
  console.log('Generating flight data');

  for (let i = 1; i <= DAYS_TO_GENERATE; i++) {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + i);

    for (const route of routes) {
      for (const airline of airlines) {
        // Price variation +/- 20%
        const priceVariance = Math.random() * 0.4 - 0.2;
        const finalPrice = Math.floor(route.basePrice * (1 + priceVariance));

        // Create 2 schedules per airline per route (Morning & Afternoon)
        const times = [8, 14];

        for (const hour of times) {
          // Random minute variation
          const randomHour = hour + Math.floor(Math.random() * 2);

          const departure = new Date(currentDate);
          departure.setHours(randomHour, Math.floor(Math.random() * 59), 0, 0);

          const arrival = new Date(departure);
          arrival.setHours(departure.getHours() + 3); // Assume duration 3 hours

          // Random available seats (0 - 60)
          const seats = Math.floor(Math.random() * 61);

          await prisma.flight.create({
            data: {
              airline: airline.name,
              flightCode: `${airline.code}-${1000 + flightCount}`,
              originCode: route.origin,
              destCode: route.dest,
              departure: departure,
              arrival: arrival,
              price: finalPrice,
              availableSeats: seats,
            },
          });
          flightCount++;
        }
      }
    }
  }
  console.log(`Successfully created ${flightCount} flight records.`);

  // 5. Generate Hotels
  const hotelData = [
    { name: 'The Apurva Kempinski', city: 'Bali', rating: 5.0, price: 5500000, amenities: ['Ocean View', 'Spa', 'Private Pool'] },
    { name: 'Hard Rock Hotel', city: 'Bali', rating: 4.5, price: 2500000, amenities: ['Live Music', 'Pool', 'Gym'] },
    { name: 'Ubud Village Resort', city: 'Bali', rating: 4.8, price: 1800000, amenities: ['Nature', 'Yoga', 'Breakfast'] },
    { name: 'Marina Bay Sands', city: 'Singapore', rating: 5.0, price: 9500000, amenities: ['Infinity Pool', 'Casino', 'Luxury Mall'] },
    { name: 'Hotel Boss', city: 'Singapore', rating: 3.8, price: 1200000, amenities: ['City View', 'WiFi', 'Near MRT'] },
    { name: 'Park Hyatt', city: 'Jakarta', rating: 5.0, price: 4200000, amenities: ['Luxury', 'Fine Dining', 'Spa'] },
    { name: 'Pop! Hotel Kemang', city: 'Jakarta', rating: 3.5, price: 450000, amenities: ['Budget', 'WiFi', 'Clean'] },
    { name: 'Shinjuku Prince Hotel', city: 'Tokyo', rating: 4.0, price: 2800000, amenities: ['City Center', 'Train Access', 'Bar'] },
    { name: 'Aman Tokyo', city: 'Tokyo', rating: 5.0, price: 15000000, amenities: ['Ultra Luxury', 'Panorama View', 'Zen Garden'] },
    { name: 'Lebua at State Tower', city: 'Bangkok', rating: 4.7, price: 3500000, amenities: ['Rooftop Bar', 'River View', 'Suite'] },
  ];

  for (const h of hotelData) {
    await prisma.hotel.create({
      data: {
        name: h.name,
        locationId: locationMap[h.city],
        address: `Prime location in ${h.city}`,
        rating: h.rating,
        pricePerNight: h.price,
        amenities: JSON.stringify(h.amenities),
      },
    });
  }
  console.log(`Successfully created ${hotelData.length} hotel records.`);

  // 6. Generate Activities
  const activities = [
    { name: 'Kecak Fire Dance at Uluwatu', city: 'Bali', durationMin: 60, price: 150000 },
    { name: 'Snorkeling Nusa Penida Trip', city: 'Bali', durationMin: 480, price: 850000 },
    { name: 'Gardens by the Bay Access', city: 'Singapore', durationMin: 120, price: 350000 },
    { name: 'Universal Studios VIP Tour', city: 'Singapore', durationMin: 360, price: 2500000 },
    { name: 'TeamLab Planets', city: 'Tokyo', durationMin: 90, price: 400000 },
    { name: 'Shibuya Sky Deck', city: 'Tokyo', durationMin: 60, price: 250000 },
    { name: 'Grand Palace Tour', city: 'Bangkok', durationMin: 180, price: 500000 },
  ];

  for (const a of activities) {
    await prisma.activity.create({
      data: {
        name: a.name,
        locationId: locationMap[a.city],
        durationMin: a.durationMin,
        price: a.price,
      },
    });
  }
  console.log(`Successfully created ${activities.length} activity records`);

  console.log('Seeding process completed. Database is ready to use');
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
