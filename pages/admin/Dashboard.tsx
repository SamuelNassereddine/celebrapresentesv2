
import { useDashboardData } from './Dashboard/hooks/useDashboardData';
import MetricsCard from './Dashboard/components/MetricsCard';
import SalesChart from './Dashboard/components/SalesChart';
import TopProducts from './Dashboard/components/TopProducts';
import OrdersStatus from './Dashboard/components/OrdersStatus';
import UpcomingDeliveries from './Dashboard/components/UpcomingDeliveries';
import { BarChart, Calendar, Package, ShoppingBag, TrendingUp, CircleDollarSign } from 'lucide-react';

const Dashboard = () => {
  const { data, loading } = useDashboardData();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      {/* Main KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <MetricsCard
          title="Pedidos Totais"
          value={data.orderCount}
          description="Total de pedidos realizados"
          icon={<ShoppingBag className="h-4 w-4" />}
        />
        <MetricsCard
          title="Pendentes"
          value={data.pendingOrderCount}
          description="Pedidos aguardando processamento"
          icon={<Package className="h-4 w-4" />}
        />
        <MetricsCard
          title="Produtos"
          value={data.productCount}
          description="Total de produtos cadastrados"
          icon={<BarChart className="h-4 w-4" />}
        />
        <MetricsCard
          title="Receita Total"
          value={`R$ ${data.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          description="Receita dos últimos 30 dias"
          icon={<CircleDollarSign className="h-4 w-4" />}
        />
        <MetricsCard
          title="Ticket Médio"
          value={`R$ ${data.averageOrderValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          description="Valor médio por pedido"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <MetricsCard
          title="Taxa de Conversão"
          value={`${data.conversionRate.toFixed(1)}%`}
          description="Pedidos entregues vs total"
          icon={<Calendar className="h-4 w-4" />}
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <SalesChart data={data.salesData} />
        <OrdersStatus data={data.ordersStatus} />
      </div>

      {/* Additional Insights */}
      <div className="grid gap-6 md:grid-cols-2">
        <TopProducts products={data.topProducts} />
        <UpcomingDeliveries deliveries={data.upcomingDeliveries} />
      </div>
    </div>
  );
};

export default Dashboard;
