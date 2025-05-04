
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
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            const userRole = await getUserRole(session.user.id);
            setRole(userRole);
          } catch (error) {
            console.error('Error fetching user role:', error);
            setRole(null);
          }
        } else {
          setRole(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        try {
          const userRole = await getUserRole(session.user.id);
          setRole(userRole);
        } catch (error) {
          console.error('Error fetching user role:', error);
          setRole(null);
        }
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        setLoading(false);
        throw error;
      }
      
      // Check if user is an admin
      if (data.user) {
        try {
          const userRole = await getUserRole(data.user.id);
          
          if (!userRole) {
            // User exists but is not in admin_users table
            await supabase.auth.signOut();
            setLoading(false);
            throw new Error('Usuário não possui permissão de acesso.');
          }
          
          setRole(userRole);
          toast.success('Login realizado com sucesso');
        } catch (error) {
          await supabase.auth.signOut();
          setLoading(false);
          throw new Error('Usuário não possui permissão de acesso.');
        }
      }
      
      setLoading(false);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    setLoading(true);
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      setLoading(false);
      throw error;
    }
    
    setUser(null);
    setRole(null);
    setLoading(false);
    toast.success('Logout realizado com sucesso');
  };

  const checkIsAdmin = async () => {
    if (!user) return false;
    
    const userRole = await getUserRole(user.id);
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
