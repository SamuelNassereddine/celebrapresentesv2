
import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader } from 'lucide-react';
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';

interface AdminLayoutProps {
  children: ReactNode;
  requiredRole?: 'master' | 'editor' | 'viewer';
}

const AdminLayout = ({ children, requiredRole = 'viewer' }: AdminLayoutProps) => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [isCheckingRole, setIsCheckingRole] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    // Check if role is loaded yet
    if (!loading) {
      console.log('🔑 AdminLayout: Auth loaded, user:', !!user, 'role:', role);
      
      // If user is not authenticated, redirect to login
      if (!user) {
        console.log('🔑 AdminLayout: No user, redirecting to login');
        navigate('/admin/login');
        return;
      }
      
      // Check role permissions
      const checkAccess = () => {
        if (!role) {
          console.log('🔑 AdminLayout: No role detected');
          return false;
        }
        
        switch(requiredRole) {
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
      
      const access = checkAccess();
      console.log('🔑 AdminLayout: Access check result:', access);
      setHasAccess(access);
      setIsCheckingRole(false);
    }
  }, [user, role, loading, navigate, requiredRole]);

  // Show loading state while checking authentication
  if (loading || isCheckingRole) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-8 h-8 animate-spin text-primary" />
          <span className="text-gray-600">Verificando permissões...</span>
        </div>
      </div>
    );
  }

  // Check if user has required role
  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
        <p className="mb-6">Você não tem permissão para acessar esta página.</p>
        <button 
          onClick={() => navigate('/admin')}
          className="px-4 py-2 bg-primary text-white rounded"
        >
          Voltar para o Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-4 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
