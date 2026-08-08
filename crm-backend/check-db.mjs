import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const leads = await prisma.lead.findMany({select: {pipelineStage: true}});
  const counts = {};
  leads.forEach(l => {
    counts[l.pipelineStage] = (counts[l.pipelineStage] || 0) + 1;
  });
  console.log('Lead stages counts:', counts);
  
  const surveys = await prisma.survey.count();
  console.log('Total surveys:', surveys);
}

main().finally(() => prisma.$disconnect());
