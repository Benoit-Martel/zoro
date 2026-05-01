-- Create invoice items table if it doesn't exist
CREATE TABLE IF NOT EXISTS zoro_invoice_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES zoro_invoices(id) ON DELETE CASCADE,
  time_entry_id UUID REFERENCES zoro_time_entries(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(12, 2) NOT NULL,
  service_id UUID REFERENCES zoro_services(id) ON DELETE SET NULL,
  tax_1_name VARCHAR(100),
  tax_1_amount DECIMAL(12, 2) DEFAULT 0,
  tax_2_name VARCHAR(100),
  tax_2_amount DECIMAL(12, 2) DEFAULT 0,
  discount_amount DECIMAL(12, 2) DEFAULT 0,
  line_total DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_zoro_invoice_items_invoice_id ON zoro_invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_zoro_invoice_items_time_entry_id ON zoro_invoice_items(time_entry_id);
CREATE INDEX IF NOT EXISTS idx_zoro_invoice_items_service_id ON zoro_invoice_items(service_id);
