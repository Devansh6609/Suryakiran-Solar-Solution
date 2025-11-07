
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const masterOnlyMiddleware = require('../middlewares/masterOnly.middleware');

const router = express.Router();

// --- Multer Setup for admin document uploads ---
const uploadsDir = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, uploadsDir); },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}-${file.originalname.replace(/\s/g, '_')}`);
    }
});
const upload = multer({ storage: fileStorage });


// Protect all admin routes
router.use(authMiddleware);

// --- SSE for real-time updates ---
router.get('/events', adminController.getRealtimeEvents);

// --- Dashboard ---
router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/dashboard/charts', adminController.getChartData);

// --- Leads ---
router.get('/leads', adminController.getLeads);
router.get('/leads/export', adminController.exportLeads);
router.post('/leads/import', masterOnlyMiddleware, upload.single('leadsCsv'), adminController.importLeads);
router.get('/leads/:id', adminController.getLeadDetails);
router.patch('/leads/:id', adminController.updateLead);
router.post('/leads/:id/notes', adminController.addLeadNote);
router.post('/leads/:id/documents', upload.single('document'), adminController.uploadLeadDocument);
// FIX: Add route for bulk lead actions.
router.post('/leads/bulk-action', adminController.performBulkLeadAction);

// --- Vendor Management (Master Only) ---
router.get('/vendors', masterOnlyMiddleware, adminController.getVendors);
router.post('/vendors', masterOnlyMiddleware, adminController.createVendor);

// --- User Profile ---
router.patch('/profile', upload.single('profileImage'), adminController.updateProfile);

// --- Form Builder & Settings (Master Only) ---
router.put('/forms/:formType', masterOnlyMiddleware, adminController.updateFormSchema);
router.get('/settings', masterOnlyMiddleware, adminController.getSettings);
router.post('/settings', masterOnlyMiddleware, adminController.saveSettings);
router.post('/leads/:id/generate-summary', masterOnlyMiddleware, adminController.generateLeadSummary);


module.exports = router;