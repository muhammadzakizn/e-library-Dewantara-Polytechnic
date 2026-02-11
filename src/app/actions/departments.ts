
'use server';

import { createClient } from '@/lib/supabase/client';
import { revalidatePath } from 'next/cache';

export async function getDepartments() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');
    
    if (error) {
        console.error('Error fetching departments:', error);
        return [];
    }
    
    return data;
}

export async function createDepartment(formData: FormData) {
    const supabase = createClient();
    const name = formData.get('name') as string;
    const code = formData.get('code') as string;
    
    // Check constraints
    if (!name) return { error: 'Nama jurusan wajib diisi' };

    const { error } = await supabase
        .from('departments')
        .insert({ name, code });
        
    if (error) {
        console.error('Error creating department:', error);
        return { error: 'Gagal membuat jurusan' };
    }
    
    revalidatePath('/admin/dashboard/academic');
    return { success: true };
}

export async function updateDepartment(id: string, formData: FormData) {
    const supabase = createClient();
    const name = formData.get('name') as string;
    const code = formData.get('code') as string;
    
    if (!name) return { error: 'Nama jurusan wajib diisi' };
    
    const { error } = await supabase
        .from('departments')
        .update({ name, code })
        .eq('id', id);
        
    if (error) {
        console.error('Error updating department:', error);
        return { error: 'Gagal mengupdate jurusan' };
    }
    
    revalidatePath('/admin/dashboard/academic');
    return { success: true };
}

export async function deleteDepartment(id: string) {
    const supabase = createClient();
    
    const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', id);
        
    if (error) {
        console.error('Error deleting department:', error);
        return { error: 'Gagal menghapus jurusan' };
    }
    
    revalidatePath('/admin/dashboard/academic');
    return { success: true };
}
