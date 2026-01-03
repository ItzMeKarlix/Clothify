-- Add onboarding_completed flag to user_roles table
-- This tracks whether a new user has completed their onboarding (password change)

ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Create index for faster querying
CREATE INDEX IF NOT EXISTS idx_user_roles_onboarding ON user_roles(onboarding_completed);

-- Update the comment
COMMENT ON COLUMN user_roles.onboarding_completed IS 'Tracks whether the user has completed onboarding (password update after invitation)';
