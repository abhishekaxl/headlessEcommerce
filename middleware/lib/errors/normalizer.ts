/**
 * Error Normalizer
 * Converts Magento errors and other errors into NormalizedError format
 */

import { ErrorSeverity, ErrorSource, NormalizedError } from '../types';

export interface MagentoGraphQLError {
  message: string;
  category?: string;
  extensions?: {
    category?: string;
    [key: string]: unknown;
  };
  locations?: Array<{ line: number; column: number }>;
  path?: (string | number)[];
}

export interface MagentoHTTPError {
  status: number;
  statusText: string;
  message?: string;
  body?: unknown;
}

/**
 * Error code mapping from Magento to Canonical
 */
const MAGENTO_ERROR_CODE_MAP: Record<string, string> = {
  'graphql-no-such-entity': 'PRODUCT_NOT_FOUND',
  'graphql-authorization': 'UNAUTHORIZED',
  'graphql-input': 'INVALID_INPUT',
  'graphql-already-exists': 'ALREADY_EXISTS',
  'graphql-authentication': 'AUTHENTICATION_FAILED',
  'graphql-authorization-required': 'AUTHORIZATION_REQUIRED',
  'graphql-cart-not-found': 'CART_NOT_FOUND',
  'graphql-item-not-found': 'CART_ITEM_NOT_FOUND',
  'graphql-insufficient-stock': 'INSUFFICIENT_STOCK',
  'graphql-invalid-coupon': 'INVALID_COUPON',
  'graphql-payment-error': 'PAYMENT_ERROR',
  'graphql-shipping-error': 'SHIPPING_ERROR',
};

/**
 * Determine if error is retryable based on error code
 */
function isRetryableError(code: string, httpStatus: number): boolean {
  // Network errors and 5xx errors are retryable
  if (httpStatus >= 500) {
    return true;
  }

  // Specific error codes that are retryable
  const retryableCodes = ['NETWORK_ERROR', 'TIMEOUT', 'SERVICE_UNAVAILABLE'];
  return retryableCodes.includes(code);
}

/**
 * Get user-friendly error message
 */
function getUserFriendlyMessage(magentoMessage: string, code: string): string {
  // Map technical Magento messages to user-friendly messages
  const messageMap: Record<string, string> = {
    PRODUCT_NOT_FOUND: 'The requested product is not available',
    UNAUTHORIZED: 'You are not authorized to perform this action',
    INVALID_INPUT: 'The provided information is invalid',
    ALREADY_EXISTS: 'This item already exists',
    AUTHENTICATION_FAILED: 'Invalid email or password',
    AUTHORIZATION_REQUIRED: 'Please log in to continue',
    CART_NOT_FOUND: 'Your cart could not be found',
    CART_ITEM_NOT_FOUND: 'This item is not in your cart',
    INSUFFICIENT_STOCK: 'This product is out of stock',
    INVALID_COUPON: 'This coupon code is invalid or expired',
    PAYMENT_ERROR: 'There was an error processing your payment',
    SHIPPING_ERROR: 'There was an error calculating shipping',
    NETWORK_ERROR: 'Network error. Please try again',
    TIMEOUT: 'Request timed out. Please try again',
    SERVICE_UNAVAILABLE: 'Service temporarily unavailable. Please try again later',
  };

  return messageMap[code] || magentoMessage || 'An error occurred';
}

/**
 * Normalize Magento GraphQL error
 */
export function normalizeMagentoGraphQLError(
  error: MagentoGraphQLError,
  source: ErrorSource = ErrorSource.MAGENTO
): NormalizedError {
  const category = error.category || error.extensions?.category || 'unknown';
  const canonicalCode = MAGENTO_ERROR_CODE_MAP[category] || 'UNKNOWN_ERROR';
  const httpStatus = getHttpStatusFromErrorCode(canonicalCode);
  const retryable = isRetryableError(canonicalCode, httpStatus);
  const path = error.path?.map(String) || [];

  return {
    code: canonicalCode,
    message: getUserFriendlyMessage(error.message, canonicalCode),
    severity: ErrorSeverity.ERROR,
    httpStatus,
    retryable,
    path,
    source,
    details: {
      originalMessage: error.message,
      category,
      locations: error.locations,
    },
  };
}

/**
 * Normalize Magento HTTP error
 */
export function normalizeMagentoHTTPError(
  error: MagentoHTTPError,
  source: ErrorSource = ErrorSource.MAGENTO
): NormalizedError {
  const status = error.status || 500;
  let code = 'UNKNOWN_ERROR';

  // Map HTTP status codes to error codes
  if (status === 400) {
    code = 'INVALID_INPUT';
  } else if (status === 401) {
    code = 'UNAUTHORIZED';
  } else if (status === 403) {
    code = 'AUTHORIZATION_REQUIRED';
  } else if (status === 404) {
    code = 'NOT_FOUND';
  } else if (status === 429) {
    code = 'RATE_LIMIT_EXCEEDED';
  } else if (status >= 500) {
    code = 'SERVICE_UNAVAILABLE';
  }

  const retryable = isRetryableError(code, status);
  const message = error.message || error.statusText || getUserFriendlyMessage('', code);

  return {
    code,
    message,
    severity: ErrorSeverity.ERROR,
    httpStatus: status,
    retryable,
    source,
    details: {
      statusText: error.statusText,
      body: error.body,
    },
  };
}

/**
 * Normalize network error
 */
export function normalizeNetworkError(error: Error): NormalizedError {
  let code = 'NETWORK_ERROR';
  let message = 'Network error. Please check your connection and try again';

  if (error.message.includes('timeout')) {
    code = 'TIMEOUT';
    message = 'Request timed out. Please try again';
  } else if (error.message.includes('ECONNREFUSED')) {
    code = 'SERVICE_UNAVAILABLE';
    message = 'Service temporarily unavailable. Please try again later';
  }

  return {
    code,
    message,
    severity: ErrorSeverity.ERROR,
    httpStatus: 503,
    retryable: true,
    source: ErrorSource.MIDDLEWARE,
    details: {
      originalError: error.message,
    },
  };
}

/**
 * Normalize validation error
 */
export function normalizeValidationError(
  message: string,
  path?: string[]
): NormalizedError {
  return {
    code: 'VALIDATION_ERROR',
    message,
    severity: ErrorSeverity.ERROR,
    httpStatus: 400,
    retryable: false,
    path,
    source: ErrorSource.MIDDLEWARE,
  };
}

/**
 * Normalize authentication error
 */
export function normalizeAuthError(message: string): NormalizedError {
  return {
    code: 'AUTHENTICATION_REQUIRED',
    message,
    severity: ErrorSeverity.ERROR,
    httpStatus: 401,
    retryable: false,
    source: ErrorSource.MIDDLEWARE,
  };
}

/**
 * Get HTTP status code from error code
 */
function getHttpStatusFromErrorCode(code: string): number {
  const statusMap: Record<string, number> = {
    PRODUCT_NOT_FOUND: 404,
    NOT_FOUND: 404,
    UNAUTHORIZED: 401,
    AUTHORIZATION_REQUIRED: 403,
    AUTHENTICATION_FAILED: 401,
    AUTHENTICATION_REQUIRED: 401,
    INVALID_INPUT: 400,
    VALIDATION_ERROR: 400,
    ALREADY_EXISTS: 409,
    CART_NOT_FOUND: 404,
    CART_ITEM_NOT_FOUND: 404,
    INSUFFICIENT_STOCK: 400,
    INVALID_COUPON: 400,
    PAYMENT_ERROR: 402,
    SHIPPING_ERROR: 400,
    RATE_LIMIT_EXCEEDED: 429,
    NETWORK_ERROR: 503,
    TIMEOUT: 504,
    SERVICE_UNAVAILABLE: 503,
  };

  return statusMap[code] || 500;
}

/**
 * Normalize array of Magento GraphQL errors
 */
export function normalizeMagentoGraphQLErrors(
  errors: MagentoGraphQLError[]
): NormalizedError[] {
  return errors.map((error) => normalizeMagentoGraphQLError(error));
}


