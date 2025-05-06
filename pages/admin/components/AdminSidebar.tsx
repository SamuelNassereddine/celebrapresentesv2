
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Calendar,
  Settings,
  Users,
  Menu,
  ChevronDown,
  ChevronUp,
  Tags,
  Gift,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileNav from './MobileNav';

const AdminSidebar = () => {
  const location = useLocation();
  const { role } = useAuth();
  const isMobile = useIsMobile();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(
    location.pathname.startsWith('/admin/products') || 
    location.pathname.startsWith('/admin/categories') ||
    location.pathname.startsWith('/admin/special-items')
      ? 'products'
      : null
  );

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  const toggleExpandMenu = (menu: string) => {
    setExpandedMenu(expandedMenu === menu ? null : menu);
  };

  if (isMobile) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden fixed top-3 left-3 z-50"
          onClick={toggleSidebar}
        >
          <Menu />
        </Button>
        <MobileNav isOpen={isSidebarOpen} onClose={toggleSidebar} />
      </>
    );
  }

  const isLinkActive = (path: string) => {
    if (path === '/admin' && location.pathname === '/admin') {
      return true;
    }
    return path !== '/admin' && location.pathname.startsWith(path);
  };

  const menuItems = [
    { path: '/admin', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    {
      id: 'products',
      icon: <ShoppingBag size={18} />,
      label: 'Catálogo',
      role: 'viewer',
      submenu: [
        { path: '/admin/categories', icon: <Tags size={16} />, label: 'Categorias', role: 'editor' },
        { path: '/admin/products', icon: <Package size={16} />, label: 'Produtos', role: 'editor' },
        { path: '/admin/special-items', icon: <Gift size={16} />, label: 'Itens Especiais', role: 'editor' },
      ],
      isExpanded: expandedMenu === 'products',
    },
    { path: '/admin/orders', icon: <Package size={18} />, label: 'Pedidos', role: 'viewer' },
    { path: '/admin/calendar', icon: <Calendar size={18} />, label: 'Calendário', role: 'viewer' },
    { path: '/admin/settings', icon: <Settings size={18} />, label: 'Configurações', role: 'editor' },
    { path: '/admin/users', icon: <Users size={18} />, label: 'Usuários', role: 'master' },
  ];

  const hasAccess = (requiredRole: string) => {
    switch (requiredRole) {
      case 'master':
        return role === 'master';
      case 'editor':
        return ['master', 'editor'].includes(role || '');
      case 'viewer':
        return ['master', 'editor', 'viewer'].includes(role || '');
      default:
        return false;
    }
  };

  return (
    <div className="hidden md:flex w-64 bg-background border-r flex-col">
      <div className="p-4 border-b">
        <div className="w-full p-2 flex items-center justify-center">
          <Link to="/admin" className="text-lg font-bold">
            Flor & Cia Admin
          </Link>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3">
          <nav className="space-y-1">
            {menuItems.map((item, index) => {
              if ('submenu' in item) {
                // Skip items that user doesn't have access to
                if (item.role && !hasAccess(item.role)) return null;
                
                // Check if any submenu item is accessible
                const hasAccessToAnySubmenuItem = item.submenu.some(
                  (subItem) => !subItem.role || hasAccess(subItem.role)
                );
                
                if (!hasAccessToAnySubmenuItem) return null;

                return (
                  <div key={index} className="space-y-1">
                    <button
                      onClick={() => toggleExpandMenu(item.id)}
                      className={`
                        w-full flex items-center justify-between px-3 py-2 text-sm rounded-md
                        ${isLinkActive('/admin/products') || isLinkActive('/admin/categories') || isLinkActive('/admin/special-items')
                          ? 'bg-accent text-accent-foreground font-medium'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}
                      `}
                    >
                      <div className="flex items-center">
                        <span className="mr-3">{item.icon}</span>
                        {item.label}
                      </div>
                      {item.isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    
                    {item.isExpanded && (
                      <div className="pl-9 space-y-1">
                        {item.submenu.map((subItem, subIndex) => {
                          // Skip submenu items that user doesn't have access to
                          if (subItem.role && !hasAccess(subItem.role)) return null;
                          
                          return (
                            <Link
                              key={subIndex}
                              to={subItem.path}
                              className={`
                                flex items-center px-3 py-2 text-sm rounded-md
                                ${isLinkActive(subItem.path)
                                  ? 'bg-accent text-accent-foreground font-medium'
                                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}
                              `}
                            >
                              <span className="mr-3">{subItem.icon}</span>
                              {subItem.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              } else {
                // Skip items that user doesn't have access to
                if (item.role && !hasAccess(item.role)) return null;
                
                return (
                  <Link
                    key={index}
                    to={item.path}
                    className={`
                      flex items-center px-3 py-2 text-sm rounded-md
                      ${isLinkActive(item.path)
                        ? 'bg-accent text-accent-foreground font-medium'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}
                    `}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              }
            })}
          </nav>
        </div>
      </ScrollArea>
    </div>
  );
};

export default AdminSidebar;
