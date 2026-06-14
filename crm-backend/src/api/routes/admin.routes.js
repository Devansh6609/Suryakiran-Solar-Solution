import { Hono } from 'hono';
import * as adminController from '../controllers/admin.controller.js';
import * as productController from '../controllers/product.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import masterOnlyMiddleware from '../middlewares/masterOnly.middleware.js';

const admin = new Hono();

admin.use('*', authMiddleware);

// Dashboard
admin.get('/dashboard/stats', adminController.getDashboardStats);
admin.get('/dashboard/charts', adminController.getChartData);
admin.get('/dashboard/chart', adminController.getChartData); // legacy alias

// Leads
admin.get('/leads', adminController.getLeads);
admin.get('/leads/:id', adminController.getLeadDetails);
admin.patch('/leads/:id', adminController.updateLead);
admin.post('/leads/:id/notes', adminController.addLeadNote);
admin.post('/leads/:id/documents', adminController.uploadLeadDocument);
admin.post('/leads/:id/generate-summary', adminController.generateLeadSummary);
admin.delete('/leads/:id/documents/:docId', adminController.deleteLeadDocument);
admin.delete('/leads/:id', adminController.deleteLead);
admin.post('/leads/bulk-action', adminController.performBulkLeadAction);
admin.post('/leads/import', adminController.importLeads);
admin.post('/leads/manual', adminController.createManualLead);

// Vendors
admin.get('/vendors', adminController.getVendors);
admin.post('/vendors', masterOnlyMiddleware, adminController.createVendor);

// Admin management (frontend uses /admins)
admin.get('/admins', masterOnlyMiddleware, adminController.getMasterAdmins);
admin.post('/admins', masterOnlyMiddleware, adminController.createMasterAdmin);
admin.get('/master-admins', masterOnlyMiddleware, adminController.getMasterAdmins);
admin.post('/master-admins', masterOnlyMiddleware, adminController.createMasterAdmin);

// User deletion (frontend uses /users/*)
admin.post('/users/request-deletion-otp', masterOnlyMiddleware, adminController.requestUserDeletionOtp);
admin.post('/users/confirm-deletion', masterOnlyMiddleware, adminController.deleteUserWithOtp);
admin.post('/request-user-deletion', masterOnlyMiddleware, adminController.requestUserDeletionOtp);
admin.delete('/delete-user-with-otp', masterOnlyMiddleware, adminController.deleteUserWithOtp);

// Profile
admin.patch('/profile', adminController.updateProfile);

// Settings
admin.get('/settings', adminController.getSettings);
admin.post('/settings', adminController.updateSettings);

// Form Builder
admin.put('/forms/:formType', adminController.updateFormSchema);

// Products Catalog
admin.get('/products', productController.getProducts);
admin.post('/products', productController.createProduct);
admin.patch('/products/:id', productController.updateProduct);
admin.delete('/products/:id', productController.deleteProduct);

// Events (SSE stub — Cloudflare Workers don't support long-polling well)
admin.get('/events', adminController.getEvents);

export default admin;