import { Hono } from 'hono';
import * as adminController from '../controllers/admin.controller.js';
import * as productController from '../controllers/product.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import masterOnlyMiddleware from '../middlewares/masterOnly.middleware.js';

import * as quotationController from '../controllers/quotation.controller.js';
import * as lifecycleController from '../controllers/lifecycle.controller.js';
import * as surveyController from '../controllers/survey.controller.js';
import * as inventoryController from '../controllers/inventory.controller.js';
import * as financeController from '../controllers/finance.controller.js';

const admin = new Hono();

admin.use('*', authMiddleware);

// Inventory Management
admin.get('/inventory/overview', inventoryController.getInventoryOverview);
admin.post('/inventory/products', inventoryController.createOrUpdateProduct);
admin.patch('/inventory/products/:id/stock', inventoryController.quickUpdateStock);
admin.delete('/inventory/products/:id', inventoryController.deleteProduct);
admin.get('/inventory/purchase-orders', inventoryController.getPurchaseOrders);
admin.post('/inventory/purchase-orders', inventoryController.createPurchaseOrder);
admin.post('/inventory/reserve', inventoryController.reserveProjectStock);
admin.post('/inventory/dispatch', inventoryController.generateDispatchChallan);
admin.get('/inventory/analytics', inventoryController.getInventoryAnalytics);
admin.get('/inventory/panel-serials', inventoryController.getPanelSerials);
admin.post('/inventory/panel-serials', inventoryController.addPanelSerial);
admin.delete('/inventory/panel-serials/:id', inventoryController.deletePanelSerial);
admin.post('/inventory/grn/:poId', inventoryController.confirmGRN);

// Project Finance (per-lead)
admin.get('/finance/dashboard-summary', financeController.getFinanceDashboardSummary);
admin.get('/finance/:leadId', financeController.getProjectFinance);
admin.patch('/finance/:leadId', financeController.updateProjectFinance);
admin.post('/finance/:leadId/expenses', financeController.addProjectExpense);
admin.delete('/finance/expenses/:id', financeController.deleteProjectExpense);

// Surveys
admin.get('/surveys', surveyController.getSurveys);
admin.post('/surveys', surveyController.createSurvey);
admin.get('/surveys/:id', surveyController.getSurveyById);
admin.post('/surveys/:id/assign', surveyController.assignSurvey);
admin.post('/surveys/:id/section', surveyController.updateSurveySection);
admin.post('/surveys/:id/review', surveyController.reviewSurvey);

// Lifecycle & Stage Verification
admin.get('/leads/:id/lifecycle', lifecycleController.getLeadLifecycle);
admin.post('/leads/:id/stage-verify', lifecycleController.verifyLeadStage);
admin.post('/leads/:id/stage-override', masterOnlyMiddleware, lifecycleController.overrideLeadStage);

// Quotations
admin.get('/quotations', quotationController.getQuotations);
admin.get('/quotations/:id', quotationController.getQuotationById);
admin.post('/quotations', quotationController.saveQuotation);
admin.patch('/quotations/:id/status', quotationController.updateQuotationStatus);
admin.delete('/quotations/:id', quotationController.deleteQuotation);

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