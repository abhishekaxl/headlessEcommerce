/**
 * Middleware Configuration
 * Environment-based configuration for the GraphQL Normalization Gateway
 */

export interface MiddlewareConfig {
  magento: {
    graphqlUrl: string;
    storeCode: string;
    defaultLocale: string;
    defaultCurrency: string;
    timeout: number;
  };
  cache: {
    enabled: boolean;
    ttl: {
      product: number;
      category: number;
      search: number;
    };
  };
  rateLimit: {
    enabled: boolean;
    global: {
      requestsPerMinute: number;
      requestsPerHour: number;
    };
    operations: {
      [key: string]: {
        requestsPerMinute: number;
      };
    };
  };
  security: {
    introspection: boolean;
    maxQueryDepth: number;
    maxQueryComplexity: number;
    maxPayloadSize: number; // bytes
  };
  observability: {
    logging: boolean;
    metrics: boolean;
  };
}

export const getConfig = (): MiddlewareConfig => {
  return {
    magento: {
      graphqlUrl: process.env.MAGENTO_GRAPHQL_URL || 'https://magento-instance.com/graphql',
      storeCode: process.env.MAGENTO_STORE_CODE || 'default',
      defaultLocale: process.env.DEFAULT_LOCALE || 'en_US',
      defaultCurrency: process.env.DEFAULT_CURRENCY || 'USD',
      timeout: parseInt(process.env.MAGENTO_TIMEOUT || '30000', 10),
    },
    cache: {
      enabled: process.env.CACHE_ENABLED !== 'false',
      ttl: {
        product: parseInt(process.env.CACHE_TTL_PRODUCT || '300', 10), // 5 minutes
        category: parseInt(process.env.CACHE_TTL_CATEGORY || '600', 10), // 10 minutes
        search: parseInt(process.env.CACHE_TTL_SEARCH || '120', 10), // 2 minutes
      },
    },
    rateLimit: {
      enabled: process.env.RATE_LIMIT_ENABLED !== 'false',
      global: {
        requestsPerMinute: parseInt(process.env.RATE_LIMIT_GLOBAL_MINUTE || '100', 10),
        requestsPerHour: parseInt(process.env.RATE_LIMIT_GLOBAL_HOUR || '1000', 10),
      },
      operations: {
        GetProduct: { requestsPerMinute: 60 },
        SearchProducts: { requestsPerMinute: 30 },
        AddToCart: { requestsPerMinute: 20 },
        PlaceOrder: { requestsPerMinute: 10 },
        Login: { requestsPerMinute: 5 },
      },
    },
    security: {
      introspection: process.env.NODE_ENV !== 'production',
      maxQueryDepth: parseInt(process.env.MAX_QUERY_DEPTH || '10', 10),
      maxQueryComplexity: parseInt(process.env.MAX_QUERY_COMPLEXITY || '1000', 10),
      maxPayloadSize: parseInt(process.env.MAX_PAYLOAD_SIZE || '1048576', 10), // 1MB
    },
    observability: {
      logging: process.env.LOGGING_ENABLED !== 'false',
      metrics: process.env.METRICS_ENABLED !== 'false',
    },
  };
};

export const config = getConfig();



