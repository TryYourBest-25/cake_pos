"use client";

import { useEffect, useState } from "react";
import { CalendarDays, TrendingUp, Users, Package, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SummaryStats } from "@/components/charts/summary-stats";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { EmployeePerformanceChart } from "@/components/charts/employee-performance-chart";
import { ProductSalesChart } from "@/components/charts/product-sales-chart";
import { useReportsStore } from "@/stores/reports";
import { SalesReportQuery } from "@/types/api";

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

const months = [
  { value: 1, label: "Tháng 1" },
  { value: 2, label: "Tháng 2" },
  { value: 3, label: "Tháng 3" },
  { value: 4, label: "Tháng 4" },
  { value: 5, label: "Tháng 5" },
  { value: 6, label: "Tháng 6" },
  { value: 7, label: "Tháng 7" },
  { value: 8, label: "Tháng 8" },
  { value: 9, label: "Tháng 9" },
  { value: 10, label: "Tháng 10" },
  { value: 11, label: "Tháng 11" },
  { value: 12, label: "Tháng 12" },
];

const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

export default function ReportsPage() {
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined);
  const [reportType, setReportType] = useState<string>("overview");

  const {
    currentReport,
    isLoading,
    getSalesReport,
    getMonthlySalesReport,
    getDailySalesReport,
    getEmployeeSalesReport,
    getProductSalesReport,
  } = useReportsStore();

  const buildQuery = (): SalesReportQuery => {
    const query: SalesReportQuery = { year: selectedYear };
    if (selectedMonth) {
      query.month = selectedMonth;
    }
    return query;
  };

  const fetchReportData = async () => {
    try {
      const query = buildQuery();
      
      switch (reportType) {
        case "monthly":
          await getMonthlySalesReport({ year: selectedYear });
          break;
        case "daily":
          if (selectedMonth) {
            await getDailySalesReport(query);
          } else {
            toast.error("Vui lòng chọn tháng để xem báo cáo theo ngày");
            return;
          }
          break;
        case "employee":
          await getEmployeeSalesReport(query);
          break;
        case "products":
          await getProductSalesReport(query);
          break;
        default:
          await getSalesReport(query);
      }
    } catch (error) {
      console.error("Lỗi khi tải báo cáo:", error);
      toast.error("Không thể tải dữ liệu báo cáo");
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [selectedYear, selectedMonth, reportType]);

  const handleRefresh = () => {
    fetchReportData();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Báo Cáo Bán Hàng</h1>
          <p className="text-muted-foreground">
            Thống kê và phân tích doanh thu, đơn hàng và hiệu suất bán hàng
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={isLoading}>
          <TrendingUp className="mr-2 h-4 w-4" />
          Làm Mới
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarDays className="mr-2 h-5 w-5" />
            Bộ Lọc Báo Cáo
          </CardTitle>
          <CardDescription>
            Chọn khoảng thời gian và loại báo cáo để xem thống kê
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Năm</label>
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Tháng (Tùy chọn)</label>
              <Select
                value={selectedMonth?.toString() || "all"}
                onValueChange={(value) => setSelectedMonth(value === "all" ? undefined : parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn tháng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả tháng</SelectItem>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Loại Báo Cáo</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Tổng Quan</SelectItem>
                  <SelectItem value="monthly">Theo Tháng</SelectItem>
                  <SelectItem value="daily">Theo Ngày</SelectItem>
                  <SelectItem value="employee">Theo Nhân Viên</SelectItem>
                  <SelectItem value="products">Theo Sản Phẩm</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {currentReport && (
        <SummaryStats summary={currentReport.summary} />
      )}

      {/* Charts */}
      {currentReport && (
        <Tabs defaultValue="charts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="charts">Biểu Đồ</TabsTrigger>
            <TabsTrigger value="details">Chi Tiết</TabsTrigger>
          </TabsList>

          <TabsContent value="charts" className="space-y-6">
            {/* Revenue Charts */}
            {currentReport.monthly_sales && (
              <RevenueChart
                data={currentReport.monthly_sales}
                type="monthly"
                title="Doanh Thu Theo Tháng"
                description={`Biểu đồ doanh thu 12 tháng năm ${selectedYear}`}
              />
            )}

            {currentReport.daily_sales && (
              <RevenueChart
                data={currentReport.daily_sales}
                type="daily"
                title="Doanh Thu Theo Ngày"
                description={`Biểu đồ doanh thu các ngày trong tháng ${selectedMonth}/${selectedYear}`}
              />
            )}

            <div className="grid gap-6 md:grid-cols-2">
              {/* Employee Performance */}
              {currentReport.employee_sales && currentReport.employee_sales.length > 0 && (
                <EmployeePerformanceChart
                  data={currentReport.employee_sales}
                  type="bar"
                  title="Hiệu Suất Nhân Viên"
                  description="Doanh thu theo nhân viên"
                />
              )}

              {/* Product Sales */}
              {currentReport.product_sales && currentReport.product_sales.length > 0 && (
                <ProductSalesChart
                  data={currentReport.product_sales}
                  type="bar"
                  title="Sản Phẩm Bán Chạy"
                  description="Top 10 sản phẩm bán chạy nhất"
                  showTop={10}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            {/* Detailed Tables */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Employee Details */}
              {currentReport.employee_sales && currentReport.employee_sales.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="mr-2 h-5 w-5" />
                      Chi Tiết Nhân Viên
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {currentReport.employee_sales.map((employee, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                          <div>
                            <p className="font-medium">{employee.employee_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {employee.total_orders} đơn hàng • {employee.total_products_sold} sản phẩm
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND',
                              }).format(employee.total_revenue)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Product Details */}
              {currentReport.product_sales && currentReport.product_sales.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Package className="mr-2 h-5 w-5" />
                      Chi Tiết Sản Phẩm
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {currentReport.product_sales.slice(0, 10).map((product, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                          <div>
                            <p className="font-medium">{product.product_name}</p>
                            <p className="text-sm text-muted-foreground">
                              Đã bán: {product.quantity_sold} sản phẩm
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND',
                              }).format(product.revenue)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {!currentReport && !isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center h-96">
            <div className="text-center">
              <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Không có dữ liệu</h3>
              <p className="text-muted-foreground">
                Không tìm thấy dữ liệu báo cáo cho khoảng thời gian đã chọn
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 