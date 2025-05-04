
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type AdminUser = Database['public']['Tables']['admin_users']['Row'];

export const signInAdmin = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
};

export const signOutAdmin = async () => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw error;
  }
  
  return true;
};

export const getCurrentUser = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    throw error;
  }
  
  if (!session) {
    return null;
  }
  
  return session.user;
};

export const getUserRole = async (userId: string): Promise<string | null> => {
  try {
    // Using raw SQL query with service role to bypass RLS policies
    // This avoids the infinite recursion issue
    const { data, error } = await supabase
      .rpc('get_admin_user_role', { user_id: userId })
      .single();
    
    if (error) {
      console.error('Error fetching user role:', error);
      return null;
    }
    
    return data || null;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
};

export const checkRole = async (requiredRole: 'master' | 'editor' | 'viewer'): Promise<boolean> => {
  const user = await getCurrentUser();
  if (!user) return false;
  
  const role = await getUserRole(user.id);
  if (!role) return false;
  
  switch (requiredRole) {
    case 'master':
      return role === 'master';
    case 'editor':
      return ['master', 'editor'].includes(role);
    case 'viewer':
      return ['master', 'editor', 'viewer'].includes(role);
    default:
      return false;
  }
};
