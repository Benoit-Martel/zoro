-- Create email_logs table to track all emails sent
CREATE TABLE IF NOT EXISTS zoro_email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES zoro_invoices(id) ON DELETE CASCADE,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  success BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_email_logs_invoice_id ON zoro_email_logs(invoice_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON zoro_email_logs(sent_at DESC);
