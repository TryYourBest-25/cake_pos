import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  Tag, 
  Ruler,
  ArrowRight,
  Plus
} from "lucide-react";
import Link from "next/link";

const productCategories = [
  {
    title: "Danh Mục",
    description: "Quản lý danh mục sản phẩm và phân loại",
    icon: Tag,
    href: "/products/categories",
    count: 8,
    color: "text-blue-600"
  },
  {
    title: "Kích Thước", 
    description: "Quản lý kích thước sản phẩm cho từng loại",
    icon: Ruler,
    href: "/products/product-sizes",
    count: 12,
    color: "text-green-600"
  },
  {
    title: "Sản Phẩm",
    description: "Quản lý thông tin sản phẩm và giá cả",
    icon: Package,
    href: "/products/items", 
    count: 64,
    color: "text-purple-600"
  }
];

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sản Phẩm</h1>
          <p className="text-muted-foreground">
            Quản lý tất cả sản phẩm, danh mục và kích thước trong hệ thống
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/products/categories">
              <Plus className="mr-2 h-4 w-4" />
              Thêm Danh Mục
            </Link>
          </Button>
          <Button asChild>
            <Link href="/products/items">
              <Plus className="mr-2 h-4 w-4" />
              Thêm Sản Phẩm
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        {productCategories.map((category) => {
          const Icon = category.icon;
          return (
            <Card key={category.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {category.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${category.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{category.count}</div>
                <p className="text-xs text-muted-foreground">
                  Tổng số {category.title.toLowerCase()}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Product Categories */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {productCategories.map((category) => {
          const Icon = category.icon;
          return (
            <Card key={category.title} className="group hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-muted ${category.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {category.count} {category.title.toLowerCase()}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {category.description}
                </p>
                <Button asChild variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Link href={category.href}>
                    Quản lý {category.title}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Hoạt Động Gần Đây</CardTitle>
          <CardDescription>
            Các hoạt động liên quan đến sản phẩm trong 7 ngày qua
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-full">
                <Package className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Sản phẩm mới được thêm</p>
                <p className="text-xs text-muted-foreground">Bánh kem chocolate - Danh mục bánh kem</p>
              </div>
              <span className="text-xs text-muted-foreground">2 giờ trước</span>
            </div>
            
            <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-full">
                <Tag className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Danh mục mới được tạo</p>
                <p className="text-xs text-muted-foreground">Bánh Cupcake - Dành cho bánh cỡ nhỏ</p>
              </div>
              <span className="text-xs text-muted-foreground">5 giờ trước</span>
            </div>
            
            <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
              <div className="p-2 bg-purple-100 rounded-full">
                <Ruler className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Kích thước mới được thêm</p>
                <p className="text-xs text-muted-foreground">XXL - 12 inch cho bánh lớn</p>
              </div>
              <span className="text-xs text-muted-foreground">1 ngày trước</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 