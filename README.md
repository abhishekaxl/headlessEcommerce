# Headless eCommerce Portal

Production-grade headless eCommerce portal built with Next.js (App Router), TypeScript, and Magento 2.

## 🚀 Quick Start with Docker

Deploy the complete stack in minutes:

```bash
# Clone the repository
git clone https://github.com/abhishekaxl/headlessEcommerce.git
cd headlessEcommerce

# Start all services
cd docker
docker-compose up -d
```

**Access:**
- 🛒 **Storefront**: http://localhost:3000
- 🔧 **Magento Admin**: http://localhost:8080/admin (admin / Admin@123)
- 📧 **Mailhog**: http://localhost:8025

For detailed Docker setup, see [docker/README.md](./docker/README.md)

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Headless eCommerce                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Next.js Frontend                     │   │
│  │         (Atomic Design Pattern)                   │   │
│  │   atoms → molecules → organisms → templates       │   │
│  └──────────────────────┬───────────────────────────┘   │
│                         │                                │
│  ┌──────────────────────▼───────────────────────────┐   │
│  │         GraphQL Middleware Layer                  │   │
│  │    (Normalization, Caching, Error Handling)       │   │
│  └──────────────────────┬───────────────────────────┘   │
│                         │                                │
│  ┌──────────────────────▼───────────────────────────┐   │
│  │              Magento 2 Backend                    │   │
│  │         (GraphQL API, MySQL, Redis)               │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Project Structure

```
headlessEcommerce/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   ├── category/[slug]/    # Category pages
│   ├── product/[slug]/     # Product detail pages
│   ├── shop/               # Shop listing page
│   ├── cart/               # Cart page
│   ├── checkout/           # Checkout page
│   └── account/            # Account pages
├── components/             # React components (Atomic Design)
│   ├── atoms/              # Basic UI elements (Button, Input, Text, Icon)
│   ├── molecules/          # Combinations (ProductCard, NavLink, SearchBar)
│   ├── organisms/          # Complex sections (Header, Footer, ProductGrid)
│   └── templates/          # Page layouts (MainLayout, ShopLayout)
├── lib/                    # Utilities and helpers
│   └── graphql/            # GraphQL client, queries, mutations
├── middleware/             # GraphQL Normalization Gateway
├── docker/                 # Docker deployment files
│   ├── docker-compose.yml  # Complete stack configuration
│   ├── Dockerfile.frontend # Next.js container
│   └── README.md           # Docker deployment guide
└── docs/                   # Documentation
```

## Features

### Frontend
- ✅ **Atomic Design Pattern** - Scalable component architecture
- ✅ **Megamenu Navigation** - 3-level expandable category menu
- ✅ **Product Catalog** - Categories, products, search
- ✅ **Shopping Cart** - Guest and logged-in cart
- ✅ **Checkout Flow** - Multi-step checkout process
- ✅ **Customer Account** - Login, register, dashboard
- ✅ **Responsive Design** - Mobile-first approach

### Architecture
- ✅ **3-Layer Architecture** - Frontend, Middleware, Backend
- ✅ **Canonical GraphQL API** - Unified API layer
- ✅ **Server-Side Rendering** - SEO optimized
- ✅ **Type-Safe** - Full TypeScript support

## Manual Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Docker Desktop (for Magento)

### Steps

```bash
# 1. Clone repository
git clone https://github.com/abhishekaxl/headlessEcommerce.git
cd headlessEcommerce

# 2. Install dependencies
npm install

# 3. Create environment file
cp docker/env.example .env.local

# 4. Start Magento (Docker)
cd docker
docker-compose up -d magento mysql elasticsearch redis

# 5. Start Next.js development server
cd ..
npm run dev
```

### Environment Variables

Create `.env.local` in project root:

```bash
# Magento Configuration
MAGENTO_GRAPHQL_URL=http://localhost:8080/graphql
MAGENTO_STORE_CODE=default

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_GRAPHQL_ENDPOINT=/api/graphql
```

## Development

```bash
# Development server
npm run dev

# Type check
npm run type-check

# Lint
npm run lint

# Build
npm run build

# Production
npm start
```

## Component Usage (Atomic Design)

```tsx
// Import atoms
import { Button, Text, Icon } from '@/components/atoms';

// Import molecules
import { ProductCard, NavLink } from '@/components/molecules';

// Import organisms
import { Header, Footer, ProductGrid } from '@/components/organisms';

// Import templates
import { MainLayout, ShopLayout } from '@/components/templates';
```

## Documentation

- [Docker Deployment Guide](./docker/README.md)
- [Architecture Blueprint](./docs/02-architecture-blueprint.md)
- [GraphQL Schema](./docs/03-canonical-graphql-schema.md)
- [Test Strategy](./docs/06-test-strategy.md)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18, TypeScript |
| Styling | CSS Variables, styled-jsx |
| Backend | Magento 2.4.7, GraphQL |
| Database | MySQL 8.0 |
| Search | Elasticsearch 7.17 |
| Cache | Redis 7 |
| Container | Docker, Docker Compose |

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT

## Support

For issues, create a GitHub issue at:
https://github.com/abhishekaxl/headlessEcommerce/issues
