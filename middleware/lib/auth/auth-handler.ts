/**
 * Authentication Handler
 * Manages customer authentication and token handling
 */

import { RequestContext } from '../types';
import { normalizeAuthError } from '../errors/normalizer';

export interface AuthTokens {
  customerToken?: string;
  cartToken?: string;
}

/**
 * Extract authentication tokens from request
 */
export function extractAuthTokens(context: RequestContext): AuthTokens {
  return {
    customerToken: context.customerToken,
    cartToken: context.cartToken,
  };
}

/**
 * Validate customer token
 * In production, this would verify the token with Magento
 */
export async function validateCustomerToken(
  token: string | undefined
): Promise<boolean> {
  if (!token) {
    return false;
  }

  // TODO: Implement actual token validation with Magento
  // For now, just check if token exists and has valid format
  return token.length > 0;
}

/**
 * Check if request requires authentication
 */
export function requiresAuthentication(
  operationName: string,
  hasToken: boolean
): { required: boolean; error?: string } {
  // Check if operation requires auth
  // This should match the operation registry
  const authRequiredOperations = [
    'GetCustomer',
    'GetCustomerOrders',
    'GetOrder',
    'Logout',
    'UpdateProfile',
    'ChangePassword',
    'AddAddress',
    'UpdateAddress',
    'DeleteAddress',
    'SetDefaultShippingAddress',
    'SetDefaultBillingAddress',
  ];

  const requiresAuth = authRequiredOperations.includes(operationName);

  if (requiresAuth && !hasToken) {
    return {
      required: true,
      error: 'Authentication required for this operation',
    };
  }

  return { required: false };
}

/**
 * Get Magento authorization headers
 */
export function getMagentoAuthHeaders(tokens: AuthTokens): Record<string, string> {
  const headers: Record<string, string> = {};

  if (tokens.customerToken) {
    headers['Authorization'] = `Bearer ${tokens.customerToken}`;
  }

  // Cart token can be passed as a custom header or in the request
  if (tokens.cartToken) {
    headers['X-Cart-Token'] = tokens.cartToken;
  }

  return headers;
}

/**
 * Handle authentication error
 */
export function createAuthError(message: string) {
  return normalizeAuthError(message);
}


