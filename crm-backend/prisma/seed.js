const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // --- Seed Users ---
  const saltRounds = 10;
  const password = await bcrypt.hash('password123', saltRounds);

  const masterAdmin = await prisma.user.upsert({
    where: { email: 'admin@suryakiran.com' },
    update: {},
    create: {
      email: 'admin@suryakiran.com',
      name: 'Master Admin',
      password: password,
      role: 'Master',
      country: 'India'
    },
  });

  const puneVendor = await prisma.user.upsert({
    where: { email: 'pune.vendor@suryakiran.com' },
    update: {},
    create: {
      email: 'pune.vendor@suryakiran.com',
      name: 'Pune Vendor',
      password: password,
      role: 'Vendor',
      country: 'India',
      state: 'Maharashtra',
      district: 'Pune'
    },
  });

  const mumbaiVendor = await prisma.user.upsert({
    where: { email: 'mumbai.vendor@suryakiran.com' },
    update: {},
    create: {
      email: 'mumbai.vendor@suryakiran.com',
      name: 'Mumbai Vendor',
      password: password,
      role: 'Vendor',
      country: 'India',
      state: 'Maharashtra',
      district: 'Mumbai'
    },
  });
  
  console.log('Users seeded:', { masterAdmin, puneVendor, mumbaiVendor });

  // --- Seed Leads (Optional, but good for testing) ---
  await prisma.lead.createMany({
    data: [
      {
        productType: 'rooftop',
        name: 'Rohan Sharma',
        email: 'rohan.s@example.com',
        phone: '9876543210',
        pipelineStage: 'New Lead',
        score: 45,
        scoreStatus: 'Cold',
        source: 'Website',
        customFields: {
          bill: '2500',
          roofType: 'RCC (Concrete)',
          propertyStatus: 'Homeowner',
          pincode: '411007',
          state: 'Maharashtra',
          district: 'Pune',
        },
        assignedVendorId: puneVendor.id,
      },
      {
        productType: 'pump',
        name: 'Anjali Desai',
        email: 'anjali.d@example.com',
        phone: '9876543211',
        pipelineStage: 'Verified Lead',
        otpVerified: true,
        score: 85,
        scoreStatus: 'Hot',
        source: 'Referral',
        customFields: {
          pumpHP: '5 HP',
          waterSource: 'Borehole',
          energyCost: '12000',
          pincode: '400001',
          state: 'Maharashtra',
          district: 'Mumbai',
        },
        assignedVendorId: mumbaiVendor.id,
      }
    ],
    skipDuplicates: true, // Prevents errors if you run the seed command multiple times
  });

  console.log('Sample leads seeded.');

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
