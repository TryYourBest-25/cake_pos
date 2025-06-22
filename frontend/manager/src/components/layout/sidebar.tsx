"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUIStore } from "@/stores/ui";
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  BarChart3,
  ChevronDown,
  User,
  UserCheck,
  UserX,
  Tag,
  Ruler,
  CheckCircle,
  Clock,
  XCircle,
  Gift
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface NavItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Người Dùng",
    icon: Users,
    children: [
      {
        title: "Quản lý",
        href: "/users/managers",
        icon: User,
      },
      {
        title: "Nhân viên",
        href: "/users/employees", 
        icon: UserCheck,
      },
      {
        title: "Khách hàng",
        href: "/users/customers",
        icon: UserX,
      },
    ],
  },
  {
    title: "Sản Phẩm",
    icon: Package,
    children: [
      {
        title: "Danh mục",
        href: "/products/categories",
        icon: Tag,
      },
      {
        title: "Kích thước sản phẩm",
        href: "/products/product-sizes",
        icon: Ruler,
      },
    ],
  },
  {
    title: "Khuyến Mãi", 
    href: "/promotions",
    icon: Gift,
  },
  {
    title: "Đơn Hàng",
    icon: ShoppingCart,
    children: [
      {
        title: "Đang Xử Lý",
        href: "/orders/processing",
        icon: Clock,
      },
      {
        title: "Đã Hoàn Thành",
        href: "/orders/completed",
        icon: CheckCircle,
      },
      {
        title: "Đã Hủy",
        href: "/orders/cancelled",
        icon: XCircle,
      },
    ],
  },
  {
    title: "Báo Cáo",
    href: "/reports",
    icon: BarChart3,
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { sidebarCollapsed } = useUIStore();
  const [openItems, setOpenItems] = React.useState<string[]>([]);

  const toggleItem = (title: string) => {
    setOpenItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const renderNavItem = (item: NavItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openItems.includes(item.title);
    const isActive = item.href ? pathname === item.href : false;

    if (hasChildren) {
      return (
        <Collapsible key={item.title} open={isOpen} onOpenChange={() => toggleItem(item.title)}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2 px-3 py-2 text-left font-normal",
                level > 0 && "ml-4 pl-8"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="flex-1">{item.title}</span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1">
            {item.children?.map(child => renderNavItem(child, level + 1))}
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return (
      <Button
        key={item.title}
        asChild
        variant={isActive ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start gap-2 px-3 py-2 font-normal",
          level > 0 && "ml-4 pl-8"
        )}
      >
        <Link href={item.href!}>
          <item.icon className="h-4 w-4" />
          <span>{item.title}</span>
        </Link>
      </Button>
    );
  };

  return (
    <div className={cn(
      "border-r bg-card transition-all duration-300",
      sidebarCollapsed ? "w-16" : "w-64",
      className
    )}>
      <div className="p-6">
        <h2 className={cn(
          "text-lg font-semibold transition-opacity duration-300",
          sidebarCollapsed ? "opacity-0" : "opacity-100"
        )}>
          {!sidebarCollapsed && "Quản Lý Cửa Hàng"}
        </h2>
      </div>
      <ScrollArea className="h-[calc(100vh-80px)]">
        <div className="space-y-1 p-2">
          {navItems.map(item => renderNavItem(item))}
        </div>
      </ScrollArea>
    </div>
  );
} 