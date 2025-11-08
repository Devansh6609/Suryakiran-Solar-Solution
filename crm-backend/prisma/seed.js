const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // --- Seed Master Admin User Only ---
  const saltRounds = 10;
  const password = await bcrypt.hash('suryakiran@155', saltRounds);

  const masterAdmin = await prisma.user.upsert({
    where: { email: 'pateldevansh155@gmail.com' },
    update: {}, // No updates needed if it exists
    create: {
      email: 'admin@suryakiran.com',
      name: 'Master Admin',
      password: password,
      role: 'Master',
      country: 'India'
    },
  });

  console.log('Master Admin seeded:', { id: masterAdmin.id, email: masterAdmin.email });
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
