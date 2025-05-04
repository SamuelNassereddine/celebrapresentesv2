
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type AdminUser = Database['public']['Tables']['admin_users']['Row'];

export const signInAdmin = async (email: string, password: string) => {
  console.log('🔑 signInAdmin: Attempting to sign in with email:', email);
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('🔑 signInAdmin: Auth error:', error);
    throw error;
  }
  
  console.log('🔑 signInAdmin: Auth successful, user ID:', data.user?.id);
  return data;
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

export const getCurrentUser = async () => {
  console.log('👤 getCurrentUser: Fetching current session');
  
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('👤 getCurrentUser: Error getting session:', error);
    throw error;
  }
  
  if (!session) {
    console.log('👤 getCurrentUser: No active session found');
    return null;
  }
  
  console.log('👤 getCurrentUser: Session found, user ID:', session.user.id);
  return session.user;
};

export const getUserRole = async (userId: string): Promise<string | null> => {
  console.log('🔍 getUserRole: Looking up role for user ID:', userId);
  
  try {
    console.log('🔍 getUserRole: Querying admin_users table');
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
  
  const user = await getCurrentUser();
  if (!user) {
    console.log('🛡️ checkRole: No user found');
    return false;
  }
  
  const role = await getUserRole(user.id);
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
