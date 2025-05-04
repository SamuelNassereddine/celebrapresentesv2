
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: { email: string } | null;
  role: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Verificar sessão existente no carregamento inicial
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Se houver uma sessão, verifique se o usuário é um admin
          const { data: adminUser } = await supabase
            .from('admin_users')
            .select('*')
            .eq('id', session.user?.id)
            .single();
            
          if (adminUser) {
            setUser({ email: adminUser.email });
            setRole(adminUser.role);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      // Manual authentication with hardcoded credentials
      if (email === 'admin' && password === 'admin@2025') {
        // Create a session for the admin user in Supabase
        const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
          email: 'admin@example.com',
          password: 'admin@2025',
        });
        
        if (sessionError) {
          // If sign in fails, try to sign up first
          const { data: signupData, error: signupError } = await supabase.auth.signUp({
            email: 'admin@example.com',
            password: 'admin@2025',
          });
          
          if (signupError) throw signupError;
          
          // Then sign in again
          const { error: retryError } = await supabase.auth.signInWithPassword({
            email: 'admin@example.com',
            password: 'admin@2025',
          });
          
          if (retryError) throw retryError;
        }
        
        // Check if this admin user exists in the admin_users table
        const { data: adminUser, error: adminUserError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', 'admin@example.com')
          .maybeSingle();
          
        // If admin user doesn't exist in the admin_users table, create it
        if (!adminUser) {
          // Get the authenticated user's ID
          const { data: { user: authUser } } = await supabase.auth.getUser();
          
          if (authUser) {
            // Insert the admin user into the admin_users table
            const { error: insertError } = await supabase
              .from('admin_users')
              .insert({
                id: authUser.id,
                email: 'admin@example.com',
                role: 'master'
              });
              
            if (insertError) {
              console.error('Error creating admin user:', insertError);
              throw insertError;
            }
          }
        }
        
        // Set user in state after successful authentication
        setUser({ email: 'admin' });
        setRole('master');
        
        toast.success('Login realizado com sucesso');
        return;
      } else {
        throw new Error('Credenciais inválidas');
      }
    } catch (error: any) {
      console.error('🔐 Error signing in:', error);
      setUser(null);
      setRole(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Clear local state
    setUser(null);
    setRole(null);
    toast.success('Logout realizado com sucesso');
  };

  const contextValue = {
    user,
    role,
    loading,
    signIn,
    signOut,
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
