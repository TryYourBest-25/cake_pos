"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ShoppingCart, User, Plus, Minus, Crown, Gift, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { usePOSStore } from "@/stores/pos";
import { usePOSData } from "@/hooks/use-pos-data";
import { ProductDetailDialog } from "@/components/pos/product-detail-dialog";
import { CustomerSearchDialog } from "@/components/pos/customer-search-dialog";
import { CouponDialog } from "@/components/pos/coupon-dialog";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Product, POSCustomer } from "@/types";

// Category icons mapping
const categoryIcons: Record<string, string> = {
  "Bánh Sinh Nhật": "🎂",
  "Bánh Cupcake": "🧁", 
  "Bánh Tart": "🥧",
  "Bánh Cookies": "🍪",
  "Đồ Uống": "☕",
  "Phụ Kiện": "🎁",
  "Bánh Ngọt": "🍰",
  "Bánh Mì": "🥖",
  "Kem": "🍦"
};

export default function POSPage() {
  const router = useRouter();
  const {
    selectedCategoryId,
    cart,
    searchQuery,
    appliedDiscounts,
    membershipDiscount,
    selectedCustomer,
    setSelectedCategoryId,
    setSearchQuery,
    setSelectedCustomer,
    updateCartItemQuantity,
    removeFromCart,
    removeDiscount,
    getCartTotal,
    getTotalDiscount,
    getRegularDiscountTotal,
    getMembershipDiscountAmount,
    getFilteredProducts
  } = usePOSStore();

  // Use optimized data hook
  const { categories, isLoadingCategories, isLoadingProducts } = usePOSData();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [isCouponDialogOpen, setIsCouponDialogOpen] = useState(false);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsProductDialogOpen(true);
  };

  const closeProductDialog = () => {
    setIsProductDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleCustomerSelect = (newCustomer: POSCustomer) => {
    setSelectedCustomer(newCustomer);
  };

  const openCustomerDialog = () => {
    setIsCustomerDialogOpen(true);
  };

  const closeCustomerDialog = () => {
    setIsCustomerDialogOpen(false);
  };

  const openCouponDialog = () => {
    setIsCouponDialogOpen(true);
  };

  const closeCouponDialog = () => {
    setIsCouponDialogOpen(false);
  };

  // Debug function to clear localStorage and refresh
  const handleDebugClear = () => {
    localStorage.removeItem('pos-storage');
    window.location.reload();
  };

  const subtotal = getCartTotal();
  const discountAmount = getTotalDiscount();
  const total = subtotal - discountAmount;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Helper function to get initials
  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  // Get category icon
  const getCategoryIcon = (categoryName: string) => {
    return categoryIcons[categoryName] || "📦";
  };

  // Get minimum price of a product
  const getMinPrice = (product: Product) => {
    if (!product.product_price || product.product_price.length === 0) {
      return null;
    }
    
    const activePrices = product.product_price.filter(price => price.is_active);
    if (activePrices.length === 0) {
      return null;
    }
    
    return Math.min(...activePrices.map(price => price.price));
  };

  return (
    <AuthGuard>
      <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Categories */}
      <div className="w-64 bg-white shadow-sm border-r">
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">🧁</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Cake POS</h1>
          </div>
          
          <nav className="space-y-2">
            {isLoadingCategories ? (
              <div className="text-center py-4">
                <div className="text-sm text-gray-500">Đang tải danh mục...</div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setSelectedCategoryId(null)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    selectedCategoryId === null
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">📦</span>
                  <span className="font-medium">Tất cả</span>
                </button>
                {categories.map((category) => (
                  <button
                    key={category.category_id}
                    onClick={() => setSelectedCategoryId(category.category_id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      selectedCategoryId === category.category_id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {(category as any).firstProductImage ? (
                      <img 
                        src={(category as any).firstProductImage} 
                        alt={category.name}
                        className="w-6 h-6 object-cover rounded"
                      />
                    ) : (
                      <span className="text-lg">{getCategoryIcon(category.name)}</span>
                    )}
                    <span className="font-medium">{category.name}</span>
                  </button>
                ))}
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <User className="w-4 h-4 mr-2" />
                Tài khoản
              </Button>
              {process.env.NODE_ENV === 'development' && (
                <Button variant="outline" size="sm" onClick={handleDebugClear}>
                  🐛 Clear Cache
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Products Grid */}
        <div className="flex-1 p-6">
          {isLoadingProducts ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-lg text-gray-500">Đang tải sản phẩm...</div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {getFilteredProducts().map((product) => (
                <Card key={product.product_id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-4xl mb-2">
                        {product.image_path ? (
                          <img 
                            src={product.image_path} 
                            alt={product.name}
                            className="w-16 h-16 mx-auto object-cover rounded"
                          />
                        ) : (
                          getCategoryIcon(product.category?.name || '')
                        )}
                      </div>
                      <h3 className="font-medium text-sm mb-2 line-clamp-2">{product.name}</h3>
                      <div className="mb-3">
                        {getMinPrice(product) ? (
                          <>
                            <p className="text-sm font-semibold text-blue-600 mb-1">
                              Từ {formatPrice(getMinPrice(product)!)}
                            </p>
                            <p className="text-xs text-gray-500">Xem chi tiết để chọn size</p>
                          </>
                        ) : (
                          <p className="text-sm text-gray-500">Chưa có giá</p>
                        )}
                      </div>
                      <Button 
                        onClick={() => handleProductClick(product)}
                        className="w-full"
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Thêm
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order Panel */}
      <div className="w-96 bg-white shadow-sm border-l">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold mb-4">Đơn hàng</h2>
          
          {/* Customer Info */}
          <Card className="mb-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={openCustomerDialog}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                Thông tin khách hàng
                <Search className="w-4 h-4 text-gray-400" />
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {selectedCustomer ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-xs">
                        {getInitials(selectedCustomer.name)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{selectedCustomer.name}</p>
                      <p className="text-xs text-gray-500">{selectedCustomer.phone}</p>
                      {selectedCustomer.isGuest && (
                        <p className="text-xs text-blue-600">Khách mới</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Membership Info */}
                  {selectedCustomer.membership_type && (
                    <div className="bg-gray-50 rounded-lg p-3 border">
                      <div className="flex items-center space-x-2 mb-2">
                        <Crown className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium text-gray-700">Hạng thành viên</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-blue-600">
                          {selectedCustomer.membership_type.type}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>Giảm giá: {selectedCustomer.membership_type.discount_value}%</span>
                          <div className="flex items-center space-x-1">
                            <Gift className="w-3 h-3" />
                            <span>{selectedCustomer.current_points || 0} điểm</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3 text-gray-500">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Chưa chọn khách hàng</p>
                    <p className="text-xs">Nhấn để tìm kiếm hoặc thêm khách hàng</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Discount Section */}
        <div className="px-4 py-2 border-b">
          {/* Membership Discount */}
          {membershipDiscount && (
            <div className="mb-3">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Ưu đãi thành viên</h3>
              <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                <div className="flex items-center space-x-2">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-700">
                      {membershipDiscount.membershipType}
                    </p>
                    <p className="text-xs text-yellow-600">
                      -{formatPrice(membershipDiscount.discountAmount)} ({membershipDiscount.discountPercentage}%)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Regular Discounts */}
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Mã giảm giá</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={openCouponDialog}
              className="h-8 px-3"
            >
              <Tag className="w-3 h-3 mr-1" />
              Thêm mã
            </Button>
          </div>
          
          {appliedDiscounts.length > 0 && (
            <div className="space-y-2">
              {appliedDiscounts.map((appliedDiscount) => (
                <div
                  key={appliedDiscount.discount.discount_id}
                  className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-2"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-700">
                      {appliedDiscount.discount.name}
                    </p>
                    <p className="text-xs text-green-600">
                      -{formatPrice(appliedDiscount.discount_amount)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDiscount(appliedDiscount.discount.discount_id)}
                    className="h-6 w-6 p-0 text-green-600 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">Giỏ hàng trống</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <Card key={item.product_price_id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.product.name}</h4>
                      <p className="text-xs text-gray-500">
                        {item.product_size.name} - {formatPrice(item.price)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateCartItemQuantity(item.product_price_id, item.quantity - 1)}
                        className="w-6 h-6 p-0"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateCartItemQuantity(item.product_price_id, item.quantity + 1)}
                        className="w-6 h-6 p-0"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.product_price_id)}
                      className="text-red-500 hover:text-red-700 p-0 h-auto"
                    >
                      Xóa
                    </Button>
                    <p className="font-medium text-sm">{formatPrice(item.total)}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Order Summary */}
        {cart.length > 0 && (
          <div className="border-t p-4">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Tạm tính:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              
              {/* Membership Discount */}
              {getMembershipDiscountAmount() > 0 && (
                <div className="flex justify-between text-sm text-yellow-600">
                  <span>Ưu đãi thành viên:</span>
                  <span>-{formatPrice(getMembershipDiscountAmount())}</span>
                </div>
              )}
              
              {/* Regular Discounts */}
              {getRegularDiscountTotal() > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Mã giảm giá:</span>
                  <span>-{formatPrice(getRegularDiscountTotal())}</span>
                </div>
              )}
              
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Tổng cộng:</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => router.push('/checkout')}
              >
                Thanh toán
              </Button>
              <Button variant="outline" className="w-full">
                Lưu đơn hàng
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Product Detail Dialog */}
      <ProductDetailDialog
        product={selectedProduct}
        isOpen={isProductDialogOpen}
        onClose={closeProductDialog}
      />

      {/* Customer Search Dialog */}
      <CustomerSearchDialog
        isOpen={isCustomerDialogOpen}
        onClose={closeCustomerDialog}
        onSelectCustomer={handleCustomerSelect}
        currentCustomer={selectedCustomer || undefined}
      />

      {/* Coupon Dialog */}
      <CouponDialog
        isOpen={isCouponDialogOpen}
        onClose={closeCouponDialog}
        customer={selectedCustomer}
      />
    </div>
    </AuthGuard>
  );
} 