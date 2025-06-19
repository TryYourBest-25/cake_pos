import { CartItem, Category, Product, POSCustomer } from '@/types';
import { POSState, MembershipDiscount } from './types';
import { Discount } from '@/lib/services/discount-service';

export function createPOSActions(set: any, get: () => POSState) {
  return {
    // Basic setters
    setCategories: (categories: Category[]) => set({ categories }),
    setSelectedCategoryId: (categoryId: number | null) => set({ selectedCategoryId: categoryId }),
    setProducts: (products: Product[]) => set({ products }),
    setAllProducts: (products: Product[]) => set({ allProducts: products }),
    setSearchQuery: (query: string) => set({ searchQuery: query }),
    setSelectedCustomer: (customer: POSCustomer | null) => {
      // Tính toán membership discount nếu có
      let membershipDiscount: MembershipDiscount | null = null;
      
      if (customer?.membership_type && customer.membership_type.discount_value > 0) {
        const cartTotal = get().getCartTotal();
        const membershipDiscountAmount = (cartTotal * customer.membership_type.discount_value) / 100;
        
        if (membershipDiscountAmount > 0) {
          membershipDiscount = {
            membershipType: customer.membership_type.type,
            discountPercentage: customer.membership_type.discount_value,
            discountAmount: membershipDiscountAmount,
            customerName: customer.name
          };
        }
      }
      
      set({ selectedCustomer: customer, membershipDiscount });
    },
    setIsLoadingCategories: (loading: boolean) => set({ isLoadingCategories: loading }),
    setIsLoadingProducts: (loading: boolean) => set({ isLoadingProducts: loading }),
    
    // Cart actions
    addToCart: (item: Omit<CartItem, 'quantity' | 'total'>) => {
      const { cart } = get();
      const existingItem = cart.find(cartItem => cartItem.product_price_id === item.product_price_id);
      
      let updatedCart;
      if (existingItem) {
        // Update quantity if item already exists
        updatedCart = cart.map(cartItem =>
          cartItem.product_price_id === item.product_price_id
            ? { ...cartItem, quantity: cartItem.quantity + 1, total: (cartItem.quantity + 1) * cartItem.price }
            : cartItem
        );
      } else {
        // Add new item
        const newItem: CartItem = {
          ...item,
          quantity: 1,
          total: item.price
        };
        updatedCart = [...cart, newItem];
      }
      
      set({ cart: updatedCart });
      
      // Recalculate membership discount if customer has membership
      get().recalculateMembershipDiscount();
    },
    
    removeFromCart: (productPriceId: number) => {
      const { cart } = get();
      const updatedCart = cart.filter(item => item.product_price_id !== productPriceId);
      set({ cart: updatedCart });
      
      // Recalculate membership discount if customer has membership
      get().recalculateMembershipDiscount();
    },
    
    updateCartItemQuantity: (productPriceId: number, quantity: number) => {
      const { cart } = get();
      let updatedCart;
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        updatedCart = cart.filter(item => item.product_price_id !== productPriceId);
      } else {
        // Update quantity and total
        updatedCart = cart.map(item =>
          item.product_price_id === productPriceId
            ? { ...item, quantity, total: quantity * item.price }
            : item
        );
      }
      
      set({ cart: updatedCart });
      
      // Recalculate membership discount if customer has membership
      get().recalculateMembershipDiscount();
    },
    
    clearCart: () => {
      set({ cart: [], membershipDiscount: null });
    },

    // Membership discount methods
    recalculateMembershipDiscount: () => {
      const { selectedCustomer } = get();
      
      if (!selectedCustomer?.membership_type || selectedCustomer.membership_type.discount_value <= 0) {
        set({ membershipDiscount: null });
        return;
      }
      
      const cartTotal = get().getCartTotal();
      const membershipDiscountAmount = (cartTotal * selectedCustomer.membership_type.discount_value) / 100;
      
      if (membershipDiscountAmount > 0) {
        const membershipDiscount: MembershipDiscount = {
          membershipType: selectedCustomer.membership_type.type,
          discountPercentage: selectedCustomer.membership_type.discount_value,
          discountAmount: membershipDiscountAmount,
          customerName: selectedCustomer.name
        };
        set({ membershipDiscount });
      } else {
        set({ membershipDiscount: null });
      }
    },

    clearMembershipDiscount: () => {
      set({ membershipDiscount: null });
    },
    
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

    // Regular discount actions (chỉ cho discounts gửi tới backend)
    setCouponCode: (code: string) => set({ couponCode: code }),
    
    applyDiscount: (discount: Discount, discountAmount: number, reason: string) => {
      const { appliedDiscounts } = get();
      
      // Chỉ cho phép regular discounts (không phải membership)
      if (reason === 'membership') {
        console.warn('Membership discounts should not be added as regular discounts');
        return;
      }
      
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
    
    // Discount calculation methods
    getRegularDiscountTotal: () => {
      return get().appliedDiscounts.reduce((total, applied) => total + applied.discount_amount, 0);
    },

    getMembershipDiscountAmount: () => {
      return get().membershipDiscount?.discountAmount || 0;
    },
    
    getTotalDiscount: () => {
      return get().getRegularDiscountTotal() + get().getMembershipDiscountAmount();
    },
    
    getFinalTotal: () => {
      const cartTotal = get().getCartTotal();
      const totalDiscount = get().getTotalDiscount();
      return Math.max(0, cartTotal - totalDiscount);
    },
    
    getProductCount: () => {
      return get().cart.length;
    },
  };
} 