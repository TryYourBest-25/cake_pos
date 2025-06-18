"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, X } from 'lucide-react';
import { Product, ProductPrice } from '@/types';
import { productService } from '@/lib/services/product-service';
import { usePOSStore } from '@/stores/pos';

interface ProductDetailDialogProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetailDialog({ product, isOpen, onClose }: ProductDetailDialogProps) {
  const [productPrices, setProductPrices] = useState<ProductPrice[]>([]);
  const [selectedPrice, setSelectedPrice] = useState<ProductPrice | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const { addToCart } = usePOSStore();

  // Load product prices when dialog opens
  useEffect(() => {
    if (!product || !isOpen) {
      setProductPrices([]);
      setSelectedPrice(null);
      setQuantity(1);
      return;
    }

    const loadProductPrices = async () => {
      try {
        setIsLoading(true);
        const prices = await productService.getProductPrices(product.product_id);
        const activePrices = prices.filter(p => p.is_active);
        setProductPrices(activePrices);
        
        // Select first active price by default
        if (activePrices.length > 0) {
          setSelectedPrice(activePrices[0]);
        }
      } catch (error) {
        console.error('Lỗi khi tải giá sản phẩm:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProductPrices();
  }, [product, isOpen]);

  const handleAddToCart = () => {
    if (!selectedPrice || !product) return;

    for (let i = 0; i < quantity; i++) {
      addToCart({
        product_price_id: selectedPrice.product_price_id,
        product: {
          product_id: product.product_id,
          name: product.name,
          image_path: product.image_path
        },
        product_size: selectedPrice.product_size || {
          size_id: selectedPrice.size_id,
          name: 'Standard',
          unit: 'pcs'
        },
        price: selectedPrice.price
      });
    }

    onClose();
    setQuantity(1);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getCategoryIcon = (categoryName?: string) => {
    const icons: Record<string, string> = {
      "Bánh Sinh Nhật": "🎂",
      "Bánh Cupcake": "🧁", 
      "Bánh Tart": "🥧",
      "Bánh Cookies": "🍪",
      "Đồ Uống": "☕",
      "Phụ Kiện": "🎁",
    };
    return icons[categoryName || ''] || "📦";
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Chi tiết sản phẩm</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Info */}
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              {product.image_path ? (
                <img 
                  src={product.image_path} 
                  alt={product.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center text-3xl">
                  {getCategoryIcon(product.category?.name)}
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{product.name}</h3>
              {product.category && (
                <Badge variant="secondary" className="mt-1">
                  {product.category.name}
                </Badge>
              )}
              {product.is_signature && (
                <Badge variant="outline" className="mt-1 ml-2">
                  Đặc biệt
                </Badge>
              )}
              {product.description && (
                <p className="text-sm text-gray-600 mt-2">{product.description}</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Size Selection */}
          <div>
            <h4 className="font-medium mb-3">Chọn kích thước</h4>
            {isLoading ? (
              <div className="text-center py-4">
                <div className="text-sm text-gray-500">Đang tải...</div>
              </div>
            ) : productPrices.length === 0 ? (
              <div className="text-center py-4">
                <div className="text-sm text-gray-500">Sản phẩm chưa có giá</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {productPrices.map((priceItem) => (
                  <Card 
                    key={priceItem.product_price_id}
                    className={`cursor-pointer transition-colors ${
                      selectedPrice?.product_price_id === priceItem.product_price_id
                        ? 'ring-2 ring-blue-500 bg-blue-50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedPrice(priceItem)}
                  >
                    <CardContent className="p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">
                            {priceItem.product_size?.name || 'Standard'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {priceItem.product_size?.quantity} {priceItem.product_size?.unit || 'pcs'}
                          </div>
                          {priceItem.product_size?.description && (
                            <div className="text-xs text-gray-400 mt-1">
                              {priceItem.product_size.description}
                            </div>
                          )}
                        </div>
                        <div className="text-lg font-bold text-blue-600">
                          {formatPrice(priceItem.price)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Quantity Selection */}
          {selectedPrice && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-3">Số lượng</h4>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="font-medium text-lg w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="font-medium">Tổng cộng:</span>
                <span className="text-xl font-bold text-blue-600">
                  {formatPrice(selectedPrice.price * quantity)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Hủy
                </Button>
                <Button onClick={handleAddToCart} className="flex-1">
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm vào giỏ
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 