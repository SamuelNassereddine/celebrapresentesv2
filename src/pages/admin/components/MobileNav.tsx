
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Calendar,
  Settings,
  Users,
  X,
  ChevronDown,
  ChevronUp,
  Tags,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileNav = ({ isOpen, onClose }: MobileNavProps) => {
  const location = useLocation();
  const { role } = useAuth();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(
    location.pathname.startsWith('/admin/products') || location.pathname.startsWith('/admin/categories')
      ? 'products'
      : null
  );

  const toggleExpandMenu = (menu: string) => {
    setExpandedMenu(expandedMenu === menu ? null : menu);
  };

  const isLinkActive = (path: string) => {
    if (path === '/admin' && location.pathname === '/admin') {
      return true;
    }
    return path !== '/admin' && location.pathname.startsWith(path);
  };

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

  const menuItems = [
    { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    {
      id: 'products',
      icon: <ShoppingBag size={20} />,
      label: 'Catálogo',
      role: 'viewer',
      submenu: [
        { path: '/admin/categories', icon: <Tags size={18} />, label: 'Categorias', role: 'editor' },
        { path: '/admin/products', icon: <Package size={18} />, label: 'Produtos', role: 'editor' },
      ],
      isExpanded: expandedMenu === 'products',
    },
    { path: '/admin/orders', icon: <Package size={20} />, label: 'Pedidos', role: 'viewer' },
    { path: '/admin/calendar', icon: <Calendar size={20} />, label: 'Calendário', role: 'viewer' },
    { path: '/admin/settings', icon: <Settings size={20} />, label: 'Configurações', role: 'editor' },
    { path: '/admin/users', icon: <Users size={20} />, label: 'Usuários', role: 'master' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden">
      <div className="fixed inset-y-0 left-0 z-50 h-full w-3/4 max-w-xs bg-background shadow-lg">
        <div className="flex h-full flex-col overflow-y-auto">
          <div className="p-4 border-b flex items-center justify-between">
            <Link to="/admin" className="text-lg font-bold" onClick={onClose}>
              Flor & Cia Admin
            </Link>
            <button className="text-muted-foreground" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
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
                        w-full flex items-center justify-between px-4 py-3 text-sm rounded-md
                        ${isLinkActive('/admin/products') || isLinkActive('/admin/categories')
                          ? 'bg-accent text-accent-foreground font-medium'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}
                      `}
                    >
                      <div className="flex items-center">
                        <span className="mr-3">{item.icon}</span>
                        {item.label}
                      </div>
                      {item.isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    
                    {item.isExpanded && (
                      <div className="pl-10 space-y-1">
                        {item.submenu.map((subItem, subIndex) => {
                          // Skip submenu items that user doesn't have access to
                          if (subItem.role && !hasAccess(subItem.role)) return null;
                          
                          return (
                            <Link
                              key={subIndex}
                              to={subItem.path}
                              className={`
                                flex items-center px-4 py-3 text-sm rounded-md
                                ${isLinkActive(subItem.path)
                                  ? 'bg-accent text-accent-foreground font-medium'
                                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}
                              `}
                              onClick={onClose}
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
                      flex items-center px-4 py-3 text-sm rounded-md
                      ${isLinkActive(item.path)
                        ? 'bg-accent text-accent-foreground font-medium'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}
                    `}
                    onClick={onClose}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              }
            })}
          </nav>
        </div>
      </div>
      <div className="fixed inset-0 z-40" onClick={onClose} />
    </div>
  );
};

export default MobileNav;
