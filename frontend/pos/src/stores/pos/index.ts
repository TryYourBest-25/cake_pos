import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { POSState } from './types';
import { createPOSActions } from './actions';

export const usePOSStore = create<POSState>()(
  persist(
    (set, get) => ({
      // Initial state
      categories: [],
      selectedCategoryId: null,
      products: [],
      allProducts: [],
      cart: [],
      selectedCustomer: null,
      searchQuery: '',
      isLoadingCategories: false,
      isLoadingProducts: false,
      
      // Discount states - tách riêng membership và regular
      appliedDiscounts: [], // Regular discounts
      membershipDiscount: null, // Membership discount
      couponCode: '',
      isValidatingDiscount: false,
      
      // All actions (including discount actions)
      ...createPOSActions(set, get),
    }),
    {
      name: 'pos-storage',
      partialize: (state) => ({
        cart: state.cart,
        selectedCategoryId: state.selectedCategoryId,
        appliedDiscounts: state.appliedDiscounts,
        // Không persist membershipDiscount vì nó phụ thuộc vào customer
      }),
    }
  )
);

export * from './types'; 