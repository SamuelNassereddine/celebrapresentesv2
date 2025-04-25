
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-50 pt-10 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-playfair font-semibold mb-4">Flor & Cia</h3>
            <p className="text-gray-600 mb-4">
              Entregamos emoções através de flores. Conheça nossos buquês e arranjos especiais.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-playfair font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-primary-foreground">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-600 hover:text-primary-foreground">
                  Produtos
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-600 hover:text-primary-foreground">
                  Carrinho
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-playfair font-semibold mb-4">Contato</h3>
            <ul className="space-y-2">
              <li className="text-gray-600">
                <span className="font-medium">Email:</span> contato@floresecia.com.br
              </li>
              <li className="text-gray-600">
                <span className="font-medium">WhatsApp:</span> (00) 00000-0000
              </li>
              <li className="text-gray-600">
                <span className="font-medium">Endereço:</span> Rua das Flores, 123 - São Paulo, SP
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-6 text-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Flor & Cia. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
