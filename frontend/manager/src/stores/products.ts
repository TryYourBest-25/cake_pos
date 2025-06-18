"use client";

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Product, ProductPrice, PaginatedResponse, BulkDeleteResponse } from '@/types/api';
import { productService } from '@/lib/services/product-service';
import { 
  CreateProductFormData, 
  UpdateProductFormData,
  CreateProductPriceFormData,
  UpdateProductPriceFormData,
  BulkDeleteProductFormData 
} from '@/lib/validations/product';
import { toast } from 'sonner';

interface ProductState {
  // State
  products: Product[];
  selectedProducts: Product[];
  currentProduct: Product | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  
  // Price management states
  isCreatingPrice: boolean;
  isUpdatingPrice: boolean;
  isDeletingPrice: boolean;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  
  // Selection
  selectedIds: Set<number>;
  
  // Filters
  categoryFilter: number | null;
  isSignatureFilter: boolean | null;
  searchQuery: string;
  
  // Actions - Products
  fetchProducts: (params?: { 
    page?: number; 
    limit?: number; 
    search?: string;
    category_id?: number;
    is_signature?: boolean;
  }) => Promise<void>;
  fetchProductById: (id: number) => Promise<void>;
  fetchProductsByCategory: (categoryId: number, params?: { page?: number; limit?: number; search?: string }) => Promise<void>;
  createProduct: (data: CreateProductFormData) => Promise<Product | null>;
  updateProduct: (id: number, data: UpdateProductFormData) => Promise<Product | null>;
  deleteProduct: (id: number) => Promise<boolean>;
  bulkDeleteProducts: (data: BulkDeleteProductFormData) => Promise<BulkDeleteResponse>;
  
  // Actions - Product Prices
  fetchProductPrices: (productId: number) => Promise<ProductPrice[]>;
  createProductPrice: (data: CreateProductPriceFormData) => Promise<ProductPrice | null>;
  updateProductPrice: (priceId: number, data: UpdateProductPriceFormData) => Promise<ProductPrice | null>;
  deleteProductPrice: (priceId: number) => Promise<boolean>;
  bulkDeleteProductPrices: (priceIds: number[]) => Promise<BulkDeleteResponse>;
  
  // Selection actions
  selectProduct: (id: number) => void;
  deselectProduct: (id: number) => void;
  selectAllProducts: () => void;
  deselectAllProducts: () => void;
  
  // Filter actions
  setCategoryFilter: (categoryId: number | null) => void;
  setIsSignatureFilter: (isSignature: boolean | null) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
  
  // UI actions
  setCurrentProduct: (product: Product | null) => void;
  clearError: () => void;
  resetState: () => void;
}

const initialState = {
  products: [],
  selectedProducts: [],
  currentProduct: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  isCreatingPrice: false,
  isUpdatingPrice: false,
  isDeletingPrice: false,
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 10,
  selectedIds: new Set<number>(),
  categoryFilter: null,
  isSignatureFilter: null,
  searchQuery: '',
};

export const useProductStore = create<ProductState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // === PRODUCT ACTIONS ===

      fetchProducts: async (params = {}) => {
        set({ isLoading: true, error: null });
        
        try {
          const { page = 1, limit = 10, search, category_id, is_signature } = params;
          const response: PaginatedResponse<Product> = await productService.getAll({
            page,
            limit,
            search,
            category_id,
            is_signature,
          });
          
          set({
            products: response.data,
            currentPage: response.page,
            totalPages: response.totalPages,
            totalItems: response.total,
            itemsPerPage: response.limit,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Không thể tải danh sách sản phẩm';
          set({ 
            error: errorMessage, 
            isLoading: false,
            products: [],
          });
          toast.error(errorMessage);
        }
      },

      fetchProductById: async (id: number) => {
        set({ isLoading: true, error: null });
        
        try {
          const product = await productService.getById(id);
          set({
            currentProduct: product,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Không thể tải thông tin sản phẩm';
          set({ 
            error: errorMessage, 
            isLoading: false,
            currentProduct: null,
          });
          toast.error(errorMessage);
        }
      },

      fetchProductsByCategory: async (categoryId: number, params = {}) => {
        set({ isLoading: true, error: null });
        
        try {
          const { page = 1, limit = 10, search } = params;
          const response: PaginatedResponse<Product> = await productService.getByCategory(categoryId, {
            page,
            limit,
            search,
          });
          
          set({
            products: response.data,
            currentPage: response.page,
            totalPages: response.totalPages,
            totalItems: response.total,
            itemsPerPage: response.limit,
            categoryFilter: categoryId,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Không thể tải sản phẩm theo danh mục';
          set({ 
            error: errorMessage, 
            isLoading: false,
            products: [],
          });
          toast.error(errorMessage);
        }
      },

      createProduct: async (data: CreateProductFormData) => {
        set({ isCreating: true, error: null });
        
        try {
          const newProduct = await productService.create(data);
          
          // Refresh products list
          const { currentPage, itemsPerPage } = get();
          await get().fetchProducts({ page: currentPage, limit: itemsPerPage });
          
          set({ isCreating: false });
          toast.success('Tạo sản phẩm thành công');
          return newProduct;
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Không thể tạo sản phẩm';
          set({ 
            error: errorMessage, 
            isCreating: false 
          });
          toast.error(errorMessage);
          return null;
        }
      },

      updateProduct: async (id: number, data: UpdateProductFormData) => {
        set({ isUpdating: true, error: null });
        
        try {
          const updatedProduct = await productService.update(id, data);
          
          // Update products in current list
          set((state) => ({
            products: state.products.map(product => 
              product.id === id ? updatedProduct : product
            ),
            currentProduct: state.currentProduct?.id === id ? updatedProduct : state.currentProduct,
            isUpdating: false,
          }));
          
          toast.success('Cập nhật sản phẩm thành công');
          return updatedProduct;
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Không thể cập nhật sản phẩm';
          set({ 
            error: errorMessage, 
            isUpdating: false 
          });
          toast.error(errorMessage);
          return null;
        }
      },

      deleteProduct: async (id: number) => {
        set({ isDeleting: true, error: null });
        
        try {
          await productService.delete(id);
          
          // Remove product from current list
          set((state) => ({
            products: state.products.filter(product => product.id !== id),
            selectedIds: new Set([...state.selectedIds].filter(selectedId => selectedId !== id)),
            currentProduct: state.currentProduct?.id === id ? null : state.currentProduct,
            totalItems: Math.max(0, state.totalItems - 1),
            isDeleting: false,
          }));
          
          toast.success('Xóa sản phẩm thành công');
          return true;
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Không thể xóa sản phẩm';
          set({ 
            error: errorMessage, 
            isDeleting: false 
          });
          toast.error(errorMessage);
          return false;
        }
      },

      bulkDeleteProducts: async (data: BulkDeleteProductFormData) => {
        set({ isDeleting: true, error: null });
        
        try {
          const result = await productService.bulkDelete(data);
          
          // Remove deleted products from current list
          set((state) => ({
            products: state.products.filter(product => !result.deleted.includes(product.id)),
            selectedIds: new Set(),
            totalItems: Math.max(0, state.totalItems - result.deleted.length),
            isDeleting: false,
          }));
          
          return result;
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Không thể xóa các sản phẩm đã chọn';
          set({ 
            error: errorMessage, 
            isDeleting: false 
          });
          toast.error(errorMessage);
          throw error;
        }
      },

      // === PRODUCT PRICE ACTIONS ===

      fetchProductPrices: async (productId: number) => {
        try {
          const prices = await productService.getProductPrices(productId);
          return prices;
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Không thể tải danh sách giá sản phẩm';
          toast.error(errorMessage);
          return [];
        }
      },

      createProductPrice: async (data: CreateProductPriceFormData) => {
        set({ isCreatingPrice: true, error: null });
        
        try {
          const newPrice = await productService.createProductPrice(data);
          
          // Refresh current product if it matches
          const { currentProduct } = get();
          if (currentProduct && currentProduct.id === data.product_id) {
            await get().fetchProductById(data.product_id);
          }
          
          set({ isCreatingPrice: false });
          toast.success('Thêm giá sản phẩm thành công');
          return newPrice;
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Không thể thêm giá sản phẩm';
          set({ 
            error: errorMessage, 
            isCreatingPrice: false 
          });
          toast.error(errorMessage);
          return null;
        }
      },

      updateProductPrice: async (priceId: number, data: UpdateProductPriceFormData) => {
        set({ isUpdatingPrice: true, error: null });
        
        try {
          const updatedPrice = await productService.updateProductPrice(priceId, data);
          
          // Refresh current product if needed
          const { currentProduct } = get();
          if (currentProduct) {
            await get().fetchProductById(currentProduct.id);
          }
          
          set({ isUpdatingPrice: false });
          toast.success('Cập nhật giá sản phẩm thành công');
          return updatedPrice;
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Không thể cập nhật giá sản phẩm';
          set({ 
            error: errorMessage, 
            isUpdatingPrice: false 
          });
          toast.error(errorMessage);
          return null;
        }
      },

      deleteProductPrice: async (priceId: number) => {
        set({ isDeletingPrice: true, error: null });
        
        try {
          await productService.deleteProductPrice(priceId);
          
          // Refresh current product if needed
          const { currentProduct } = get();
          if (currentProduct) {
            await get().fetchProductById(currentProduct.id);
          }
          
          set({ isDeletingPrice: false });
          toast.success('Xóa giá sản phẩm thành công');
          return true;
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Không thể xóa giá sản phẩm';
          set({ 
            error: errorMessage, 
            isDeletingPrice: false 
          });
          toast.error(errorMessage);
          return false;
        }
      },

      bulkDeleteProductPrices: async (priceIds: number[]) => {
        set({ isDeletingPrice: true, error: null });
        
        try {
          const result = await productService.bulkDeleteProductPrices(priceIds);
          
          // Refresh current product if needed
          const { currentProduct } = get();
          if (currentProduct) {
            await get().fetchProductById(currentProduct.id);
          }
          
          set({ isDeletingPrice: false });
          
          if (result.summary.success > 0) {
            toast.success(`Đã xóa thành công ${result.summary.success} giá sản phẩm`);
          }
          
          if (result.summary.failed > 0) {
            toast.error(`Không thể xóa ${result.summary.failed} giá sản phẩm`);
          }
          
          return result;
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Không thể xóa các giá sản phẩm đã chọn';
          set({ 
            error: errorMessage, 
            isDeletingPrice: false 
          });
          toast.error(errorMessage);
          throw error;
        }
      },

      // === SELECTION ACTIONS ===

      selectProduct: (id: number) => {
        set((state) => {
          const newSelected = new Set(state.selectedIds);
          newSelected.add(id);
          return { selectedIds: newSelected };
        });
      },

      deselectProduct: (id: number) => {
        set((state) => {
          const newSelected = new Set(state.selectedIds);
          newSelected.delete(id);
          return { selectedIds: newSelected };
        });
      },

      selectAllProducts: () => {
        set((state) => ({
          selectedIds: new Set(state.products.map(product => product.id)),
        }));
      },

      deselectAllProducts: () => {
        set({ selectedIds: new Set() });
      },

      // === FILTER ACTIONS ===

      setCategoryFilter: (categoryId: number | null) => {
        set({ categoryFilter: categoryId });
        const { currentPage, itemsPerPage, searchQuery, isSignatureFilter } = get();
        get().fetchProducts({ 
          page: currentPage, 
          limit: itemsPerPage, 
          search: searchQuery,
          category_id: categoryId || undefined,
          is_signature: isSignatureFilter || undefined,
        });
      },

      setIsSignatureFilter: (isSignature: boolean | null) => {
        set({ isSignatureFilter: isSignature });
        const { currentPage, itemsPerPage, searchQuery, categoryFilter } = get();
        get().fetchProducts({ 
          page: currentPage, 
          limit: itemsPerPage, 
          search: searchQuery,
          category_id: categoryFilter || undefined,
          is_signature: isSignature || undefined,
        });
      },

      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
        const { currentPage, itemsPerPage, categoryFilter, isSignatureFilter } = get();
        get().fetchProducts({ 
          page: currentPage, 
          limit: itemsPerPage, 
          search: query,
          category_id: categoryFilter || undefined,
          is_signature: isSignatureFilter || undefined,
        });
      },

      clearFilters: () => {
        set({ 
          categoryFilter: null, 
          isSignatureFilter: null, 
          searchQuery: '' 
        });
        const { currentPage, itemsPerPage } = get();
        get().fetchProducts({ page: currentPage, limit: itemsPerPage });
      },

      // === UI ACTIONS ===

      setCurrentProduct: (product: Product | null) => {
        set({ currentProduct: product });
      },

      clearError: () => {
        set({ error: null });
      },

      resetState: () => {
        set(initialState);
      },
    }),
    { name: 'product-store' }
  )
); 