
import { useState } from 'react';
import { useDashboardData } from './Dashboard/hooks/useDashboardData';
import MetricsCard from './Dashboard/components/MetricsCard';
import SalesChart from './Dashboard/components/SalesChart';
import TopProducts from './Dashboard/components/TopProducts';
import TopSpecialItems from './Dashboard/components/TopSpecialItems';
import OrdersStatus from './Dashboard/components/OrdersStatus';
import UpcomingDeliveries from './Dashboard/components/UpcomingDeliveries';
import HourlyTrends from './Dashboard/components/HourlyTrends';
import PendingAlertsCard from './Dashboard/components/PendingAlertsCard';
import DateRangeFilter, { DateRange } from './Dashboard/components/DateRangeFilter';
import { BarChart, Calendar, Package, ShoppingBag, TrendingUp, CircleDollarSign, Clock, Star } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Dashboard = () => {
  // Initialize with last 30 days
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    label: 'Últimos 30 dias'
  });

  const { data, loading } = useDashboardData(dateRange);

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-xl md:text-2xl font-bold">Dashboard</h1>
          <div className="animate-pulse h-10 w-48 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Dashboard</h1>
        <DateRangeFilter
          selectedRange={dateRange}
          onRangeChange={setDateRange}
          loading={loading}
        />
      </div>

      {/* Main KPIs */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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
          description="Receita do período"
          icon={<CircleDollarSign className="h-4 w-4" />}
          trend={{
            value: data.growthRate,
            label: 'vs período anterior',
            positive: data.growthRate >= 0
          }}
        />
        <MetricsCard
          title="Ticket Médio"
          value={`R$ ${data.averageOrderValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          description="Valor médio por pedido"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <MetricsCard
          title="Tempo Médio"
          value={`${data.averageDeliveryTime.toFixed(1)} dias`}
          description="Tempo até entrega"
          icon={<Clock className="h-4 w-4" />}
        />
      </div>

      {/* Charts Section - Responsive layout */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <SalesChart data={data.salesData} />
        <OrdersStatus data={data.ordersStatus} />
      </div>

      {/* Hourly trends and alerts */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <HourlyTrends data={data.hourlyTrends} />
        <PendingAlertsCard alerts={data.pendingAlerts} />
      </div>

      {/* Products Section with Tabs */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="special" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Itens Especiais
            </TabsTrigger>
          </TabsList>
          <TabsContent value="products" className="mt-6">
            <TopProducts products={data.topProducts} />
          </TabsContent>
          <TabsContent value="special" className="mt-6">
            <TopSpecialItems specialItems={data.topSpecialItems} />
          </TabsContent>
        </Tabs>
        
        <UpcomingDeliveries deliveries={data.upcomingDeliveries} />
      </div>
    </div>
  );
};

export default Dashboard;
