
import { useEffect, useState } from 'react';
import AdminLayout from '../AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type Order = Database['public']['Tables']['orders']['Row'];

const CalendarView = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [orders, setOrders] = useState<Order[]>([]);
  const [dateOrders, setDateOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [viewingDate, setViewingDate] = useState<Date | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .not('delivery_date', 'is', null);
        
      if (error) throw error;
      
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (viewingDate) {
      // Filter orders by selected date
      const dateStr = format(viewingDate, 'yyyy-MM-dd');
      const filtered = orders.filter(order => {
        if (!order.delivery_date) return false;
        return order.delivery_date.startsWith(dateStr);
      });
      setDateOrders(filtered);
    }
  }, [viewingDate, orders]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  // Function to check if a date has orders
  const hasOrdersOnDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return orders.some(order => {
      if (!order.delivery_date) return false;
      return order.delivery_date.startsWith(dateStr);
    });
  };

  // Format date in PT-BR
  const formatDateBR = (date: Date) => {
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const formatOrderStatus = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'in_production': return 'Em Produção';
      case 'shipped': return 'Enviado';
      case 'delivered': return 'Entregue';
      default: return status;
    }
  };

  const openDetails = (date: Date) => {
    setViewingDate(date);
    setIsDetailsOpen(true);
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Calendário de Entregas</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => {
                  const prevMonth = new Date(selectedDate);
                  prevMonth.setMonth(prevMonth.getMonth() - 1);
                  setSelectedDate(prevMonth);
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-center text-lg font-medium">
                {format(selectedDate, 'MMMM yyyy', { locale: ptBR })}
              </h2>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => {
                  const nextMonth = new Date(selectedDate);
                  nextMonth.setMonth(nextMonth.getMonth() + 1);
                  setSelectedDate(nextMonth);
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="rounded-md border"
              locale={ptBR}
              modifiers={{
                hasOrders: (date) => hasOrdersOnDate(date)
              }}
              modifiersClassNames={{
                hasOrders: 'bg-primary/20 font-bold text-primary'
              }}
              onDayClick={openDetails}
            />
            <div className="mt-4 text-center text-sm text-gray-500">
              Clique em um dia para ver os pedidos de entrega
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardContent className="p-4">
            <h2 className="text-lg font-medium mb-4">
              Próximas Entregas
            </h2>

            {loading ? (
              <div className="flex items-center justify-center h-40">
                <p>Carregando...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center p-6 text-gray-500">
                Nenhum pedido com entrega agendada encontrado
              </div>
            ) : (
              <div className="space-y-4">
                {/* Show next 5 delivery dates */}
                {Array.from(new Set(orders
                  .filter(order => order.delivery_date && new Date(order.delivery_date) >= new Date())
                  .sort((a, b) => {
                    if (!a.delivery_date || !b.delivery_date) return 0;
                    return new Date(a.delivery_date).getTime() - new Date(b.delivery_date).getTime();
                  })
                  .map(order => order.delivery_date)
                ))
                .slice(0, 5)
                .map(dateStr => {
                  if (!dateStr) return null;
                  
                  // Count orders for this date
                  const dateOrders = orders.filter(order => order.delivery_date === dateStr);
                  const date = new Date(dateStr);
                  
                  return (
                    <div key={dateStr} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{formatDateBR(date)}</h3>
                          <p className="text-sm text-gray-500">
                            {dateOrders.length} {dateOrders.length === 1 ? 'pedido' : 'pedidos'}
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openDetails(date)}
                        >
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Date Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Entregas para {viewingDate ? formatDateBR(viewingDate) : ''}
            </DialogTitle>
          </DialogHeader>
          
          {dateOrders.length === 0 ? (
            <div className="text-center py-8">
              <p>Não há pedidos para entrega nesta data.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto py-4">
              {dateOrders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                    <div>
                      <h3 className="font-medium">{order.customer_name}</h3>
                      <p className="text-sm text-gray-500">{order.customer_phone}</p>
                    </div>
                    <div className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium",
                      order.status === 'pending' && "bg-yellow-100 text-yellow-800",
                      order.status === 'in_production' && "bg-blue-100 text-blue-800",
                      order.status === 'shipped' && "bg-purple-100 text-purple-800",
                      order.status === 'delivered' && "bg-green-100 text-green-800"
                    )}>
                      {formatOrderStatus(order.status)}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-gray-500">Endereço de Entrega</p>
                        <p className="text-sm">
                          {order.address_street}, {order.address_number}
                          {order.address_complement && `, ${order.address_complement}`}
                        </p>
                        <p className="text-sm">
                          {order.address_neighborhood}, {order.address_city}/{order.address_state}
                        </p>
                        <p className="text-sm">CEP: {order.address_zipcode}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Detalhes do Pedido</p>
                        <p className="text-sm">
                          Valor Total: {Number(order.total_price).toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                        </p>
                        {order.recipient_name && (
                          <p className="text-sm">Destinatário: {order.recipient_name}</p>
                        )}
                      </div>
                    </div>
                    
                    {order.personalization_text && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">Mensagem</p>
                        <p className="text-sm italic">"{order.personalization_text}"</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      asChild
                    >
                      <a href={`/admin/orders/${order.id}`}>
                        Ver Pedido Completo
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default CalendarView;
