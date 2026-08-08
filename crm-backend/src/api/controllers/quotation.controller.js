export const saveQuotation = async (c) => {
    try {
        const prisma = c.get('prisma');
        const user = c.get('user');
        const body = await c.req.json();

        let {
            quotationNo,
            leadId,
            clientName,
            clientPhone,
            clientEmail,
            systemSize,
            totalAmount,
            subsidy,
            netCost,
            quotationData,
            pdfData
        } = body;

        if (!quotationNo) {
            quotationNo = `VE-QUO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        }

        const quotation = await prisma.quotation.create({
            data: {
                quotationNo,
                leadId: leadId || null,
                clientName: clientName || 'Customer',
                clientPhone: clientPhone || '',
                clientEmail: clientEmail || '',
                systemSize: systemSize || '',
                totalAmount: Number(totalAmount) || 0,
                subsidy: Number(subsidy) || 0,
                netCost: Number(netCost) || Number(totalAmount) || 0,
                quotationData: typeof quotationData === 'string' ? quotationData : JSON.stringify(quotationData || {}),
                pdfData: pdfData || null,
                createdById: user ? user.id : null,
            }
        });

        // If linked to a lead, update lead's customFields quoteAmount and log activity
        if (leadId) {
            try {
                const lead = await prisma.lead.findUnique({ where: { id: leadId } });
                if (lead) {
                    let cf = {};
                    if (typeof lead.customFields === 'string') {
                        cf = JSON.parse(lead.customFields || '{}');
                    } else if (typeof lead.customFields === 'object' && lead.customFields !== null) {
                        cf = lead.customFields;
                    }
                    
                    cf.quoteAmount = Number(netCost) || Number(totalAmount) || 0;
                    cf.latestQuotationNo = quotationNo;

                    await prisma.lead.update({
                        where: { id: leadId },
                        data: {
                            customFields: JSON.stringify(cf),
                            pipelineStage: lead.pipelineStage === 'New Lead' || lead.pipelineStage === 'Verified Lead' ? 'Proposal Sent' : lead.pipelineStage
                        }
                    });

                    await prisma.activity.create({
                        data: {
                            leadId,
                            action: 'Quotation Generated',
                            notes: `Generated Quotation #${quotationNo} for ₹${(Number(netCost) || Number(totalAmount) || 0).toLocaleString('en-IN')}`,
                            user: user ? user.name : 'System'
                        }
                    });
                }
            } catch (err) {
                console.error("Error updating lead with quotation valuation:", err);
            }
        }

        return c.json({ success: true, quotation }, 201);
    } catch (e) {
        console.error("Save Quotation Error:", e);
        return c.json({ message: 'Error saving quotation', error: e.message }, 500);
    }
};

export const getQuotations = async (c) => {
    try {
        const prisma = c.get('prisma');
        const user = c.get('user');
        const { vendorId, search, startDate, endDate } = c.req.query();

        let where = {};

        if (user.role === 'Vendor') {
            where.OR = [
                { createdById: user.id },
                { lead: { assignedVendorId: user.id } }
            ];
        } else if (vendorId && vendorId !== 'all') {
            where.OR = [
                { createdById: vendorId },
                { lead: { assignedVendorId: vendorId } }
            ];
        }

        if (search) {
            where.AND = [
                {
                    OR: [
                        { clientName: { contains: search } },
                        { clientPhone: { contains: search } },
                        { quotationNo: { contains: search } }
                    ]
                }
            ];
        }

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                where.createdAt.lte = end;
            }
        }

        const quotations = await prisma.quotation.findMany({
            where,
            select: {
                id: true,
                quotationNo: true,
                leadId: true,
                clientName: true,
                clientPhone: true,
                clientEmail: true,
                systemSize: true,
                totalAmount: true,
                subsidy: true,
                netCost: true,
                version: true,
                status: true,
                validUntil: true,
                revisionNotes: true,
                createdAt: true,
                createdBy: { select: { id: true, name: true, email: true } },
                lead: { select: { id: true, name: true, pipelineStage: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return c.json(quotations);
    } catch (e) {
        console.error("Get Quotations Error:", e);
        return c.json({ message: 'Error fetching quotations', error: e.message }, 500);
    }
};

export const updateQuotationStatus = async (c) => {
    try {
        const prisma = c.get('prisma');
        const user = c.get('user');
        const id = c.req.param('id');
        const body = await c.req.json();
        const { status, revisionNotes } = body;

        const existing = await prisma.quotation.findUnique({ where: { id } });
        if (!existing) return c.json({ message: 'Quotation not found' }, 404);

        const newVersion = status === 'Revision_Required' ? existing.version + 1 : existing.version;

        const updated = await prisma.quotation.update({
            where: { id },
            data: {
                status: status || existing.status,
                version: newVersion,
                revisionNotes: revisionNotes || existing.revisionNotes
            }
        });

        if (existing.leadId) {
            await prisma.activity.create({
                data: {
                    leadId: existing.leadId,
                    action: `Quotation Status: ${status}`,
                    notes: `Quotation #${existing.quotationNo} status changed to ${status}. ${revisionNotes ? `Notes: ${revisionNotes}` : ''}`,
                    user: user ? user.name : 'System'
                }
            });
        }

        return c.json({ success: true, quotation: updated });
    } catch (e) {
        console.error("Update Quotation Status Error:", e);
        return c.json({ message: 'Error updating quotation status', error: e.message }, 500);
    }
};

export const getQuotationById = async (c) => {
    try {
        const prisma = c.get('prisma');
        const id = c.req.param('id');
        const quotation = await prisma.quotation.findUnique({
            where: { id },
            include: {
                createdBy: { select: { id: true, name: true, email: true } },
                lead: { select: { id: true, name: true, phone: true } }
            }
        });

        if (!quotation) return c.json({ message: 'Quotation not found' }, 404);

        return c.json(quotation);
    } catch (e) {
        console.error("Get Quotation By ID Error:", e);
        return c.json({ message: 'Error fetching quotation' }, 500);
    }
};

export const deleteQuotation = async (c) => {
    try {
        const prisma = c.get('prisma');
        const id = c.req.param('id');
        const user = c.get('user');

        if (user.role !== 'Master') {
            return c.json({ message: 'Only Master Admins can delete quotations' }, 403);
        }

        await prisma.quotation.delete({ where: { id } });
        return c.json({ success: true, message: 'Quotation deleted' });
    } catch (e) {
        console.error("Delete Quotation Error:", e);
        return c.json({ message: 'Error deleting quotation' }, 500);
    }
};
