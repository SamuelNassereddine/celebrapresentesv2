
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
          console.log("Active session found:", session.user.id);
          // Admin login simplificado
          setUser({ email: 'admin' });
          setRole('master');
          
          // Verificar se o token de sessão é válido
          const { data: userResponse, error: userError } = await supabase
            .from('admin_users')
            .select('role')
            .limit(1);
            
          if (userError) {
            console.warn("Token pode estar expirado ou RLS não está configurada corretamente:", userError);
          } else {
            console.log("User has valid access to protected resources");
          }
        } else {
          console.log("No active session found");
          setUser(null);
          setRole(null);
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        setUser(null);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
    
    // Configurar listener para mudanças na autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event);
        if (event === 'SIGNED_IN' && session) {
          setUser({ email: 'admin' });
          setRole('master');
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setRole(null);
        }
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      // Aceita apenas admin/admin@2025
      if (email === 'admin' && password === 'admin@2025') {
        console.log("Login attempt with correct credentials");
        // Autenticar no Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'admin@example.com',
          password: 'admin@2025',
        });
        
        if (error) {
          console.error("Supabase auth error:", error);
          throw error;
        }
        
        console.log("Authentication successful, session:", data.session?.user?.id);
        
        // Definir o usuário como admin
        setUser({ email: 'admin' });
        setRole('master');
        
        toast.success('Login realizado com sucesso');
        return;
      } else {
        console.log("Invalid login credentials");
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
    try {
      console.log("Signing out");
      // Sair do Supabase
      await supabase.auth.signOut();
      
      // Limpar o estado local
      setUser(null);
      setRole(null);
      toast.success('Logout realizado com sucesso');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout');
    }
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
