
import { Link } from 'react-router-dom';

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
}

const ProductCard = ({ id, title, price, imageUrl }: ProductCardProps) => {
  return (
    <Link to={`/product/${id}`} className="group">
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition duration-300">
        <div className="aspect-square overflow-hidden">
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
        </div>
        <div className="p-4">
          <h3 className="text-gray-800 font-medium text-lg mb-1 line-clamp-1">{title}</h3>
          <p className="text-primary-foreground font-semibold">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
              .format(price)}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
