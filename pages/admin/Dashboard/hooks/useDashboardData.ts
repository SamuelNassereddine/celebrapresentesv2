
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardData {
  orderCount: number;
  pendingOrderCount: number;
  productCount: number;
  revenue: number;
  averageOrderValue: number;
  conversionRate: number;
  averageDeliveryTime: number;
  growthRate: number;
  salesData: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  topProducts: Array<{
    title: string;
    quantity: number;
    revenue: number;
    categoryName?: string;
  }>;
  topSpecialItems: Array<{
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
  hourlyTrends: Array<{
    hour: string;
    orders: number;
    revenue: number;
  }>;
  pendingAlerts: Array<{
    id: string;
    customerName: string;
    orderNumber: string;
    daysPending: number;
    totalPrice: number;
  }>;
}

interface DateRange {
  startDate: string;
  endDate: string;
}

export const useDashboardData = (dateRange?: DateRange) => {
  const [data, setData] = useState<DashboardData>({
    orderCount: 0,
    pendingOrderCount: 0,
    productCount: 0,
    revenue: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    averageDeliveryTime: 0,
    growthRate: 0,
    salesData: [],
    topProducts: [],
    topSpecialItems: [],
    ordersStatus: [],
    upcomingDeliveries: [],
    hourlyTrends: [],
    pendingAlerts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Calculate date ranges
        const endDate = dateRange?.endDate ? new Date(dateRange.endDate) : new Date();
        const startDate = dateRange?.startDate ? new Date(dateRange.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        
        // Previous period for comparison
        const previousStartDate = new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime()));
        
        // Fetch basic metrics
        const [
          { count: totalOrders },
          { count: pendingOrders },
          { count: totalProducts },
          { data: recentOrders },
          { data: previousOrders },
          { data: allOrders },
          { data: orderItems },
          { data: specialOrderItems },
          { data: upcomingOrders },
          { data: categories }
        ] = await Promise.all([
          supabase.from('orders').select('*', { count: 'exact', head: true })
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString()),
          supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('total_price, created_at, status, delivery_date')
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString()),
          supabase.from('orders').select('total_price, created_at')
            .gte('created_at', previousStartDate.toISOString())
            .lt('created_at', startDate.toISOString()),
          supabase.from('orders').select('status, total_price, created_at'),
          supabase.from('order_items')
            .select(`
              product_title, 
              quantity, 
              unit_price,
              order_id,
              orders!inner(created_at),
              products!inner(category_id)
            `)
            .gte('orders.created_at', startDate.toISOString())
            .lte('orders.created_at', endDate.toISOString())
            .not('product_id', 'is', null),
          supabase.from('order_items')
            .select(`
              product_title, 
              quantity, 
              unit_price,
              order_id,
              orders!inner(created_at)
            `)
            .gte('orders.created_at', startDate.toISOString())
            .lte('orders.created_at', endDate.toISOString())
            .is('product_id', null),
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
            .limit(10),
          supabase.from('categories').select('id, name')
        ]);

        // Calculate revenue
        const totalRevenue = recentOrders?.reduce((sum, order) => sum + Number(order.total_price), 0) || 0;
        const previousRevenue = previousOrders?.reduce((sum, order) => sum + Number(order.total_price), 0) || 0;
        
        // Calculate growth rate
        const growthRate = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
        
        // Calculate average order value
        const avgOrderValue = totalOrders && totalOrders > 0 ? totalRevenue / totalOrders : 0;
        
        // Calculate conversion rate
        const deliveredOrders = allOrders?.filter(order => order.status === 'delivered').length || 0;
        const conversionRate = totalOrders && totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0;

        // Calculate average delivery time
        const deliveredOrdersWithDates = recentOrders?.filter(order => 
          order.status === 'delivered' && order.delivery_date
        ) || [];
        
        const avgDeliveryTime = deliveredOrdersWithDates.length > 0 
          ? deliveredOrdersWithDates.reduce((sum, order) => {
              const orderDate = new Date(order.created_at);
              const deliveryDate = new Date(order.delivery_date);
              return sum + Math.ceil((deliveryDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
            }, 0) / deliveredOrdersWithDates.length
          : 0;

        // Prepare sales data for chart
        const salesMap = new Map();
        const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const daysArray = Array.from({ length: daysDiff }, (_, i) => {
          const date = new Date(startDate);
          date.setDate(date.getDate() + i);
          return date.toISOString().split('T')[0];
        });

        daysArray.forEach(date => {
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

        // Calculate top products with categories
        const categoryMap = new Map();
        categories?.forEach(cat => categoryMap.set(cat.id, cat.name));

        const productMap = new Map();
        orderItems?.forEach(item => {
          if (productMap.has(item.product_title)) {
            const existing = productMap.get(item.product_title);
            existing.quantity += item.quantity;
            existing.revenue += item.quantity * Number(item.unit_price);
          } else {
            const categoryName = item.products?.category_id ? categoryMap.get(item.products.category_id) : undefined;
            productMap.set(item.product_title, {
              title: item.product_title,
              quantity: item.quantity,
              revenue: item.quantity * Number(item.unit_price),
              categoryName
            });
          }
        });

        const topProducts = Array.from(productMap.values())
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 10);

        // Calculate top special items
        const specialItemMap = new Map();
        specialOrderItems?.forEach(item => {
          if (specialItemMap.has(item.product_title)) {
            const existing = specialItemMap.get(item.product_title);
            existing.quantity += item.quantity;
            existing.revenue += item.quantity * Number(item.unit_price);
          } else {
            specialItemMap.set(item.product_title, {
              title: item.product_title,
              quantity: item.quantity,
              revenue: item.quantity * Number(item.unit_price)
            });
          }
        });

        const topSpecialItems = Array.from(specialItemMap.values())
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 10);

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

        // Calculate hourly trends
        const hourlyMap = new Map();
        for (let i = 0; i < 24; i++) {
          hourlyMap.set(i.toString().padStart(2, '0'), { hour: `${i.toString().padStart(2, '0')}h`, orders: 0, revenue: 0 });
        }

        recentOrders?.forEach(order => {
          const hour = new Date(order.created_at).getHours().toString().padStart(2, '0');
          if (hourlyMap.has(hour)) {
            const hourData = hourlyMap.get(hour);
            hourData.orders += 1;
            hourData.revenue += Number(order.total_price);
          }
        });

        const hourlyTrends = Array.from(hourlyMap.values());

        // Calculate pending alerts
        const { data: pendingOrdersData } = await supabase
          .from('orders')
          .select('id, customer_name, order_number, created_at, total_price')
          .eq('status', 'pending');

        const pendingAlerts = pendingOrdersData?.map(order => {
          const daysPending = Math.floor((Date.now() - new Date(order.created_at).getTime()) / (1000 * 60 * 60 * 24));
          return {
            id: order.id,
            customerName: order.customer_name,
            orderNumber: order.order_number || `ORD-${order.id.slice(0, 8)}`,
            daysPending,
            totalPrice: Number(order.total_price)
          };
        }).filter(alert => alert.daysPending >= 1) || [];

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
          averageDeliveryTime: avgDeliveryTime,
          growthRate,
          salesData,
          topProducts,
          topSpecialItems,
          ordersStatus,
          upcomingDeliveries,
          hourlyTrends,
          pendingAlerts
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [dateRange?.startDate, dateRange?.endDate]);

  return { data, loading };
};
