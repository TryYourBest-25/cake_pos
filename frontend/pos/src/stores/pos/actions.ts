import { CartItem, Category, Product, POSCustomer } from '@/types';
import { POSState, AppliedDiscount } from './types';
import { Discount } from '@/lib/services/discount-service';

export function createPOSActions(set: any, get: () => POSState) {
  return {
    // Basic setters
    setCategories: (categories: Category[]) => set({ categories }),
    setSelectedCategoryId: (categoryId: number | null) => set({ selectedCategoryId: categoryId }),
    setProducts: (products: Product[]) => set({ products }),
    setAllProducts: (products: Product[]) => set({ allProducts: products }),
    setSearchQuery: (query: string) => set({ searchQuery: query }),
    setSelectedCustomer: (customer: POSCustomer | null) => set({ selectedCustomer: customer }),
    setIsLoadingCategories: (loading: boolean) => set({ isLoadingCategories: loading }),
    setIsLoadingProducts: (loading: boolean) => set({ isLoadingProducts: loading }),
    
    // Cart actions
    addToCart: (item: Omit<CartItem, 'quantity' | 'total'>) => {
      const { cart } = get();
      const existingItem = cart.find(cartItem => cartItem.product_price_id === item.product_price_id);
      
      if (existingItem) {
        // Update quantity if item already exists
        const updatedCart = cart.map(cartItem =>
          cartItem.product_price_id === item.product_price_id
            ? { ...cartItem, quantity: cartItem.quantity + 1, total: (cartItem.quantity + 1) * cartItem.price }
            : cartItem
        );
        set({ cart: updatedCart });
      } else {
        // Add new item
        const newItem: CartItem = {
          ...item,
          quantity: 1,
          total: item.price
        };
        set({ cart: [...cart, newItem] });
      }
    },
    
    removeFromCart: (productPriceId: number) => {
      const { cart } = get();
      set({ cart: cart.filter(item => item.product_price_id !== productPriceId) });
    },
    
    updateCartItemQuantity: (productPriceId: number, quantity: number) => {
      const { cart } = get();
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        set({ cart: cart.filter(item => item.product_price_id !== productPriceId) });
      } else {
        // Update quantity and total
        const updatedCart = cart.map(item =>
          item.product_price_id === productPriceId
            ? { ...item, quantity, total: quantity * item.price }
            : item
        );
        set({ cart: updatedCart });
      }
    },
    
    clearCart: () => set({ cart: [] }),
    
    // Computed values
    getCartTotal: () => {
      const { cart } = get();
      return cart.reduce((total, item) => total + item.total, 0);
    },
    
    getCartItemCount: () => {
      const { cart } = get();
      return cart.reduce((count, item) => count + item.quantity, 0);
    },
    
    getFilteredProducts: () => {
      const { products, allProducts, selectedCategoryId, searchQuery } = get();
      
      let filteredProducts = selectedCategoryId ? products : allProducts;
      
      if (searchQuery.trim()) {
        filteredProducts = filteredProducts.filter(product =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      return filteredProducts;
    },

    // New discount actions
    setCouponCode: (code: string) => set({ couponCode: code }),
    
    applyDiscount: (discount: Discount, discountAmount: number, reason: string) => {
      const { appliedDiscounts } = get();
      
      // Check if discount already applied
      const existingIndex = appliedDiscounts.findIndex(
        (applied) => applied.discount.discount_id === discount.discount_id
      );
      
      if (existingIndex >= 0) {
        // Update existing discount
        const updatedDiscounts = [...appliedDiscounts];
        updatedDiscounts[existingIndex] = { discount, discount_amount: discountAmount, reason };
        set({ appliedDiscounts: updatedDiscounts });
      } else {
        // Add new discount
        set({ 
          appliedDiscounts: [...appliedDiscounts, { discount, discount_amount: discountAmount, reason }]
        });
      }
    },
    
    removeDiscount: (discountId: number) => {
      const { appliedDiscounts } = get();
      set({ 
        appliedDiscounts: appliedDiscounts.filter(
          (applied) => applied.discount.discount_id !== discountId
        )
      });
    },
    
    clearDiscounts: () => set({ appliedDiscounts: [] }),
    
    getTotalDiscount: () => {
      return get().appliedDiscounts.reduce((total, applied) => total + applied.discount_amount, 0);
    },
    
    getFinalTotal: () => {
      const cartTotal = get().getCartTotal();
      const discountTotal = get().getTotalDiscount();
      return Math.max(0, cartTotal - discountTotal);
    },
    
    getProductCount: () => {
      return get().cart.length;
    },
  };
} 