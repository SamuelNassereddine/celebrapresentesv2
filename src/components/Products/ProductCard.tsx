
import { Link } from 'react-router-dom';
import { Truck } from 'lucide-react';

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  slug: string;
}

const ProductCard = ({ id, title, price, imageUrl, slug }: ProductCardProps) => {
  return (
-   <Link
-     to={`/product/${id}`}
+   <Link
+     to={`/product/${slug}`}
      className="block group focus:outline-none"
      tabIndex={0}
      aria-label={`Ver detalhes de ${title}`}
    >
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200 cursor-pointer flex flex-col pb-0 animate-fade-in min-h-80">
        <div className="aspect-square bg-gray-100">
          <img
            src={imageUrl}
            alt={title}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
          />
        </div>
        <div className="flex-1 flex flex-col justify-between px-4 py-3">
          <h3 className="font-semibold text-base text-gray-900 mb-1 truncate">{title}</h3>
          <div className="flex items-center justify-between gap-2 mt-1">
            <div className="flex items-center gap-1 text-gray-700 text-xs font-medium">
              <Truck className="h-4 w-4 text-[#a62c47]" />
              <span>Entrega Rápida no mesmo dia!</span>
            </div>
            <span className="inline-block text-green-700 font-bold text-lg bg-gray-50 px-2 py-1 rounded">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
