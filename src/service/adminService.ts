// A centralized service for all CRM Admin API interactions.
import { User } from "../types";

const API_BASE_URL =
  import.meta.env.VITE_CRM_API_URL || "http://localhost:3001";

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    // Handle case where token is missing. Maybe redirect to login.
    // For now, this will cause API calls to fail gracefully with a 401.
    return { "Content-Type": "application/json" };
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const handleResponse = async (response: Response) => {
  if (response.status === 401) {
    // Token is invalid or expired, log the user out
    localStorage.clear();
    window.location.href = "/#/login"; // Use hash for HashRouter
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) {
    let errorMessage = "An unknown API error occurred.";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      // Fallback for non-JSON errors (like 403 from middleware with no body)
      if (response.status === 403) {
        errorMessage =
          "Access Denied: You do not have permission to perform this action.";
      } else if (response.status === 404) {
        errorMessage = "Resource not found.";
      } else if (response.status === 500) {
        errorMessage = "Internal Server Error. Please try again later.";
      } else {
        errorMessage = `API Error (${response.status}): ${response.statusText}`;
      }
    }
    throw new Error(errorMessage);
  }
  return response.json();
};

// Dashboard
async function getDashboardStats(
  filters: { vendorId?: string; startDate?: string; endDate?: string } = {},
) {
  const params = new URLSearchParams(
    Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value && value !== "all"),
    ),
  ).toString();
  const response = await fetch(
    `${API_BASE_URL}/api/admin/dashboard/stats?${params}`,
    { headers: getAuthHeaders() },
  );
  return handleResponse(response);
}

async function getChartData(
  filters: {
    vendorId?: string;
    startDate?: string;
    endDate?: string;
    groupBy?: string;
  } = {},
) {
  const params = new URLSearchParams(
    Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value && value !== "all"),
    ),
  ).toString();
  const response = await fetch(
    `${API_BASE_URL}/api/admin/dashboard/charts?${params}`,
    { headers: getAuthHeaders() },
  );
  return handleResponse(response);
}

// Leads
async function getLeads(filters: Record<string, any> = {}) {
  const params = new URLSearchParams(filters).toString();
  const response = await fetch(`${API_BASE_URL}/api/admin/leads?${params}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

async function getLeadDetails(leadId: string) {
  const response = await fetch(`${API_BASE_URL}/api/admin/leads/${leadId}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

async function updateLead(
  leadId: string,
  updateData: Record<string, any> | FormData,
) {
  const isFormData = updateData instanceof FormData;
  const headers = isFormData
    ? { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
    : getAuthHeaders();

  const response = await fetch(`${API_BASE_URL}/api/admin/leads/${leadId}`, {
    method: "PATCH",
    headers: headers,
    body: isFormData ? updateData : JSON.stringify(updateData),
  });
  return handleResponse(response);
}

async function deleteLead(leadId: string) {
  const response = await fetch(`${API_BASE_URL}/api/admin/leads/${leadId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

async function addLeadNote(leadId: string, note: string) {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/leads/${leadId}/notes`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ note }),
    },
  );
  return handleResponse(response);
}

async function generateLeadSummary(leadId: string) {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/leads/${leadId}/generate-summary`,
    {
      method: "POST",
      headers: getAuthHeaders(),
    },
  );
  return handleResponse(response);
}

async function uploadDocument(leadId: string, file: File) {
  const formData = new FormData();
  formData.append("document", file);
  const token = localStorage.getItem("authToken");

  const response = await fetch(
    `${API_BASE_URL}/api/admin/leads/${leadId}/documents`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }, // No Content-Type for FormData
      body: formData,
    },
  );
  return handleResponse(response);
}

async function deleteDocument(leadId: string, docId: string) {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/leads/${leadId}/documents/${docId}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    },
  );
  return handleResponse(response);
}

async function performBulkLeadAction(
  action: "changeStage" | "assignVendor",
  value: string,
  leadIds: string[],
) {
  const response = await fetch(`${API_BASE_URL}/api/admin/leads/bulk-action`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ action, value, leadIds }),
  });
  return handleResponse(response);
}

async function importLeads(formData: FormData) {
  const token = localStorage.getItem("authToken");
  const response = await fetch(`${API_BASE_URL}/api/admin/leads/import`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return handleResponse(response);
}

async function createManualLead(formData: FormData) {
  const token = localStorage.getItem("authToken");
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}/api/admin/leads/manual`, {
    method: "POST",
    headers: headers, // No Content-Type for FormData
    body: formData,
  });
  return handleResponse(response);
}

// Vendor Management
async function getVendors() {
  const response = await fetch(`${API_BASE_URL}/api/admin/vendors`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

async function createVendor(vendorData: any) {
  const response = await fetch(`${API_BASE_URL}/api/admin/vendors`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(vendorData),
  });
  return handleResponse(response);
}

// Admin Management
async function getMasterAdmins(): Promise<User[]> {
  const response = await fetch(`${API_BASE_URL}/api/admin/admins`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

async function createMasterAdmin(adminData: any): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/api/admin/admins`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(adminData),
  });
  return handleResponse(response);
}

// --- User Deletion ---
async function requestUserDeletionOtp(
  userIdToDelete: string,
): Promise<{ message: string }> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/users/request-deletion-otp`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ userIdToDelete }),
    },
  );
  return handleResponse(response);
}

async function deleteUserWithOtp(
  userIdToDelete: string,
  otp: string,
): Promise<{ message: string }> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/users/confirm-deletion`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ userIdToDelete, otp }),
    },
  );
  return handleResponse(response);
}

// Profile
async function updateProfile(updateData: {
  name?: string;
  profileImage?: File;
}): Promise<User> {
  const formData = new FormData();
  if (updateData.name) {
    formData.append("name", updateData.name);
  }
  if (updateData.profileImage) {
    formData.append("profileImage", updateData.profileImage);
  }

  const token = localStorage.getItem("authToken");
  const response = await fetch(`${API_BASE_URL}/api/admin/profile`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      // No 'Content-Type', browser sets it for FormData
    },
    body: formData,
  });
  return handleResponse(response);
}

// Location Data
async function getStates() {
  const response = await fetch(`${API_BASE_URL}/api/locations/states`);
  // This is a public route, so no auth needed
  if (!response.ok) throw new Error("Failed to load states");
  return response.json();
}
async function getDistricts(state: string) {
  const response = await fetch(
    `${API_BASE_URL}/api/locations/districts/${state}`,
  );
  if (!response.ok) throw new Error("Failed to load districts");
  return response.json();
}

// Form Builder (publicly accessible schema)
async function getFormSchema(formType: string) {
  const response = await fetch(`${API_BASE_URL}/api/forms/${formType}`);
  if (!response.ok) throw new Error("Failed to load form schema");
  return response.json();
}

async function updateFormSchema(formType: string, schema: any) {
  const response = await fetch(`${API_BASE_URL}/api/admin/forms/${formType}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(schema),
  });
  return handleResponse(response);
}

// Data Explorer
async function getAllLeadsData() {
  const response = await fetch(`${API_BASE_URL}/api/admin/leads`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

// Settings
async function getSettings() {
  const response = await fetch(`${API_BASE_URL}/api/admin/settings`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

async function updateSettings(apiKey: string) {
  const response = await fetch(`${API_BASE_URL}/api/admin/settings`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ apiKey }),
  });
  return handleResponse(response);
}

// Products Catalog
async function getProducts() {
  const response = await fetch(`${API_BASE_URL}/api/admin/products`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

async function createProduct(formData: FormData) {
  const token = localStorage.getItem("authToken");
  const response = await fetch(`${API_BASE_URL}/api/admin/products`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return handleResponse(response);
}

async function updateProduct(id: string, formData: FormData) {
  const token = localStorage.getItem("authToken");
  const response = await fetch(`${API_BASE_URL}/api/admin/products/${id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return handleResponse(response);
}

async function deleteInventoryProduct(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/admin/products/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

// === RESTORED METHODS START ===

// INVENTORY
async function getInventoryOverview(params?: { category?: string; search?: string }) {
  const query = new URLSearchParams(params as any).toString();
  const response = await fetch(`${API_BASE_URL}/api/admin/inventory/overview?${query}`, { headers: getAuthHeaders() });
  return handleResponse(response);
}

async function quickUpdateStock(id: string, data: { currentStock?: number; unitPrice?: number }) {
  const response = await fetch(`${API_BASE_URL}/api/admin/inventory/products/${id}/stock`, {
    method: "PATCH", headers: getAuthHeaders(), body: JSON.stringify(data)
  });
  return handleResponse(response);
}

async function getPurchaseOrders() {
  const response = await fetch(`${API_BASE_URL}/api/admin/inventory/purchase-orders`, { headers: getAuthHeaders() });
  return handleResponse(response);
}

async function createPurchaseOrder(data: Record<string, any>) {
  const response = await fetch(`${API_BASE_URL}/api/admin/inventory/purchase-orders`, { method: "POST", headers: getAuthHeaders(), body: JSON.stringify(data) });
  return handleResponse(response);
}

async function confirmGRN(poId: string, data: Record<string, any>) {
  const response = await fetch(`${API_BASE_URL}/api/admin/inventory/grn/${poId}`, { method: "POST", headers: getAuthHeaders(), body: JSON.stringify(data) });
  return handleResponse(response);
}

async function getInventoryAnalytics() {
  const response = await fetch(`${API_BASE_URL}/api/admin/inventory/analytics`, { headers: getAuthHeaders() });
  return handleResponse(response);
}

async function getPanelSerials() {
  const response = await fetch(`${API_BASE_URL}/api/admin/inventory/panel-serials`, { headers: getAuthHeaders() });
  return handleResponse(response);
}

async function addPanelSerial(data: Record<string, any>) {
  const response = await fetch(`${API_BASE_URL}/api/admin/inventory/panel-serials`, { method: "POST", headers: getAuthHeaders(), body: JSON.stringify(data) });
  return handleResponse(response);
}

async function deletePanelSerial(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/admin/inventory/panel-serials/${id}`, { method: "DELETE", headers: getAuthHeaders() });
  return handleResponse(response);
}

async function generateDispatchChallan(data: Record<string, any>) {
  const response = await fetch(`${API_BASE_URL}/api/admin/inventory/dispatch`, { method: "POST", headers: getAuthHeaders(), body: JSON.stringify(data) });
  return handleResponse(response);
}

async function createOrUpdateProduct(data: Record<string, any>) {
  const response = await fetch(`${API_BASE_URL}/api/admin/inventory/products`, { method: "POST", headers: getAuthHeaders(), body: JSON.stringify(data) });
  return handleResponse(response);
}

// FINANCE
async function getFinanceDashboardSummary(filters: { vendorId?: string; startDate?: string; endDate?: string } = {}) {
  const params = new URLSearchParams(
    Object.fromEntries(Object.entries(filters).filter(([, value]) => value && value !== "all"))
  ).toString();
  const response = await fetch(`${API_BASE_URL}/api/admin/finance/dashboard-summary?${params}`, { headers: getAuthHeaders() });
  return handleResponse(response);
}

async function getProjectFinance(leadId: string) {
  const response = await fetch(`${API_BASE_URL}/api/admin/finance/${leadId}`, { headers: getAuthHeaders() });
  return handleResponse(response);
}

async function addProjectExpense(leadId: string, data: Record<string, any>) {
  const response = await fetch(`${API_BASE_URL}/api/admin/finance/${leadId}/expenses`, { method: "POST", headers: getAuthHeaders(), body: JSON.stringify(data) });
  return handleResponse(response);
}

async function updateProjectFinance(leadId: string, data: Record<string, any>) {
  const response = await fetch(`${API_BASE_URL}/api/admin/finance/${leadId}`, { method: "PATCH", headers: getAuthHeaders(), body: JSON.stringify(data) });
  return handleResponse(response);
}

async function deleteProjectExpense(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/admin/finance/expenses/${id}`, { method: "DELETE", headers: getAuthHeaders() });
  return handleResponse(response);
}

// SURVEYS
async function getSurveys(params: any) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE_URL}/api/admin/surveys?${query}`, { headers: getAuthHeaders() });
  return handleResponse(response);
}

async function getSurveyById(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/admin/surveys/${id}`, { headers: getAuthHeaders() });
  return handleResponse(response);
}

async function assignSurvey(id: string, payload: any) {
  const response = await fetch(`${API_BASE_URL}/api/admin/surveys/${id}/assign`, { method: "POST", headers: getAuthHeaders(), body: JSON.stringify(payload) });
  return handleResponse(response);
}

async function updateSurveySection(id: string, payload: any) {
  const response = await fetch(`${API_BASE_URL}/api/admin/surveys/${id}/section`, { method: "POST", headers: getAuthHeaders(), body: JSON.stringify(payload) });
  return handleResponse(response);
}

async function updateSurveyStatus(id: string, payload: any) {
  const response = await fetch(`${API_BASE_URL}/api/admin/surveys/${id}`, { method: "PATCH", headers: getAuthHeaders(), body: JSON.stringify(payload) });
  return handleResponse(response);
}

async function reviewSurvey(id: string, payload: any) {
  const response = await fetch(`${API_BASE_URL}/api/admin/surveys/${id}/review`, { method: "POST", headers: getAuthHeaders(), body: JSON.stringify(payload) });
  return handleResponse(response);
}

// LIFECYCLE
async function getLeadLifecycle(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/admin/leads/${id}/lifecycle`, { headers: getAuthHeaders() });
  return handleResponse(response);
}

async function verifyLeadStage(id: string, payload: any) {
  const response = await fetch(`${API_BASE_URL}/api/admin/leads/${id}/stage-verify`, { method: "POST", headers: getAuthHeaders(), body: JSON.stringify(payload) });
  return handleResponse(response);
}

async function overrideLeadStage(id: string, targetStage: string, overrideReason: string) {
  const response = await fetch(`${API_BASE_URL}/api/admin/leads/${id}/stage-override`, { method: "POST", headers: getAuthHeaders(), body: JSON.stringify({ targetStage, overrideReason }) });
  return handleResponse(response);
}

// QUOTATIONS
async function getQuotations(params: any) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE_URL}/api/admin/quotations?${query}`, { headers: getAuthHeaders() });
  return handleResponse(response);
}

async function getQuotationById(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/admin/quotations/${id}`, { headers: getAuthHeaders() });
  return handleResponse(response);
}

async function saveQuotation(payload: any) {
  const response = await fetch(`${API_BASE_URL}/api/admin/quotations`, { method: "POST", headers: getAuthHeaders(), body: JSON.stringify(payload) });
  return handleResponse(response);
}

async function updateQuotationStatus(id: string, payload: any) {
  const response = await fetch(`${API_BASE_URL}/api/admin/quotations/${id}/status`, { method: "PATCH", headers: getAuthHeaders(), body: JSON.stringify(payload) });
  return handleResponse(response);
}

async function deleteQuotation(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/admin/quotations/${id}`, { method: "DELETE", headers: getAuthHeaders() });
  return handleResponse(response);
}

// === RESTORED METHODS END ===

export {
  getDashboardStats,
  getChartData,
  getLeads,
  getLeadDetails,
  updateLead,
  deleteLead,
  addLeadNote,
  generateLeadSummary,
  uploadDocument,
  deleteDocument,
  performBulkLeadAction,
  importLeads,
  createManualLead,
  getVendors,
  createVendor,
  getMasterAdmins,
  createMasterAdmin,
  requestUserDeletionOtp,
  deleteUserWithOtp,
  updateProfile,
  getStates,
  getDistricts,
  getFormSchema,
  updateFormSchema,
  getAllLeadsData,
  getSettings,
  updateSettings,
  getProducts,
  createProduct,
  updateProduct,
  
  // Appended Exports
  getInventoryOverview,
  quickUpdateStock,
  getPurchaseOrders,
  createPurchaseOrder,
  confirmGRN,
  getInventoryAnalytics,
  getPanelSerials,
  addPanelSerial,
  deletePanelSerial,
  generateDispatchChallan,
  createOrUpdateProduct,
  deleteInventoryProduct,
  getProjectFinance,
  getFinanceDashboardSummary,
  addProjectExpense,
  updateProjectFinance,
  deleteProjectExpense,
  getSurveys,
  getSurveyById,
  assignSurvey,
  updateSurveySection,
  updateSurveyStatus,
  reviewSurvey,
  getLeadLifecycle,
  verifyLeadStage,
  overrideLeadStage,
  getQuotations,
  getQuotationById,
  saveQuotation,
  updateQuotationStatus,
  deleteQuotation,
};

