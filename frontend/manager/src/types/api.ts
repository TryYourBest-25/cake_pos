// Types dựa trên API controllers

// Backend response structure
export interface BackendManagerResponse {
  manager_id: number;
  account_id: number;
  last_name: string;
  first_name: string;
  gender: 'MALE' | 'FEMALE' | null;
  phone: string;
  email: string;
  created_at: string;
  updated_at: string;
  account?: {
    account_id: number;
    role_id: number;
    username: string;
    is_active: boolean;
    is_locked: boolean;
    last_login: string | null;
    created_at: string;
    updated_at: string;
    role: Record<string, unknown>;
  };
}

// Frontend Manager interface (transformed)
export interface Manager {
  id: number;
  accountId: number;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: 'MALE' | 'FEMALE' | null;
  password?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  permissions?: string[];
  username?: string;
  lastLogin?: Date;
  role?: any;
}

// Utility function để transform backend response
export function transformManagerResponse(backendManager: BackendManagerResponse): Manager {
  return {
    id: backendManager.manager_id,
    accountId: backendManager.account_id,
    name: `${backendManager.first_name} ${backendManager.last_name}`,
    firstName: backendManager.first_name,
    lastName: backendManager.last_name,
    email: backendManager.email,
    phone: backendManager.phone,
    gender: backendManager.gender,
    isActive: backendManager.account?.is_active ?? true,
    createdAt: new Date(backendManager.created_at),
    updatedAt: new Date(backendManager.updated_at),
    permissions: ['MANAGE_USERS', 'MANAGE_ORDERS', 'MANAGE_PRODUCTS'], // Mock permissions
    username: backendManager.account?.username,
    lastLogin: backendManager.account?.last_login ? new Date(backendManager.account.last_login) : undefined,
    role: backendManager.account?.role,
  };
}

// Backend response structure cho Employee
export interface BackendEmployeeResponse {
  employee_id: number;
  account_id: number;
  last_name: string;
  first_name: string;
  email: string;
  phone: string;
  position: string;
  created_at: string;
  updated_at: string;
  account?: {
    account_id: number;
    role_id: number;
    username: string;
    is_active: boolean;
    is_locked: boolean;
    last_login: string | null;
    created_at: string;
    updated_at: string;
    role: Record<string, unknown>;
  };
}

// Frontend Employee interface (transformed)
export interface Employee {
  id: number;
  accountId: number;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  createdAt: Date;
  updatedAt: Date;
  username?: string;
  lastLogin?: Date;
  role?: any;
}

// Utility function để transform backend employee response
export function transformEmployeeResponse(backendEmployee: BackendEmployeeResponse): Employee {
  return {
    id: backendEmployee.employee_id,
    accountId: backendEmployee.account_id,
    name: `${backendEmployee.first_name} ${backendEmployee.last_name}`,
    firstName: backendEmployee.first_name,
    lastName: backendEmployee.last_name,
    email: backendEmployee.email,
    phone: backendEmployee.phone,
    position: backendEmployee.position,
    createdAt: new Date(backendEmployee.created_at),
    updatedAt: new Date(backendEmployee.updated_at),
    username: backendEmployee.account?.username,
    lastLogin: backendEmployee.account?.last_login ? new Date(backendEmployee.account.last_login) : undefined,
    role: backendEmployee.account?.role,
  };
}

// Backend response structure cho Customer
export interface BackendCustomerResponse {
  customer_id: number;
  membership_type_id: number;
  last_name?: string;
  first_name?: string;
  phone: string;
  current_points?: number;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  created_at: string;
  updated_at: string;
  account?: {
    account_id: number;
    role_id: number;
    username: string;
    is_active: boolean;
    is_locked: boolean;
    last_login: string | null;
    created_at: string;
    updated_at: string;
    role: Record<string, unknown>;
  };
  membership_type?: {
    membership_type_id: number;
    type: string;
    discount_value: number;
    required_point: number;
    description?: string;
    valid_until?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
}

// Frontend Customer interface (transformed)
export interface Customer {
  id: number;
  membershipTypeId: number;
  name: string;
  firstName?: string;
  lastName?: string;
  phone: string;
  currentPoints?: number;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  createdAt: Date;
  updatedAt: Date;
  username?: string;
  lastLogin?: Date;
  role?: any;
  membershipType?: MembershipType;
}

// Utility function để transform backend customer response
export function transformCustomerResponse(backendCustomer: BackendCustomerResponse): Customer {
  return {
    id: backendCustomer.customer_id,
    membershipTypeId: backendCustomer.membership_type_id,
    name: backendCustomer.first_name && backendCustomer.last_name 
      ? `${backendCustomer.first_name} ${backendCustomer.last_name}` 
      : backendCustomer.phone,
    firstName: backendCustomer.first_name,
    lastName: backendCustomer.last_name,
    phone: backendCustomer.phone,
    currentPoints: backendCustomer.current_points,
    gender: backendCustomer.gender,
    createdAt: new Date(backendCustomer.created_at),
    updatedAt: new Date(backendCustomer.updated_at),
    username: backendCustomer.account?.username,
    lastLogin: backendCustomer.account?.last_login ? new Date(backendCustomer.account.last_login) : undefined,
    role: backendCustomer.account?.role,
    membershipType: backendCustomer.membership_type ? transformMembershipTypeResponse(backendCustomer.membership_type) : undefined,
  };
}

// Backend response structure cho MembershipType
export interface BackendMembershipTypeResponse {
  membership_type_id: number;
  type: string;
  discount_value: number;
  required_point: number;
  description?: string;
  valid_until?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  customers?: BackendCustomerResponse[];
}

// Frontend MembershipType interface (transformed)
export interface MembershipType {
  id: number;
  type: string;
  discountValue: number;
  requiredPoint: number;
  description?: string;
  validUntil?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  customers?: Customer[];
}

// Utility function để transform backend membership type response
export function transformMembershipTypeResponse(backendMembershipType: BackendMembershipTypeResponse): MembershipType {
  return {
    id: backendMembershipType.membership_type_id,
    type: backendMembershipType.type,
    discountValue: backendMembershipType.discount_value,
    requiredPoint: backendMembershipType.required_point,
    description: backendMembershipType.description,
    validUntil: backendMembershipType.valid_until ? new Date(backendMembershipType.valid_until) : undefined,
    isActive: backendMembershipType.is_active,
    createdAt: new Date(backendMembershipType.created_at),
    updatedAt: new Date(backendMembershipType.updated_at),
    customers: backendMembershipType.customers?.map(transformCustomerResponse),
  };
}

// =============================================================================
// ORDER & PAYMENT TYPES
// =============================================================================

// Backend response structure cho Order 
export interface BackendOrderResponse {
  order_id: number;
  employee_id?: number;
  customer_id?: number;
  order_time?: string;
  total_amount: number;
  final_amount: number;
  status: 'PROCESSING' | 'CANCELLED' | 'COMPLETED';
  customize_note?: string;
  created_at: string;
  updated_at: string;
  customer?: BackendCustomerResponse;
  employee?: BackendEmployeeResponse;
  order_product?: BackendOrderProductResponse[];
  order_discount?: BackendOrderDiscountResponse[];
  payment?: BackendPaymentResponse[];
}

// Backend response structure cho OrderProduct
export interface BackendOrderProductResponse {
  order_product_id: number;
  order_id: number;
  product_price_id: number;
  quantity: number;
  option?: string;
  created_at: string;
  updated_at: string;
  product_price?: {
    product_price_id: number;
    product_id: number;
    size_id: number;
    price: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    product?: BackendProductResponse;
    product_size?: BackendProductSizeResponse;
  };
}

// Backend response structure cho OrderDiscount
export interface BackendOrderDiscountResponse {
  order_discount_id: number;
  order_id: number;
  discount_id: number;
  discount_amount: number;
  created_at: string;
  updated_at: string;
  discount?: BackendDiscountResponse;
}

// Backend response structure cho Payment
export interface BackendPaymentResponse {
  payment_id: number;
  order_id: number;
  payment_method_id: number;
  status: 'PROCESSING' | 'PAID' | 'CANCELLED';
  amount_paid?: number;
  change_amount?: number;
  payment_time?: string;
  created_at: string;
  updated_at: string;
  payment_method?: {
    payment_method_id: number;
    name: string;
    description?: string;
    created_at: string;
    updated_at: string;
  };
}

// Frontend Order interface (transformed)
export interface Order {
  id: number;
  employeeId?: number;
  customerId?: number;
  orderTime?: Date;
  totalAmount: number;
  finalAmount: number;
  status: 'PROCESSING' | 'CANCELLED' | 'COMPLETED';
  customizeNote?: string;
  createdAt: Date;
  updatedAt: Date;
  customer?: Customer;
  employee?: Employee;
  products?: OrderProduct[];
  discounts?: OrderDiscount[];
  payments?: Payment[];
  // Computed properties
  customerName?: string;
  employeeName?: string;
  paymentStatus?: 'PROCESSING' | 'PAID' | 'CANCELLED';
  paymentMethod?: string;
}

// Frontend OrderProduct interface (transformed)
export interface OrderProduct {
  id: number;
  orderId: number;
  productPriceId: number;
  quantity: number;
  option?: string;
  createdAt: Date;
  updatedAt: Date;
  productPrice?: ProductPrice;
  // Computed properties
  productName?: string;
  sizeName?: string;
  unitPrice?: number;
  totalPrice?: number;
}

// Frontend OrderDiscount interface (transformed)
export interface OrderDiscount {
  id: number;
  orderId: number;
  discountId: number;
  discountAmount: number;
  createdAt: Date;
  updatedAt: Date;
  discount?: Discount;
  // Computed properties
  discountName?: string;
}

// Frontend Payment interface (transformed)
export interface Payment {
  id: number;
  orderId: number;
  paymentMethodId: number;
  status: 'PROCESSING' | 'PAID' | 'CANCELLED';
  amountPaid?: number;
  changeAmount?: number;
  paymentTime?: Date;
  createdAt: Date;
  updatedAt: Date;
  paymentMethod?: {
    id: number;
    name: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

// Transform functions
export function transformOrderResponse(backendOrder: BackendOrderResponse): Order {
  const customer = backendOrder.customer ? transformCustomerResponse(backendOrder.customer) : undefined;
  const employee = backendOrder.employee ? transformEmployeeResponse(backendOrder.employee) : undefined;
  
  return {
    id: backendOrder.order_id,
    employeeId: backendOrder.employee_id,
    customerId: backendOrder.customer_id,
    orderTime: backendOrder.order_time ? new Date(backendOrder.order_time) : undefined,
    totalAmount: backendOrder.total_amount,
    finalAmount: backendOrder.final_amount,
    status: backendOrder.status,
    customizeNote: backendOrder.customize_note,
    createdAt: new Date(backendOrder.created_at),
    updatedAt: new Date(backendOrder.updated_at),
    customer,
    employee,
    products: backendOrder.order_product?.map(transformOrderProductResponse),
    discounts: backendOrder.order_discount?.map(transformOrderDiscountResponse),
    payments: backendOrder.payment?.map(transformPaymentResponse),
    // Computed properties
    customerName: customer ? customer.name : undefined,
    employeeName: employee ? employee.name : undefined,
    paymentStatus: backendOrder.payment?.[0]?.status,
    paymentMethod: backendOrder.payment?.[0]?.payment_method?.name,
  };
}

export function transformOrderProductResponse(backendOrderProduct: BackendOrderProductResponse): OrderProduct {
  return {
    id: backendOrderProduct.order_product_id,
    orderId: backendOrderProduct.order_id,
    productPriceId: backendOrderProduct.product_price_id,
    quantity: backendOrderProduct.quantity,
    option: backendOrderProduct.option,
    createdAt: new Date(backendOrderProduct.created_at),
    updatedAt: new Date(backendOrderProduct.updated_at),
    productPrice: backendOrderProduct.product_price ? transformProductPriceResponse(backendOrderProduct.product_price) : undefined,
    // Computed properties
    productName: backendOrderProduct.product_price?.product?.name,
    sizeName: backendOrderProduct.product_price?.product_size?.name,
    unitPrice: backendOrderProduct.product_price?.price,
    totalPrice: backendOrderProduct.product_price ? backendOrderProduct.product_price.price * backendOrderProduct.quantity : 0,
  };
}

export function transformOrderDiscountResponse(backendOrderDiscount: BackendOrderDiscountResponse): OrderDiscount {
  return {
    id: backendOrderDiscount.order_discount_id,
    orderId: backendOrderDiscount.order_id,
    discountId: backendOrderDiscount.discount_id,
    discountAmount: backendOrderDiscount.discount_amount,
    createdAt: new Date(backendOrderDiscount.created_at),
    updatedAt: new Date(backendOrderDiscount.updated_at),
    discount: backendOrderDiscount.discount ? transformDiscountResponse(backendOrderDiscount.discount) : undefined,
    // Computed properties
    discountName: backendOrderDiscount.discount?.name,
  };
}

export function transformPaymentResponse(backendPayment: BackendPaymentResponse): Payment {
  return {
    id: backendPayment.payment_id,
    orderId: backendPayment.order_id,
    paymentMethodId: backendPayment.payment_method_id,
    status: backendPayment.status,
    amountPaid: backendPayment.amount_paid,
    changeAmount: backendPayment.change_amount,
    paymentTime: backendPayment.payment_time ? new Date(backendPayment.payment_time) : undefined,
    createdAt: new Date(backendPayment.created_at),
    updatedAt: new Date(backendPayment.updated_at),
    paymentMethod: backendPayment.payment_method ? {
      id: backendPayment.payment_method.payment_method_id,
      name: backendPayment.payment_method.name,
      description: backendPayment.payment_method.description,
      createdAt: new Date(backendPayment.payment_method.created_at),
      updatedAt: new Date(backendPayment.payment_method.updated_at),
    } : undefined,
  };
}

// Order DTOs
export interface CreateOrderDto {
  employee_id: number;
  customer_id?: number;
  customize_note?: string;
  products: {
    product_price_id: number;
    quantity: number;
    option?: string;
  }[];
  discounts?: {
    discount_id: number;
  }[];
}

export interface UpdateOrderDto {
  employee_id?: number;
  customer_id?: number;
  customize_note?: string;
  status?: 'PROCESSING' | 'CANCELLED' | 'COMPLETED';
  products?: {
    product_price_id: number;
    quantity: number;
    option?: string;
  }[];
  discounts?: {
    discount_id: number;
  }[];
}

// Payment DTOs
export interface CreatePaymentDto {
  order_id: number;
  payment_method_id: number;
  amount_paid: number;
  payment_time?: string;
}

export interface UpdatePaymentDto {
  amount_paid?: number;
  payment_time?: string;
}

// =============================================================================

// Backend response structure cho Discount
export interface BackendDiscountResponse {
  discount_id: number;
  name: string;
  description?: string;
  coupon_code: string;
  discount_value: number;
  min_required_order_value: number;
  max_discount_amount: number;
  min_required_product?: number;
  valid_from?: string;
  valid_until: string;
  current_uses?: number;
  max_uses?: number;
  max_uses_per_customer?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Frontend Discount interface (transformed)
export interface Discount {
  id: number;
  name: string;
  description?: string;
  couponCode: string;
  discountValue: number;
  minRequiredOrderValue: number;
  maxDiscountAmount: number;
  minRequiredProduct?: number;
  validFrom?: Date;
  validUntil: Date;
  currentUses?: number;
  maxUses?: number;
  maxUsesPerCustomer?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Utility function để transform backend discount response
export function transformDiscountResponse(backendDiscount: BackendDiscountResponse): Discount {
  return {
    id: backendDiscount.discount_id,
    name: backendDiscount.name,
    description: backendDiscount.description,
    couponCode: backendDiscount.coupon_code,
    discountValue: backendDiscount.discount_value,
    minRequiredOrderValue: backendDiscount.min_required_order_value,
    maxDiscountAmount: backendDiscount.max_discount_amount,
    minRequiredProduct: backendDiscount.min_required_product,
    validFrom: backendDiscount.valid_from ? new Date(backendDiscount.valid_from) : undefined,
    validUntil: new Date(backendDiscount.valid_until),
    currentUses: backendDiscount.current_uses,
    maxUses: backendDiscount.max_uses,
    maxUsesPerCustomer: backendDiscount.max_uses_per_customer,
    isActive: backendDiscount.is_active,
    createdAt: new Date(backendDiscount.created_at),
    updatedAt: new Date(backendDiscount.updated_at),
  };
}

// DTOs cho Discount
export interface CreateDiscountDto {
  name: string;
  description?: string;
  coupon_code: string;
  discount_value: number;
  min_required_order_value: number;
  max_discount_amount: number;
  min_required_product?: number;
  valid_from?: string;
  valid_until: string;
  max_uses?: number;
  max_uses_per_customer?: number;
  is_active?: boolean;
}

export interface UpdateDiscountDto {
  name?: string;
  description?: string;
  coupon_code?: string;
  discount_value?: number;
  min_required_order_value?: number;
  max_discount_amount?: number;
  min_required_product?: number;
  valid_from?: string;
  valid_until?: string;
  max_uses?: number;
  max_uses_per_customer?: number;
  is_active?: boolean;
}

// =============================================================================
// PRODUCT TYPES (Categories, Products, ProductSizes)
// =============================================================================

// Backend response structure cho Category
export interface BackendCategoryResponse {
  category_id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  product?: BackendProductResponse[];
}

// Frontend Category interface (transformed)
export interface Category {
  id: number;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  products?: Product[];
}

// Utility function để transform backend category response
export function transformCategoryResponse(backendCategory: BackendCategoryResponse): Category {
  return {
    id: backendCategory.category_id,
    name: backendCategory.name,
    description: backendCategory.description,
    createdAt: new Date(backendCategory.created_at),
    updatedAt: new Date(backendCategory.updated_at),
    products: backendCategory.product ? backendCategory.product.map(transformProductResponse) : undefined,
  };
}

// Backend response structure cho ProductSize
export interface BackendProductSizeResponse {
  size_id: number;
  name: string;
  unit: string;
  quantity: number;
  description?: string;
  created_at: string;
  updated_at: string;
  product_price?: BackendProductPriceResponse[];
}

// Frontend ProductSize interface (transformed)
export interface ProductSize {
  id: number;
  name: string;
  unit: string;
  quantity: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  productPrices?: ProductPrice[];
}

// Utility function để transform backend product size response
export function transformProductSize(backendProductSize: BackendProductSizeResponse): ProductSize {
  return {
    id: backendProductSize.size_id,
    name: backendProductSize.name,
    unit: backendProductSize.unit,
    quantity: backendProductSize.quantity,
    description: backendProductSize.description,
    createdAt: new Date(backendProductSize.created_at),
    updatedAt: new Date(backendProductSize.updated_at),
    productPrices: backendProductSize.product_price ? backendProductSize.product_price.map(transformProductPriceResponse) : undefined,
  };
}

// Backend response structure cho ProductPrice
export interface BackendProductPriceResponse {
  product_price_id: number;
  product_id: number;
  size_id: number;
  price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  product?: BackendProductResponse;
  product_size?: BackendProductSizeResponse;
}

// Frontend ProductPrice interface (transformed)
export interface ProductPrice {
  id: number;
  productId: number;
  sizeId: number;
  price: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  product?: Product;
  productSize?: ProductSize;
}

// Utility function để transform backend product price response
export function transformProductPriceResponse(backendProductPrice: BackendProductPriceResponse): ProductPrice {
  return {
    id: backendProductPrice.product_price_id,
    productId: backendProductPrice.product_id,
    sizeId: backendProductPrice.size_id,
    price: backendProductPrice.price,
    isActive: backendProductPrice.is_active,
    createdAt: new Date(backendProductPrice.created_at),
    updatedAt: new Date(backendProductPrice.updated_at),
    product: backendProductPrice.product ? transformProductResponse(backendProductPrice.product) : undefined,
    productSize: backendProductPrice.product_size ? transformProductSize(backendProductPrice.product_size) : undefined,
  };
}

// Backend response structure cho Product
export interface BackendProductResponse {
  product_id: number;
  category_id?: number;
  name: string;
  description?: string;
  is_signature?: boolean;
  image_path?: string;
  created_at: string;
  updated_at: string;
  category?: BackendCategoryResponse;
  product_price?: BackendProductPriceResponse[];
}

// Frontend Product interface (transformed)
export interface Product {
  id: number;
  categoryId?: number;
  name: string;
  description?: string;
  isSignature?: boolean;
  imagePath?: string;
  createdAt: Date;
  updatedAt: Date;
  category?: Category;
  productPrices?: ProductPrice[];
  // Computed properties
  minPrice?: number;
  maxPrice?: number;
  availableSizes?: ProductSize[];
}

// Utility function để transform backend product response
export function transformProductResponse(backendProduct: BackendProductResponse): Product {
  const productPrices = backendProduct.product_price ? backendProduct.product_price.map(transformProductPriceResponse) : [];
  const activePrices = productPrices.filter(price => price.isActive);
  
  return {
    id: backendProduct.product_id,
    categoryId: backendProduct.category_id,
    name: backendProduct.name,
    description: backendProduct.description,
    isSignature: backendProduct.is_signature,
    imagePath: backendProduct.image_path,
    createdAt: new Date(backendProduct.created_at),
    updatedAt: new Date(backendProduct.updated_at),
    category: backendProduct.category ? transformCategoryResponse(backendProduct.category) : undefined,
    productPrices: productPrices,
    minPrice: activePrices.length > 0 ? Math.min(...activePrices.map(p => p.price)) : undefined,
    maxPrice: activePrices.length > 0 ? Math.max(...activePrices.map(p => p.price)) : undefined,
    availableSizes: activePrices.map(price => price.productSize).filter(Boolean) as ProductSize[],
  };
}

// DTOs for API requests
export interface CreateCategoryDto {
  name: string;
  description?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
}

export interface CreateProductSizeDto {
  name: string;
  unit: string;
  quantity: number;
  description?: string;
}

export interface UpdateProductSizeDto {
  name?: string;
  unit?: string;
  quantity?: number;
  description?: string;
}

export interface CreateProductPriceDto {
  size_id?: number;
  size_data?: CreateProductSizeDto;
  price: number;
  is_active?: boolean;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  is_signature?: boolean;
  image_path?: string;
  category_id?: number;
  prices: CreateProductPriceDto[];
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  is_signature?: boolean;
  image_path?: string;
  category_id?: number;
}

// =============================================================================

// DTOs for API requests (match backend structure)
export interface CreateManagerDto {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender?: 'MALE' | 'FEMALE';
  username: string;
  password: string;
}

export interface UpdateManagerDto {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  gender?: 'MALE' | 'FEMALE';
  username?: string;
  password?: string;
}

export interface BulkDeleteManagerDto {
  ids: number[];
}

// DTOs for API requests (match backend structure) - cập nhật Employee DTOs
export interface CreateEmployeeDto {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  position: string;
  username: string;
}

export interface UpdateEmployeeDto {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  position?: string;
  username?: string;
}

export interface BulkDeleteEmployeeDto {
  ids: number[];
}

// DTOs for API requests (match backend structure) - Customer DTOs
export interface CreateCustomerDto {
  membership_type_id: number;
  last_name?: string;
  first_name?: string;
  phone: string;
  current_points?: number;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  username?: string;
}

export interface UpdateCustomerDto {
  membership_type_id?: number;
  last_name?: string;
  first_name?: string;
  phone?: string;
  current_points?: number;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  username?: string;
}

export interface BulkDeleteCustomerDto {
  ids: number[];
}

// DTOs for API requests (match backend structure) - MembershipType DTOs
export interface CreateMembershipTypeDto {
  type: string;
  discount_value: number;
  required_point: number;
  description?: string;
  valid_until?: string;
  is_active?: boolean;
}

export interface UpdateMembershipTypeDto {
  type?: string;
  discount_value?: number;
  required_point?: number;
  description?: string;
  valid_until?: string;
  is_active?: boolean;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Frontend pagination response interface
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Backend pagination response structure (for internal service use)
export interface BackendPaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Backend bulk delete response structure (for internal service use)
export interface BulkDeleteResponse {
  deleted: number[];
  failed: { id: number; reason: string }[];
  summary: { total: number; success: number; failed: number };
}

// Reports Related Types
export interface SalesReportQuery {
  month?: number;
  year?: number;
  employee_id?: number;
}

export interface EmployeeSalesData {
  employee_id: number;
  employee_name: string;
  total_orders: number;
  total_revenue: number;
  total_products_sold: number;
}

export interface MonthlySalesData {
  month: number;
  year: number;
  total_orders: number;
  total_revenue: number;
  total_products_sold: number;
}

export interface DailySalesData {
  day: number;
  month: number;
  year: number;
  total_orders: number;
  total_revenue: number;
  total_products_sold: number;
}

export interface ProductSalesData {
  product_id: number;
  product_name: string;
  quantity_sold: number;
  revenue: number;
}

export interface SalesReportSummary {
  total_orders: number;
  total_revenue: number;
  total_products_sold: number;
  period: string;
}

export interface SalesReportResponse {
  summary: SalesReportSummary;
  employee_sales?: EmployeeSalesData[];
  monthly_sales?: MonthlySalesData[];
  daily_sales?: DailySalesData[];
  product_sales?: ProductSalesData[];
}

// Transform functions for Reports
export const transformSalesReportResponse = (data: any): SalesReportResponse => {
  // Handle null or undefined data
  if (!data) {
    return {
      summary: {
        total_orders: 0,
        total_revenue: 0,
        total_products_sold: 0,
        period: 'Không có dữ liệu',
      },
    };
  }

  return {
    summary: {
      total_orders: data.summary?.total_orders || 0,
      total_revenue: data.summary?.total_revenue || 0,
      total_products_sold: data.summary?.total_products_sold || 0,
      period: data.summary?.period || '',
    },
    employee_sales: data.employee_sales?.map((item: any) => ({
      employee_id: item.employee_id || 0,
      employee_name: item.employee_name || 'Không xác định',
      total_orders: item.total_orders || 0,
      total_revenue: item.total_revenue || 0,
      total_products_sold: item.total_products_sold || 0,
    })) || undefined,
    monthly_sales: data.monthly_sales?.map((item: any) => ({
      month: item.month || 0,
      year: item.year || 0,
      total_orders: item.total_orders || 0,
      total_revenue: item.total_revenue || 0,
      total_products_sold: item.total_products_sold || 0,
    })) || undefined,
    daily_sales: data.daily_sales?.map((item: any) => ({
      day: item.day || 0,
      month: item.month || 0,
      year: item.year || 0,
      total_orders: item.total_orders || 0,
      total_revenue: item.total_revenue || 0,
      total_products_sold: item.total_products_sold || 0,
    })) || undefined,
    product_sales: data.product_sales?.map((item: any) => ({
      product_id: item.product_id || 0,
      product_name: item.product_name || 'Không xác định',
      quantity_sold: item.quantity_sold || 0,
      revenue: item.revenue || 0,
    })) || undefined,
  };
};

// Profile và Store types
export interface BackendProfileResponse {
  account_id: number;
  username: string;
  role_id: number;
  role_name: string;
  is_active: boolean;
  is_locked: boolean;
  last_login?: string;
  created_at: string;
  profile?: {
    manager_id?: number;
    employee_id?: number;
    customer_id?: number;
    last_name: string;
    first_name: string;
    email?: string;
    phone: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    position?: string; // Chỉ có cho employee
    current_points?: number; // Chỉ có cho customer
    membership_type_id?: number; // Chỉ có cho customer
  };
}

export interface Profile {
  accountId: number;
  username: string;
  roleId: number;
  roleName: string;
  isActive: boolean;
  isLocked: boolean;
  lastLogin?: Date;
  createdAt: Date;
  profile?: {
    id?: number;
    lastName: string;
    firstName: string;
    name: string;
    email?: string;
    phone: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    position?: string;
    currentPoints?: number;
    membershipTypeId?: number;
  };
}

export function transformProfileResponse(backendProfile: BackendProfileResponse): Profile {
  return {
    accountId: backendProfile.account_id,
    username: backendProfile.username,
    roleId: backendProfile.role_id,
    roleName: backendProfile.role_name,
    isActive: backendProfile.is_active,
    isLocked: backendProfile.is_locked,
    lastLogin: backendProfile.last_login ? new Date(backendProfile.last_login) : undefined,
    createdAt: new Date(backendProfile.created_at),
    profile: backendProfile.profile ? {
      id: backendProfile.profile.manager_id || backendProfile.profile.employee_id || backendProfile.profile.customer_id,
      lastName: backendProfile.profile.last_name,
      firstName: backendProfile.profile.first_name,
      name: `${backendProfile.profile.first_name} ${backendProfile.profile.last_name}`,
      email: backendProfile.profile.email,
      phone: backendProfile.profile.phone,
      gender: backendProfile.profile.gender,
      position: backendProfile.profile.position,
      currentPoints: backendProfile.profile.current_points,
      membershipTypeId: backendProfile.profile.membership_type_id,
    } : undefined,
  };
}

export interface UpdateProfileDto {
  username?: string;
  password?: string;
  last_name?: string;
  first_name?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  phone?: string;
  email?: string;
  position?: string; // Chỉ dành cho employee
}

// Store types
export interface BackendStoreResponse {
  store_id: number;
  name: string;
  address: string;
  phone: string;
  opening_time: string;
  closing_time: string;
  email: string;
  opening_date: string;
  tax_code: string;
  created_at: string;
  updated_at: string;
}

export interface Store {
  id: number;
  name: string;
  address: string;
  phone: string;
  openingTime: string;
  closingTime: string;
  email: string;
  openingDate: Date;
  taxCode: string;
  createdAt: Date;
  updatedAt: Date;
}

export function transformStoreResponse(backendStore: BackendStoreResponse): Store {
  return {
    id: backendStore.store_id,
    name: backendStore.name,
    address: backendStore.address,
    phone: backendStore.phone,
    openingTime: backendStore.opening_time,
    closingTime: backendStore.closing_time,
    email: backendStore.email,
    openingDate: new Date(backendStore.opening_date),
    taxCode: backendStore.tax_code,
    createdAt: new Date(backendStore.created_at),
    updatedAt: new Date(backendStore.updated_at),
  };
}

export interface CreateStoreDto {
  name: string;
  address: string;
  phone: string;
  opening_time: string; // Format: "HH:mm:ss"
  closing_time: string; // Format: "HH:mm:ss"
  email: string;
  opening_date: string; // Format: "YYYY-MM-DD"
  tax_code: string;
}

export interface UpdateStoreDto {
  name?: string;
  address?: string;
  phone?: string;
  opening_time?: string;
  closing_time?: string;
  email?: string;
  opening_date?: string;
  tax_code?: string;
} 