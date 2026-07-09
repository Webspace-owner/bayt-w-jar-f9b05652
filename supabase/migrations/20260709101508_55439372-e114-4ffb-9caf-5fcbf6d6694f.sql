
-- Listings suspension
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended'));

DROP POLICY IF EXISTS "Listings are viewable by everyone" ON public.listings;
CREATE POLICY "Active listings viewable by everyone or owner/admin"
ON public.listings FOR SELECT
USING (
  status = 'active'
  OR auth.uid() = user_id
  OR public.has_role(auth.uid(), 'admin')
);

-- Profiles suspension
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN NOT NULL DEFAULT false;

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile"
ON public.profiles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Block suspended users from creating listings
DROP POLICY IF EXISTS "Authenticated users can create listings" ON public.listings;
CREATE POLICY "Non-suspended users can create listings"
ON public.listings FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND NOT COALESCE((SELECT is_suspended FROM public.profiles WHERE id = auth.uid()), false)
);

-- Block suspended users from creating conversations
DROP POLICY IF EXISTS "Buyers can create conversations" ON public.conversations;
CREATE POLICY "Non-suspended buyers can create conversations"
ON public.conversations FOR INSERT
WITH CHECK (
  auth.uid() = buyer_id
  AND auth.uid() <> seller_id
  AND NOT COALESCE((SELECT is_suspended FROM public.profiles WHERE id = auth.uid()), false)
);

-- Block suspended users from sending messages
DROP POLICY IF EXISTS "Participants can send messages" ON public.messages;
CREATE POLICY "Non-suspended participants can send messages"
ON public.messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
    AND (auth.uid() = c.buyer_id OR auth.uid() = c.seller_id)
  )
  AND NOT COALESCE((SELECT is_suspended FROM public.profiles WHERE id = auth.uid()), false)
);
