"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { ProductSalesData } from '@/types/api';

interface ProductSalesChartProps {
  data: ProductSalesData[];
  type: 'bar' | 'pie';
  title: string;
  description?: string;
  showTop?: number;
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))', 
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
}

function formatChartData(data: ProductSalesData[], showTop: number = 10) {
  return data
    .slice(0, showTop)
    .map(item => ({
      name: item.product_name.length > 20 
        ? item.product_name.substring(0, 20) + '...'
        : item.product_name,
      fullName: item.product_name,
      quantity: item.quantity_sold,
      revenue: item.revenue,
      value: item.quantity_sold, // For pie chart
    }));
}

export function ProductSalesChart({ 
  data, 
  type, 
  title, 
  description, 
  showTop = 10 
}: ProductSalesChartProps) {
  const chartData = formatChartData(data, showTop);

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} layout="horizontal">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          type="number"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          type="category"
          dataKey="name" 
          fontSize={12}
          tickLine={false}
          axisLine={false}
          width={120}
        />
        <Tooltip
          formatter={(value: number, name: string) => [
            name === 'quantity' ? `${value} sản phẩm` : formatCurrency(value),
            name === 'quantity' ? 'Số lượng bán' : 'Doanh thu'
          ]}
          labelFormatter={(label) => `Sản phẩm: ${label}`}
        />
        <Bar 
          dataKey="quantity" 
          fill="hsl(var(--primary))"
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: number) => [`${value} sản phẩm`, 'Số lượng bán']}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          {type === 'pie' ? renderPieChart() : renderBarChart()}
        </div>
      </CardContent>
    </Card>
  );
} 