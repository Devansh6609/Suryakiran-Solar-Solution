
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const publicController = require('../controllers/public.controller');

const router = express.Router();

// --- Multer Setup for public lead forms ---
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

// --- Public Routes ---
router.get('/locations/states', publicController.getStates);
router.get('/locations/districts/:state', publicController.getDistricts);
router.get('/forms/:formType', publicController.getFormSchema);

router.post('/leads', publicController.createLead);
router.post('/leads/:leadId/send-otp', publicController.sendOtp);
router.post('/leads/:leadId/verify-otp', publicController.verifyOtp);

// This handles the initial file upload during the multi-step form process.
router.post('/leads/:leadId/application', upload.any(), publicController.handleApplicationFileUpload);

module.exports = router;
