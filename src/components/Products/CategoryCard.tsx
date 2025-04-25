
import { Link } from 'react-router-dom';
import { Gift, Flower, Box, Plus } from 'lucide-react';

interface CategoryCardProps {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

const CategoryCard = ({ id, name, slug, icon }: CategoryCardProps) => {
  const getIcon = () => {
    switch (icon) {
      case 'gift':
        return <Gift className="w-8 h-8 text-primary" />;
      case 'flower':
        return <Flower className="w-8 h-8 text-primary" />;
      case 'box':
        return <Box className="w-8 h-8 text-primary" />;
      case 'plus':
        return <Plus className="w-8 h-8 text-primary" />;
      default:
        return <Gift className="w-8 h-8 text-primary" />;
    }
  };

  return (
    <Link to={`/category/${slug}`} className="block">
      <div className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm hover:shadow-md transition duration-300 flex flex-col items-center">
        {getIcon()}
        <h3 className="text-gray-800 font-medium text-lg mt-3 text-center">
          {name}
        </h3>
      </div>
    </Link>
  );
};

export default CategoryCard;
