/**
 * GraphQL Types
 * TypeScript types for GraphQL operations
 * These should be generated from schema.graphql in production
 */

// Core Types
export interface Money {
  amount: number;
  currency: string;
  formatted: string;
}

export interface PriceRange {
  min: Money;
  max: Money;
}

export interface Media {
  url: string;
  alt?: string;
  type: string;
  width?: number;
  height?: number;
  thumbnail?: string;
}

export interface ProductAttribute {
  code: string;
  label: string;
  value: string;
}

export interface ConfigurableOptionValue {
  id: string;
  label: string;
  code: string;
  swatch?: string;
}

export interface ConfigurableOption {
  id: string;
  label: string;
  code: string;
  values: ConfigurableOptionValue[];
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price?: Money;
  priceRange?: PriceRange;
  specialPrice?: Money;
  images: Media[];
  type: 'SIMPLE' | 'CONFIGURABLE' | 'BUNDLE' | 'GROUPED' | 'VIRTUAL' | 'DOWNLOADABLE';
  stockStatus: 'IN_STOCK' | 'OUT_OF_STOCK' | 'BACKORDER';
  inStock: boolean;
  quantity?: number;
  attributes?: ProductAttribute[];
  configurableOptions?: ConfigurableOption[];
  relatedProducts?: Product[];
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: Media;
  parentId?: string;
  children?: Category[];
  breadcrumbs: Category[];
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
}

export interface CartItem {
  id: string;
  product: Product;
  variant?: Product;
  quantity: number;
  unitPrice: Money;
  rowTotal: Money;
  options?: ProductAttribute[];
}

export interface Cart {
  id: string;
  items: CartItem[];
  itemCount: number;
  subtotal: Money;
  discount?: Money;
  couponCode?: string;
  tax?: Money;
  shipping?: Money;
  total: Money;
}

export interface Address {
  id?: string;
  firstName: string;
  lastName: string;
  company?: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefaultShipping?: boolean;
  isDefaultBilling?: boolean;
}

export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone?: string;
  defaultShippingAddress?: Address;
  defaultBillingAddress?: Address;
  addresses: Address[];
  isEmailVerified: boolean;
  createdAt: string;
}

export interface Order {
  orderNumber: string;
  id: string;
  status: string;
  state: string;
  items: OrderItem[];
  subtotal: Money;
  discount?: Money;
  couponCode?: string;
  tax?: Money;
  shipping?: Money;
  total: Money;
  shippingAddress: Address;
  billingAddress: Address;
  orderDate: string;
  trackingNumber?: string;
  trackingUrl?: string;
}

export interface OrderItem {
  id: string;
  sku: string;
  name: string;
  image?: Media;
  quantity: number;
  unitPrice: Money;
  rowTotal: Money;
  options?: ProductAttribute[];
}

export interface NormalizedError {
  code: string;
  message: string;
  severity: 'INFO' | 'WARN' | 'ERROR';
  httpStatus: number;
  retryable: boolean;
  path?: string[];
  source: 'MAGENTO' | 'MIDDLEWARE';
  details?: Record<string, unknown>;
}

// Request/Response Types
export interface GraphQLRequest {
  query: string;
  variables?: Record<string, unknown>;
  operationName?: string;
}

export interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: NormalizedError[];
}

// Connection Types
export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
  totalCount?: number;
}

export interface ProductConnection {
  items: Product[];
  pageInfo: PageInfo;
  totalCount?: number;
}

export interface OrderConnection {
  items: Order[];
  pageInfo: PageInfo;
  totalCount?: number;
}


