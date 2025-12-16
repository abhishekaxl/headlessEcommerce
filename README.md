# Headless eCommerce Portal

Production-grade headless eCommerce portal built with Next.js (App Router), TypeScript, and Magento 2.

## Architecture

- **Frontend**: Next.js 14+ (App Router), React 18+, TypeScript
- **Middleware**: GraphQL Normalization Gateway (Next.js API Routes)
- **Backend**: Magento 2 (GraphQL API)

## Project Structure

```
headless-ecommerce-portal/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   ├── category/[slug]/    # Category pages
│   ├── product/[slug]/     # Product detail pages
│   ├── cart/               # Cart page
│   ├── checkout/           # Checkout page
│   ├── account/            # Account pages
│   └── search/             # Search results
├── components/             # React components
│   ├── catalog/            # Catalog components
│   ├── cart/               # Cart components
│   ├── checkout/           # Checkout components
│   └── account/            # Account components
├── lib/                    # Utilities and helpers
│   └── graphql/            # GraphQL client, queries, mutations
├── middleware/             # GraphQL Normalization Gateway
│   └── lib/                # Middleware logic
├── api/                    # API routes
│   └── graphql/            # GraphQL endpoint
└── docs/                   # Documentation
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Docker Desktop (or Docker Engine + Docker Compose)
- Magento 2 instance with GraphQL API (see [Magento 2 Setup](#magento-2-setup) below)

### Installation

```bash
# Install dependencies
npm install

# Install middleware dependencies
cd middleware
npm install
cd ..
```

### Magento 2 Setup

**Quick Setup with Docker:**

1. Navigate to Magento 2 directory:
   ```bash
   cd magento2
   ```

2. Follow the setup instructions in `magento2/README.md` or `magento2/QUICKSTART.md`

3. After installation, Magento will be available at:
   - Frontend: http://localhost
   - Admin: http://localhost/admin
   - GraphQL: http://localhost/graphql

**For detailed instructions, see:** [magento2/README.md](./magento2/README.md)

### Environment Variables

Create a `.env.local` file in the project root:

```bash
# Magento Configuration (use localhost if using Docker setup)
MAGENTO_GRAPHQL_URL=http://localhost/graphql
MAGENTO_STORE_CODE=default
DEFAULT_LOCALE=en_US
DEFAULT_CURRENCY=USD

# GraphQL Endpoint
NEXT_PUBLIC_GRAPHQL_ENDPOINT=/api/graphql

# Middleware Configuration
CACHE_ENABLED=true
RATE_LIMIT_ENABLED=true
```

### Development

```bash
# Run development server
npm run dev

# Type check
npm run type-check

# Lint
npm run lint
```

### Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Features

### Phase 1 (MVP)

- ✅ Catalog browsing (categories, products)
- ✅ Product detail pages
- ✅ Search functionality
- ✅ Shopping cart (guest and logged-in)
- ✅ Checkout flow
- ✅ Customer account management
- ✅ Order history

### Architecture Features

- ✅ 3-layer architecture (Frontend, Middleware, Magento)
- ✅ Canonical GraphQL API
- ✅ Error normalization
- ✅ Type-safe operations
- ✅ Server-side rendering (SSR)
- ✅ Incremental Static Regeneration (ISR)

## Documentation

### Project Documentation

See `/docs` directory for detailed documentation:

- `01-requirements-breakdown.md` - Requirements and user stories
- `02-architecture-blueprint.md` - Architecture design
- `03-canonical-graphql-schema.md` - GraphQL schema documentation
- `06-test-strategy.md` - Testing strategy and guidelines

### Magento 2 Documentation

- `magento2/README.md` - Complete Magento 2 Docker setup guide
- `magento2/QUICKSTART.md` - Quick start guide for Magento 2

## License

MIT

