
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { getUserRole } from '@/services/auth';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  role: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkIsAdmin: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    console.log('🔄 AuthProvider: Setting up auth state listener');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 AuthProvider: Auth state changed:', event);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('🔄 AuthProvider: New session established, fetching user role');
          try {
            const userRole = await getUserRole(session.user.id);
            console.log('🔄 AuthProvider: User role:', userRole);
            setRole(userRole);
          } catch (error) {
            console.error('🔄 AuthProvider: Error fetching user role:', error);
            setRole(null);
          }
        } else {
          console.log('🔄 AuthProvider: No session, clearing user role');
          setRole(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    console.log('🔄 AuthProvider: Checking for existing session');
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('🔄 AuthProvider: Session check result:', session ? 'Session found' : 'No session');
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('🔄 AuthProvider: Existing session found, fetching user role');
        try {
          const userRole = await getUserRole(session.user.id);
          console.log('🔄 AuthProvider: User role:', userRole);
          setRole(userRole);
        } catch (error) {
          console.error('🔄 AuthProvider: Error fetching user role:', error);
          setRole(null);
        }
      }
      
      setLoading(false);
    });

    return () => {
      console.log('🔄 AuthProvider: Unsubscribing from auth state changes');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('🔐 AuthProvider.signIn: Starting sign in process');
    setLoading(true);
    
    try {
      console.log('🔐 AuthProvider.signIn: Authenticating with Supabase');
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('🔐 AuthProvider.signIn: Authentication error:', error);
        setLoading(false);
        throw error;
      }
      
      console.log('🔐 AuthProvider.signIn: Authentication successful');
      
      // Check if user is an admin
      if (data.user) {
        console.log('🔐 AuthProvider.signIn: Checking user role');
        const userRole = await getUserRole(data.user.id);
        console.log('🔐 AuthProvider.signIn: User role:', userRole);
        
        if (!userRole) {
          // User exists but is not in admin_users table
          console.log('🔐 AuthProvider.signIn: User not in admin_users table, signing out');
          await supabase.auth.signOut();
          setLoading(false);
          throw new Error('Usuário não possui permissão de acesso.');
        }
        
        console.log('🔐 AuthProvider.signIn: User has role, sign in successful');
        setRole(userRole);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('🔐 AuthProvider.signIn: Exception:', error);
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    console.log('🚪 AuthProvider.signOut: Starting sign out process');
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('🚪 AuthProvider.signOut: Error signing out:', error);
        throw error;
      }
      
      console.log('🚪 AuthProvider.signOut: Sign out successful');
      setUser(null);
      setRole(null);
      toast.success('Logout realizado com sucesso');
    } catch (error) {
      console.error('🚪 AuthProvider.signOut: Exception:', error);
      toast.error('Erro ao realizar logout');
    } finally {
      setLoading(false);
    }
  };

  const checkIsAdmin = async () => {
    console.log('🛡️ AuthProvider.checkIsAdmin: Checking admin status');
    if (!user) {
      console.log('🛡️ AuthProvider.checkIsAdmin: No user logged in');
      return false;
    }
    
    const userRole = await getUserRole(user.id);
    console.log('🛡️ AuthProvider.checkIsAdmin: User role:', userRole);
    return !!userRole;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        signIn,
        signOut,
        checkIsAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
