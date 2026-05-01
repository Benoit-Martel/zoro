-- Create users table for authentication
CREATE TABLE IF NOT EXISTS zoro_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster email lookups
CREATE INDEX idx_zoro_users_email ON zoro_users(email);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_zoro_users_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER zoro_users_update_timestamp
BEFORE UPDATE ON zoro_users
FOR EACH ROW
EXECUTE FUNCTION update_zoro_users_timestamp();

-- Create password reset tokens table
CREATE TABLE IF NOT EXISTS zoro_password_reset_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES zoro_users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '24 hours',
  used_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for password reset tokens
CREATE INDEX idx_zoro_password_reset_tokens_token ON zoro_password_reset_tokens(token);
CREATE INDEX idx_zoro_password_reset_tokens_user_id ON zoro_password_reset_tokens(user_id);
