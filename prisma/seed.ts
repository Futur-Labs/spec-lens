import 'dotenv/config';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import bcrypt from 'bcryptjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { PrismaClient } from '../src/generated/prisma/client.js';

// Get absolute path for SQLite database (in project root)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, '..', 'specLens.db');
const dbUrl = `file://${dbPath}`;

const adapter = new PrismaLibSql({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.contact.deleteMany();
  await prisma.article.deleteMany();
  await prisma.portfolio.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const hashedPassword = await bcrypt.hash('1234', 12);
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      password: hashedPassword,
    },
  });
  console.log('✅ Created admin user:', adminUser.username);

  // Create articles
  const articles = await prisma.article.createMany({
    data: [],
  });
  console.log('✅ Created', articles.count, 'articles');

  // Create portfolio items
  const portfolioItems = await prisma.portfolio.createMany({
    data: [],
  });
  console.log('✅ Created', portfolioItems.count, 'portfolio items');

  console.log('✨ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
