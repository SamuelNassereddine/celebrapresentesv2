
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin } from 'lucide-react';

interface DeliveryItem {
  id: string;
  customerName: string;
  deliveryDate: string;
  timeSlot: string;
  address: string;
  totalPrice: number;
  status: string;
}

interface UpcomingDeliveriesProps {
  deliveries: DeliveryItem[];
}

const UpcomingDeliveries = ({ deliveries }: UpcomingDeliveriesProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'processing': return 'Processando';
      case 'delivered': return 'Entregue';
      default: return status;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Próximas Entregas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {deliveries.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Nenhuma entrega programada para os próximos dias
            </p>
          ) : (
            deliveries.map((delivery) => (
              <div key={delivery.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{delivery.customerName}</h4>
                  <Badge className={getStatusColor(delivery.status)}>
                    {getStatusLabel(delivery.status)}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(delivery.deliveryDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {delivery.timeSlot}
                  </div>
                </div>
                
                <div className="flex items-start gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{delivery.address}</span>
                </div>
                
                <div className="text-right">
                  <span className="font-bold text-primary">
                    R$ {delivery.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingDeliveries;
