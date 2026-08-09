import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

dotenv.config();

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL connected via Prisma');

    const users = await prisma.user.findMany({ take: 5 });
    console.log('sample users:', users);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('ERROR:', error.message || error);
  process.exit(1);
});
