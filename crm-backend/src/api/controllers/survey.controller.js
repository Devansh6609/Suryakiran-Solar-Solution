export const createSurvey = async (c) => {
    try {
        const prisma = c.get('prisma');
        const user = c.get('user');
        const body = await c.req.json();

        const { leadId, assignedEngineerId, scheduledDate, scheduledTime, priority = 'Medium' } = body;

        if (!leadId) {
            return c.json({ message: 'leadId is required' }, 400);
        }

        const surveyNo = `SV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

        const survey = await prisma.survey.create({
            data: {
                surveyNo,
                leadId,
                assignedEngineerId: assignedEngineerId || null,
                priority,
                scheduledDate: scheduledDate || null,
                scheduledTime: scheduledTime || null,
                status: assignedEngineerId ? 'Assigned' : 'Pending',
                progressPercent: 10
            },
            include: {
                lead: { select: { id: true, name: true, phone: true, email: true, pipelineStage: true } },
                assignedEngineer: { select: { id: true, name: true, email: true } }
            }
        });

        await prisma.activity.create({
            data: {
                leadId,
                action: 'Survey Request Created',
                notes: `Created Survey #${surveyNo} (${priority} Priority)`,
                user: user ? user.name : 'System'
            }
        });

        return c.json({ success: true, survey }, 201);
    } catch (e) {
        console.error("Create Survey Error:", e);
        return c.json({ message: 'Error creating survey request', error: e.message }, 500);
    }
};

export const getSurveys = async (c) => {
    try {
        const prisma = c.get('prisma');
        const user = c.get('user');
        const { status, priority, engineerId, search } = c.req.query();

        let where = {};

        if (user.role === 'Vendor') {
            where.OR = [
                { assignedEngineerId: user.id },
                { lead: { assignedVendorId: user.id } }
            ];
        } else if (engineerId && engineerId !== 'all') {
            where.assignedEngineerId = engineerId;
        }

        if (status && status !== 'all') {
            if (status.includes(',')) {
                // Handle grouped status filter (e.g., "Pending,Assigned,Started")
                const statusList = status.split(',').map(s => s.trim()).filter(Boolean);
                where.status = { in: statusList };
            } else {
                where.status = status;
            }
        }

        if (priority && priority !== 'all') {
            where.priority = priority;
        }

        if (search) {
            where.AND = [
                {
                    OR: [
                        { surveyNo: { contains: search } },
                        { lead: { name: { contains: search } } },
                        { lead: { phone: { contains: search } } }
                    ]
                }
            ];
        }

        const surveys = await prisma.survey.findMany({
            where,
            include: {
                lead: { select: { id: true, name: true, phone: true, email: true, district: true, village: true, pipelineStage: true } },
                assignedEngineer: { select: { id: true, name: true, email: true } },
                _count: { select: { media: true, obstacles: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return c.json(surveys);
    } catch (e) {
        console.error("Get Surveys Error:", e);
        return c.json({ message: 'Error fetching surveys', error: e.message }, 500);
    }
};

export const getSurveyById = async (c) => {
    try {
        const prisma = c.get('prisma');
        const id = c.req.param('id');

        const survey = await prisma.survey.findUnique({
            where: { id },
            include: {
                lead: { select: { id: true, name: true, phone: true, email: true, district: true, village: true, pipelineStage: true, customFields: true } },
                assignedEngineer: { select: { id: true, name: true, email: true } },
                sections: true,
                obstacles: true,
                materialEstimates: true,
                media: true,
                approvalHistory: { orderBy: { createdAt: 'desc' } }
            }
        });

        if (!survey) return c.json({ message: 'Survey not found' }, 404);

        // Convert sections array into a clean object map
        const sectionsMap = {};
        survey.sections.forEach(sec => {
            sectionsMap[sec.sectionName] = typeof sec.formData === 'string' ? JSON.parse(sec.formData || '{}') : sec.formData;
        });

        return c.json({
            ...survey,
            sectionsMap
        });
    } catch (e) {
        console.error("Get Survey Details Error:", e);
        return c.json({ message: 'Error fetching survey details', error: e.message }, 500);
    }
};

export const assignSurvey = async (c) => {
    try {
        const prisma = c.get('prisma');
        const user = c.get('user');
        const id = c.req.param('id');
        const body = await c.req.json();

        const { assignedEngineerId, scheduledDate, scheduledTime, priority, remarks } = body;

        const survey = await prisma.survey.update({
            where: { id },
            data: {
                assignedEngineerId: assignedEngineerId || undefined,
                scheduledDate: scheduledDate || undefined,
                scheduledTime: scheduledTime || undefined,
                priority: priority || undefined,
                status: 'Assigned',
                reviewRemarks: remarks || undefined
            },
            include: {
                lead: { select: { id: true, name: true } },
                assignedEngineer: { select: { id: true, name: true } }
            }
        });

        await prisma.activity.create({
            data: {
                leadId: survey.leadId,
                action: 'Survey Assigned',
                notes: `Survey ${survey.surveyNo} assigned to ${survey.assignedEngineer?.name || 'Engineer'} for ${scheduledDate || 'scheduled date'}.`,
                user: user ? user.name : 'System'
            }
        });

        return c.json({ success: true, survey });
    } catch (e) {
        console.error("Assign Survey Error:", e);
        return c.json({ message: 'Error assigning survey', error: e.message }, 500);
    }
};

export const updateSurveySection = async (c) => {
    try {
        const prisma = c.get('prisma');
        const id = c.req.param('id');
        const body = await c.req.json();

        const { sectionName, formData, status, progressPercent, estimatedCapacity, gpsLat, gpsLng, gpsAccuracy, customerSignature, engineerSignature } = body;

        if (sectionName) {
            await prisma.surveySection.upsert({
                where: {
                    surveyId_sectionName: { surveyId: id, sectionName }
                },
                update: {
                    formData: typeof formData === 'string' ? formData : JSON.stringify(formData || {})
                },
                create: {
                    surveyId: id,
                    sectionName,
                    formData: typeof formData === 'string' ? formData : JSON.stringify(formData || {})
                }
            });
        }

        const survey = await prisma.survey.update({
            where: { id },
            data: {
                status: status || undefined,
                progressPercent: progressPercent !== undefined ? Number(progressPercent) : undefined,
                estimatedCapacity: estimatedCapacity !== undefined ? Number(estimatedCapacity) : undefined,
                gpsLat: gpsLat || undefined,
                gpsLng: gpsLng || undefined,
                gpsAccuracy: gpsAccuracy !== undefined ? Number(gpsAccuracy) : undefined,
                customerSignature: customerSignature || undefined,
                engineerSignature: engineerSignature || undefined
            }
        });

        return c.json({ success: true, survey });
    } catch (e) {
        console.error("Update Survey Section Error:", e);
        return c.json({ message: 'Error updating survey section', error: e.message }, 500);
    }
};

export const reviewSurvey = async (c) => {
    try {
        const prisma = c.get('prisma');
        const user = c.get('user');
        const id = c.req.param('id');
        const body = await c.req.json();

        const { action, remarks } = body; // action: Approved, Rejected, Changes_Requested

        const survey = await prisma.survey.findUnique({ where: { id } });
        if (!survey) return c.json({ message: 'Survey not found' }, 404);

        const newStatus = action === 'Approved' ? 'Approved' : 'Rejected';

        await prisma.surveyApprovalHistory.create({
            data: {
                surveyId: id,
                status: action,
                remarks: remarks || '',
                reviewedBy: user ? user.name : 'Manager'
            }
        });

        const updatedSurvey = await prisma.survey.update({
            where: { id },
            data: {
                status: newStatus,
                reviewRemarks: remarks || undefined,
                approvedBy: action === 'Approved' ? (user ? user.name : 'Manager') : undefined,
                approvedAt: action === 'Approved' ? new Date() : undefined
            }
        });

        if (action === 'Approved') {
            await prisma.lead.update({
                where: { id: survey.leadId },
                data: { pipelineStage: 'Site Survey Completed' }
            });

            await prisma.stageVerification.create({
                data: {
                    leadId: survey.leadId,
                    stage: 'Site Survey Completed',
                    status: 'Completed',
                    verifiedBy: user ? user.name : 'Manager',
                    remarks: remarks || 'Site Survey Verified & Approved by Manager',
                    evidenceData: JSON.stringify({
                        surveyNo: survey.surveyNo,
                        approvedAt: new Date(),
                        estimatedCapacity: survey.estimatedCapacity
                    })
                }
            });
        }

        await prisma.activity.create({
            data: {
                leadId: survey.leadId,
                action: `Survey ${action}`,
                notes: `Survey ${survey.surveyNo} ${action.toLowerCase()} by ${user ? user.name : 'Manager'}. ${remarks ? `Remarks: ${remarks}` : ''}`,
                user: user ? user.name : 'Manager'
            }
        });

        return c.json({ success: true, survey: updatedSurvey });
    } catch (e) {
        console.error("Review Survey Error:", e);
        return c.json({ message: 'Error reviewing survey', error: e.message }, 500);
    }
};
