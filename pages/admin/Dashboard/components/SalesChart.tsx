
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Line, LineChart, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface SalesChartProps {
  data: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

const chartConfig = {
  revenue: {
    label: "Receita",
    color: "#a62c47",
  },
  orders: {
    label: "Pedidos",
    color: "#3e6522",
  }
};

const SalesChart = ({ data }: SalesChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendas dos Últimos 30 Dias</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="date" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="var(--color-revenue)" 
                strokeWidth={2}
                name="Receita (R$)"
              />
              <Line 
                type="monotone" 
                dataKey="orders" 
                stroke="var(--color-orders)" 
                strokeWidth={2}
                name="Pedidos"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default SalesChart;
