-- Fix overly permissive INSERT policies

-- Drop and recreate conversations INSERT policy
DROP POLICY "Authenticated users can create conversations" ON public.conversations;
CREATE POLICY "Authenticated users can create conversations" ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Drop and recreate participants INSERT policy  
DROP POLICY "Authenticated users can add participants" ON public.conversation_participants;
CREATE POLICY "Users can add participants to their conversations" ON public.conversation_participants FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id 
    OR is_conversation_participant(conversation_id, auth.uid())
  );