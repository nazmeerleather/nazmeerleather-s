
-- Lock has_role: RLS calls run as owner, no external EXECUTE needed
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM authenticated;

-- Replace permissive order_items INSERT policies with an order-existence check
DROP POLICY IF EXISTS "anon may insert order items" ON public.order_items;
DROP POLICY IF EXISTS "auth may insert order items" ON public.order_items;

CREATE POLICY "anon inserts items for real order" ON public.order_items
  FOR INSERT TO anon
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND o.user_id IS NULL));

CREATE POLICY "auth inserts items for own order" ON public.order_items
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id AND (o.user_id = auth.uid() OR o.user_id IS NULL)
  ));

-- Custom requests: replace with-check(true) with light rate-safety (name/email present)
DROP POLICY IF EXISTS "anyone submits custom request" ON public.custom_requests;
DROP POLICY IF EXISTS "auth submits custom request" ON public.custom_requests;
CREATE POLICY "anon submits custom request" ON public.custom_requests
  FOR INSERT TO anon WITH CHECK (length(full_name) > 1 AND length(email) > 3);
CREATE POLICY "auth submits custom request" ON public.custom_requests
  FOR INSERT TO authenticated WITH CHECK (length(full_name) > 1 AND length(email) > 3);
