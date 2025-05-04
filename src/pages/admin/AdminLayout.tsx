
import { ReactNode, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader } from 'lucide-react';
import AdminSidebar from './components/AdminSidebar';

interface AdminLayoutProps {
  children: ReactNode;
  requiredRole?: 'master' | 'editor' | 'viewer';
}

const AdminLayout = ({ children, requiredRole = 'viewer' }: AdminLayoutProps) => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!loading && !user) {
      navigate('/admin/login');
    }
  }, [user, loading, navigate]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="w-8 h-8 animate-spin" />
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }

  // Check if user is logged in
  if (!user) {
    return <Navigate to="/admin/login" />;
  }

  // Check if user has required role
  const hasAccess = () => {
    if (!role) return false;
    
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

  if (!hasAccess()) {
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
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
