export enum CalculatorType {
  Rooftop = "rooftop",
  Pump = "pump",
}

export enum StorySegment {
  Residential = "Residential",
  Commercial = "Commercial",
  Agricultural = "Agricultural",
}

export interface Testimonial {
  quote: string;
  name: string;
  segment: StorySegment;
  image: string;
}

export interface SuccessStory {
  id: number;
  title: string;
  segment: StorySegment;
  image: string;
  customerQuote: string;
  roiData: { label: string; value: string }[];
}

// --- CRM Types ---

export interface User {
  id: string;
  email: string;
  name: string;
  role: "Master" | "Vendor";
  country?: string;
  state?: string;
  district?: string;
  profileImage?: string;
}

export enum PipelineStage {
  NewLead        = "New_Lead",
  Survey         = "Survey",
  QuotationSent  = "Quotation_Sent",
  CustomerApproved = "Customer_Approved",
  MaterialDispatched = "Material_Dispatched",
  Installation   = "Installation",
  Completed      = "Completed",
  Lost           = "Lost",
}


export interface StageVerificationRecord {
  id: string;
  leadId: string;
  stage: string;
  status: "Completed" | "Pending_Verification" | "Rejected";
  verifiedBy?: string;
  assignedTo?: string;
  remarks?: string;
  evidenceData: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialCheckItem {
  id?: string;
  componentName: string;
  requiredQty: string;
  receivedQty: string;
  condition: "Good" | "Damaged" | "Missing";
  photoUrl?: string;
  notes?: string;
}

export enum LeadScoreStatus {
  Hot = "Hot",
  Warm = "Warm",
  Cold = "Cold",
}

export interface LeadDocument {
  id: string;
  filename: string;
  uploadedAt: string;
}

export interface LeadActivity {
  timestamp: string;
  action: string;
  user?: string; // User who performed the action
  notes?: string;
}

export interface Lead {
  id: string;
  createdAt: string;
  productType: CalculatorType | "Contact Inquiry";
  name: string;
  phone: string;
  email: string;

  customFields: Record<string, any>;

  otpVerified: boolean;
  score: number;
  scoreStatus: LeadScoreStatus;
  pipelineStage: PipelineStage;

  documents: LeadDocument[];
  activityLog: LeadActivity[];
  notes?: LeadActivity[];

  assignedVendorId: string | null;
  assignedVendorName?: string;
  assignedTo?: { name: string; email: string };
  surveys?: any[];

  // Manual Workflow Fields
  source?: string;
  fatherName?: string;
  district?: string;
  tehsil?: string;
  village?: string;
  hp?: string;
  connectionType?: string;

  approvalStatus?: string;
  paymentStatus?: string;
  allotmentStatus?: string;
  surveyStatus?: string;
  ntpStatus?: string;
  aifStatus?: string;
  cifStatus?: boolean;
  workStatus?: string;
  bankAccountOpen?: boolean;
  meterSerialNo?: string;
  panelSerialNo?: string;
}

// --- Form Builder Types ---
export type FormFieldType =
  | "text"
  | "number"
  | "select"
  | "email"
  | "tel"
  | "image";

export interface FormField {
  id: string;
  type: FormFieldType;
  name: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  visibleInStates?: string[];
}

export type FormSchema = FormField[];
