
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface TopProduct {
  title: string;
  quantity: number;
  revenue: number;
  categoryName?: string;
}

interface TopProductsProps {
  products: TopProduct[];
}

const TopProducts = ({ products }: TopProductsProps) => {
  const [showAll, setShowAll] = useState(false);
  const [sortBy, setSortBy] = useState<'quantity' | 'revenue'>('quantity');

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'quantity') {
      return b.quantity - a.quantity;
    }
    return b.revenue - a.revenue;
  });

  const displayProducts = showAll ? sortedProducts.slice(0, 10) : sortedProducts.slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg md:text-xl">Top Produtos</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant={sortBy === 'quantity' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('quantity')}
          >
            Qtd
          </Button>
          <Button
            variant={sortBy === 'revenue' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('revenue')}
          >
            R$
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayProducts.map((product, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">
                  {index + 1}
                </Badge>
                <div>
                  <p className="font-medium text-sm">{product.title}</p>
                  <p className="text-xs text-muted-foreground">{product.quantity} vendidos</p>
                  {product.categoryName && (
                    <p className="text-xs text-blue-600">{product.categoryName}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm">R$ {product.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          ))}
          
          {products.length > 5 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="w-full mt-4 flex items-center gap-2"
            >
              {showAll ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showAll ? 'Mostrar menos' : `Ver mais (${Math.min(10, products.length)} total)`}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopProducts;
