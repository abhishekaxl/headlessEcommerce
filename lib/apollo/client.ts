/**
 * Apollo Client Configuration
 * Client for making GraphQL requests using Apollo Client
 */

import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

/**
 * Get the GraphQL endpoint URL
 */
function getGraphQLEndpoint(): string {
  if (typeof window === 'undefined') {
    // Server-side: use absolute URL
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
  // Client-side: use relative URL
  return process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || '/api/graphql';
}

/**
 * HTTP Link for Apollo Client
 */
const httpLink = createHttpLink({
  uri: getGraphQLEndpoint(),
  credentials: 'include', // Include cookies for cart/customer state
});

/**
 * Auth Link - Add headers and cookies
 */
const authLink = setContext(async (_, { headers }) => {
  const newHeaders: Record<string, string> = {
    ...headers,
    'Content-Type': 'application/json',
    'X-Store-Code': 'default',
    'X-Locale': 'en_US',
    'X-Currency': 'USD',
  };

  // Forward cookies in SSR
  if (typeof window === 'undefined') {
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = cookies();
      const cookieHeader = cookieStore
        .getAll()
        .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
        .join('; ');
      if (cookieHeader) {
        newHeaders.cookie = cookieHeader;
      }
    } catch (e) {
      console.warn('[Apollo Client] Could not read cookies for SSR:', e);
    }
  }

  return {
    headers: newHeaders,
  };
});

/**
 * Error Link - Handle GraphQL errors
 */
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    if (networkError.message.includes('fetch')) {
      const endpoint = getGraphQLEndpoint();
      console.error(`Could not connect to ${endpoint}. Make sure the server is running.`);
    }
  }
});

/**
 * Create Apollo Client instance
 */
export function createApolloClient() {
  return new ApolloClient({
    link: from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            // Cache policies for better performance
            productsByCategory: {
              merge(existing, incoming, { args }) {
                // Merge paginated results
                if (args?.pagination?.cursor) {
                  return {
                    ...incoming,
                    items: [...(existing?.items || []), ...(incoming?.items || [])],
                  };
                }
                return incoming;
              },
            },
            searchProducts: {
              merge(existing, incoming, { args }) {
                if (args?.pagination?.cursor) {
                  return {
                    ...incoming,
                    items: [...(existing?.items || []), ...(incoming?.items || [])],
                  };
                }
                return incoming;
              },
            },
          },
        },
      },
    }),
    ssrMode: typeof window === 'undefined',
    defaultOptions: {
      watchQuery: {
        errorPolicy: 'all',
      },
      query: {
        errorPolicy: 'all',
        fetchPolicy: 'cache-first',
      },
      mutate: {
        errorPolicy: 'all',
      },
    },
  });
}

/**
 * Get or create Apollo Client instance
 * For SSR, we need a new client for each request
 */
let apolloClient: ApolloClient<any> | null = null;

export function getApolloClient() {
  // Create new client for each SSR request
  if (typeof window === 'undefined') {
    return createApolloClient();
  }

  // Reuse client for client-side
  if (!apolloClient) {
    apolloClient = createApolloClient();
  }

  return apolloClient;
}
