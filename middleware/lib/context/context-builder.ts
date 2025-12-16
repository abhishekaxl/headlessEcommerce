/**
 * Context Builder
 * Builds request context from incoming request
 */

import { RequestContext } from '../types';
import { config } from '../config';

/**
 * Generate UUID v4
 * Simple implementation - in production, use a proper UUID library
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export interface RequestHeaders {
  'x-correlation-id'?: string;
  'x-store-code'?: string;
  'x-locale'?: string;
  'x-currency'?: string;
  authorization?: string;
  'x-cart-token'?: string;
  'x-forwarded-for'?: string;
  'user-agent'?: string;
}

/**
 * Build request context from headers and cookies
 */
export function buildContext(headers: RequestHeaders, cookies: Record<string, string>): RequestContext {
  // Extract correlation ID or generate new one
  const correlationId = headers['x-correlation-id'] || generateUUID();

  // Extract store, locale, currency from headers or use defaults
  const storeCode = headers['x-store-code'] || config.magento.storeCode;
  const locale = headers['x-locale'] || config.magento.defaultLocale;
  const currency = headers['x-currency'] || config.magento.defaultCurrency;

  // Extract customer token from Authorization header or cookie
  let customerToken: string | undefined;
  if (headers.authorization) {
    // Extract Bearer token
    const match = headers.authorization.match(/^Bearer\s+(.+)$/i);
    if (match) {
      customerToken = match[1];
    }
  } else if (cookies['customer-token']) {
    customerToken = cookies['customer-token'];
  }

  // Extract cart token from header or cookie
  const cartToken = headers['x-cart-token'] || cookies['cart-token'];

  // Extract IP address
  const ipAddress = headers['x-forwarded-for']?.split(',')[0]?.trim();

  // Extract user agent
  const userAgent = headers['user-agent'];

  return {
    correlationId,
    storeCode,
    locale,
    currency,
    customerToken,
    cartToken,
    ipAddress,
    userAgent,
  };
}

/**
 * Generate correlation ID
 */
export function generateCorrelationId(): string {
  return generateUUID();
}

