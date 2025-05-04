
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import AdminLayout from '../AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Eye, User } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// Estendemos o tipo Order do Supabase para garantir que order_number seja reconhecido
type Order = Database['public']['Tables']['orders']['Row'] & {
  order_number?: string | null;
};

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

const OrderStatusBadge = ({ status }: { status: string }) => {
  const colorClass = statusColors[status] || 'bg-gray-100 text-gray-800';
  const label = statusLabels[status] || 'Desconhecido';
  
  return <Badge className={colorClass}>{label}</Badge>;
};

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setOrders(data || []);
      setFilteredOrders(data || []);
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

  // Função para normalizar o número do telefone para comparação
  const normalizePhone = (phone: string) => {
    // Remove todos os caracteres não numéricos
    return phone.replace(/\D/g, '');
  };

  useEffect(() => {
    let filtered = [...orders];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    // Apply search filter (by customer name, ID, phone or order_number)
    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      const searchNormalized = normalizePhone(searchTerm);
      
      filtered = filtered.filter(order => 
        order.customer_name?.toLowerCase().includes(searchLower) ||
        order.id?.toLowerCase().includes(searchLower) ||
        (order.order_number && order.order_number.includes(searchTerm)) ||
        (order.customer_phone && normalizePhone(order.customer_phone).includes(searchNormalized))
      );
    }
    
    setFilteredOrders(filtered);
  }, [statusFilter, searchTerm, orders]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <AdminLayout>
      <div className="space-y-1 mb-8">
        <h1 className="text-2xl font-bold">Gerenciamento de Pedidos</h1>
        <p className="text-gray-500">Gerencie todos os pedidos e atualize seus status.</p>
      </div>

      <div className="bg-white border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">Pedidos</h2>
        <p className="text-gray-500 mb-6">Listagem de todos os pedidos da loja.</p>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Buscar por nome, ID, número do pedido ou telefone..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select 
            value={statusFilter} 
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="in_production">Em Produção</SelectItem>
              <SelectItem value="shipped">Enviados</SelectItem>
              <SelectItem value="delivered">Entregues</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Carregando pedidos...
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Nenhum pedido encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      #{order.order_number || order.id.slice(0, 4)}
                    </TableCell>
                    <TableCell>{formatDate(order.created_at)}</TableCell>
                    <TableCell>{order.customer_name}</TableCell>
                    <TableCell>{order.customer_phone}</TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell>
                      {formatCurrency(Number(order.total_price))}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild title="Ver">
                          <Link to={`/admin/orders/${order.id}`}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Ver</span>
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild title="Perfil">
                          <Link to={`/admin/orders/${order.id}`}>
                            <User className="h-4 w-4" />
                            <span className="sr-only">Perfil</span>
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Orders;
