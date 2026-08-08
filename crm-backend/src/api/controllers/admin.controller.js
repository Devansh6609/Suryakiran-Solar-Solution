import bcrypt from 'bcryptjs';
import { calculateScore, getScoreStatus } from '../utils/leadScoring.js';
import { createNotification } from './notification.controller.js';
import crypto from 'node:crypto';

// In-memory store for OTPs. In production, use KV or a similar shared store on Cloudflare.
const deletionOtps = new Map();

// Helper to get buffer from Hono File/Blob
async function getBuffer(file) {
    if (!file) return null;
    const arrayBuffer = await file.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

// ==================== DASHBOARD ====================

export const getDashboardStats = async (c) => {
    try {
        const prisma = c.get('prisma');
        const user = c.get('user');
        const { vendorId, startDate, endDate } = c.req.query();

        let where = {};
        if (user.role === 'Vendor') {
            where.assignedVendorId = user.id;
        } else if (vendorId && vendorId !== 'all') {
            where.assignedVendorId = vendorId;
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

        const leads = await prisma.lead.findMany({
            where,
            select: {
                id: true,
                productType: true,
                pipelineStage: true,
                otpVerified: true,
                customFields: true,
                createdAt: true,
                quotations: {
                    select: { netCost: true, totalAmount: true },
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });

        const totalLeads = leads.length;

        const verifiedLeads = leads.filter(l =>
            l.otpVerified || ['Survey', 'Quotation_Sent', 'Customer_Approved', 'Material_Dispatched', 'Installation', 'Completed'].includes(l.pipelineStage)
        ).length;

        const projectsWon = leads.filter(l => l.pipelineStage === 'Completed').length;

        // Calculate individual lead estimated value from generated quotation or custom fields
        const getLeadValue = (l) => {
            try {
                if (l.quotations && l.quotations.length > 0) {
                    const latestQuo = l.quotations[0];
                    if (latestQuo.netCost) return Number(latestQuo.netCost);
                    if (latestQuo.totalAmount) return Number(latestQuo.totalAmount);
                }
                let cf = {};
                if (typeof l.customFields === 'string') {
                    cf = JSON.parse(l.customFields || '{}');
                } else if (typeof l.customFields === 'object' && l.customFields !== null) {
                    cf = l.customFields;
                }
                if (cf.quoteAmount) return Number(cf.quoteAmount) || 0;
                if (cf.estimatedAnnualSavings) return (Number(cf.estimatedAnnualSavings) || 0) * 4;
                if (cf.monthlyBill) return (Number(cf.monthlyBill) || 0) * 50;
            } catch (e) {}
            return (l.productType && l.productType.toLowerCase().includes('pump')) ? 250000 : 150000;
        };

        const pipelineValue = leads
            .filter(l => l.pipelineStage !== 'Closed Lost')
            .reduce((sum, l) => sum + getLeadValue(l), 0);

        // MoM / Previous period trend calculations
        const now = new Date();
        const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

        const thisMonthLeads = leads.filter(l => new Date(l.createdAt) >= firstDayThisMonth);
        const lastMonthLeads = leads.filter(l => {
            const d = new Date(l.createdAt);
            return d >= firstDayLastMonth && d <= lastDayLastMonth;
        });

        const calcTrend = (curr, prev) => {
            if (prev === 0) {
                if (curr === 0) return { value: 0, isPositive: true };
                return { value: 100, isPositive: true };
            }
            const diff = ((curr - prev) / prev) * 100;
            return {
                value: parseFloat(Math.abs(diff).toFixed(1)),
                isPositive: diff >= 0
            };
        };

        const totalLeadsTrend = calcTrend(
            thisMonthLeads.length,
            lastMonthLeads.length
        );

        const verifiedLeadsTrend = calcTrend(
            thisMonthLeads.filter(l => l.otpVerified || ['Survey', 'Quotation_Sent', 'Customer_Approved', 'Material_Dispatched', 'Installation', 'Completed'].includes(l.pipelineStage)).length,
            lastMonthLeads.filter(l => l.otpVerified || ['Survey', 'Quotation_Sent', 'Customer_Approved', 'Material_Dispatched', 'Installation', 'Completed'].includes(l.pipelineStage)).length
        );

        const projectsWonTrend = calcTrend(
            thisMonthLeads.filter(l => l.pipelineStage === 'Completed').length,
            lastMonthLeads.filter(l => l.pipelineStage === 'Completed').length
        );

        const thisMonthVal = thisMonthLeads.filter(l => l.pipelineStage !== 'Lost').reduce((s, l) => s + getLeadValue(l), 0);
        const lastMonthVal = lastMonthLeads.filter(l => l.pipelineStage !== 'Lost').reduce((s, l) => s + getLeadValue(l), 0);
        const pipelineValueTrend = calcTrend(thisMonthVal, lastMonthVal);

        // Task widget counts
        const pendingVerifications = leads.filter(l => l.pipelineStage === 'New Lead' || !l.otpVerified).length;
        const activeProposals = leads.filter(l => ['Proposal Sent', 'Negotiation/Finance'].includes(l.pipelineStage)).length;
        const upcomingSurveys = leads.filter(l => l.pipelineStage === 'Site Survey Scheduled').length;

        return c.json({
            totalLeads,
            verifiedLeads,
            projectsWon,
            pipelineValue,
            totalLeadsTrend,
            verifiedLeadsTrend,
            projectsWonTrend,
            pipelineValueTrend,
            tasks: {
                pendingVerifications,
                activeProposals,
                upcomingSurveys
            }
        });
    } catch (e) {
        console.error("Dashboard Stats Error:", e);
        return c.json({ message: 'Error fetching stats', error: e.message }, 500);
    }
};

export const getChartData = async (c) => {
    try {
        const prisma = c.get('prisma');
        const user = c.get('user');
        const { vendorId, startDate, endDate, groupBy = 'month' } = c.req.query();

        let where = {};
        if (user.role === 'Vendor') {
            where.assignedVendorId = user.id;
        } else if (vendorId && vendorId !== 'all') {
            where.assignedVendorId = vendorId;
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

        const leads = await prisma.lead.findMany({
            where,
            select: { 
                createdAt: true, 
                pipelineStage: true, 
                customFields: true, 
                productType: true,
                quotations: {
                    select: { netCost: true, totalAmount: true },
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });

        const getLeadValue = (l) => {
            try {
                if (l.quotations && l.quotations.length > 0) {
                    const latestQuo = l.quotations[0];
                    if (latestQuo.netCost) return Number(latestQuo.netCost);
                    if (latestQuo.totalAmount) return Number(latestQuo.totalAmount);
                }
                let cf = {};
                if (typeof l.customFields === 'string') {
                    cf = JSON.parse(l.customFields || '{}');
                } else if (typeof l.customFields === 'object' && l.customFields !== null) {
                    cf = l.customFields;
                }
                if (cf.quoteAmount) return Number(cf.quoteAmount) || 0;
                if (cf.estimatedAnnualSavings) return (Number(cf.estimatedAnnualSavings) || 0) * 4;
            } catch (e) {}
            return (l.productType && l.productType.toLowerCase().includes('pump')) ? 250000 : 150000;
        };

        if (groupBy === 'day') {
            const daysMap = new Map();
            const now = new Date();
            for (let i = 13; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
                const key = `${d.getDate()} ${d.toLocaleString('en-US', { month: 'short' })}`;
                daysMap.set(key, { name: key, leads: 0, revenue: 0 });
            }
            leads.forEach(l => {
                const d = new Date(l.createdAt);
                const key = `${d.getDate()} ${d.toLocaleString('en-US', { month: 'short' })}`;
                if (daysMap.has(key)) {
                    const entry = daysMap.get(key);
                    entry.leads++;
                    if (l.pipelineStage === 'Completed') {
                        entry.revenue += getLeadValue(l);
                    } else {
                        entry.revenue += Math.round(getLeadValue(l) * 0.2);
                    }
                }
            });
            const result = Array.from(daysMap.values());
            return c.json({ timeSeriesLeads: result, timeSeriesRevenue: result });
        }

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const timeSeriesMap = months.map(m => ({ name: m, leads: 0, revenue: 0 }));

        leads.forEach(l => {
            const d = new Date(l.createdAt);
            const m = d.getMonth();
            timeSeriesMap[m].leads++;
            const val = getLeadValue(l);
            if (l.pipelineStage === 'Completed') {
                timeSeriesMap[m].revenue += val;
            } else if (l.pipelineStage !== 'Lost') {
                timeSeriesMap[m].revenue += Math.round(val * 0.2);
            }
        });

        return c.json({
            timeSeriesLeads: timeSeriesMap,
            timeSeriesRevenue: timeSeriesMap
        });
    } catch (e) {
        console.error("Chart Data Error:", e);
        return c.json({ message: 'Error fetching chart data' }, 500);
    }
};

// ==================== LEADS ====================

export const getLeads = async (c) => {
    try {
        const prisma = c.get('prisma');
        const user = c.get('user');
        const { status, priority, search } = c.req.query();

        let where = {};
        if (user.role === 'Vendor') {
            where.assignedVendorId = user.id;
        }

        if (status && status !== 'All') where.pipelineStage = status;
        if (priority && priority !== 'All') where.priority = priority;
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { email: { contains: search } },
                { phone: { contains: search } }
            ];
        }

        const rawLeads = await prisma.lead.findMany({
            where,
            orderBy: { updatedAt: 'desc' },
            include: { assignedTo: { select: { name: true } } }
        });

        // Map back to 'status' for frontend compatibility and parse JSON fields
        const leads = rawLeads.map(l => ({
            ...l,
            status: l.pipelineStage,
            customFields: typeof l.customFields === 'string' ? JSON.parse(l.customFields) : l.customFields
        }));

        return c.json(leads);
    } catch (e) {
        console.error("Get Leads Error:", e);
        return c.json({ message: 'Error fetching leads' }, 500);
    }
};

export const getLeadDetails = async (c) => {
    try {
        const prisma = c.get('prisma');
        const id = c.req.param('id');
        const lead = await prisma.lead.findUnique({
            where: { id },
            include: {
                activityLog: { orderBy: { timestamp: 'desc' } },
                documents: { orderBy: { uploadedAt: 'desc' } },
                assignedTo: { select: { name: true, email: true } },
                surveys: {
                    orderBy: { createdAt: 'desc' },
                    include: { assignedEngineer: { select: { id: true, name: true, email: true } } }
                }
            }
        });
        if (!lead) return c.json({ message: 'Lead not found' }, 404);
        return c.json({
            ...lead,
            status: lead.pipelineStage,
            notes: lead.activityLog, // alias for frontend compatibility
            customFields: typeof lead.customFields === 'string' ? JSON.parse(lead.customFields) : lead.customFields
        });
    } catch (e) {
        console.error("Get Lead Details Error:", e);
        return c.json({ message: 'Error fetching lead details' }, 500);
    }
};

export const updateLead = async (c) => {
    try {
        const prisma = c.get('prisma');
        const id = c.req.param('id');
        const data = await c.req.json();
        
        const oldLead = await prisma.lead.findUnique({ where: { id } });
        if (!oldLead) return c.json({ message: 'Lead not found' }, 404);

        if (data.assignedVendorId && data.assignedVendorId !== oldLead.assignedVendorId) {
            await createNotification(prisma, data.assignedVendorId, 'Lead_Assigned', `New lead assigned: ${oldLead.name}`, `#/leads/${id}`);
        }

        // Map 'status' from frontend to 'pipelineStage' in DB
        if (data.status && !data.pipelineStage) {
            data.pipelineStage = data.status;
            delete data.status;
        }

        if (data.pipelineStage === 'Survey') {
            try {
                const existingSurvey = await prisma.survey.findFirst({ where: { leadId: id } });
                if (!existingSurvey) {
                    const surveyNo = `SV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
                    await prisma.survey.create({
                        data: {
                            surveyNo,
                            leadId: id,
                            status: 'Pending',
                            priority: 'Medium',
                            progressPercent: 10
                        }
                    });
                }
            } catch (err) {
                console.error("Auto survey creation error:", err);
            }
        }

        // Stringify customFields if provided as an object (Prisma TEXT column requires string)
        if (data.customFields && typeof data.customFields === 'object') {
            data.customFields = JSON.stringify(data.customFields);
        }

        const updatedLead = await prisma.lead.update({
            where: { id },
            data,
            include: {
                activityLog: { orderBy: { timestamp: 'desc' } },
                documents: { orderBy: { uploadedAt: 'desc' } },
                assignedTo: { select: { name: true, email: true } }
            }
        });

        return c.json({ 
            ...updatedLead, 
            status: updatedLead.pipelineStage,
            notes: updatedLead.activityLog,
            customFields: typeof updatedLead.customFields === 'string' ? JSON.parse(updatedLead.customFields || '{}') : (updatedLead.customFields || {})
        });
    } catch (e) {
        console.error("Update Lead Error:", e);
        return c.json({ message: 'Error updating lead' }, 500);
    }
};

export const addLeadNote = async (c) => {
    try {
        const prisma = c.get('prisma');
        const id = c.req.param('id');
        const body = await c.req.json();
        const user = c.get('user');
        
        const content = body.content || body.note || '';
        await prisma.activity.create({
            data: { 
                leadId: id, 
                action: 'Note Added',
                notes: content, 
                user: user ? user.name : 'System' 
            }
        });

        const fullLead = await prisma.lead.findUnique({
            where: { id },
            include: {
                activityLog: { orderBy: { timestamp: 'desc' } },
                documents: { orderBy: { uploadedAt: 'desc' } },
                assignedTo: { select: { name: true, email: true } }
            }
        });

        return c.json({
            ...fullLead,
            status: fullLead.pipelineStage,
            notes: fullLead.activityLog,
            customFields: typeof fullLead.customFields === 'string' ? JSON.parse(fullLead.customFields || '{}') : (fullLead.customFields || {})
        }, 201);
    } catch (e) {
        console.error("Add Note Error:", e);
        return c.json({ message: 'Error adding note' }, 500);
    }
};

export const uploadLeadDocument = async (c) => {
    try {
        const prisma = c.get('prisma');
        const id = c.req.param('id');
        const body = await c.req.parseBody();
        const file = body.file || body.document;
        if (!file) return c.json({ message: 'No file uploaded' }, 400);

        const buffer = await getBuffer(file);
        const key = `leads/${id}/${crypto.randomUUID()}-${file.name}`;
        
        // Upload to R2 if available
        if (c.env.BUCKET) {
            await c.env.BUCKET.put(key, buffer, {
                httpMetadata: { contentType: file.type }
            });
        }

        await prisma.document.create({
            data: {
                leadId: id,
                filename: file.name,
                mimeType: file.type,
                url: key,
                size: buffer.length
            }
        });

        const fullLead = await prisma.lead.findUnique({
            where: { id },
            include: {
                activityLog: { orderBy: { timestamp: 'desc' } },
                documents: { orderBy: { uploadedAt: 'desc' } },
                assignedTo: { select: { name: true, email: true } }
            }
        });

        return c.json({
            ...fullLead,
            status: fullLead.pipelineStage,
            notes: fullLead.activityLog,
            customFields: typeof fullLead.customFields === 'string' ? JSON.parse(fullLead.customFields || '{}') : (fullLead.customFields || {})
        }, 201);
    } catch (e) {
        console.error("Upload error:", e);
        return c.json({ message: 'Error uploading document' }, 500);
    }
};

export const deleteLeadDocument = async (c) => {
    try {
        const prisma = c.get('prisma');
        const docId = c.req.param('docId');
        
        const doc = await prisma.document.findUnique({ where: { id: docId } });
        if (!doc) return c.json({ message: 'Document not found' }, 404);

        // Delete from R2 if available
        if (doc.url && c.env.BUCKET) {
            try { await c.env.BUCKET.delete(doc.url); } catch (e) { /* ignore R2 errors */ }
        }

        await prisma.document.delete({ where: { id: docId } });
        return c.json({ success: true });
    } catch (e) {
        console.error("Delete Document Error:", e);
        return c.json({ message: 'Error deleting document' }, 500);
    }
};

export const generateLeadSummary = async (c) => {
    try {
        const prisma = c.get('prisma');
        const id = c.req.param('id');
        const lead = await prisma.lead.findUnique({ where: { id } });
        if (!lead) return c.json({ message: 'Lead not found' }, 404);

        // Stub: generate a basic summary from lead data
        const summary = `Lead "${lead.name || 'Unknown'}" (${lead.productType || 'N/A'}) is currently at stage "${lead.pipelineStage}". Contact: ${lead.phone || lead.email || 'N/A'}. Score: ${lead.score}/100 (${lead.scoreStatus}).`;
        
        return c.json({ summary });
    } catch (e) {
        console.error("Generate Summary Error:", e);
        return c.json({ message: 'Error generating summary' }, 500);
    }
};

export const createManualLead = async (c) => {
    try {
        const prisma = c.get('prisma');
        const body = await c.req.parseBody();
        
        // Extract fields — could come as FormData or JSON
        const name = body.name || '';
        const email = body.email || '';
        const phone = body.phone || '';
        const productType = body.productType || 'other';
        const assignedVendorId = body.assignedVendorId || null;
        
        const score = calculateScore({ productType, phone });
        
        const lead = await prisma.lead.create({
            data: {
                name,
                email,
                phone,
                productType,
                customFields: body.customFields ? (typeof body.customFields === 'string' ? body.customFields : JSON.stringify(body.customFields)) : '{}',
                score,
                scoreStatus: getScoreStatus(score),
                source: 'Manual_Entry',
                pipelineStage: 'New Lead',
                otpVerified: true,
                assignedVendorId
            }
        });
        return c.json(lead, 201);
    } catch (e) {
        console.error("Create Manual Lead Error:", e);
        return c.json({ message: 'Error creating lead' }, 500);
    }
};

export const deleteLead = async (c) => {
    try {
        const prisma = c.get('prisma');
        const id = c.req.param('id');
        // Delete related records first (SQLite doesn't cascade by default)
        await prisma.activity.deleteMany({ where: { leadId: id } });
        await prisma.document.deleteMany({ where: { leadId: id } });
        await prisma.lead.delete({ where: { id } });
        return c.json({ success: true });
    } catch (e) {
        console.error("Delete Lead Error:", e);
        return c.json({ message: 'Error deleting lead' }, 500);
    }
};

export const performBulkLeadAction = async (c) => {
    try {
        const prisma = c.get('prisma');
        const { leadIds, action, value } = await c.req.json();
        if (action === 'delete') {
            await prisma.activity.deleteMany({ where: { leadId: { in: leadIds } } });
            await prisma.document.deleteMany({ where: { leadId: { in: leadIds } } });
            await prisma.lead.deleteMany({ where: { id: { in: leadIds } } });
        } else if (action === 'assign') {
            await prisma.lead.updateMany({ where: { id: { in: leadIds } }, data: { assignedVendorId: value } });
        } else if (action === 'status' || action === 'changeStage') {
            await prisma.lead.updateMany({ where: { id: { in: leadIds } }, data: { pipelineStage: value } });
            
            if (value === 'Survey') {
                for (const id of leadIds) {
                    try {
                        const existingSurvey = await prisma.survey.findFirst({ where: { leadId: id } });
                        if (!existingSurvey) {
                            const surveyNo = `SV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
                            await prisma.survey.create({
                                data: {
                                    surveyNo,
                                    leadId: id,
                                    status: 'Pending',
                                    priority: 'Medium',
                                    progressPercent: 10
                                }
                            });
                        }
                    } catch (err) {
                        console.error("Auto survey creation error (bulk):", err);
                    }
                }
            }
        } else if (action === 'assignVendor') {
            await prisma.lead.updateMany({ where: { id: { in: leadIds } }, data: { assignedVendorId: value } });
        }
        return c.json({ success: true });
    } catch (e) {
        console.error("Bulk Action Error:", e);
        return c.json({ message: 'Error performing bulk action' }, 500);
    }
};

export const importLeads = async (c) => {
    try {
        const prisma = c.get('prisma');
        const body = await c.req.parseBody();
        const file = body.file;
        if (!file) return c.json({ message: 'No file uploaded' }, 400);

        const text = await file.text();
        const lines = text.split('\n').filter(l => l.trim());
        const headers = lines[0].split(',');
        const leadsToCreate = lines.slice(1).map(line => {
            const values = line.split(',');
            const lead = {};
            headers.forEach((h, i) => lead[h.trim()] = values[i]?.trim());
            
            const score = calculateScore(lead);
            return {
                name: lead.name || 'Unknown',
                email: lead.email || null,
                phone: lead.phone || null,
                productType: lead.productType || 'other',
                pipelineStage: 'New_Lead',
                score,
                scoreStatus: getScoreStatus(score),
                source: 'Bulk_Import'
            };
        });

        // D1/SQLite doesn't support createMany well, create one by one
        let created = 0;
        for (const leadData of leadsToCreate) {
            try {
                await prisma.lead.create({ data: leadData });
                created++;
            } catch (e) { console.error('Error importing single lead:', e); }
        }
        return c.json({ message: `Successfully imported ${created} leads` });
    } catch (e) {
        console.error("Import Error:", e);
        return c.json({ message: 'Error importing leads' }, 500);
    }
};

// ==================== VENDORS ====================

export const getVendors = async (c) => {
    try {
        const prisma = c.get('prisma');
        const vendors = await prisma.user.findMany({
            where: { role: 'Vendor' },
            select: { id: true, name: true, email: true, state: true, district: true }
        });
        return c.json(vendors);
    } catch (e) {
        console.error("Get Vendors Error:", e);
        return c.json({ message: 'Error fetching vendors' }, 500);
    }
};

export const createVendor = async (c) => {
    try {
        const prisma = c.get('prisma');
        const { name, email, password, state, district } = await c.req.json();
        const hashedPassword = await bcrypt.hash(password, 10);
        const vendor = await prisma.user.create({
            data: { name, email, password: hashedPassword, role: 'Vendor', state, district }
        });
        return c.json(vendor, 201);
    } catch (e) {
        console.error("Create Vendor Error:", e);
        return c.json({ message: 'Error creating vendor' }, 500);
    }
};

// ==================== ADMIN MANAGEMENT ====================

export const getMasterAdmins = async (c) => {
    try {
        const prisma = c.get('prisma');
        const admins = await prisma.user.findMany({
            where: { role: 'Master' },
            select: { id: true, name: true, email: true, country: true }
        });
        return c.json(admins);
    } catch (e) {
        console.error("Get Admins Error:", e);
        return c.json({ message: 'Error fetching master admins' }, 500);
    }
};

export const createMasterAdmin = async (c) => {
    try {
        const prisma = c.get('prisma');
        const { name, email, password, country } = await c.req.json();
        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = await prisma.user.create({
            data: { name, email, password: hashedPassword, role: 'Master', country }
        });
        return c.json(admin, 201);
    } catch (e) {
        console.error("Create Admin Error:", e);
        return c.json({ message: 'Error creating master admin' }, 500);
    }
};

// ==================== USER DELETION ====================

export const requestUserDeletionOtp = async (c) => {
    try {
        const prisma = c.get('prisma');
        const body = await c.req.json();
        const userId = body.userId || body.userIdToDelete;
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return c.json({ message: 'User not found' }, 404);

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        deletionOtps.set(userId, otp);
        
        console.log(`[DELETION OTP for ${user.email}]: ${otp}`);
        
        return c.json({ message: 'Deletion OTP generated. In production, this would be sent via email.' });
    } catch (e) {
        console.error("OTP Error:", e);
        return c.json({ message: 'Error generating OTP' }, 500);
    }
};

export const deleteUserWithOtp = async (c) => {
    try {
        const prisma = c.get('prisma');
        const body = await c.req.json();
        const userId = body.userId || body.userIdToDelete;
        const otp = body.otp;
        const storedOtp = deletionOtps.get(userId);

        if (otp === storedOtp) {
            await prisma.user.delete({ where: { id: userId } });
            deletionOtps.delete(userId);
            return c.json({ success: true });
        } else {
            return c.json({ message: 'Invalid OTP' }, 400);
        }
    } catch (e) {
        console.error("Delete User Error:", e);
        return c.json({ message: 'Error deleting user' }, 500);
    }
};

// ==================== PROFILE ====================

export const updateProfile = async (c) => {
    try {
        const prisma = c.get('prisma');
        const user = c.get('user');
        const body = await c.req.parseBody();
        
        const updateData = {};
        if (body.name) updateData.name = body.name;
        
        // Handle profile image upload to R2
        if (body.profileImage && typeof body.profileImage !== 'string') {
            const file = body.profileImage;
            const buffer = await getBuffer(file);
            const key = `profiles/${user.id}/${crypto.randomUUID()}-${file.name}`;
            if (c.env.BUCKET) {
                await c.env.BUCKET.put(key, buffer, {
                    httpMetadata: { contentType: file.type }
                });
            }
            updateData.profileImage = key;
        }

        if (Object.keys(updateData).length === 0) {
            return c.json({ message: 'No fields to update' }, 400);
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: updateData,
            select: { id: true, name: true, email: true, role: true, profileImage: true, state: true, district: true, country: true }
        });
        
        return c.json(updatedUser);
    } catch (e) {
        console.error("Update Profile Error:", e);
        return c.json({ message: 'Error updating profile' }, 500);
    }
};

// ==================== SETTINGS ====================

export const getSettings = async (c) => {
    try {
        const prisma = c.get('prisma');
        const settings = await prisma.setting.findMany();
        // Convert array to key-value object for frontend
        const settingsObj = {};
        settings.forEach(s => { settingsObj[s.key] = s.value; });
        return c.json(settingsObj);
    } catch (e) {
        console.error("Get Settings Error:", e);
        return c.json({ message: 'Error fetching settings' }, 500);
    }
};

export const updateSettings = async (c) => {
    try {
        const prisma = c.get('prisma');
        const body = await c.req.json();
        
        // Accept { apiKey: 'value' } or { key: 'value', ... }
        const entries = Object.entries(body);
        for (const [key, value] of entries) {
            await prisma.setting.upsert({
                where: { key },
                update: { value: String(value) },
                create: { key, value: String(value) }
            });
        }
        
        return c.json({ success: true, message: 'Settings updated successfully' });
    } catch (e) {
        console.error("Update Settings Error:", e);
        return c.json({ message: 'Error updating settings' }, 500);
    }
};

// ==================== FORM BUILDER ====================

export const updateFormSchema = async (c) => {
    try {
        const prisma = c.get('prisma');
        const formType = c.req.param('formType');
        const schemaString = await c.req.text(); // Get raw JSON string to save directly

        // Upsert setting
        await prisma.setting.upsert({
            where: { key: `form_${formType}` },
            update: { value: schemaString },
            create: { key: `form_${formType}`, value: schemaString }
        });

        return c.json({ success: true, message: 'Form schema updated successfully' });
    } catch (e) {
        console.error("Error updating form schema:", e);
        return c.json({ message: 'Error updating form schema' }, 500);
    }
};

// ==================== EVENTS (SSE Stub) ====================

export const getEvents = async (c) => {
    // Return an empty event stream message. 
    // Cloudflare Workers don't support long-polling, so this returns an empty response.
    return c.json({ type: 'HEARTBEAT', data: null, message: 'No new events' });
};