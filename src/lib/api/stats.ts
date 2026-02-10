import { createClient } from '@/lib/supabase/client';

export async function getOnlineUsersCount(): Promise<number> {
    const supabase = createClient();
    
    // Count users active in the last 15 minutes using the secure RPC function
    const { data, error } = await supabase.rpc('get_active_users_count');
        
    if (error) {
        console.error('Error fetching online users:', error);
        return 0; // Return 0 on error
    }
    
    return data || 0;
}

// Function to track activity (to be called from Server Action or Client Component)
export async function trackActivity(userId?: string, sessionId?: string, path?: string) {
    const supabase = createClient();
    
    // Upsert or Insert. 
    // If we want to upsert based on user_id or session_id, we need a unique constraint.
    // For simplicity, we might just insert log entries and count distinct in the query, or upsert if we change schema.
    // Let's assume we just insert for now and clean up old logs later, or use valid upsert logic if we have a PK.
    // A better approach for "Realtime" without massive logs is to UPSERT on (user_id) or (session_id).
    
    // But since migration doesn't allow changing constraint easily without dropping, 
    // let's just insert and we can count DISTINCT user_id/session_id in the stats query.
    
    await supabase.from('user_activity').insert({
        user_id: userId || null,
        session_id: sessionId || null,
        path: path || '/',
        last_seen: new Date().toISOString()
    });
}
