// A centralized service for all CRM API interactions.

const API_BASE_URL =
  import.meta.env.VITE_CRM_API_URL || "http://localhost:3001";

/**
 * Fetches the dynamic form schema for a given calculator type.
 * @param formType - 'rooftop' or 'pump'.
 * @returns The form schema array.
 */
export const getFormSchema = async (formType: string) => {
  const response = await fetch(`${API_BASE_URL}/api/forms/${formType}`);
  if (!response.ok) throw new Error("Failed to fetch form schema.");
  return response.json();
};

/**
 * Creates a new lead in the CRM.
 * @param leadData - The initial data collected from the form.
 * @returns The newly created lead object, including its ID.
 */
export const createLead = async (leadData: Record<string, any>) => {
  const response = await fetch(`${API_BASE_URL}/api/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(leadData),
  });
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "Failed to create lead." }));
    throw new Error(errorData.message || "Failed to create lead.");
  }
  return response.json();
};

/**
 * Updates an existing lead and triggers the OTP process.
 * @param leadId - The ID of the lead to update.
 * @param contactData - The contact information (name, email, phone).
 */
export const sendOtp = async (
  leadId: string,
  contactData: Record<string, string>
) => {
  const response = await fetch(`${API_BASE_URL}/api/leads/${leadId}/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(contactData),
  });
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "Failed to send OTP." }));
    throw new Error(errorData.message || "Failed to send OTP.");
  }
  return response.json();
};

/**
 * Verifies the OTP for a lead.
 * @param leadId - The ID of the lead.
 * @param otp - The OTP entered by the user.
 * @returns The final calculated results from the backend.
 */
export const verifyOtp = async (leadId: string, otp: string) => {
  const response = await fetch(
    `${API_BASE_URL}/api/leads/${leadId}/verify-otp`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otp }),
    }
  );
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Invalid OTP.");
  }
  return response.json();
};

/**
 * Uploads a file associated with a lead to the application endpoint.
 * @param leadId The ID of the lead.
 * @param fieldName The name of the form field for the file.
 * @param file The file object to upload.
 * @returns The updated lead object.
 */
export const uploadLeadFile = async (
  leadId: string,
  fieldName: string,
  file: File
) => {
  const formData = new FormData();
  formData.append(fieldName, file);

  const response = await fetch(
    `${API_BASE_URL}/api/leads/${leadId}/application`,
    {
      method: "POST",
      body: formData, // Browser handles Content-Type for FormData
    }
  );
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: `Failed to upload ${file.name}.` }));
    throw new Error(errorData.message || `Failed to upload ${file.name}.`);
  }
  return response.json();
};
