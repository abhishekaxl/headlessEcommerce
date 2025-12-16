/**
 * TypeScript Types for Canonical GraphQL Schema
 * These types should be generated from schema.graphql in production
 * For now, we define them manually for the scaffold
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

export interface Media {
  url: string;
  alt?: string;
  type: string;
  width?: number;
  height?: number;
  thumbnail?: string;
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
  totalCount?: number;
}

// Error Types
export enum ErrorSeverity {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export enum ErrorSource {
  MAGENTO = 'MAGENTO',
  MIDDLEWARE = 'MIDDLEWARE',
}

export interface NormalizedError {
  code: string;
  message: string;
  severity: ErrorSeverity;
  httpStatus: number;
  retryable: boolean;
  path?: string[];
  source: ErrorSource;
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

// Context Types
export interface RequestContext {
  correlationId: string;
  storeCode: string;
  locale: string;
  currency: string;
  customerToken?: string;
  cartToken?: string;
  ipAddress?: string;
  userAgent?: string;
}

