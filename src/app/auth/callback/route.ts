import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams, origin, hash } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/dashboard';
    
    // Check for error params (from identity linking failures)
    const errorParam = searchParams.get('error');
    const errorCode = searchParams.get('error_code');
    const errorDescription = searchParams.get('error_description');

    // If there's an error in the URL (e.g., identity_already_exists)
    if (errorParam || errorCode) {
        // If linking from settings, redirect back to settings with error
        if (next?.includes('pengaturan') || next?.includes('dashboard')) {
            const errorMsg = errorCode === 'identity_already_exists'
                ? 'Akun ini sudah ditautkan ke pengguna lain'
                : (errorDescription || 'Terjadi kesalahan autentikasi');
            return NextResponse.redirect(`${origin}/dashboard/pengaturan?tab=akun&error=${encodeURIComponent(errorMsg)}`);
        }
        return NextResponse.redirect(`${origin}/login?error=${errorParam || 'auth_callback_error'}&error_code=${errorCode || ''}&error_description=${encodeURIComponent(errorDescription || '')}`);
    }

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (!error) {
            return NextResponse.redirect(`${origin}${next}`);
        }
        
        // Pass through the actual error details
        return NextResponse.redirect(`${origin}/login?error=auth_callback_error&error_code=${error.code || ''}&error_description=${encodeURIComponent(error.message || '')}`);
    }

    return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
