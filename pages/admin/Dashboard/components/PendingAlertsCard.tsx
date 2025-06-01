
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock } from 'lucide-react';

interface PendingAlert {
  id: string;
  customerName: string;
  orderNumber: string;
  daysPending: number;
  totalPrice: number;
}

interface PendingAlertsCardProps {
  alerts: PendingAlert[];
}

const PendingAlertsCard = ({ alerts }: PendingAlertsCardProps) => {
  const criticalAlerts = alerts.filter(alert => alert.daysPending >= 3);
  const warningAlerts = alerts.filter(alert => alert.daysPending >= 1 && alert.daysPending < 3);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg md:text-xl flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          Alertas de Pedidos
        </CardTitle>
        <Badge variant={criticalAlerts.length > 0 ? "destructive" : "secondary"}>
          {alerts.length} pendente(s)
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {criticalAlerts.map((alert) => (
            <div key={alert.id} className="flex items-center justify-between p-2 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <div>
                  <p className="font-medium text-sm text-red-800">#{alert.orderNumber}</p>
                  <p className="text-xs text-red-600">{alert.customerName}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="destructive" className="text-xs">
                  {alert.daysPending}d
                </Badge>
                <p className="text-xs text-red-600 mt-1">
                  R$ {alert.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          ))}
          
          {warningAlerts.map((alert) => (
            <div key={alert.id} className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="font-medium text-sm text-yellow-800">#{alert.orderNumber}</p>
                  <p className="text-xs text-yellow-600">{alert.customerName}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="text-xs border-yellow-300 text-yellow-700">
                  {alert.daysPending}d
                </Badge>
                <p className="text-xs text-yellow-600 mt-1">
                  R$ {alert.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          ))}
          
          {alerts.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">Nenhum pedido pendente</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingAlertsCard;
