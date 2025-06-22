"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { EmployeeSalesData } from '@/types/api';

interface EmployeePerformanceChartProps {
  data: EmployeeSalesData[];
  type: 'pie' | 'bar';
  title: string;
  description?: string;
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

function formatChartData(data: EmployeeSalesData[]) {
  return data.map(item => ({
    name: item.employee_name,
    revenue: item.total_revenue,
    orders: item.total_orders,
    products: item.total_products_sold,
    value: item.total_revenue, // For pie chart
  }));
}

export function EmployeePerformanceChart({ data, type, title, description }: EmployeePerformanceChartProps) {
  const chartData = formatChartData(data);

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
        <Tooltip formatter={(value: number) => [formatCurrency(value), 'Doanh thu']} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} layout="horizontal">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          type="number"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
        />
        <YAxis 
          type="category"
          dataKey="name" 
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          formatter={(value: number) => [formatCurrency(value), 'Doanh thu']}
          labelFormatter={(label) => `Nhân viên: ${label}`}
        />
        <Bar 
          dataKey="revenue" 
          fill="hsl(var(--primary))"
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
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