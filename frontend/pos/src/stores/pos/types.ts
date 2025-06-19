import { Category, Product, CartItem, POSCustomer } from '@/types';
import { Discount } from '@/lib/services/discount-service';

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
  
  // Discount states - tách riêng membership và regular discounts
  appliedDiscounts: AppliedDiscount[]; // Regular discounts (gửi tới backend)
  membershipDiscount: MembershipDiscount | null; // Membership discount (chỉ frontend)
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
  
  // Discount actions - cập nhật để tách riêng
  setCouponCode: (code: string) => void;
  applyDiscount: (discount: Discount, discountAmount: number, reason: string) => void;
  removeDiscount: (discountId: number) => void;
  clearDiscounts: () => void;
  getTotalDiscount: () => number; // Tổng cả membership + regular discounts
  getRegularDiscountTotal: () => number; // Chỉ regular discounts (để gửi backend)
  getMembershipDiscountAmount: () => number; // Chỉ membership discount
  getFinalTotal: () => number;
  getProductCount: () => number;
  recalculateMembershipDiscount: () => void;
  clearMembershipDiscount: () => void;
}

export interface CategoryWithImage extends Category {
  firstProductImage?: string;
}

export interface AppliedDiscount {
  discount: Discount;
  discount_amount: number;
  reason: string;
}

// Interface mới cho membership discount
export interface MembershipDiscount {
  membershipType: string;
  discountPercentage: number;
  discountAmount: number;
  customerName: string;
} 