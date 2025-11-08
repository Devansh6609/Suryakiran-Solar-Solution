const prisma = require('../../config/prisma');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');
const sgMail = require('@sendgrid/mail');
const { calculateScore, getScoreStatus } = require('../utils/leadScoring');

// In-memory store for OTPs. In production, use Redis or a similar shared store.
const deletionOtpSessions = new Map();

// Helper function to convert frontend stage names to Prisma enum format
const normalizeStage = (stage) => {
    if (stage === 'Closed Won / Project') return 'Closed_Won';
    if (stage === 'Negotiation/Finance') return 'Negotiation';
    if (stage === 'Qualified (Vetting)') return 'Qualified';
    return stage.replace(/ /g, '_');
};

// Helper function to convert DB enum names back to display format
const denormalizeStage = (stage) => {
    if (!stage) return 'New Lead'; // Default/fallback
    if (stage === 'Closed_Won') return 'Closed Won / Project';
    if (stage === 'Negotiation') return 'Negotiation/Finance';
    if (stage === 'Qualified') return 'Qualified (Vetting)';
    return stage.replace(/_/g, ' ');
}


// --- SSE (Real-time updates) ---
let clients = [];
const sendEventsToAll = (data) => {
    clients.forEach(client => client.res.write(`data: ${JSON.stringify(data)}\n\n`));
};
const getRealtimeEvents = (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    const clientId = Date.now();
    const newClient = { id: clientId, res };
    clients.push(newClient);
    req.on('close', () => {
        clients = clients.filter(c => c.id !== clientId);
    });
};

// --- Dashboard ---
const getDashboardStats = async (req, res) => {
    const { vendorId, startDate, endDate } = req.query;
    let where = {};
    if (req.user.role === 'Vendor') {
        where.assignedVendorId = req.user.id;
    } else if (vendorId) {
        where.assignedVendorId = vendorId;
    }
    if (startDate) where.createdAt = { ...where.createdAt, gte: new Date(startDate) };
    if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        where.createdAt = { ...where.createdAt, lte: endOfDay };
    }
    try {
        const relevantLeads = await prisma.lead.findMany({ where });
        const totalLeads = relevantLeads.length;
        const verifiedLeads = relevantLeads.filter(l => l.otpVerified).length;
        const projectsWon = relevantLeads.filter(l => l.pipelineStage === 'Closed_Won').length;
        const pipelineValue = `₹ ${(projectsWon * 150000).toLocaleString('en-IN')}`;
        
        // Calculate task counts from the filtered leads
        const pendingVerifications = relevantLeads.filter(l => l.pipelineStage === 'New_Lead').length;
        const activeProposals = relevantLeads.filter(l => l.pipelineStage === 'Proposal_Sent').length;
        const upcomingSurveys = relevantLeads.filter(l => l.pipelineStage === 'Site_Survey_Scheduled').length;

        res.json({
            totalLeads,
            verifiedLeads,
            projectsWon,
            pipelineValue,
            tasks: {
                pendingVerifications,
                activeProposals,
                upcomingSurveys
            }
        });
    } catch (e) { res.status(500).json({ message: 'Error fetching stats' }); }
};
const getChartData = async (req, res) => {
    const { vendorId, startDate, endDate, groupBy = 'month' } = req.query;
    let where = {};
    if (req.user.role === 'Vendor') {
        where.assignedVendorId = req.user.id;
    } else if (vendorId) {
        where.assignedVendorId = vendorId;
    }
     if (startDate) where.createdAt = { ...where.createdAt, gte: new Date(startDate) };
    if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        where.createdAt = { ...where.createdAt, lte: endOfDay };
    }
    try {
        const relevantLeads = await prisma.lead.findMany({ where });

        const leadsByTime = {};
        const revenueByTime = {};

        relevantLeads.forEach(lead => {
            const date = new Date(lead.createdAt);
            let key;

            if (groupBy === 'day') {
                key = date.toISOString().split('T')[0]; // YYYY-MM-DD
            } else if (groupBy === 'week') {
                const firstDayOfWeek = new Date(date.setDate(date.getDate() - date.getDay()));
                key = firstDayOfWeek.toISOString().split('T')[0]; // YYYY-MM-DD of the week's Sunday
            } else { // month
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
            }

            leadsByTime[key] = (leadsByTime[key] || 0) + 1;
            if (lead.pipelineStage === 'Closed_Won') {
                revenueByTime[key] = (revenueByTime[key] || 0) + 150000;
            }
        });
        
        const formatName = (key, groupBy) => {
            if (groupBy === 'day') {
                const [y, m, d] = key.split('-');
                return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }
            if (groupBy === 'week') {
                const [y, m, d] = key.split('-');
                return `W/O ${new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
            }
            const [y, m] = key.split('-');
            return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        };

        const sortedKeys = Object.keys(leadsByTime).sort();
        
        const timeSeriesLeads = sortedKeys.map(key => ({
            name: formatName(key, groupBy),
            leads: leadsByTime[key]
        }));
        
        const timeSeriesRevenue = sortedKeys.map(key => ({
            name: formatName(key, groupBy),
            revenue: revenueByTime[key] || 0
        }));

        const leadSourceMap = new Map();
        relevantLeads.forEach(lead => {
            const source = lead.source || 'Unknown';
            leadSourceMap.set(source, (leadSourceMap.get(source) || 0) + 1);
        });
        const leadSourceData = Array.from(leadSourceMap, ([name, value]) => ({ name, value }));
        
        res.json({ timeSeriesLeads, leadSources: leadSourceData, timeSeriesRevenue });
    } catch (e) { 
        console.error("Chart data error:", e);
        res.status(500).json({ message: 'Error fetching chart data' }); 
    }
};

// --- Leads ---
const getLeads = async (req, res) => {
    let where = {};
    if (req.user.role === 'Vendor') {
        where.assignedVendorId = req.user.id;
    } else { // Master can filter
        const { assignedVendorId, state, district } = req.query;
        if (assignedVendorId && assignedVendorId !== 'all') where.assignedVendorId = assignedVendorId;
        if (state && state !== 'all') where.customFields = { ...where.customFields, path: ['state'], equals: state };
        if (district && district !== 'all') where.customFields = { ...where.customFields, path: ['district'], equals: district };
    }
    try {
        const leads = await prisma.lead.findMany({ where, include: { assignedTo: { select: { name: true } } }, orderBy: { createdAt: 'desc' } });
        const leadsWithVendorInfo = leads.map(l => ({ 
            ...l, 
            pipelineStage: denormalizeStage(l.pipelineStage),
            assignedVendorName: l.assignedTo?.name || 'Unassigned' 
        }));
        res.json(leadsWithVendorInfo);
    } catch (e) { res.status(500).json({ message: 'Error fetching leads' }); }
};
const getLeadDetails = async (req, res) => {
    try {
        const lead = await prisma.lead.findUnique({ where: { id: req.params.id }, include: { assignedTo: true, activityLog: true, documents: true } });
        if (!lead) return res.status(404).json({ message: 'Lead not found' });
        if (req.user.role === 'Vendor' && lead.assignedVendorId !== req.user.id) return res.status(403).json({ message: 'Access denied' });
        const leadWithDetails = { 
            ...lead, 
            pipelineStage: denormalizeStage(lead.pipelineStage),
            assignedVendorName: lead.assignedTo?.name || 'Unassigned' 
        };
        res.json(leadWithDetails);
    } catch (e) { res.status(500).json({ message: 'Error fetching lead details' }); }
};
const updateLead = async (req, res) => {
    try {
        const { pipelineStage, assignedVendorId } = req.body;
        const lead = await prisma.lead.findUnique({ where: { id: req.params.id } });
        if (!lead) return res.status(404).json({ message: 'Lead not found' });

        const dataToUpdate = {};
        const activityLogs = [];
        if (pipelineStage) {
            dataToUpdate.pipelineStage = normalizeStage(pipelineStage);
            activityLogs.push({ action: `Stage changed to ${pipelineStage}`, user: req.user.name });
        }
        if (assignedVendorId !== undefined) {
            dataToUpdate.assignedVendorId = assignedVendorId || null;
            const vendor = assignedVendorId ? await prisma.user.findUnique({ where: { id: assignedVendorId } }) : null;
            activityLogs.push({ action: `Assigned to ${vendor ? vendor.name : 'Unassigned'}`, user: req.user.name });
        }
        dataToUpdate.activityLog = { create: activityLogs };
        
        const updatedLead = await prisma.lead.update({
            where: { id: req.params.id },
            data: dataToUpdate,
            include: { assignedTo: true, activityLog: true, documents: true }
        });
        const leadWithDetails = { 
            ...updatedLead, 
            pipelineStage: denormalizeStage(updatedLead.pipelineStage),
            assignedVendorName: updatedLead.assignedTo?.name || 'Unassigned' 
        };
        res.json(leadWithDetails);
        sendEventsToAll({ type: 'LEAD_UPDATE', data: leadWithDetails });
    } catch (e) { res.status(500).json({ message: 'Error updating lead' }); }
};
const addLeadNote = async (req, res) => {
    try {
        const updatedLead = await prisma.lead.update({
            where: { id: req.params.id },
            data: { activityLog: { create: { action: 'Note Added', user: req.user.name, notes: req.body.note } } },
            include: { activityLog: true, documents: true, assignedTo: true }
        });
        res.json(updatedLead);
    } catch (e) { res.status(500).json({ message: 'Error adding note' }); }
};
const uploadLeadDocument = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'File upload failed' });
    try {
        const updatedLead = await prisma.lead.update({
            where: { id: req.params.id },
            data: {
                documents: { create: { filename: req.file.filename } },
                activityLog: { create: { action: `Document '${req.file.originalname}' uploaded`, user: req.user.name } }
            },
            include: { activityLog: true, documents: true, assignedTo: true }
        });
        res.json(updatedLead);
    } catch (e) { res.status(500).json({ message: 'Error uploading document' }); }
};
const deleteLead = async (req, res) => {
    try {
        const leadId = req.params.id;
        const lead = await prisma.lead.findUnique({ where: { id: leadId } });

        if (!lead) {
            return res.status(404).json({ message: 'Lead not found.' });
        }

        await prisma.lead.delete({
            where: { id: leadId },
        });

        res.status(200).json({ message: 'Lead deleted successfully.' });
        sendEventsToAll({ type: 'LEAD_DELETE', data: { id: leadId } });

    } catch (error) {
        console.error('Delete lead error:', error);
        res.status(500).json({ message: 'Error deleting lead.' });
    }
};
const exportLeads = async (req, res) => {
    // Omitting logic for brevity, but it would be similar to getLeads
    res.json([]);
}

const performBulkLeadAction = async (req, res) => {
    try {
        const { action, value, leadIds } = req.body;
        if (!action || !value || !leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
            return res.status(400).json({ message: 'Invalid request for bulk action.' });
        }

        let dataToUpdate = {};
        let activityAction = '';
        let vendorNameForLog = '...';

        if (action === 'assignVendor' && value !== 'unassigned') {
            const vendor = await prisma.user.findUnique({ where: { id: value }, select: { name: true } });
            if (vendor) vendorNameForLog = vendor.name;
        }

        if (action === 'changeStage') {
            dataToUpdate.pipelineStage = normalizeStage(value);
            activityAction = `Stage changed to ${value} via bulk update`;
        } else if (action === 'assignVendor') {
            const vendorId = value === 'unassigned' ? null : value;
            dataToUpdate.assignedVendorId = vendorId;
            activityAction = `Assigned to ${value === 'unassigned' ? 'Unassigned' : vendorNameForLog} via bulk update`;
        } else {
            return res.status(400).json({ message: 'Invalid bulk action type.' });
        }
        
        await prisma.lead.updateMany({
            where: {
                id: { in: leadIds },
                ...(req.user.role === 'Vendor' && { assignedVendorId: req.user.id })
            },
            data: dataToUpdate,
        });
        
        try {
            const activityLogData = leadIds.map(leadId => ({
                leadId,
                action: activityAction,
                user: req.user.name,
            }));
            await prisma.activity.createMany({
                data: activityLogData,
            });
        } catch (activityError) {
            console.error("Failed to create bulk activity logs (non-critical):", activityError);
        }

        res.json({ message: 'Bulk action successful.' });
        sendEventsToAll({ type: 'LEAD_UPDATE', data: { message: `${leadIds.length} leads updated.` } });

    } catch (error) {
        console.error('Bulk action error:', error);
        res.status(500).json({ message: 'Error performing bulk action.' });
    }
};

const importLeads = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No CSV file uploaded." });
    }

    const filePath = req.file.path;
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    const allVendors = await prisma.user.findMany({ where: { role: 'Vendor' } });

    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const rows = fileContent.split('\n').filter(row => row.trim() !== '');
        if (rows.length <= 1) {
            return res.status(400).json({ message: "CSV file is empty or contains only a header." });
        }

        const headers = rows[0].trim().split(',').map(h => h.trim());
        const requiredHeaders = ['name', 'email', 'productType'];
        for (const rh of requiredHeaders) {
            if (!headers.includes(rh)) {
                return res.status(400).json({ message: `Missing required CSV column: ${rh}` });
            }
        }
        
        const standardFields = ['name', 'email', 'phone', 'productType', 'pipelineStage', 'source'];

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i].trim();
            if (!row) continue;
            
            const values = row.split(',');
            const rowData = headers.reduce((obj, header, index) => {
                obj[header] = values[index] ? values[index].trim() : '';
                return obj;
            }, {});

            try {
                if (!rowData.name || !rowData.email || !rowData.productType) {
                    throw new Error("Missing required fields (name, email, productType).");
                }
                if (!['rooftop', 'pump'].includes(rowData.productType)) {
                    throw new Error("productType must be 'rooftop' or 'pump'.");
                }

                const customFields = {};
                for (const key in rowData) {
                    if (!standardFields.includes(key)) {
                        customFields[key] = rowData[key];
                    }
                }
                
                const leadToCreate = {
                    name: rowData.name,
                    email: rowData.email,
                    phone: rowData.phone || '',
                    productType: rowData.productType,
                    pipelineStage: rowData.pipelineStage ? normalizeStage(rowData.pipelineStage) : 'New_Lead',
                    source: rowData.source || 'CSV Import',
                    customFields,
                };
                
                const score = calculateScore(leadToCreate);
                leadToCreate.score = score;
                leadToCreate.scoreStatus = getScoreStatus(score);
                
                const matchingVendor = allVendors.find(v => v.district === customFields.district);
                if (matchingVendor) {
                    leadToCreate.assignedVendorId = matchingVendor.id;
                }

                await prisma.lead.create({
                    data: {
                        ...leadToCreate,
                        activityLog: { create: { action: 'Lead imported from CSV', user: req.user.name } },
                    }
                });
                successCount++;

            } catch (validationError) {
                errorCount++;
                errors.push(`Row ${i + 1}: ${validationError.message}`);
            }
        }
        
        res.json({ successCount, errorCount, errors });
        sendEventsToAll({ type: 'LEAD_IMPORT_COMPLETE', data: { successCount, errorCount } });

    } catch (err) {
        console.error('Import process error:', err);
        res.status(500).json({ message: "An error occurred during the import process." });
    } finally {
        fs.unlinkSync(filePath); // Clean up the uploaded file
    }
};

// --- Vendors ---
const getVendors = async (req, res) => {
    try {
        const vendors = await prisma.user.findMany({ where: { role: 'Vendor' }, select: { id: true, name: true, email: true, state: true, district: true } });
        res.json(vendors);
    } catch (e) { res.status(500).json({ message: 'Error fetching vendors' }); }
};
const createVendor = async (req, res) => {
    try {
        const { name, email, password, state, district } = req.body;
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return res.status(400).json({ message: 'Email already in use' });
        const hashedPassword = await bcrypt.hash(password, 10);
        const newVendor = await prisma.user.create({
            data: { name, email, password: hashedPassword, state, district, role: 'Vendor', country: 'India' }
        });
        const { password: _, ...vendorToReturn } = newVendor;
        res.status(201).json(vendorToReturn);
    } catch (e) { res.status(500).json({ message: 'Error creating vendor' }); }
};

// --- Admins ---
const getMasterAdmins = async (req, res) => {
    try {
        const admins = await prisma.user.findMany({ 
            where: { role: 'Master' }, 
            select: { id: true, name: true, email: true, role: true } 
        });
        res.json(admins);
    } catch (e) { 
        console.error("Error fetching master admins:", e);
        res.status(500).json({ message: 'Error fetching master admins' }); 
    }
};
const createMasterAdmin = async (req, res) => {
    try {
        const { name, email, password, confirmationPassword } = req.body;
        const requestingAdminId = req.user.id;
        
        const requestingAdmin = await prisma.user.findUnique({ where: { id: requestingAdminId } });
        if (!requestingAdmin) {
            return res.status(401).json({ message: 'Unable to verify your identity. Please log in again.' });
        }
        const isPasswordValid = await bcrypt.compare(confirmationPassword, requestingAdmin.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Your password confirmation is incorrect.' });
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(400).json({ message: 'Email already in use.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = await prisma.user.create({
            data: { 
                name, 
                email, 
                password: hashedPassword, 
                role: 'Master', 
                country: 'India' 
            }
        });

        const { password: _, ...adminToReturn } = newAdmin;
        res.status(201).json(adminToReturn);

    } catch (e) { 
        console.error("Error creating master admin:", e);
        res.status(500).json({ message: 'Error creating master admin.' }); 
    }
};

// --- Secure User Deletion ---
const requestUserDeletionOtp = async (req, res) => {
    const { userIdToDelete } = req.body;
    const requestingAdmin = req.user;

    try {
        if (userIdToDelete === requestingAdmin.id) {
            return res.status(400).json({ message: "You cannot delete your own account." });
        }

        const userToDelete = await prisma.user.findUnique({ where: { id: userIdToDelete } });
        if (!userToDelete) {
            return res.status(404).json({ message: "User to be deleted not found." });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
        const expires = Date.now() + 10 * 60 * 1000; // 10 minute expiry

        deletionOtpSessions.set(requestingAdmin.id, { otp, userIdToDelete, expires });
        
        if (process.env.SENDGRID_API_KEY) {
            sgMail.setApiKey(process.env.SENDGRID_API_KEY);
            const fromEmail = process.env.SENDGRID_FROM_EMAIL;
            if (!fromEmail) {
                 console.warn('SENDGRID_FROM_EMAIL not set in .env. Falling back to default. This may fail if the sender is not verified in SendGrid.');
            }
            const msg = {
                to: requestingAdmin.email,
                from: fromEmail || 'devanshagile@gmail.com', // Must be a verified SendGrid sender
                subject: 'Security Alert: User Deletion Request',
                html: `
                    <div style="font-family: sans-serif; padding: 20px; color: #333;">
                        <h2>User Deletion Confirmation</h2>
                        <p>A request has been made to delete the user account for <strong>${userToDelete.name} (${userToDelete.email})</strong>.</p>
                        <p>To confirm this action, use the following verification code:</p>
                        <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px; background-color: #f2f2f2; padding: 10px; border-radius: 5px; text-align: center;">${otp}</p>
                        <p>This code will expire in 10 minutes. If you did not request this, please secure your account immediately.</p>
                    </div>
                `,
            };
            await sgMail.send(msg);
        } else {
            console.warn(`SENDGRID_API_KEY not found. Deletion OTP for ${requestingAdmin.email} to delete ${userToDelete.email}: ${otp}`);
        }

        res.json({ message: 'Deletion confirmation code has been sent to your email.' });

    } catch (error) {
        console.error("Request user deletion OTP error:", error);
        if (error.code === 'ENOTFOUND') {
            return res.status(503).json({ message: 'Mail Service Unavailable: Could not connect to the email provider. Please check the server\'s network configuration.' });
        }
        res.status(500).json({ message: 'An internal server error occurred while trying to send the email.' });
    }
};

const deleteUserWithOtp = async (req, res) => {
    const { userIdToDelete, otp } = req.body;
    const requestingAdminId = req.user.id;

    try {
        const session = deletionOtpSessions.get(requestingAdminId);

        if (!session || session.expires < Date.now() || session.otp !== otp || session.userIdToDelete !== userIdToDelete) {
            return res.status(400).json({ message: 'Invalid or expired deletion code.' });
        }

        const userToDelete = await prisma.user.findUnique({ where: { id: userIdToDelete } });
        if (!userToDelete) {
            return res.status(404).json({ message: "User to be deleted not found." });
        }

        if (userToDelete.role === 'Vendor') {
            // Transaction: Un-assign leads and then delete the vendor.
            await prisma.$transaction([
                prisma.lead.updateMany({
                    where: { assignedVendorId: userIdToDelete },
                    data: { assignedVendorId: null },
                }),
                prisma.user.delete({
                    where: { id: userIdToDelete },
                }),
            ]);
        } else {
            // Just delete the Master Admin
            await prisma.user.delete({
                where: { id: userIdToDelete },
            });
        }
        
        deletionOtpSessions.delete(requestingAdminId); // Clean up the session

        res.json({ message: `User ${userToDelete.name} has been successfully deleted.` });

    } catch (error) {
        console.error("Confirm user deletion error:", error);
        res.status(500).json({ message: 'An internal server error occurred during deletion.' });
    }
};


// --- Settings & Forms ---
const getSettings = async (req, res) => {
    const apiKeySetting = await prisma.setting.findUnique({ where: { key: 'geminiApiKey' } });
    res.json({ apiKeyIsSet: !!apiKeySetting?.value });
};
const saveSettings = async (req, res) => {
    await prisma.setting.upsert({
        where: { key: 'geminiApiKey' },
        update: { value: req.body.apiKey },
        create: { key: 'geminiApiKey', value: req.body.apiKey }
    });
    res.json({ message: 'API key saved' });
};
const updateFormSchema = async (req, res) => {
    const { formType } = req.params;
    const schema = req.body;

    if (!['rooftop', 'pump'].includes(formType)) {
        return res.status(400).json({ message: 'Invalid form type.' });
    }
    if (!Array.isArray(schema)) {
        return res.status(400).json({ message: 'Invalid schema format. Expected an array of fields.' });
    }

    try {
        await prisma.setting.upsert({
            where: { key: `form_schema_${formType}` },
            update: { value: JSON.stringify(schema) },
            create: { key: `form_schema_${formType}`, value: JSON.stringify(schema) }
        });
        res.json({ message: 'Form schema updated successfully' });
    } catch (error) {
        console.error(`Error updating form schema for ${formType}:`, error);
        res.status(500).json({ message: 'Failed to save form schema.' });
    }
};
const generateLeadSummary = async (req, res) => {
    try {
        const apiKeySetting = await prisma.setting.findUnique({ where: { key: 'geminiApiKey' } });
        if (!apiKeySetting?.value) return res.status(400).json({ message: 'Gemini API key not configured' });
        
        const lead = await prisma.lead.findUnique({ where: { id: req.params.id } });
        if (!lead) return res.status(404).json({ message: 'Lead not found' });
        
        const ai = new GoogleGenAI({apiKey: apiKeySetting.value});
        const prompt = `Summarize this sales lead into 3 bullet points. LEAD DATA: ${JSON.stringify(lead, null, 2)}`;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        res.json({ summary: response.text });
    } catch (e) { res.status(500).json({ message: 'Failed to generate summary from Gemini API' }); }
};

const updateProfile = async (req, res) => {
    try {
        const { id } = req.user; // Get user from authMiddleware
        const { name } = req.body;
        const dataToUpdate = {};

        if (name) {
            dataToUpdate.name = name;
        }

        if (req.file) {
            dataToUpdate.profileImage = req.file.filename;
        }

        if (Object.keys(dataToUpdate).length === 0) {
             // If user only opens and saves without changes, just return the current user
            const { password, ...userToReturn } = req.user;
            return res.json(userToReturn);
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: dataToUpdate,
        });

        const { password, ...userToReturn } = updatedUser;
        res.json(userToReturn);

    } catch (error) {
        console.error("Profile update error:", error);
        res.status(500).json({ message: 'Failed to update profile.' });
    }
};


module.exports = {
    getRealtimeEvents, getDashboardStats, getChartData, getLeads, getLeadDetails,
    updateLead, addLeadNote, uploadLeadDocument, exportLeads, getVendors, createVendor,
    getSettings, saveSettings, updateFormSchema, generateLeadSummary,
    performBulkLeadAction,
    updateProfile,
    importLeads,
    deleteLead,
    getMasterAdmins,
    createMasterAdmin,
    requestUserDeletionOtp,
    deleteUserWithOtp,
};