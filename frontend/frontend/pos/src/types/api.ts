// Pagination types
export interface PaginationDto {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
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

// Category types
export interface Category {
  category_id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// Product types
export interface Product {
  product_id: number;
  category_id: number;
  name: string;
  description?: string;
  is_signature?: boolean;
  image_path?: string;
  created_at?: string;
  updated_at?: string;
  category?: Category;
  product_price?: ProductPrice[];
}

// Product Size types
export interface ProductSize {
  size_id: number;
  name: string;
  unit: string;
  quantity: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// Product Price types
export interface ProductPrice {
  product_price_id: number;
  product_id: number;
  size_id: number;
  price: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  product?: Product;
  product_size?: ProductSize;
}

// Transform functions for API responses
export function transformCategory(category: any): Category {
  return {
    category_id: category.category_id,
    name: category.name,
    description: category.description,
    created_at: category.created_at,
    updated_at: category.updated_at,
  };
}

export function transformProduct(product: any): Product {
  return {
    product_id: product.product_id,
    category_id: product.category_id,
    name: product.name,
    description: product.description,
    is_signature: product.is_signature,
    image_path: product.image_path,
    created_at: product.created_at,
    updated_at: product.updated_at,
    category: product.category ? transformCategory(product.category) : undefined,
    product_price: product.product_price ? product.product_price.map(transformProductPrice) : undefined,
  };
}

export function transformProductPrice(productPrice: any): ProductPrice {
  return {
    product_price_id: productPrice.product_price_id,
    product_id: productPrice.product_id,
    size_id: productPrice.size_id,
    price: productPrice.price,
    is_active: productPrice.is_active,
    created_at: productPrice.created_at,
    updated_at: productPrice.updated_at,
    product: productPrice.product ? transformProduct(productPrice.product) : undefined,
    product_size: productPrice.product_size ? transformProductSize(productPrice.product_size) : undefined,
  };
}

export function transformProductSize(productSize: any): ProductSize {
  return {
    size_id: productSize.size_id,
    name: productSize.name,
    unit: productSize.unit,
    quantity: productSize.quantity,
    description: productSize.description,
    created_at: productSize.created_at,
    updated_at: productSize.updated_at,
  };
} 