
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TopProduct {
  title: string;
  quantity: number;
  revenue: number;
}

interface TopProductsProps {
  products: TopProduct[];
}

const TopProducts = ({ products }: TopProductsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Produtos Mais Vendidos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.map((product, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">
                  {index + 1}
                </Badge>
                <div>
                  <p className="font-medium text-sm">{product.title}</p>
                  <p className="text-xs text-muted-foreground">{product.quantity} vendidos</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm">R$ {product.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopProducts;
