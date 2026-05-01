-- Add exempt_tax column to zoro_invoice_items table
ALTER TABLE zoro_invoice_items
ADD COLUMN exempt_tax BOOLEAN DEFAULT FALSE;
