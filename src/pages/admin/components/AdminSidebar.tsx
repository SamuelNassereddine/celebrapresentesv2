
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  CalendarDays, 
  Settings,
  Search,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const AdminSidebar = () => {
  const { role, signOut } = useAuth();
  const location = useLocation();
  
  // Function to check if link is active
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="bg-white w-64 border-r border-gray-200 hidden md:block">
      <div className="p-4 border-b">
        <Link to="/" className="flex items-center">
          <h1 className="text-xl font-bold text-primary">Flor & Cia</h1>
          <span className="ml-2 text-sm text-gray-500">Admin</span>
        </Link>
      </div>
      
      <nav className="p-4 space-y-1">
        <Link to="/admin" className={cn(
          "flex items-center p-2 rounded-md w-full",
          isActive('/admin') && !isActive('/admin/products') && !isActive('/admin/orders') && !isActive('/admin/users') && !isActive('/admin/settings') && !isActive('/admin/calendar')
            ? "bg-primary/10 text-primary"
            : "text-gray-600 hover:bg-gray-100"
        )}>
          <LayoutDashboard className="w-5 h-5 mr-3" />
          Dashboard
        </Link>

        {/* Products - Editors and Masters */}
        {(['editor', 'master'].includes(role || '')) && (
          <Link to="/admin/products" className={cn(
            "flex items-center p-2 rounded-md w-full",
            isActive('/admin/products') ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-100"
          )}>
            <FileText className="w-5 h-5 mr-3" />
            Produtos
          </Link>
        )}

        {/* Orders - All roles */}
        <Link to="/admin/orders" className={cn(
          "flex items-center p-2 rounded-md w-full",
          isActive('/admin/orders') ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-100"
        )}>
          <Search className="w-5 h-5 mr-3" />
          Pedidos
        </Link>

        {/* Calendar - All roles */}
        <Link to="/admin/calendar" className={cn(
          "flex items-center p-2 rounded-md w-full",
          isActive('/admin/calendar') ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-100"
        )}>
          <CalendarDays className="w-5 h-5 mr-3" />
          Calendário
        </Link>

        {/* Users - Only Masters */}
        {role === 'master' && (
          <Link to="/admin/users" className={cn(
            "flex items-center p-2 rounded-md w-full",
            isActive('/admin/users') ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-100"
          )}>
            <Users className="w-5 h-5 mr-3" />
            Usuários
          </Link>
        )}

        {/* Settings - Editors and Masters */}
        {(['editor', 'master'].includes(role || '')) && (
          <Link to="/admin/settings" className={cn(
            "flex items-center p-2 rounded-md w-full",
            isActive('/admin/settings') ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-100"
          )}>
            <Settings className="w-5 h-5 mr-3" />
            Configurações
          </Link>
        )}

        <div className="pt-4 mt-4 border-t border-gray-200">
          <Button 
            variant="outline" 
            className="flex items-center w-full justify-start" 
            onClick={() => signOut()}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </nav>
    </div>
  );
};

export default AdminSidebar;
