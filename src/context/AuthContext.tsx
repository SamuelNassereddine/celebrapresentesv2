
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { signInAdmin, signOutAdmin, getCurrentSession, getUserRole } from '@/services/auth';
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

  // Initialize auth state
  useEffect(() => {
    console.log('🔄 AuthContext: Initializing auth state');
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 AuthContext: Auth state changed:', event);
        
        // Update user state immediately
        setUser(session?.user ?? null);
        
        // If session exists, fetch role
        if (session?.user) {
          try {
            const userRole = await getUserRole(session.user.id);
            console.log('🔄 AuthContext: User role retrieved:', userRole);
            setRole(userRole);
          } catch (error) {
            console.error('🔄 AuthContext: Error fetching user role:', error);
            setRole(null);
          } finally {
            setLoading(false);
          }
        } else {
          console.log('🔄 AuthContext: No session, clearing user role');
          setRole(null);
          setLoading(false);
        }
      }
    );

    // Then check for existing session
    const initializeAuth = async () => {
      try {
        const session = await getCurrentSession();
        
        if (session?.user) {
          console.log('🔄 AuthContext: Existing session found, user ID:', session.user.id);
          setUser(session.user);
          
          const userRole = await getUserRole(session.user.id);
          console.log('🔄 AuthContext: User role:', userRole);
          setRole(userRole);
        } else {
          console.log('🔄 AuthContext: No existing session found');
          setUser(null);
          setRole(null);
        }
      } catch (error) {
        console.error('🔄 AuthContext: Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
    
    return () => {
      console.log('🔄 AuthContext: Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('🔐 AuthContext.signIn: Starting sign in process');
    setLoading(true);
    
    try {
      const result = await signInAdmin(email, password);
      console.log('🔐 AuthContext.signIn: Sign in successful, role:', result.role);
      setRole(result.role);
      toast.success('Login realizado com sucesso');
    } catch (error: any) {
      console.error('🔐 AuthContext.signIn: Error:', error);
      
      // Make sure we're always in a clean state after a failed login
      await supabase.auth.signOut();
      setUser(null);
      setRole(null);
      
      throw error; // Re-throw for the component to handle
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    console.log('🚪 AuthContext.signOut: Starting sign out process');
    setLoading(true);
    
    try {
      await signOutAdmin();
      console.log('🚪 AuthContext.signOut: Sign out successful');
      setUser(null);
      setRole(null);
      toast.success('Logout realizado com sucesso');
    } catch (error) {
      console.error('🚪 AuthContext.signOut: Exception:', error);
      toast.error('Erro ao realizar logout');
    } finally {
      setLoading(false);
    }
  };

  const checkIsAdmin = async () => {
    console.log('🛡️ AuthContext.checkIsAdmin: Checking admin status');
    if (!user) {
      console.log('🛡️ AuthContext.checkIsAdmin: No user logged in');
      return false;
    }
    
    const userRole = await getUserRole(user.id);
    console.log('🛡️ AuthContext.checkIsAdmin: User role:', userRole);
    return !!userRole;
  };

  const contextValue = {
    user,
    role,
    loading,
    signIn,
    signOut,
    checkIsAdmin,
  };

  return (
    <AuthContext.Provider value={contextValue}>
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
