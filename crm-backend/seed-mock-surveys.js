import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding mock leads and survey requests...");

    // Find vendor/user to assign
    const firstVendor = await prisma.user.findFirst();

    // Mock Lead 1
    const lead1 = await prisma.lead.create({
        data: {
            productType: 'rooftop',
            name: 'Rajesh Mehta',
            email: 'rajesh.mehta@gmail.com',
            phone: '+91 98765 12345',
            pipelineStage: 'Lead Created',
            score: 85,
            scoreStatus: 'Hot',
            source: 'Website Rooftop Calculator',
            district: 'Ahmedabad',
            tehsil: 'Sanand',
            village: 'Sanand GIDC',
            connectionType: 'Three Phase',
            hp: '10 kW',
            assignedVendorId: firstVendor ? firstVendor.id : null
        }
    });

    // Survey 1 linked to Lead 1
    const survey1 = await prisma.survey.create({
        data: {
            surveyNo: `SV-2026-${Math.floor(10000 + Math.random() * 90000)}`,
            leadId: lead1.id,
            assignedEngineerId: firstVendor ? firstVendor.id : null,
            status: 'Assigned',
            priority: 'High',
            scheduledDate: '2026-07-28',
            scheduledTime: '10:30 AM',
            progressPercent: 35,
            estimatedCapacity: 7.5,
            gpsLat: '23.0225° N',
            gpsLng: '72.5714° E',
            gpsAccuracy: 4.2
        }
    });

    // Create default sections for Survey 1
    await prisma.surveySection.createMany({
        data: [
            {
                surveyId: survey1.id,
                sectionName: 'customerInfo',
                formData: JSON.stringify({
                    customerName: 'Rajesh Mehta',
                    mobile: '+91 98765 12345',
                    customerType: 'Commercial',
                    address: 'Plot 45, Sanand GIDC Phase 2, Ahmedabad'
                })
            },
            {
                surveyId: survey1.id,
                sectionName: 'roofDetails',
                formData: JSON.stringify({
                    roofType: 'RCC',
                    roofCondition: 'Excellent',
                    roofOrientation: 'South Facing',
                    roofTilt: '15°'
                })
            },
            {
                surveyId: survey1.id,
                sectionName: 'measurements',
                formData: JSON.stringify({
                    length: '50',
                    width: '30',
                    usableArea: '1200',
                    maxPanels: '32',
                    estimatedKw: '17.2'
                })
            }
        ]
    });

    // Mock Lead 2
    const lead2 = await prisma.lead.create({
        data: {
            productType: 'pump',
            name: 'Vikram Patel',
            email: 'vikram.patel@farm.in',
            phone: '+91 98123 45678',
            pipelineStage: 'Lead Created',
            score: 72,
            scoreStatus: 'Warm',
            source: 'Agri Expo Offline',
            district: 'Mehsana',
            tehsil: 'Kadi',
            village: 'Kadi Village',
            connectionType: 'Single Phase',
            hp: '5 HP Solar Pump',
            assignedVendorId: firstVendor ? firstVendor.id : null
        }
    });

    // Survey 2 linked to Lead 2
    const survey2 = await prisma.survey.create({
        data: {
            surveyNo: `SV-2026-${Math.floor(10000 + Math.random() * 90000)}`,
            leadId: lead2.id,
            assignedEngineerId: null,
            status: 'Pending',
            priority: 'Urgent',
            scheduledDate: '2026-07-29',
            scheduledTime: '02:00 PM',
            progressPercent: 10,
            estimatedCapacity: 5.0,
            gpsLat: '23.3000° N',
            gpsLng: '72.3333° E',
            gpsAccuracy: 6.1
        }
    });

    console.log(`Successfully created Mock Lead 1 (${lead1.name}, ID: ${lead1.id}) with Survey #${survey1.surveyNo}`);
    console.log(`Successfully created Mock Lead 2 (${lead2.name}, ID: ${lead2.id}) with Survey #${survey2.surveyNo}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
