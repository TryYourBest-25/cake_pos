"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  ShoppingCart, 
  Package, 
  DollarSign 
} from "lucide-react";
import { SalesReportSummary } from '@/types/api';

interface SummaryStatsProps {
  summary: SalesReportSummary;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('vi-VN').format(value);
}

export function SummaryStats({ summary }: SummaryStatsProps) {
  const stats = [
    {
      title: "Tổng Doanh Thu",
      value: formatCurrency(summary.total_revenue),
      icon: DollarSign,
      description: summary.period,
      color: "text-green-600"
    },
    {
      title: "Tổng Đơn Hàng",
      value: formatNumber(summary.total_orders),
      icon: ShoppingCart,
      description: "Đơn hàng hoàn thành",
      color: "text-blue-600"
    },
    {
      title: "Sản Phẩm Đã Bán",
      value: formatNumber(summary.total_products_sold),
      icon: Package,
      description: "Tổng sản phẩm",
      color: "text-purple-600"
    },
    {
      title: "Doanh Thu TB/Đơn",
      value: formatCurrency(
        summary.total_orders > 0 
          ? summary.total_revenue / summary.total_orders 
          : 0
      ),
      icon: TrendingUp,
      description: "Giá trị trung bình",
      color: "text-orange-600"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
} 