export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Contact {
  id: string;
  client_id: string;
  name: string;
  phone?: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Project {
  id: string;
  client_id: string;
  contact_id?: string;
  name: string;
  hourly_rate: number;
  status: string;
  color?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectStep {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TimeEntry {
  id: string;
  project_id: string;
  step_id?: string | null;
  service_id?: string;
  date: string;
  hours: number;
  description: string;
  created_at?: string;
  updated_at?: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  time_entry_id?: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  service_id?: string | null;
  tax_1_name?: string;
  tax_1_amount: number;
  tax_2_name?: string;
  tax_2_amount: number;
  discount_amount: number;
  line_total: number;
  exempt_tax?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Invoice {
  id: string;
  project_id: string;
  invoice_number: string;
  date: string;
  total_amount: number;
  status?: string;
  items?: TimeEntry[];
  created_at?: string;
  updated_at?: string;
}
