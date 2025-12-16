# GraphQL Normalization Gateway (Middleware)

यह middleware layer canonical GraphQL API expose करता है और Magento GraphQL API के साथ communicate करता है।

## Structure

```
middleware/
├── lib/
│   ├── config/          # Configuration
│   ├── types/            # TypeScript types
│   ├── registry/         # Operation registry
│   ├── errors/           # Error normalizer
│   ├── auth/             # Authentication handlers
│   ├── cart/             # Cart management
│   ├── magento/          # Magento client
│   ├── translators/      # Canonical → Magento translators
│   ├── validation/       # Request validators
│   └── context/          # Context builders
└── api/
    └── graphql/          # GraphQL endpoint
```

## Features

- ✅ Operation registry (whitelist only)
- ✅ Request validation
- ✅ Error normalization
- ✅ Authentication handling
- ✅ Cart management
- ✅ Magento GraphQL client
- ✅ Translators (Catalog implemented)
- ✅ Context building

## Environment Variables

```bash
MAGENTO_GRAPHQL_URL=https://magento-instance.com/graphql
MAGENTO_STORE_CODE=default
DEFAULT_LOCALE=en_US
DEFAULT_CURRENCY=USD
MAGENTO_TIMEOUT=30000
CACHE_ENABLED=true
CACHE_TTL_PRODUCT=300
CACHE_TTL_CATEGORY=600
CACHE_TTL_SEARCH=120
RATE_LIMIT_ENABLED=true
RATE_LIMIT_GLOBAL_MINUTE=100
RATE_LIMIT_GLOBAL_HOUR=1000
MAX_QUERY_DEPTH=10
MAX_QUERY_COMPLEXITY=1000
MAX_PAYLOAD_SIZE=1048576
LOGGING_ENABLED=true
METRICS_ENABLED=true
```

## Usage

Middleware `/api/graphql` endpoint पर available है।

### Example Request

```bash
curl -X POST https://your-domain.com/api/graphql \
  -H "Content-Type: application/json" \
  -H "X-Store-Code: default" \
  -H "X-Locale: en_US" \
  -H "X-Currency: USD" \
  -d '{
    "query": "query GetProduct($slug: String!) { product(slug: $slug) { id name price { amount currency } } }",
    "variables": { "slug": "laptop-123" },
    "operationName": "GetProduct"
  }'
```

## Development

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Test
npm run test
```

## TODO

- [ ] Complete cart translator
- [ ] Complete checkout translator
- [ ] Complete customer translator
- [ ] Complete order translator
- [ ] Implement caching layer
- [ ] Implement rate limiting
- [ ] Add observability (logging, metrics)
- [ ] Add unit tests
- [ ] Add integration tests

