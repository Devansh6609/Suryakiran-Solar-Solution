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
  NewLead = "New Lead",
  VerifiedLead = "Verified Lead",
  Qualified = "Qualified (Vetting)",
  SiteSurveyScheduled = "Site Survey Scheduled",
  ProposalSent = "Proposal Sent",
  Negotiation = "Negotiation/Finance",
  ClosedWon = "Closed Won / Project",
  ClosedLost = "Closed Lost",
}

export enum LeadScoreStatus {
  Hot = "Hot",
  Warm = "Warm",
  Cold = "Cold",
}

export interface LeadDocument {
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

  assignedVendorId: string | null;
  assignedVendorName?: string;
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
}

export type FormSchema = FormField[];
