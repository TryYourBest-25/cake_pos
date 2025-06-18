import { Category, Product, CartItem, POSCustomer } from '@/types';
import { Discount, ValidateDiscountResponse } from '@/lib/services/discount-service';

export interface POSState {
  // Categories
  categories: Category[];
  selectedCategoryId: number | null;
  
  // Products
  products: Product[];
  allProducts: Product[];
  
  // Cart
  cart: CartItem[];
  
  // Customer
  selectedCustomer: POSCustomer | null;
  
  // Search
  searchQuery: string;
  
  // Loading states
  isLoadingCategories: boolean;
  isLoadingProducts: boolean;
  
  // New discount states
  appliedDiscounts: AppliedDiscount[];
  couponCode: string;
  isValidatingDiscount: boolean;
  
  // Actions
  setCategories: (categories: Category[]) => void;
  setSelectedCategoryId: (categoryId: number | null) => void;
  setProducts: (products: Product[]) => void;
  setAllProducts: (products: Product[]) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCustomer: (customer: POSCustomer | null) => void;
  setIsLoadingCategories: (loading: boolean) => void;
  setIsLoadingProducts: (loading: boolean) => void;
  
  // Cart actions
  addToCart: (item: Omit<CartItem, 'quantity' | 'total'>) => void;
  removeFromCart: (productPriceId: number) => void;
  updateCartItemQuantity: (productPriceId: number, quantity: number) => void;
  clearCart: () => void;
  
  // Computed values
  getCartTotal: () => number;
  getCartItemCount: () => number;
  getFilteredProducts: () => Product[];
  
  // New discount actions
  setCouponCode: (code: string) => void;
  applyDiscount: (discount: Discount, discountAmount: number, reason: string) => void;
  removeDiscount: (discountId: number) => void;
  clearDiscounts: () => void;
  getTotalDiscount: () => number;
  getFinalTotal: () => number;
  getProductCount: () => number;
}

export interface CategoryWithImage extends Category {
  firstProductImage?: string;
}

export interface AppliedDiscount {
  discount: Discount;
  discount_amount: number;
  reason: string;
} 