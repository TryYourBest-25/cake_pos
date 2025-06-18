import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Order } from "@/types/api";
import { orderService } from "@/lib/services/order-service";

interface OrdersState {
  // State
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  
  // Pagination
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  
  // Filters
  statusFilter: 'ALL' | 'PROCESSING' | 'CANCELLED' | 'COMPLETED';
  customerIdFilter?: number;
  employeeIdFilter?: number;

  // Actions
  fetchOrders: (params?: { page?: number; limit?: number; }) => Promise<void>;
  fetchOrdersByStatus: (status: 'PROCESSING' | 'CANCELLED' | 'COMPLETED', params?: { page?: number; limit?: number; }) => Promise<void>;
  fetchOrdersByEmployee: (employeeId: number, params?: { page?: number; limit?: number; }) => Promise<void>;
  fetchOrdersByCustomer: (customerId: number, params?: { page?: number; limit?: number; }) => Promise<void>;
  fetchOrderById: (id: number) => Promise<void>;
  cancelOrder: (id: number) => Promise<void>;
  deleteOrder: (id: number) => Promise<void>;
  
  // Filter actions
  setStatusFilter: (status: 'ALL' | 'PROCESSING' | 'CANCELLED' | 'COMPLETED') => void;
  setCustomerFilter: (customerId?: number) => void;
  setEmployeeFilter: (employeeId?: number) => void;
  clearFilters: () => void;
  
  // Utility actions
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  orders: [],
  currentOrder: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  statusFilter: 'ALL' as const,
  customerIdFilter: undefined,
  employeeIdFilter: undefined,
};

export const useOrdersStore = create<OrdersState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      fetchOrders: async (params) => {
        try {
          set({ isLoading: true, error: null });
          const { statusFilter, customerIdFilter, employeeIdFilter } = get();
          
          const response = await orderService.getOrders({
            page: params?.page || get().page,
            limit: params?.limit || get().limit,
            ...(statusFilter !== 'ALL' && { status: statusFilter }),
            ...(customerIdFilter && { customerId: customerIdFilter }),
            ...(employeeIdFilter && { employeeId: employeeIdFilter }),
          });

          set({
            orders: response.data,
            page: response.page,
            limit: response.limit,
            total: response.total,
            totalPages: response.totalPages,
            isLoading: false,
          });
        } catch (error) {
          console.error("Lỗi khi tải danh sách đơn hàng:", error);
          set({
            error: "Không thể tải danh sách đơn hàng",
            isLoading: false,
          });
          throw error;
        }
      },

      fetchOrdersByStatus: async (status, params) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await orderService.getOrdersByStatus(status, {
            page: params?.page || get().page,
            limit: params?.limit || get().limit,
          });

          set({
            orders: response.data,
            page: response.page,
            limit: response.limit,
            total: response.total,
            totalPages: response.totalPages,
            statusFilter: status,
            isLoading: false,
          });
        } catch (error) {
          console.error("Lỗi khi tải đơn hàng theo trạng thái:", error);
          set({
            error: "Không thể tải đơn hàng theo trạng thái",
            isLoading: false,
          });
          throw error;
        }
      },

      fetchOrdersByEmployee: async (employeeId, params) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await orderService.getOrdersByEmployee(employeeId, {
            page: params?.page || get().page,
            limit: params?.limit || get().limit,
          });

          set({
            orders: response.data,
            page: response.page,
            limit: response.limit,
            total: response.total,
            totalPages: response.totalPages,
            employeeIdFilter: employeeId,
            isLoading: false,
          });
        } catch (error) {
          console.error("Lỗi khi tải đơn hàng theo nhân viên:", error);
          set({
            error: "Không thể tải đơn hàng theo nhân viên",
            isLoading: false,
          });
          throw error;
        }
      },

      fetchOrdersByCustomer: async (customerId, params) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await orderService.getOrdersByCustomer(customerId, {
            page: params?.page || get().page,
            limit: params?.limit || get().limit,
          });

          set({
            orders: response.data,
            page: response.page,
            limit: response.limit,
            total: response.total,
            totalPages: response.totalPages,
            customerIdFilter: customerId,
            isLoading: false,
          });
        } catch (error) {
          console.error("Lỗi khi tải đơn hàng theo khách hàng:", error);
          set({
            error: "Không thể tải đơn hàng theo khách hàng",
            isLoading: false,
          });
          throw error;
        }
      },

      fetchOrderById: async (id) => {
        try {
          set({ isLoading: true, error: null });
          
          const order = await orderService.getById(id);
          
          set({
            currentOrder: order,
            isLoading: false,
          });
        } catch (error) {
          console.error("Lỗi khi tải chi tiết đơn hàng:", error);
          set({
            error: "Không thể tải chi tiết đơn hàng",
            isLoading: false,
          });
          throw error;
        }
      },

      cancelOrder: async (id) => {
        try {
          set({ isUpdating: true, error: null });
          
          const updatedOrder = await orderService.cancelOrder(id);
          
          // Update trong list orders
          set((state) => ({
            orders: state.orders.map((order) =>
              order.id === id ? updatedOrder : order
            ),
            currentOrder: state.currentOrder?.id === id ? updatedOrder : state.currentOrder,
            isUpdating: false,
          }));
        } catch (error) {
          console.error("Lỗi khi hủy đơn hàng:", error);
          set({
            error: "Không thể hủy đơn hàng",
            isUpdating: false,
          });
          throw error;
        }
      },

      deleteOrder: async (id) => {
        try {
          set({ isDeleting: true, error: null });
          
          await orderService.deleteOrder(id);
          
          // Remove từ list orders
          set((state) => ({
            orders: state.orders.filter((order) => order.id !== id),
            currentOrder: state.currentOrder?.id === id ? null : state.currentOrder,
            total: state.total - 1,
            isDeleting: false,
          }));
        } catch (error) {
          console.error("Lỗi khi xóa đơn hàng:", error);
          set({
            error: "Không thể xóa đơn hàng",
            isDeleting: false,
          });
          throw error;
        }
      },

      setStatusFilter: (status) => {
        set({ statusFilter: status });
      },

      setCustomerFilter: (customerId) => {
        set({ customerIdFilter: customerId });
      },

      setEmployeeFilter: (employeeId) => {
        set({ employeeIdFilter: employeeId });
      },

      clearFilters: () => {
        set({
          statusFilter: 'ALL',
          customerIdFilter: undefined,
          employeeIdFilter: undefined,
        });
      },

      setError: (error) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: "orders-store",
    }
  )
); 