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
export const getDashboardStats = async (
  filters: { vendorId?: string; startDate?: string; endDate?: string } = {}
) => {
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
};

export const getChartData = async (
  filters: {
    vendorId?: string;
    startDate?: string;
    endDate?: string;
    groupBy?: string;
  } = {}
) => {
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
};

// Leads
export const getLeads = async (filters: Record<string, any> = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await fetch(`${API_BASE_URL}/api/admin/leads?${params}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const getLeadDetails = async (leadId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/admin/leads/${leadId}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const updateLead = async (
  leadId: string,
  updateData: Record<string, any>
) => {
  const response = await fetch(`${API_BASE_URL}/api/admin/leads/${leadId}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(updateData),
  });
  return handleResponse(response);
};

export const deleteLead = async (leadId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/admin/leads/${leadId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const addLeadNote = async (leadId: string, note: string) => {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/leads/${leadId}/notes`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ note }),
    }
  );
  return handleResponse(response);
};

export const generateLeadSummary = async (leadId: string) => {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/leads/${leadId}/generate-summary`,
    {
      method: "POST",
      headers: getAuthHeaders(),
    }
  );
  return handleResponse(response);
};

export const uploadDocument = async (leadId: string, file: File) => {
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
};

// FIX: Add the missing 'performBulkLeadAction' function.
export const performBulkLeadAction = async (
  action: "changeStage" | "assignVendor",
  value: string,
  leadIds: string[]
) => {
  const response = await fetch(`${API_BASE_URL}/api/admin/leads/bulk-action`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ action, value, leadIds }),
  });
  return handleResponse(response);
};

export const importLeads = async (formData: FormData) => {
  const token = localStorage.getItem("authToken");
  const response = await fetch(`${API_BASE_URL}/api/admin/leads/import`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return handleResponse(response);
};

// Vendor Management
export const getVendors = async () => {
  const response = await fetch(`${API_BASE_URL}/api/admin/vendors`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const createVendor = async (vendorData: any) => {
  const response = await fetch(`${API_BASE_URL}/api/admin/vendors`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(vendorData),
  });
  return handleResponse(response);
};

// Profile
export const updateProfile = async (updateData: {
  name?: string;
  profileImage?: File;
}): Promise<User> => {
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
};

// Location Data
export const getStates = async () => {
  const response = await fetch(`${API_BASE_URL}/api/locations/states`);
  // This is a public route, so no auth needed
  if (!response.ok) throw new Error("Failed to load states");
  return response.json();
};
export const getDistricts = async (state: string) => {
  const response = await fetch(
    `${API_BASE_URL}/api/locations/districts/${state}`
  );
  if (!response.ok) throw new Error("Failed to load districts");
  return response.json();
};

// Form Builder (publicly accessible schema)
export const getFormSchema = async (formType: string) => {
  const response = await fetch(`${API_BASE_URL}/api/forms/${formType}`);
  if (!response.ok) throw new Error("Failed to load form schema");
  return response.json();
};

export const updateFormSchema = async (formType: string, schema: any) => {
  const response = await fetch(`${API_BASE_URL}/api/forms/${formType}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(schema),
  });
  return handleResponse(response);
};

// Data Explorer
export const getAllLeadsData = async () => {
  const response = await fetch(`${API_BASE_URL}/api/admin/leads`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// Settings
export const getSettings = async () => {
  const response = await fetch(`${API_BASE_URL}/api/admin/settings`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const updateSettings = async (apiKey: string) => {
  const response = await fetch(`${API_BASE_URL}/api/admin/settings`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ apiKey }),
  });
  return handleResponse(response);
};
