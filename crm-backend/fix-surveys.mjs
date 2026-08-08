import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const allLeads = await prisma.lead.findMany({
    include: { surveys: true }
  });

  const leadsInSurvey = allLeads.filter(l => l.pipelineStage === 'Survey');
  console.log(`Found ${leadsInSurvey.length} leads in 'Survey' stage via filter.`);

  let createdCount = 0;
  for (const lead of leadsInSurvey) {
    if (lead.surveys.length === 0) {
      const surveyNo = `SV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      await prisma.survey.create({
        data: {
          surveyNo,
          leadId: lead.id,
          status: 'Pending',
          priority: 'Medium',
          progressPercent: 10
        }
      });
      createdCount++;
      console.log(`Created survey ${surveyNo} for lead ${lead.name || lead.id}`);
    }
  }

  console.log(`Created ${createdCount} missing surveys.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
