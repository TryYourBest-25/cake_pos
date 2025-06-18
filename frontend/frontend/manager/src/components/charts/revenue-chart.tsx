"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { MonthlySalesData, DailySalesData } from '@/types/api';

interface RevenueChartProps {
  data: MonthlySalesData[] | DailySalesData[];
  type: 'monthly' | 'daily';
  title: string;
  description?: string;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
}

function formatChartData(data: MonthlySalesData[] | DailySalesData[], type: 'monthly' | 'daily') {
  if (type === 'monthly') {
    return (data as MonthlySalesData[]).map(item => ({
      name: `Tháng ${item.month}`,
      revenue: item.total_revenue,
      orders: item.total_orders,
      products: item.total_products_sold,
    }));
  } else {
    return (data as DailySalesData[]).map(item => ({
      name: `${item.day}/${item.month}`,
      revenue: item.total_revenue,
      orders: item.total_orders,
      products: item.total_products_sold,
    }));
  }
}

export function RevenueChart({ data, type, title, description }: RevenueChartProps) {
  const chartData = formatChartData(data, type);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), 'Doanh thu']}
                labelFormatter={(label) => `Thời gian: ${label}`}
              />
              <Bar 
                dataKey="revenue" 
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 