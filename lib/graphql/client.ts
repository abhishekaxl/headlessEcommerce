/**
 * GraphQL Client
 * Client for making requests to the canonical GraphQL API
 */

import { GraphQLRequest, GraphQLResponse } from './types';

/**
 * Get the GraphQL endpoint URL
 * Handles both server-side (absolute URL) and client-side (relative URL) scenarios
 */
function getGraphQLEndpoint(): string {
  // For server-side rendering, use absolute URL
  if (typeof window === 'undefined') {
    let baseUrl = process.env.NEXT_PUBLIC_API_URL;
    
    if (!baseUrl) {
      if (process.env.VERCEL_URL) {
        baseUrl = `https://${process.env.VERCEL_URL}`;
      } else {
        baseUrl = 'http://localhost:3000';
      }
    }
    
    return `${baseUrl}/api/graphql`;
  }
  
  // For client-side, use relative URL
  return process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || '/api/graphql';
}

/**
 * Execute GraphQL query/mutation
 */
export async function executeGraphQL<T = unknown>(
  request: GraphQLRequest
): Promise<GraphQLResponse<T>> {
  try {
    const endpoint = getGraphQLEndpoint();
    console.log(`[GraphQL Client] Making request to: ${endpoint}`);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      // Store context headers
      'X-Store-Code': 'default',
      'X-Locale': 'en_US',
      'X-Currency': 'USD',
    };

    // IMPORTANT: Forward cookies in SSR so cart/customer state works on server-rendered pages
    if (typeof window === 'undefined') {
      try {
        const { cookies } = await import('next/headers');
        const cookieStore = cookies();
        const cookieHeader = cookieStore
          .getAll()
          .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
          .join('; ');
        if (cookieHeader) {
          headers.cookie = cookieHeader;
        }
      } catch (e) {
        console.warn('[GraphQL Client] Could not read cookies for SSR forwarding:', e);
      }
    }

    const cacheableOps = new Set([
      'GetProduct',
      'GetCategory',
      'GetCategories',
      'ProductsByCategory',
      'SearchProducts',
    ]);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      // Ensure cart/customer cookies are always sent from the browser
      credentials: 'include',
      body: JSON.stringify(request),
      // Cache configuration for server components
      ...(typeof window === 'undefined' && request.operationName && cacheableOps.has(request.operationName)
        ? { next: { revalidate: 60 } } // Only cache public catalog queries
        : {}), // No cache config for client-side or mutations
    });

    console.log(`[GraphQL Client] Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      // Try to get error message from response
      let errorMessage = `GraphQL request failed: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.text();
        console.error(`[GraphQL Client] Error response body:`, errorData.substring(0, 500));
        // Try to parse as JSON
        try {
          const errorJson = JSON.parse(errorData);
          if (errorJson.errors && errorJson.errors.length > 0) {
            errorMessage = errorJson.errors[0].message || errorMessage;
          }
        } catch {
          // Not JSON, use text as is
          if (errorData && errorData.length > 0) {
            errorMessage = errorData.substring(0, 200);
          }
        }
      } catch (e) {
        console.error('[GraphQL Client] Could not read error response:', e);
      }
      throw new Error(errorMessage);
    }

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error(`[GraphQL Client] Non-JSON response:`, text.substring(0, 500));
      throw new Error(`Expected JSON response but got ${contentType}. Response: ${text.substring(0, 200)}`);
    }

    const result: GraphQLResponse<T> = await response.json();

    // Handle GraphQL errors
    if (result.errors && result.errors.length > 0) {
      // Log errors for debugging
      console.error('[GraphQL Client] GraphQL errors:', result.errors);
      
      // Throw error with normalized error details
      const firstError = result.errors[0];
      throw new Error(firstError.message || 'GraphQL error occurred');
    }

    return result;
  } catch (error) {
    console.error('[GraphQL Client] Request error:', error);
    
    // Handle network errors specifically
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const endpoint = getGraphQLEndpoint();
      throw new Error(`Network error: Could not connect to ${endpoint}. Make sure the server is running.`);
    }
    
    // Re-throw with more context
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error(`Unknown error: ${String(error)}`);
  }
}

/**
 * Execute GraphQL query (server-side)
 */
export async function query<T = unknown>(
  query: string,
  variables?: Record<string, unknown>,
  operationName?: string
): Promise<T> {
  try {
    const response = await executeGraphQL<T>({
      query,
      variables,
      operationName,
    });

    if (!response.data) {
      // Return empty object/array based on expected return type
      // This prevents errors when data is missing
      console.warn(`[GraphQL Client] Query "${operationName}" returned no data`);
      return {} as T;
    }

    return response.data;
  } catch (error) {
    console.error(`[GraphQL Client] Query "${operationName}" error:`, error);
    
    // For network errors, still return empty to prevent page crashes
    // But log the error clearly
    if (error instanceof Error) {
      if (error.message.includes('Network error') || error.message.includes('fetch')) {
        console.error(`[GraphQL Client] Network error detected. Server may not be running.`);
      }
    }
    
    // Return empty result instead of throwing to prevent page crashes
    // This allows pages to render even if GraphQL fails
    return {} as T;
  }
}

/**
 * Execute GraphQL mutation (client-side)
 */
export async function mutate<T = unknown>(
  mutation: string,
  variables?: Record<string, unknown>,
  operationName?: string
): Promise<T> {
  const response = await executeGraphQL<T>({
    query: mutation,
    variables,
    operationName,
  });

  if (response.errors && response.errors.length > 0) {
    // Return errors in the response for client-side handling
    throw new Error(response.errors[0].message);
  }

  if (!response.data) {
    throw new Error('No data returned from GraphQL mutation');
  }

  return response.data;
}

