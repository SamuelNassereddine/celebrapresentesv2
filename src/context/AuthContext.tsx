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
          // Admin login simplificado - garantindo que sempre terá permissão 'master'
          setUser({ email: 'admin' });
          setRole('master'); // Garantindo que o role é sempre 'master'
          
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
          setRole('master'); // Garantindo que o role é sempre 'master'
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
      // Consulta simples na tabela admin_users_v2 para validar e-mail e senha
      // ATENÇÃO: Senha em texto puro, ideal seria hash em produção
      const { data, error } = await supabase
        .from('admin_users_v2')
        .select('*')
        .eq('email', email)
        .eq('senha', password)
        .single(); // Espera encontrar apenas um usuário

      if (error || !data) {
        // Se não encontrar usuário, lança erro
        throw new Error('Credenciais inválidas');
      }

      // Após autenticar, buscar o role do usuário na tabela admin_users
      const { data: userRoleData, error: userRoleError } = await supabase
        .from('admin_users')
        .select('role')
        .eq('email', email)
        .single();

      // Se não encontrar role, define como null
      const userRole = userRoleData?.role || null;

      // Usuário autenticado com sucesso
      // Define o usuário autenticado no estado local, incluindo o role
      setUser({ email: data.email });
      setRole(userRole); // Agora o role é preenchido corretamente
      toast.success('Login realizado com sucesso');
      return;
    } catch (error: any) {
      // Em caso de erro, limpa o estado e repassa o erro
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
