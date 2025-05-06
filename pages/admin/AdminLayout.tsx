
import { ReactNode, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader } from 'lucide-react';
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';

interface AdminLayoutProps {
  children?: ReactNode;
  requiredRole?: 'master' | 'editor' | 'viewer';
}

const AdminLayout = ({ children, requiredRole = 'viewer' }: AdminLayoutProps) => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      // If user is not authenticated, redirect to login
      if (!user) {
        navigate('/admin/login');
        return;
      }
      
      // Check if user has the required role
      if (requiredRole === 'master' && role !== 'master') {
        navigate('/admin');
        return;
      }
      
      if (requiredRole === 'editor' && role !== 'master' && role !== 'editor') {
        navigate('/admin');
        return;
      }
    }
  }, [user, role, loading, navigate, requiredRole]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-8 h-8 animate-spin text-primary" />
          <span className="text-gray-600">Carregando...</span>
        </div>
      </div>
    );
  }

  // If user is not authenticated, the useEffect will handle redirecting
  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-4 py-8">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
