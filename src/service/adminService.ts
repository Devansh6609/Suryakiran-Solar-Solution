// A centralized service for all CRM Admin API interactions.
import { User } from "../types";

const API_BASE_URL =
  import.meta.env.VITE_CRM_API_URL || "http://localhost:3001";

const getAuthHeaders = () => {
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
    const errorData = await response
      .json()
      .catch(() => ({ message: "An unknown API error occurred." }));
    throw new Error(errorData.message || "API request failed.");
  }
  return response.json();
};

// Dashboard
async function getDashboardStats(
  filters: { vendorId?: string; startDate?: string; endDate?: string } = {}
) {
  const params = new URLSearchParams(
    Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value && value !== "all")
    )
  ).toString();
  const response = await fetch(
    `${API_BASE_URL}/api/admin/dashboard/stats?${params}`,
    { headers: getAuthHeaders() }
  );
  return handleResponse(response);
}

async function getChartData(
  filters: {
    vendorId?: string;
    startDate?: string;
    endDate?: string;
    groupBy?: string;
  } = {}
) {
  const params = new URLSearchParams(
    Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value && value !== "all")
    )
  ).toString();
  const response = await fetch(
    `${API_BASE_URL}/api/admin/dashboard/charts?${params}`,
    { headers: getAuthHeaders() }
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

async function updateLead(leadId: string, updateData: Record<string, any>) {
  const response = await fetch(`${API_BASE_URL}/api/admin/leads/${leadId}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(updateData),
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
    }
  );
  return handleResponse(response);
}

async function generateLeadSummary(leadId: string) {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/leads/${leadId}/generate-summary`,
    {
      method: "POST",
      headers: getAuthHeaders(),
    }
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
    }
  );
  return handleResponse(response);
}

async function performBulkLeadAction(
  action: "changeStage" | "assignVendor",
  value: string,
  leadIds: string[]
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
  userIdToDelete: string
): Promise<{ message: string }> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/users/request-deletion-otp`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ userIdToDelete }),
    }
  );
  return handleResponse(response);
}

async function deleteUserWithOtp(
  userIdToDelete: string,
  otp: string
): Promise<{ message: string }> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/users/confirm-deletion`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ userIdToDelete, otp }),
    }
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
    `${API_BASE_URL}/api/locations/districts/${state}`
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
  performBulkLeadAction,
  importLeads,
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
};
