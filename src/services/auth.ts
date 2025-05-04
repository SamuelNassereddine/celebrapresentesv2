
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type AdminUser = Database['public']['Tables']['admin_users']['Row'];

export const signInAdmin = async (email: string, password: string) => {
  console.log('🔑 signInAdmin: Attempting to sign in with email:', email);
  
  try {
    // Step 1: Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('🔑 signInAdmin: Auth error:', error);
      throw error;
    }
    
    console.log('🔑 signInAdmin: Auth successful, user ID:', data.user?.id);
    
    // Step 2: Check if user has admin role
    if (data.user) {
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();
      
      if (adminError) {
        console.error('🔑 signInAdmin: Error checking admin status:', adminError);
        // Sign out if there's an error checking admin status
        await supabase.auth.signOut();
        throw new Error('Erro ao verificar permissões de administrador.');
      }
      
      if (!adminData) {
        console.error('🔑 signInAdmin: User not in admin_users table');
        // Sign out if user is not in admin_users table
        await supabase.auth.signOut();
        throw new Error('Usuário não possui permissão de acesso.');
      }
      
      console.log('🔑 signInAdmin: Admin role verified:', adminData.role);
      return { user: data.user, role: adminData.role };
    }
    
    // This should not happen, but just in case
    console.error('🔑 signInAdmin: No user data returned');
    throw new Error('Erro de autenticação.');
  } catch (error) {
    console.error('🔑 signInAdmin: Exception:', error);
    throw error;
  }
};

export const signOutAdmin = async () => {
  console.log('🚪 signOutAdmin: Attempting to sign out');
  
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('🚪 signOutAdmin: Error signing out:', error);
    throw error;
  }
  
  console.log('🚪 signOutAdmin: Sign out successful');
  return true;
};

export const getCurrentSession = async () => {
  console.log('👤 getCurrentSession: Fetching current session');
  
  const { data, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('👤 getCurrentSession: Error getting session:', error);
    throw error;
  }
  
  console.log('👤 getCurrentSession: Session found?', !!data.session);
  return data.session;
};

export const getUserRole = async (userId: string): Promise<string | null> => {
  console.log('🔍 getUserRole: Looking up role for user ID:', userId);
  
  try {
    // Direct query to admin_users table
    const { data, error } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('🔍 getUserRole: Database error:', error);
      return null;
    }
    
    console.log('🔍 getUserRole: Query result:', data);
    return data?.role || null;
  } catch (error) {
    console.error('🔍 getUserRole: Exception:', error);
    return null;
  }
};

export const checkRole = async (requiredRole: 'master' | 'editor' | 'viewer'): Promise<boolean> => {
  console.log('🛡️ checkRole: Checking if user has role:', requiredRole);
  
  const session = await getCurrentSession();
  if (!session) {
    console.log('🛡️ checkRole: No session found');
    return false;
  }
  
  const role = await getUserRole(session.user.id);
  console.log('🛡️ checkRole: User role is:', role);
  
  if (!role) {
    console.log('🛡️ checkRole: No role found for user');
    return false;
  }
  
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
