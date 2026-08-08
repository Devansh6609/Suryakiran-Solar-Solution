// DB Migration: Remap old pipeline stage values to new 7-stage system
// Run: node migrate_stages.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const STAGE_MAP = {
    // Old → New
    'New_Lead':          'New_Lead',          // unchanged
    'Survey_Scheduled':  'Survey',
    'Survey_Completed':  'Survey',
    'Quotation_Sent':    'Quotation_Sent',    // unchanged
    'Customer_Approved': 'Customer_Approved', // unchanged
    'Material_Dispatched': 'Material_Dispatched', // unchanged
    'Material_Reserved': 'Material_Dispatched',
    'Installation':      'Installation',      // unchanged
    'Final_Processing':  'Completed',
    'Completed':         'Completed',         // unchanged
    'Closed_Won / Project': 'Completed',
    'Closed_Lost':       'Lost',
    'ClosedLost':        'Lost',

    // Legacy DB string variants
    'New Lead':          'New_Lead',
    'Survey Scheduled':  'Survey',
    'Survey Completed':  'Survey',
    'Quotation Sent':    'Quotation_Sent',
    'Customer Approved': 'Customer_Approved',
    'Material Dispatched': 'Material_Dispatched',
    'Final Processing':  'Completed',
    'Closed Lost':       'Lost',
};

async function main() {
    console.log('Starting pipeline stage migration...\n');

    const leads = await prisma.lead.findMany({ select: { id: true, pipelineStage: true } });
    console.log(`Found ${leads.length} leads to check.`);

    let updated = 0;
    let skipped = 0;

    for (const lead of leads) {
        const newStage = STAGE_MAP[lead.pipelineStage];
        if (newStage && newStage !== lead.pipelineStage) {
            await prisma.lead.update({
                where: { id: lead.id },
                data: { pipelineStage: newStage }
            });
            console.log(`  ✓ Lead ${lead.id}: "${lead.pipelineStage}" → "${newStage}"`);
            updated++;
        } else if (!newStage) {
            console.log(`  ? Lead ${lead.id}: Unknown stage "${lead.pipelineStage}" — setting to "New_Lead"`);
            await prisma.lead.update({ where: { id: lead.id }, data: { pipelineStage: 'New_Lead' } });
            updated++;
        } else {
            skipped++;
        }
    }

    console.log(`\nMigration complete: ${updated} updated, ${skipped} already correct.`);
    await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
