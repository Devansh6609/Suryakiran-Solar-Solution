import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // --- Seed Master Admin User Only ---
  const saltRounds = 10;
  const password = await bcrypt.hash('varcas@155', saltRounds);

  const masterAdmin = await prisma.user.upsert({
    where: { email: 'admin@varcasenergy.com' },
    update: {
      password: password,
    },
    create: {
      email: 'admin@varcasenergy.com',
      name: 'Master Admin',
      password: password,
      role: 'Master',
      country: 'India'
    },
  });

  console.log('Master Admin seeded:', { id: masterAdmin.id, email: masterAdmin.email });

  // --- Seed Default Products ---
  await prisma.product.deleteMany({});
  console.log('Cleared existing products');
  const defaultProducts = [
    {
      name: "Solar Module",
      category: "Solar Module",
      description: "Topcon Bifacial 550 WP",
      make: "Adani/waree (30 Year Performance Warranty)",
      imageUrl: "/assets/quotation/Panel.jpg"
    },
    {
      name: "Solar Inverter",
      category: "Solar Inverter",
      description: "On-grid String inverters 8.0KW",
      make: "Deye (10 Year warranty)",
      imageUrl: "/assets/quotation/invertor.jpg"
    },
    {
      name: "Module mounting Structure",
      category: "Module mounting Structure",
      description: "Size:() Thickness::2.0 MM",
      make: "Hutch India HDG (Hot Dip) Galvanized",
      imageUrl: "/assets/quotation/Module mounting structure.jpg"
    },
    {
      name: "PVC Pipe",
      category: "PVC Pipe",
      description: "25 MM",
      make: "Polycab",
      imageUrl: "/assets/quotation/PVC pipe.jpg"
    },
    {
      name: "AC Wire",
      category: "AC Wire",
      description: "2.5 MM",
      make: "Polycab",
      imageUrl: "/assets/quotation/AC wire.jpg"
    },
    {
      name: "DC Wire",
      category: "DC Wire",
      description: "2.5 MM",
      make: "Polycab",
      imageUrl: "/assets/quotation/DC Wire.jpg"
    },
    {
      name: "LA Cable",
      category: "LA Cable",
      description: "2.5 MM",
      make: "Polycab",
      imageUrl: "/assets/quotation/LA Cable.jpg"
    },
    {
      name: "Earthing Wire",
      category: "Earthing Wire",
      description: "2.5 MM",
      make: "RR",
      imageUrl: "/assets/quotation/Earthing Cable.jpg"
    },
    {
      name: "14 MM 4.0 Mtr",
      category: "14 MM 4.0 Mtr",
      description: "Certified",
      make: "As Standard",
      imageUrl: "/assets/quotation/LA Kit.jpg"
    },
    {
      name: "AC / DC Protection Box",
      category: "AC / DC Protection Box",
      description: "As per design",
      make: "L&T L&T",
      imageUrl: "/assets/quotation/ACDB box.jpg"
    },
    {
      name: "MC4 Connector",
      category: "MC4 Connector",
      description: "Male-female",
      make: "Elmex",
      imageUrl: "/assets/quotation/MC4 connector.jpg"
    },
    {
      name: "Cable Tie",
      category: "Cable Tie",
      description: "SS",
      make: "Certified",
      imageUrl: "/assets/quotation/Cable Tie.jpg"
    },
    {
      name: "J Hook Corrosion Free SS 304",
      category: "J Hook Corrosion Free SS 304",
      description: "As Per System Requirement",
      make: "Standard",
      imageUrl: "/assets/quotation/Jhook.jpg"
    }
  ];

  for (const product of defaultProducts) {
    const existing = await prisma.product.findFirst({
      where: { name: product.name, category: product.category }
    });
    if (!existing) {
      await prisma.product.create({ data: product });
      console.log(`Product created: ${product.name}`);
    } else {
      await prisma.product.update({
        where: { id: existing.id },
        data: product
      });
      console.log(`Product updated: ${product.name}`);
    }
  }

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
