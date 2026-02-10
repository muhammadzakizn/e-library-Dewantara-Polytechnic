-- Create user_activity table to track active users (real-time stats)
CREATE TABLE IF NOT EXISTS public.user_activity (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable for anonymous/guest tracking if needed, or just track auth users
    session_id TEXT, -- Optional: to track guest sessions via cookie/localstorage if we want guests
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    path TEXT,
    ip_address TEXT -- Optional: for basic unique counting of guests if no login
);

-- Index for fast query of "active in last X minutes"
CREATE INDEX IF NOT EXISTS idx_user_activity_last_seen ON public.user_activity(last_seen);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON public.user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_session_id ON public.user_activity(session_id);

-- Policy: Allow anyone to insert (since we might track public page views)
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert activity" ON public.user_activity
    FOR INSERT WITH CHECK (true);

-- Policy: Only service role can select (for stats) or users can see their own
CREATE POLICY "Users can view own activity" ON public.user_activity
    FOR SELECT USING (auth.uid() = user_id);

-- Function to get active users count efficiently (bypasses RLS for count)
CREATE OR REPLACE FUNCTION get_active_users_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Count users active in the last 15 minutes
    RETURN (
        SELECT COUNT(DISTINCT coalesce(user_id::text, session_id, ip_address))
        FROM public.user_activity
        WHERE last_seen > (now() - interval '15 minutes')
    );
END;
$$;
