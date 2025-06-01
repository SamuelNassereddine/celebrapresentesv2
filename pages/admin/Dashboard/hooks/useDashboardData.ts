
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardData {
  orderCount: number;
  pendingOrderCount: number;
  productCount: number;
  revenue: number;
  averageOrderValue: number;
  conversionRate: number;
  salesData: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  topProducts: Array<{
    title: string;
    quantity: number;
    revenue: number;
  }>;
  ordersStatus: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  upcomingDeliveries: Array<{
    id: string;
    customerName: string;
    deliveryDate: string;
    timeSlot: string;
    address: string;
    totalPrice: number;
    status: string;
  }>;
}

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData>({
    orderCount: 0,
    pendingOrderCount: 0,
    productCount: 0,
    revenue: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    salesData: [],
    topProducts: [],
    ordersStatus: [],
    upcomingDeliveries: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch basic metrics
        const [
          { count: totalOrders },
          { count: pendingOrders },
          { count: totalProducts },
          { data: recentOrders },
          { data: allOrders },
          { data: orderItems },
          { data: upcomingOrders }
        ] = await Promise.all([
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('total_price, created_at').gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
          supabase.from('orders').select('status, total_price, created_at'),
          supabase.from('order_items').select('product_title, quantity, unit_price'),
          supabase.from('orders')
            .select(`
              id,
              customer_name,
              delivery_date,
              address_street,
              address_number,
              address_neighborhood,
              address_city,
              total_price,
              status,
              delivery_time_slots!inner(name)
            `)
            .gte('delivery_date', new Date().toISOString().split('T')[0])
            .order('delivery_date')
            .limit(10)
        ]);

        // Calculate revenue
        const totalRevenue = recentOrders?.reduce((sum, order) => sum + Number(order.total_price), 0) || 0;
        
        // Calculate average order value
        const avgOrderValue = totalOrders && totalOrders > 0 ? totalRevenue / totalOrders : 0;
        
        // Calculate conversion rate (delivered orders / total orders)
        const deliveredOrders = allOrders?.filter(order => order.status === 'delivered').length || 0;
        const conversionRate = totalOrders && totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0;

        // Prepare sales data for chart (last 30 days)
        const salesMap = new Map();
        const last30Days = Array.from({ length: 30 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return date.toISOString().split('T')[0];
        }).reverse();

        last30Days.forEach(date => {
          salesMap.set(date, { date, revenue: 0, orders: 0 });
        });

        recentOrders?.forEach(order => {
          const date = order.created_at.split('T')[0];
          if (salesMap.has(date)) {
            const day = salesMap.get(date);
            day.revenue += Number(order.total_price);
            day.orders += 1;
          }
        });

        const salesData = Array.from(salesMap.values());

        // Calculate top products
        const productMap = new Map();
        orderItems?.forEach(item => {
          if (productMap.has(item.product_title)) {
            const existing = productMap.get(item.product_title);
            existing.quantity += item.quantity;
            existing.revenue += item.quantity * Number(item.unit_price);
          } else {
            productMap.set(item.product_title, {
              title: item.product_title,
              quantity: item.quantity,
              revenue: item.quantity * Number(item.unit_price)
            });
          }
        });

        const topProducts = Array.from(productMap.values())
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 5);

        // Calculate orders status distribution
        const statusMap = new Map();
        allOrders?.forEach(order => {
          statusMap.set(order.status, (statusMap.get(order.status) || 0) + 1);
        });

        const ordersStatus = Array.from(statusMap.entries()).map(([status, count]) => ({
          status,
          count,
          percentage: totalOrders ? (count / totalOrders) * 100 : 0
        }));

        // Format upcoming deliveries
        const upcomingDeliveries = upcomingOrders?.map(order => ({
          id: order.id,
          customerName: order.customer_name,
          deliveryDate: order.delivery_date,
          timeSlot: order.delivery_time_slots?.name || 'N/A',
          address: `${order.address_street || ''} ${order.address_number || ''}, ${order.address_neighborhood || ''}, ${order.address_city || ''}`.trim(),
          totalPrice: Number(order.total_price),
          status: order.status
        })) || [];

        setData({
          orderCount: totalOrders || 0,
          pendingOrderCount: pendingOrders || 0,
          productCount: totalProducts || 0,
          revenue: totalRevenue,
          averageOrderValue: avgOrderValue,
          conversionRate,
          salesData,
          topProducts,
          ordersStatus,
          upcomingDeliveries
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return { data, loading };
};
