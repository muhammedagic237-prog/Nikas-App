export type StaffRole = "owner" | "advisor" | "technician";

export type JobStatus =
  | "checked_in"
  | "diagnosing"
  | "waiting_approval"
  | "approved"
  | "in_progress"
  | "waiting_parts"
  | "ready"
  | "completed";

export type EstimateStatus = "draft" | "sent" | "approved" | "declined";
export type ApprovalStatus = "pending" | "approved" | "declined";
export type InvoiceStatus = "draft" | "issued" | "paid";

export type Shop = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
};

export type StaffUser = {
  id: string;
  shopId: string;
  fullName: string;
  email: string;
  password: string;
  role: StaffRole;
};

export type Customer = {
  id: string;
  shopId: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
};

export type Vehicle = {
  id: string;
  shopId: string;
  customerId: string;
  vin: string;
  plateNumber: string;
  make: string;
  model: string;
  year: number;
  engine: string;
  color: string;
  mileage: number;
};

export type JobTimelineEvent = {
  id: string;
  jobId: string;
  type: "status_change" | "note" | "system";
  message: string;
  createdAt: string;
};

export type Job = {
  id: string;
  shopId: string;
  customerId: string;
  vehicleId: string;
  jobNumber: string;
  status: JobStatus;
  complaint: string;
  internalNotes: string;
  assignedAdvisorId: string;
  assignedTechnicianId: string;
  checkInAt: string;
  dueAt: string;
  completedAt: string | null;
};

export type Estimate = {
  id: string;
  jobId: string;
  status: EstimateStatus;
  subtotal: number;
  tax: number;
  total: number;
  notes: string;
};

export type Approval = {
  id: string;
  estimateId: string;
  token: string;
  status: ApprovalStatus;
  customerMessage: string;
};

export type Invoice = {
  id: string;
  jobId: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  subtotal: number;
  tax: number;
  total: number;
  issuedAt: string;
  paidAt: string | null;
};

export type GarageFlowStore = {
  shops: Shop[];
  users: StaffUser[];
  customers: Customer[];
  vehicles: Vehicle[];
  jobs: Job[];
  estimates: Estimate[];
  approvals: Approval[];
  invoices: Invoice[];
  timeline: JobTimelineEvent[];
};
