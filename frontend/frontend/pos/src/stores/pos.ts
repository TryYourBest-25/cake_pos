import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Category, Product, CartItem, POSCustomer } from '@/types';

interface POSState {
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
}

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
      
      // Actions
      setCategories: (categories) => set({ categories }),
      setSelectedCategoryId: (categoryId) => set({ selectedCategoryId: categoryId }),
      setProducts: (products) => set({ products }),
      setAllProducts: (products) => set({ allProducts: products }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),
      setIsLoadingCategories: (loading) => set({ isLoadingCategories: loading }),
      setIsLoadingProducts: (loading) => set({ isLoadingProducts: loading }),
      
      // Cart actions
      addToCart: (item) => {
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
      
      removeFromCart: (productPriceId) => {
        const { cart } = get();
        set({ cart: cart.filter(item => item.product_price_id !== productPriceId) });
      },
      
      updateCartItemQuantity: (productPriceId, quantity) => {
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
      }
    }),
    {
      name: 'pos-store',
      partialize: (state) => ({
        cart: state.cart,
        selectedCustomer: state.selectedCustomer,
        selectedCategoryId: state.selectedCategoryId
      })
    }
  )
); 