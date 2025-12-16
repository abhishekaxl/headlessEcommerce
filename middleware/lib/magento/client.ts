/**
 * Magento GraphQL Client
 * Handles communication with Magento GraphQL API
 */

import { config } from '../config';
import { RequestContext } from '../types';
import { getMagentoAuthHeaders } from '../auth/auth-handler';
import {
  normalizeMagentoGraphQLErrors,
  normalizeMagentoHTTPError,
  normalizeNetworkError,
} from '../errors/normalizer';
import { NormalizedError, ErrorSeverity, ErrorSource } from '../types';

export interface MagentoGraphQLRequest {
  query: string;
  variables?: Record<string, unknown>;
  operationName?: string;
}

export interface MagentoGraphQLResponse<T = unknown> {
  data?: T;
  errors?: Array<{
    message: string;
    category?: string;
    extensions?: {
      category?: string;
      [key: string]: unknown;
    };
    locations?: Array<{ line: number; column: number }>;
    path?: (string | number)[];
  }>;
}

/**
 * Execute GraphQL query/mutation against Magento
 */
export async function executeMagentoGraphQL<T = unknown>(
  request: MagentoGraphQLRequest,
  context: RequestContext
): Promise<{ data?: T; errors?: NormalizedError[] }> {
  const url = config.magento.graphqlUrl;
  const authHeaders = getMagentoAuthHeaders({
    customerToken: context.customerToken,
    cartToken: context.cartToken,
  });

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Store-Code': context.storeCode,
    'X-Locale': context.locale,
    'X-Currency': context.currency,
    'X-Correlation-ID': context.correlationId,
    ...authHeaders,
  };

  const body = JSON.stringify({
    query: request.query,
    variables: request.variables || {},
    operationName: request.operationName,
  });

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.magento.timeout);

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error: {
        status: number;
        statusText: string;
        message?: string;
        body?: unknown;
      } = {
        status: response.status,
        statusText: response.statusText,
      };

      try {
        error.body = await response.json();
      } catch {
        error.message = await response.text();
      }

      const normalizedError = normalizeMagentoHTTPError(error);
      return { errors: [normalizedError] };
    }

    const result: MagentoGraphQLResponse<T> = await response.json();

    // Handle Magento GraphQL errors
    if (result.errors && result.errors.length > 0) {
      const normalizedErrors = normalizeMagentoGraphQLErrors(result.errors);
      return {
        data: result.data,
        errors: normalizedErrors,
      };
    }

    return { data: result.data };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          errors: [
            {
              code: 'TIMEOUT',
              message: 'Request timed out. Please try again',
              severity: ErrorSeverity.ERROR,
              httpStatus: 504,
              retryable: true,
              source: ErrorSource.MIDDLEWARE,
            },
          ],
        };
      }

      const normalizedError = normalizeNetworkError(error);
      return { errors: [normalizedError] };
    }

    return {
      errors: [
        {
          code: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred',
          severity: ErrorSeverity.ERROR,
          httpStatus: 500,
          retryable: false,
          source: ErrorSource.MIDDLEWARE,
        },
      ],
    };
  }
}

/**
 * Retry logic for failed requests
 */
export async function executeMagentoGraphQLWithRetry<T = unknown>(
  request: MagentoGraphQLRequest,
  context: RequestContext,
  maxRetries = 3
): Promise<{ data?: T; errors?: NormalizedError[] }> {
  let lastError: NormalizedError[] | undefined;
  let attempt = 0;

  while (attempt < maxRetries) {
    const result = await executeMagentoGraphQL<T>(request, context);

    if (!result.errors || result.errors.length === 0) {
      return result;
    }

    // Check if error is retryable
    const retryable = result.errors.some((error) => error.retryable);
    if (!retryable) {
      return result;
    }

    lastError = result.errors;
    attempt++;

    // Exponential backoff
    if (attempt < maxRetries) {
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return { errors: lastError };
}

