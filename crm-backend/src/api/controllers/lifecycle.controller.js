export const getLeadLifecycle = async (c) => {
    try {
        const prisma = c.get('prisma');
        const leadId = c.req.param('id');

        const lead = await prisma.lead.findUnique({
            where: { id: leadId },
            include: {
                verifications: { orderBy: { createdAt: 'desc' } },
                materialChecklist: true,
                activityLog: { orderBy: { timestamp: 'desc' } },
                documents: { orderBy: { uploadedAt: 'desc' } },
                assignedTo: { select: { id: true, name: true, email: true } },
                quotations: { orderBy: { createdAt: 'desc' } }
            }
        });

        if (!lead) return c.json({ message: 'Lead not found' }, 404);

        // Group verifications by stage
        const verificationsMap = {};
        lead.verifications.forEach(v => {
            if (!verificationsMap[v.stage]) {
                verificationsMap[v.stage] = {
                    ...v,
                    evidenceData: typeof v.evidenceData === 'string' ? JSON.parse(v.evidenceData || '{}') : (v.evidenceData || {})
                };
            }
        });

        return c.json({
            leadId: lead.id,
            currentStage: lead.pipelineStage,
            assignedTo: lead.assignedTo,
            verifications: verificationsMap,
            materialChecklist: lead.materialChecklist,
            activityLog: lead.activityLog,
            documents: lead.documents,
            quotations: lead.quotations
        });
    } catch (e) {
        console.error("Get Lead Lifecycle Error:", e);
        return c.json({ message: 'Error fetching lifecycle data', error: e.message }, 500);
    }
};

export const verifyLeadStage = async (c) => {
    try {
        const prisma = c.get('prisma');
        const user = c.get('user');
        const leadId = c.req.param('id');
        const body = await c.req.json();

        const {
            targetStage,
            remarks,
            assignedEmployee,
            evidenceData,
            materialChecklistItems
        } = body;

        const lead = await prisma.lead.findUnique({ where: { id: leadId } });
        if (!lead) return c.json({ message: 'Lead not found' }, 404);

        // Stage-Specific Evidence Mandatory Validation Rules
        const parsedEvidence = evidenceData || {};

        if (targetStage === 'Site Survey Completed') {
            if (!parsedEvidence.surveyDate || !parsedEvidence.surveyEngineer) {
                return c.json({ message: 'Survey Date and Engineer Name are mandatory.' }, 400);
            }
            if (!parsedEvidence.latitude || !parsedEvidence.longitude) {
                return c.json({ message: 'GPS Location (Latitude & Longitude) is mandatory.' }, 400);
            }
            const roofPhotos = parsedEvidence.roofPhotos || [];
            if (roofPhotos.length < 5) {
                return c.json({ message: `Minimum 5 Roof Photos required. (Uploaded: ${roofPhotos.length})` }, 400);
            }
            if (!parsedEvidence.meterPhoto || !parsedEvidence.panelPhoto) {
                return c.json({ message: 'Electric Meter and Main Panel photos are mandatory.' }, 400);
            }
        }

        if (targetStage === 'Advance Payment Received' || targetStage === 'Final Payment') {
            if (!parsedEvidence.paymentAmount || !parsedEvidence.utrNumber) {
                return c.json({ message: 'Payment Amount and UTR / Transaction Number are mandatory.' }, 400);
            }
            if (!parsedEvidence.paymentScreenshot) {
                return c.json({ message: 'Payment Screenshot / Proof is mandatory.' }, 400);
            }
        }

        if (targetStage === 'Material Received On Site') {
            if (!materialChecklistItems || materialChecklistItems.length < 13) {
                return c.json({ message: 'All 13 component inspection items must be checked.' }, 400);
            }
            // Upsert material checklist items
            await prisma.materialChecklistItem.deleteMany({ where: { leadId } });
            for (const item of materialChecklistItems) {
                await prisma.materialChecklistItem.create({
                    data: {
                        leadId,
                        componentName: item.componentName,
                        requiredQty: String(item.requiredQty || '1'),
                        receivedQty: String(item.receivedQty || '1'),
                        condition: item.condition || 'Good',
                        photoUrl: item.photoUrl || null,
                        notes: item.notes || null
                    }
                });
            }
        }

        if (targetStage === 'Installation Completed') {
            const photos = parsedEvidence.installationPhotos || [];
            if (photos.length < 10) {
                return c.json({ message: `Minimum 10 Installation Photos required. (Uploaded: ${photos.length})` }, 400);
            }
            if (!parsedEvidence.customerSignature || !parsedEvidence.engineerSignature) {
                return c.json({ message: 'Customer & Engineer Digital Signatures are mandatory.' }, 400);
            }
        }

        // Record verification
        const record = await prisma.stageVerification.create({
            data: {
                leadId,
                stage: targetStage,
                status: 'Completed',
                verifiedBy: user ? user.name : 'System',
                assignedTo: assignedEmployee || (user ? user.name : 'Unassigned'),
                remarks: remarks || '',
                evidenceData: JSON.stringify(parsedEvidence)
            }
        });

        // Advance Lead Stage
        await prisma.lead.update({
            where: { id: leadId },
            data: { pipelineStage: targetStage }
        });

        // Record Immutable Activity Log
        const photosCount = (parsedEvidence.roofPhotos || parsedEvidence.installationPhotos || parsedEvidence.photos || []).length;
        const noteSummary = `${targetStage} verified by ${user ? user.name : 'System'}${photosCount > 0 ? ` (${photosCount} Evidence Photos)` : ''}${parsedEvidence.gpsAddress ? ` [GPS Verified: ${parsedEvidence.gpsAddress}]` : ''}`;

        await prisma.activity.create({
            data: {
                leadId,
                action: `${targetStage} Verified`,
                notes: noteSummary,
                user: user ? user.name : 'System'
            }
        });

        return c.json({ success: true, verification: record, currentStage: targetStage });
    } catch (e) {
        console.error("Verify Lead Stage Error:", e);
        return c.json({ message: 'Error verifying stage', error: e.message }, 500);
    }
};

export const overrideLeadStage = async (c) => {
    try {
        const prisma = c.get('prisma');
        const user = c.get('user');
        const leadId = c.req.param('id');
        const body = await c.req.json();

        if (user.role !== 'Master') {
            return c.json({ message: 'Only Master Admins can override stage verification rules.' }, 403);
        }

        const { targetStage, reason } = body;

        await prisma.stageVerification.create({
            data: {
                leadId,
                stage: targetStage,
                status: 'Completed',
                verifiedBy: `${user.name} (Admin Override)`,
                remarks: `Admin Override Reason: ${reason || 'Manual Approval'}`,
                evidenceData: JSON.stringify({ isOverride: true, reason })
            }
        });

        await prisma.lead.update({
            where: { id: leadId },
            data: { pipelineStage: targetStage }
        });

        await prisma.activity.create({
            data: {
                leadId,
                action: `${targetStage} (Admin Override)`,
                notes: `Stage overridden by ${user.name}. Reason: ${reason || 'Manual Approval'}`,
                user: user.name
            }
        });

        return c.json({ success: true, currentStage: targetStage });
    } catch (e) {
        console.error("Override Stage Error:", e);
        return c.json({ message: 'Error overriding stage', error: e.message }, 500);
    }
};
