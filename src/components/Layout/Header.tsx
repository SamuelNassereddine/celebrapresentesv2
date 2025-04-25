
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Menu, User } from 'lucide-react';

const Header = () => {
  const { totalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="font-playfair text-2xl font-bold">
            Flor & Cia
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-primary-foreground">
              Início
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-primary-foreground">
              Produtos
            </Link>
            <a 
              href="https://wa.me/5500000000000" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-primary-foreground"
            >
              WhatsApp
            </a>
            <Link to="/cart" className="relative">
              <ShoppingCart className="h-5 w-5 text-gray-700" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-foreground text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </nav>

          {/* Mobile Navigation Trigger */}
          <div className="flex items-center space-x-4 md:hidden">
            <Link to="/cart" className="relative">
              <ShoppingCart className="h-5 w-5 text-gray-700" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-foreground text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu className="h-6 w-6 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="md:hidden pt-4 pb-2 border-t mt-2 animate-fade-in">
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/"
                  onClick={() => setIsMenuOpen(false)} 
                  className="block text-gray-700 hover:text-primary-foreground"
                >
                  Início
                </Link>
              </li>
              <li>
                <Link 
                  to="/products"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-gray-700 hover:text-primary-foreground"
                >
                  Produtos
                </Link>
              </li>
              <li>
                <a 
                  href="https://wa.me/5500000000000"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-gray-700 hover:text-primary-foreground"
                >
                  WhatsApp
                </a>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
