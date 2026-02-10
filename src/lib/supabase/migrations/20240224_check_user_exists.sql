-- Function to check if a user exists by email (Securely, for public/service role access)
-- This function should be called via RPC with the Service Role Key

CREATE OR REPLACE FUNCTION check_user_exists_by_email(email_input TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of the creator (postgres/admin)
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM auth.users
    WHERE email = email_input
  );
END;
$$;
