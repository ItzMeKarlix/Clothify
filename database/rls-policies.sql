-- =====================================================
-- FIX: CLEAR ALL POLICIES AND RESET RECURSION
-- =====================================================

-- 1. NUKE all existing policies on user_roles (Dynamic Drop)
-- This PL/pgSQL block finds every policy on 'user_roles' and deletes it.
DO $$ 
DECLARE 
    pol record; 
BEGIN 
    FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_roles' 
    LOOP 
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_roles', pol.policyname); 
    END LOOP; 
END $$;

-- 2. Force Re-creation of Helper Functions (Recursion Breakers)
-- We strictly enforce security definer and row_security = off
CREATE OR REPLACE FUNCTION public.get_user_role(check_user_id UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
SET row_security = off -- <--- CRITICAL: This stops the recursion
STABLE
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = check_user_id
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
SET row_security = off -- <--- CRITICAL: This stops the recursion
STABLE
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

-- 3. Re-Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Create CLEAN Policies for user_roles

-- A. Users can see their own role (Basic Access)
CREATE POLICY "Users can view own role" ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- B. Admins/Employees can see ALL roles (Needed for your Customers.tsx page)
-- This uses the safe function (current_user_role) which bypasses RLS
CREATE POLICY "Staff can view all roles" ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (
    public.current_user_role() IN ('admin', 'employee')
  );

-- C. Updates (handled via functions, but locking down table)
-- No direct INSERT/UPDATE policies needed as per your previous setup,
-- but ensure service_role has access.
GRANT ALL ON public.user_roles TO service_role;
GRANT SELECT ON public.user_roles TO authenticated;

-- =====================================================
-- 5. Quick Fix for Support Tickets (Recursion Safeguard)
-- =====================================================
-- Just in case there are weird policies on tickets too
DO $$ 
DECLARE 
    pol record; 
BEGIN 
    FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'support_tickets' 
    LOOP 
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.support_tickets', pol.policyname); 
    END LOOP; 
END $$;

-- Re-apply Ticket Policies cleanly
CREATE POLICY "Admins view all tickets" ON support_tickets
  FOR SELECT TO authenticated
  USING (public.current_user_role() = 'admin');

CREATE POLICY "Employees view all tickets" ON support_tickets
  FOR SELECT TO authenticated
  USING (public.current_user_role() = 'employee');

CREATE POLICY "Users view own tickets" ON support_tickets
  FOR SELECT TO authenticated
  USING (customer_email = auth.jwt() ->> 'email');

CREATE POLICY "Anyone can create tickets" ON support_tickets
  FOR INSERT WITH CHECK (true);

-- Allow updates for staff
CREATE POLICY "Staff update tickets" ON support_tickets
  FOR UPDATE TO authenticated
  USING (public.current_user_role() IN ('admin', 'employee'));

-- =====================================================
-- 6. RPC Function to Get All Members (Bypasses View)
-- =====================================================
-- This function replaces the user_details view query
-- It bypasses RLS entirely and joins user_roles with auth.users
CREATE OR REPLACE FUNCTION public.get_all_members()
RETURNS TABLE(
  user_id UUID,
  role TEXT,
  name TEXT,
  email TEXT,
  last_sign_in_at TIMESTAMPTZ,
  role_assigned_at TIMESTAMPTZ,
  user_created_at TIMESTAMPTZ,
  email_confirmed_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
SET row_security = off
STABLE
AS $$
BEGIN
  -- Only admins and employees can view all members
  IF public.current_user_role() NOT IN ('admin', 'employee') THEN
    RAISE EXCEPTION 'Unauthorized: Only admins and employees can view all members';
  END IF;

  RETURN QUERY
  SELECT
    ur.user_id,
    ur.role::TEXT,
    ur.name,
    au.email,
    au.last_sign_in_at,
    ur.created_at as role_assigned_at,
    au.created_at as user_created_at,
    au.email_confirmed_at
  FROM public.user_roles ur
  JOIN auth.users au ON ur.user_id = au.id
  WHERE ur.role IN ('admin', 'employee')
  ORDER BY ur.created_at DESC;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.get_all_members() TO authenticated;

