-- Supabase Database Function for Admin Authentication
-- This runs on Supabase, not Vercel, so it doesn't count as a serverless function
-- Run this in Supabase SQL Editor

-- Function to verify admin credentials
CREATE OR REPLACE FUNCTION verify_admin_credentials(
  p_username TEXT,
  p_password TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user RECORD;
  v_result JSON;
BEGIN
  -- Get user from admin_users table
  SELECT id, username, password INTO v_user
  FROM admin_users
  WHERE username = p_username
  LIMIT 1;

  -- Check if user exists
  IF v_user IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid credentials'
    );
  END IF;

  -- Verify password using pgcrypto (bcrypt)
  -- Note: This requires the password to be hashed with bcrypt
  IF crypt(p_password, v_user.password) = v_user.password THEN
    -- Password matches
    RETURN json_build_object(
      'success', true,
      'user', json_build_object(
        'id', v_user.id,
        'username', v_user.username
      )
    );
  ELSE
    -- Password doesn't match
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid credentials'
    );
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Authentication failed'
    );
END;
$$;

-- Grant execute permission to authenticated users (or anon if using public access)
GRANT EXECUTE ON FUNCTION verify_admin_credentials(TEXT, TEXT) TO anon, authenticated;

-- Alternative: Simple function that returns user if password hash matches
-- This version doesn't verify password (less secure, but works if passwords are already hashed)
CREATE OR REPLACE FUNCTION get_admin_user(p_username TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user RECORD;
BEGIN
  SELECT id, username INTO v_user
  FROM admin_users
  WHERE username = p_username
  LIMIT 1;

  IF v_user IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;

  RETURN json_build_object(
    'success', true,
    'user', json_build_object(
      'id', v_user.id,
      'username', v_user.username
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_admin_user(TEXT) TO anon, authenticated;

