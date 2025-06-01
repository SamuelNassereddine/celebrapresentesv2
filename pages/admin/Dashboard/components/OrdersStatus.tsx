
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface OrdersStatusProps {
  data: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
}

const statusColors = {
  pending: '#fbbf24',
  processing: '#3b82f6',
  delivered: '#10b981',
  cancelled: '#ef4444'
};

const statusLabels = {
  pending: 'Pendente',
  processing: 'Processando',
  delivered: 'Entregue',
  cancelled: 'Cancelado'
};

const chartConfig = {
  count: {
    label: "Pedidos",
  }
};

const OrdersStatus = ({ data }: OrdersStatusProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Status dos Pedidos</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] sm:h-[220px] md:h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius="70%"
                innerRadius="20%"
                label={({ percentage }) => `${percentage.toFixed(1)}%`}
                labelLine={false}
                fontSize={12}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={statusColors[entry.status as keyof typeof statusColors]} 
                  />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: statusColors[item.status as keyof typeof statusColors] }}
              />
              <span className="text-xs sm:text-sm truncate">
                {statusLabels[item.status as keyof typeof statusLabels]}: {item.count}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrdersStatus;
