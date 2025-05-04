
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  CalendarDays, 
  Settings,
  Search,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const { role, signOut } = useAuth();
  const location = useLocation();
  
  // Function to check if link is active
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px] sm:w-[300px]">
        <div className="px-2 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center" onClick={() => setOpen(false)}>
            <h1 className="text-xl font-bold text-primary">Flor & Cia</h1>
            <span className="ml-2 text-sm text-gray-500">Admin</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <nav className="flex flex-col gap-2 p-2">
          <Link 
            to="/admin" 
            className={cn(
              "flex items-center p-2 rounded-md",
              isActive('/admin') && !isActive('/admin/products') && !isActive('/admin/orders') && !isActive('/admin/users') && !isActive('/admin/settings') && !isActive('/admin/calendar')
                ? "bg-primary/10 text-primary"
                : "text-gray-600 hover:bg-gray-100"
            )}
            onClick={() => setOpen(false)}
          >
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Dashboard
          </Link>

          {/* Products - Editors and Masters */}
          {(['editor', 'master'].includes(role || '')) && (
            <Link 
              to="/admin/products" 
              className={cn(
                "flex items-center p-2 rounded-md",
                isActive('/admin/products') ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-100"
              )}
              onClick={() => setOpen(false)}
            >
              <FileText className="w-5 h-5 mr-3" />
              Produtos
            </Link>
          )}

          {/* Orders - All roles */}
          <Link 
            to="/admin/orders" 
            className={cn(
              "flex items-center p-2 rounded-md",
              isActive('/admin/orders') ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-100"
            )}
            onClick={() => setOpen(false)}
          >
            <Search className="w-5 h-5 mr-3" />
            Pedidos
          </Link>

          {/* Calendar - All roles */}
          <Link 
            to="/admin/calendar" 
            className={cn(
              "flex items-center p-2 rounded-md",
              isActive('/admin/calendar') ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-100"
            )}
            onClick={() => setOpen(false)}
          >
            <CalendarDays className="w-5 h-5 mr-3" />
            Calendário
          </Link>

          {/* Users - Only Masters */}
          {role === 'master' && (
            <Link 
              to="/admin/users" 
              className={cn(
                "flex items-center p-2 rounded-md",
                isActive('/admin/users') ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-100"
              )}
              onClick={() => setOpen(false)}
            >
              <Users className="w-5 h-5 mr-3" />
              Usuários
            </Link>
          )}

          {/* Settings - Editors and Masters */}
          {(['editor', 'master'].includes(role || '')) && (
            <Link 
              to="/admin/settings" 
              className={cn(
                "flex items-center p-2 rounded-md",
                isActive('/admin/settings') ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-100"
              )}
              onClick={() => setOpen(false)}
            >
              <Settings className="w-5 h-5 mr-3" />
              Configurações
            </Link>
          )}

          <div className="pt-4 mt-4 border-t border-gray-200">
            <Button 
              variant="outline" 
              className="flex items-center w-full justify-start" 
              onClick={() => {
                signOut();
                setOpen(false);
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
