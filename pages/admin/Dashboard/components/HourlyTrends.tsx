
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface HourlyTrendsProps {
  data: Array<{
    hour: string;
    orders: number;
    revenue: number;
  }>;
}

const chartConfig = {
  orders: {
    label: "Pedidos",
    color: "#3e6522",
  },
  revenue: {
    label: "Receita",
    color: "#a62c47",
  }
};

const HourlyTrends = ({ data }: HourlyTrendsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Vendas por Horário</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] sm:h-[250px] md:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <XAxis 
                dataKey="hour" 
                fontSize={12}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                fontSize={12}
                tick={{ fontSize: 12 }}
                width={60}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar 
                dataKey="orders" 
                fill="var(--color-orders)" 
                name="Pedidos"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default HourlyTrends;
