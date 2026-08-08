import { calculateScore, getScoreStatus } from '../utils/leadScoring.js';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the complete Indian states and districts JSON
const locationsFilePath = path.join(__dirname, '../../data/india_locations.json');
let indiaLocations = { states: [] };
try {
    indiaLocations = JSON.parse(fs.readFileSync(locationsFilePath, 'utf-8'));
} catch (e) {
    console.error("Failed to load india_locations.json", e);
}

export const getStates = async (c) => {
    try {
        const stateNames = indiaLocations.states.map(s => s.state);
        return c.json(stateNames);
    } catch (e) { return c.json({ message: 'Error fetching states' }, 500); }
};

export const getDistricts = async (c) => {
    const stateName = decodeURIComponent(c.req.param('state'));
    try {
        const stateObj = indiaLocations.states.find(s => s.state === stateName);
        const districts = stateObj ? stateObj.districts : [];
        return c.json(districts);
    } catch (e) { return c.json({ message: 'Error fetching districts' }, 500); }
};

export const createPublicLead = async (c) => {
    try {
        const prisma = c.get('prisma');
        const body = await c.req.json();
        const { 
            name, email, phone, productType, 
            fatherName, district, tehsil, village, 
            hp, connectionType, 
            customFields 
        } = body;
        
        const score = calculateScore({ productType, phone });
        const lead = await prisma.lead.create({
            data: {
                name, email, phone, productType,
                fatherName, district, tehsil, village,
                hp, connectionType,
                customFields: customFields ? (typeof customFields === 'string' ? customFields : JSON.stringify(customFields)) : '{}',
                score,
                scoreStatus: getScoreStatus(score),
                source: 'Public_Website',
                otpVerified: true // OTP skipped as requested
            }
        });
        return c.json(lead, 201);
    } catch (e) { 
        console.error("Create Public Lead Error:", e);
        return c.json({ message: 'Error creating lead' }, 500); 
    }
};

export const sendOtp = async (c) => {
    try {
        const leadId = c.req.param('id');
        console.log(`Sending mock OTP for lead: ${leadId}`);
        // In a real app, integrate with SMS/Email service here
        return c.json({ success: true, message: 'OTP sent successfully (Mock)' });
    } catch (e) {
        return c.json({ message: 'Error sending OTP' }, 500);
    }
};

export const verifyLeadOtp = async (c) => {
    try {
        const prisma = c.get('prisma');
        const { leadId, otp } = await c.req.json();
        if (otp === '123456') { // Mock verification
            await prisma.lead.update({ where: { id: leadId }, data: { otpVerified: true } });
            return c.json({ success: true });
        } else {
            return c.json({ message: 'Invalid OTP' }, 400);
        }
    } catch (e) { return c.json({ message: 'Error verifying OTP' }, 500); }
};

export const getFormSchema = async (c) => {
    try {
        const prisma = c.get('prisma');
        const formType = c.req.param('formType');
        
        const setting = await prisma.setting.findUnique({
            where: { key: `form_${formType}` }
        });
        
        if (setting) {
            return c.json(JSON.parse(setting.value));
        } else {
            return c.json([]);
        }
    } catch (e) {
        console.error("Error fetching form schema:", e);
        return c.json({ message: 'Error fetching form schema' }, 500);
    }
};