import { db } from '../lib/db';
import { seedData } from './seedData';

export async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    await db.write(seedData);
    console.log('Database seeded successfully!');
    console.log('Seed data:', JSON.stringify(seedData, null, 2));
    return true;
  } catch (error) {
    console.error('Failed to seed database:', error);
    return false;
  }
}

export async function clearDatabase() {
  try {
    console.log('Clearing database...');
    await db.write({
      meta: {
        appVersion: '1.0.0',
        exportDate: new Date().toISOString(),
        userCurrency: '₹',
        organizationName: '',
      },
      collections: [],
      ledger: [],
    });
    console.log('Database cleared successfully!');
    return true;
  } catch (error) {
    console.error('Failed to clear database:', error);
    return false;
  }
}
