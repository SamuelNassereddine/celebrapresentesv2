
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import AdminLayout from './AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Calendar, Package, ShoppingBag } from 'lucide-react';

type Order = Database['public']['Tables']['orders']['Row'];
type Product = Database['public']['Tables']['products']['Row'];

const DashboardCard = ({ 
  title, 
  value, 
  description, 
  icon 
}: { 
  title: string; 
  value: string | number; 
  description: string;
  icon: React.ReactNode;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="h-4 w-4 text-muted-foreground">
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [orderCount, setOrderCount] = useState<number>(0);
  const [pendingOrderCount, setPendingOrderCount] = useState<number>(0);
  const [productCount, setProductCount] = useState<number>(0);
  const [revenue, setRevenue] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch total orders
        const { count: totalOrders } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true });
          
        // Fetch pending orders
        const { count: pendingOrders } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');
          
        // Fetch total products
        const { count: totalProducts } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });
          
        // Calculate total revenue (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data: recentOrders } = await supabase
          .from('orders')
          .select('total_price')
          .gte('created_at', thirtyDaysAgo.toISOString());
        
        const totalRevenue = recentOrders?.reduce((sum, order) => sum + Number(order.total_price), 0) || 0;
        
        setOrderCount(totalOrders || 0);
        setPendingOrderCount(pendingOrders || 0);
        setProductCount(totalProducts || 0);
        setRevenue(totalRevenue);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-7 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-100 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Pedidos Totais"
            value={orderCount}
            description="Todos os pedidos"
            icon={<ShoppingBag className="h-4 w-4" />}
          />
          <DashboardCard
            title="Pendentes"
            value={pendingOrderCount}
            description="Pedidos aguardando processamento"
            icon={<Package className="h-4 w-4" />}
          />
          <DashboardCard
            title="Produtos"
            value={productCount}
            description="Total de produtos cadastrados"
            icon={<BarChart className="h-4 w-4" />}
          />
          <DashboardCard
            title="Receita (30 dias)"
            value={`R$ ${revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            description="Receita dos últimos 30 dias"
            icon={<Calendar className="h-4 w-4" />}
          />
        </div>
      )}

      {/* Add more dashboard content here later */}
    </>
  );
};

export default Dashboard;
