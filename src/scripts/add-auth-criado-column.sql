-- Add auth_criado column to track if Auth user was created
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auth_criado BOOLEAN DEFAULT false;

-- Update existing records (assume they have Auth if they exist)
UPDATE profiles SET auth_criado = true WHERE auth_criado IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN profiles.auth_criado IS 'Flag to track if Supabase Auth user was successfully created';