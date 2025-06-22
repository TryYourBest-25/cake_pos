"use client";

import { useState, useEffect } from "react";
import { Search, ShoppingCart, User, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { usePOSStore } from "@/stores/pos";
import { categoryService } from "@/lib/services/category-service";
import { productService } from "@/lib/services/product-service";
import { Category, Product, ProductPrice } from "@/types";

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
  const {
    categories,
    selectedCategoryId,
    cart,
    searchQuery,
    isLoadingCategories,
    isLoadingProducts,
    setCategories,
    setSelectedCategoryId,
    setProducts,
    setAllProducts,
    setSearchQuery,
    setIsLoadingCategories,
    setIsLoadingProducts,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    getCartTotal,
    getCartItemCount,
    getFilteredProducts
  } = usePOSStore();

  const [customer] = useState({ name: "James Anderson", phone: "0123456789" });
  const [activeProducts, setActiveProducts] = useState<(Product & { activePrice?: ProductPrice })[]>([]);

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const result = await categoryService.getAll({ limit: 100 });
        setCategories(result.data);
        
        // Set first category as selected if none selected
        if (!selectedCategoryId && result.data.length > 0) {
          setSelectedCategoryId(result.data[0].category_id);
        }
      } catch (error) {
        console.error('Lỗi khi tải danh mục:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  // Load all products on mount
  useEffect(() => {
    const loadAllProducts = async () => {
      try {
        setIsLoadingProducts(true);
        const result = await productService.getAll({ limit: 100 });
        setAllProducts(result.data);
      } catch (error) {
        console.error('Lỗi khi tải tất cả sản phẩm:', error);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    loadAllProducts();
  }, []);

  // Load products by category
  useEffect(() => {
    if (!selectedCategoryId) return;

    const loadProductsByCategory = async () => {
      try {
        setIsLoadingProducts(true);
        const result = await productService.getByCategory(selectedCategoryId, { limit: 100 });
        setProducts(result.data);
      } catch (error) {
        console.error('Lỗi khi tải sản phẩm theo danh mục:', error);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    loadProductsByCategory();
  }, [selectedCategoryId]);

  // Load product prices for filtered products
  useEffect(() => {
    const loadProductPrices = async () => {
      const filteredProducts = getFilteredProducts();
      const productsWithPrices = await Promise.all(
        filteredProducts.map(async (product) => {
          try {
            const prices = await productService.getProductPrices(product.product_id);
            const activePrice = prices.find(p => p.is_active);
            return { ...product, activePrice };
          } catch (error) {
            console.error(`Lỗi khi tải giá sản phẩm ${product.product_id}:`, error);
            return product;
          }
        })
      );
      setActiveProducts(productsWithPrices);
    };

    const filteredProducts = getFilteredProducts();
    if (filteredProducts.length > 0) {
      loadProductPrices();
    }
  }, [getFilteredProducts()]);

  const handleAddToCart = (product: Product & { activePrice?: ProductPrice }) => {
    if (!product.activePrice) {
      console.error('Sản phẩm không có giá active');
      return;
    }

    addToCart({
      product_price_id: product.activePrice.product_price_id,
      product: {
        product_id: product.product_id,
        name: product.name,
        image_path: product.image_path
      },
      product_size: product.activePrice.product_size || {
        size_id: product.activePrice.size_id,
        name: 'Standard',
        unit: 'pcs'
      },
      price: product.activePrice.price
    });
  };

  const subtotal = getCartTotal();
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

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

  return (
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
                    <span className="text-lg">{getCategoryIcon(category.name)}</span>
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
              {activeProducts.map((product) => (
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
                      {product.activePrice ? (
                        <>
                          <p className="text-lg font-bold text-blue-600 mb-3">
                            {formatPrice(product.activePrice.price)}
                          </p>
                          <Button 
                            onClick={() => handleAddToCart(product)}
                            className="w-full"
                            size="sm"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Thêm
                          </Button>
                        </>
                      ) : (
                        <p className="text-sm text-gray-500 mb-3">Chưa có giá</p>
                      )}
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
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Thông tin khách hàng</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-xs">
                    {getInitials(customer.name)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-sm">{customer.name}</p>
                  <p className="text-xs text-gray-500">{customer.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>
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
              <div className="flex justify-between text-sm">
                <span>VAT (10%):</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Tổng cộng:</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Button className="w-full" size="lg">
                Thanh toán
              </Button>
              <Button variant="outline" className="w-full">
                Lưu đơn hàng
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 