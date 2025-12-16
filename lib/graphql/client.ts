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
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add store context headers if needed
        'X-Store-Code': 'default',
        'X-Locale': 'en_US',
        'X-Currency': 'USD',
      },
      body: JSON.stringify(request),
      // Cache configuration for server components
      ...(typeof window === 'undefined' && request.operationName?.startsWith('Get')
        ? { next: { revalidate: 60 } } // Revalidate every minute for queries (server-side only)
        : {}), // No cache config for client-side or mutations
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.statusText}`);
    }

    const result: GraphQLResponse<T> = await response.json();

    // Handle GraphQL errors
    if (result.errors && result.errors.length > 0) {
      // Log errors for debugging
      console.error('GraphQL errors:', result.errors);
      
      // Throw error with normalized error details
      const firstError = result.errors[0];
      throw new Error(firstError.message || 'GraphQL error occurred');
    }

    return result;
  } catch (error) {
    console.error('GraphQL request error:', error);
    throw error;
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
      console.warn('GraphQL query returned no data');
      return {} as T;
    }

    return response.data;
  } catch (error) {
    console.error('GraphQL query error:', error);
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

