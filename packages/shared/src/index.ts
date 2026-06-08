export type LoadStatus =
  | "available"
  | "booked"
  | "dispatched"
  | "in_transit"
  | "delivered"
  | "invoiced"
  | "paid"
  | "cancelled";

export type DocumentType =
  | "rate_confirmation"
  | "bol"
  | "pod"
  | "invoice"
  | "lumper_receipt"
  | "detention_form"
  | "other";

export type ClaimType =
  | "detention"
  | "lumper"
  | "tonu"
  | "accessorial"
  | "short_pay"
  | "other";

export type ClaimStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "denied"
  | "paid";

export type FacilityType = "shipper" | "receiver" | "both";

export type MemberRole = "owner" | "dispatcher" | "driver" | "admin";

export interface Organization {
  id: string;
  name: string;
  mc_number?: string;
  dot_number?: string;
  phone?: string;
  email?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface Load {
  id: string;
  organization_id: string;
  load_number?: string;
  reference_number?: string;
  status: LoadStatus;
  broker_id?: string;
  driver_id?: string;
  truck_id?: string;
  origin_facility_id?: string;
  destination_facility_id?: string;
  pickup_date?: string;
  delivery_date?: string;
  commodity?: string;
  weight_lbs?: number;
  miles?: number;
  rate?: number;
  rate_per_mile?: number;
  fuel_surcharge?: number;
  accessorials?: number;
  total_revenue?: number;
  notes?: string;
  ai_parsed?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Driver {
  id: string;
  organization_id: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  cdl_number?: string;
  cdl_expiry?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Truck {
  id: string;
  organization_id: string;
  unit_number: string;
  vin?: string;
  make?: string;
  model?: string;
  year?: number;
  trailer_type?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Broker {
  id: string;
  organization_id: string;
  name: string;
  mc_number?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  payment_terms?: number;
  credit_rating?: string;
  notes?: string;
  total_loads?: number;
  avg_days_to_pay?: number;
  created_at: string;
  updated_at: string;
}

export interface Facility {
  id: string;
  organization_id: string;
  name: string;
  facility_type: FacilityType;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  zip: string;
  latitude?: number;
  longitude?: number;
  dock_hours?: string;
  appointment_required?: boolean;
  lumper_required?: boolean;
  detention_policy?: string;
  notes?: string;
  avg_wait_minutes?: number;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  organization_id: string;
  load_id?: string;
  document_type: DocumentType;
  file_name: string;
  storage_path: string;
  file_size?: number;
  mime_type?: string;
  parsed_data?: Record<string, unknown>;
  uploaded_by?: string;
  created_at: string;
}

export interface RevenueClaim {
  id: string;
  organization_id: string;
  load_id: string;
  claim_type: ClaimType;
  status: ClaimStatus;
  amount: number;
  description?: string;
  detention_start?: string;
  detention_end?: string;
  detention_hours?: number;
  submitted_at?: string;
  resolved_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ParsedEmailData {
  load_number?: string;
  broker_name?: string;
  origin?: string;
  destination?: string;
  pickup_date?: string;
  delivery_date?: string;
  rate?: number;
  commodity?: string;
  weight_lbs?: number;
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
}

export interface RateConfirmationData {
  broker_name?: string;
  load_number?: string;
  reference_number?: string;
  pickup_address?: string;
  delivery_address?: string;
  pickup_date?: string;
  delivery_date?: string;
  rate?: number;
  fuel_surcharge?: number;
  commodity?: string;
  weight_lbs?: number;
  miles?: number;
  detention_policy?: string;
  payment_terms?: number;
}

export const LOAD_STATUS_LABELS: Record<LoadStatus, string> = {
  available: "Available",
  booked: "Booked",
  dispatched: "Dispatched",
  in_transit: "In Transit",
  delivered: "Delivered",
  invoiced: "Invoiced",
  paid: "Paid",
  cancelled: "Cancelled",
};

export const CLAIM_TYPE_LABELS: Record<ClaimType, string> = {
  detention: "Detention",
  lumper: "Lumper",
  tonu: "TONU",
  accessorial: "Accessorial",
  short_pay: "Short Pay",
  other: "Other",
};

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatRatePerMile(rate: number, miles: number): string {
  if (!miles) return "—";
  return `$${(rate / miles).toFixed(2)}/mi`;
}
