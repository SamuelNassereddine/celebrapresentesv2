import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { format } from 'date-fns';
import { ArrowLeft, Printer, MessageSquare } from 'lucide-react';
import AdminLayout from '../AdminLayout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderItem = Database['public']['Tables']['order_items']['Row'];
type DeliveryTimeSlot = Database['public']['Tables']['delivery_time_slots']['Row'];

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  in_production: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  shipped: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
  delivered: 'bg-green-100 text-green-800 hover:bg-green-200',
};

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  in_production: 'Em Produção',
  shipped: 'Enviado',
  delivered: 'Entregue',
};

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [timeSlot, setTimeSlot] = useState<DeliveryTimeSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        // Fetch order details
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .single();

        if (orderError) throw orderError;
        setOrder(orderData);
        
        // Fetch delivery time slot if exists
        if (orderData.delivery_time_slot_id) {
          const { data: timeSlotData, error: timeSlotError } = await supabase
            .from('delivery_time_slots')
            .select('*')
            .eq('id', orderData.delivery_time_slot_id)
            .single();
            
          if (!timeSlotError && timeSlotData) {
            setTimeSlot(timeSlotData);
          }
        }

        // Fetch order items
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', id);

        if (itemsError) throw itemsError;
        console.log('Fetched order items:', itemsData);
        setOrderItems(itemsData || []);
      } catch (error) {
        console.error('Error fetching order details:', error);
        toast.error('Erro ao carregar detalhes do pedido');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;
    
    setStatusUpdating(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', order.id);
      
      if (error) throw error;
      
      setOrder({ ...order, status: newStatus });
      toast.success(`Status atualizado para ${statusLabels[newStatus]}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Erro ao atualizar status do pedido');
    } finally {
      setStatusUpdating(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      // Corrigir formatação de data para evitar problemas de timezone
      // Se a data está no formato YYYY-MM-DD, usar diretamente sem conversão de timezone
      if (dateString.includes('-') && dateString.length === 10) {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
      }
      
      // Fallback para outras strings de data
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (e) {
      return dateString;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Function to identify if an item is a special item
  const isSpecialItem = (item: OrderItem) => {
    return item.product_id === null;
  };

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Carregando detalhes do pedido...</p>
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-gray-500">Pedido não encontrado</p>
          <Button asChild>
            <Link to="/admin/orders">Voltar para lista de pedidos</Link>
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" asChild className="flex items-center">
          <Link to="/admin/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
        
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">
              Pedido #{order.order_number || 'N/A'}
            </h1>
            <Badge className={statusColors[order.status] || 'bg-gray-100'}>
              {statusLabels[order.status] || 'Desconhecido'}
            </Badge>
          </div>
          <p className="text-sm text-gray-500">ID: {order.id}</p>
        </div>
        
        <Button variant="outline" className="flex items-center gap-2">
          <Printer className="h-4 w-4" />
          Imprimir Pedido
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
                </span>
                Dados do Cliente (Comprador)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg">{order.customer_name}</h3>
                  <p className="text-gray-600">({order.customer_phone})</p>
                  <p className="text-gray-600">Email: {order.customer_email || 'não informado'}</p>
                </div>
                
                {(order.recipient_name && order.recipient_name !== order.customer_name) && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-medium flex items-center gap-2 mb-2">
                      <span className="text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                      </span>
                      Dados do Destinatário
                    </h4>
                    <p className="text-gray-700 font-medium">{order.recipient_name}</p>
                    {order.recipient_phone && (
                      <p className="text-gray-600">Telefone: {order.recipient_phone}</p>
                    )}
                  </div>
                )}
                
                {(order.presented_name) && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-medium flex items-center gap-2 mb-2">
                      <span className="text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                      </span>
                      Dados do Presenteado
                    </h4>
                    <p className="text-gray-700 font-medium">{order.presented_name}</p>
                    {order.presented_phone && (
                      <p className="text-gray-600">Telefone: {order.presented_phone}</p>
                    )}
                  </div>
                )}

                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <span className="text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    </span>
                    Endereço de Entrega
                  </h4>
                  {order.address_street ? (
                    <p className="text-gray-600">
                      {order.address_street}, {order.address_number}
                      {order.address_complement && `, ${order.address_complement}`}<br />
                      {order.address_neighborhood}, {order.address_city} - {order.address_state}<br />
                      CEP: {order.address_zipcode}
                    </p>
                  ) : (
                    <p className="text-gray-500 italic">Endereço não informado</p>
                  )}
                </div>

                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <span className="text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                    </span>
                    Data e Horário
                  </h4>
                  <p className="text-gray-600">
                    Data do pedido: {formatDate(order.created_at)}<br />
                    {order.delivery_date && (
                      <>Data de entrega: {formatDate(order.delivery_date)}</>
                    )}
                    {timeSlot && (
                      <>
                        <br />
                        Horário de entrega: {timeSlot.name} ({timeSlot.start_time} - {timeSlot.end_time})
                      </>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.5 4.27h9c.82 0 1.48.66 1.5 1.48l.38 8.5a1.5 1.5 0 0 1-1.5 1.5H7.12a1.5 1.5 0 0 1-1.5-1.5l.38-8.5c.02-.82.68-1.48 1.5-1.48z"/><path d="M12 9v3"/><path d="m15 11-6-4"/></svg>
                </span>
                Itens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {orderItems.length > 0 ? (
                  orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium">
                          {item.product_title}
                          {isSpecialItem(item) && (
                            <Badge variant="outline" className="ml-2 text-xs">Item Especial</Badge>
                          )}
                        </p>
                        <p className="text-sm text-gray-500">{item.quantity}x {formatCurrency(item.unit_price)}</p>
                      </div>
                      <div className="text-right font-medium">
                        {formatCurrency(item.quantity * item.unit_price)}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">Nenhum item encontrado</p>
                )}
              </div>
            </CardContent>
          </Card>

          {order.personalization_text && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 9h10"/><path d="M7 13h6"/><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  </span>
                  Mensagem da Carta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-md">
                  {order.personalization_text || "\"Sem mensagem\""}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumo Financeiro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Pedido #{order.order_number || 'N/A'}</p>
                  <p className="text-sm text-gray-500">Data: {formatDate(order.created_at)}</p>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex justify-between mb-2">
                    <p className="text-gray-600">Itens:</p>
                    <p className="font-medium">{formatCurrency(Number(order.total_price))}</p>
                  </div>
                  
                  <div className="flex justify-between pt-4 border-t mt-4">
                    <p className="font-bold">Total:</p>
                    <p className="font-bold">{formatCurrency(Number(order.total_price))}</p>
                  </div>
                </div>

                <div className="pt-4 space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Método de pagamento:</p>
                    <p className="bg-gray-100 rounded px-3 py-1.5 text-sm inline-block">WhatsApp</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-1">Status de pagamento:</p>
                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                      Pendente
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-1">Status do pedido:</p>
                    <Select
                      value={order.status}
                      onValueChange={handleStatusChange}
                      disabled={statusUpdating}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="in_production">Em Produção</SelectItem>
                        <SelectItem value="shipped">Enviado</SelectItem>
                        <SelectItem value="delivered">Entregue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="w-full flex items-center gap-2 mt-4" variant="outline">
                    <MessageSquare className="h-4 w-4" />
                    Enviar Confirmação no WhatsApp
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default OrderDetail;
