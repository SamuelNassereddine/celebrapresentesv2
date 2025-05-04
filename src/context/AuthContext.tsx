
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
          // Admin login simplificado
          setUser({ email: 'admin' });
          setRole('master');
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
      // Aceita apenas admin/admin@2025
      if (email === 'admin' && password === 'admin@2025') {
        // Autenticar no Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'admin@example.com',
          password: 'admin@2025',
        });
        
        if (error) throw error;
        
        // Definir o usuário como admin
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
    try {
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
