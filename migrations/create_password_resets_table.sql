-- Create password reset requests table
CREATE TABLE IF NOT EXISTS zoro_password_resets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '1 hour',
  used_at TIMESTAMP WITH TIME ZONE
);

-- Add index for faster lookups
CREATE INDEX idx_password_resets_token ON zoro_password_resets(token);
CREATE INDEX idx_password_resets_email ON zoro_password_resets(user_email);
