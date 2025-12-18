# Headless eCommerce Portal

Production-grade headless eCommerce portal built with Next.js (App Router), TypeScript, and Magento 2.

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed
- Docker Compose v2+
- At least 8GB RAM allocated to Docker
- 20GB free disk space
- Node.js 18+ and npm

### 1. Clone and Start Services

```bash
# Clone repository
git clone https://github.com/abhishekaxl/headlessEcommerce.git
cd headlessEcommerce/docker

# Start all services (Magento installs automatically on first run)
docker compose up -d
```

**Note:** First-time Magento installation takes ~15-20 minutes. Check progress:
```bash
docker logs -f headless-magento
```

### 2. Start Next.js Frontend

```bash
# From project root
cd ..
npm install
npm run dev
```

### 3. Access Your Application

| Service | URL | Credentials |
|---------|-----|-------------|
| **Next.js Frontend** | http://localhost:3000 | - |
| **Magento Frontend** | http://localhost:8080 | - |
| **Magento Admin** | http://localhost:8080/admin | admin / Admin@123 |
| **phpMyAdmin** | http://localhost:8081 | root / rootpassword |
| **Mailhog** | http://localhost:8025 | - |

## 📋 Environment Variables

Create `.env.local` in project root:

```bash
MAGENTO_GRAPHQL_URL=http://localhost:8080/graphql
MAGENTO_STORE_CODE=default
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_GRAPHQL_ENDPOINT=/api/graphql
```

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────┐
│              Next.js Frontend (localhost:3000)          │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Apollo Client (GraphQL Client)           │   │
│  └──────────────────────┬───────────────────────────┘   │
└─────────────────────────┼───────────────────────────────┘
                          │ Canonical GraphQL
┌─────────────────────────▼───────────────────────────────┐
│         GraphQL Middleware (/api/graphql)               │
│  ┌──────────────────────────────────────────────────┐   │
│  │  - Translators (Canonical → Magento)             │   │
│  │  - Normalizers (Magento → Canonical)             │   │
│  │  - Error Handling                                │   │
│  └──────────────────────┬───────────────────────────┘   │
└─────────────────────────┼───────────────────────────────┘
                          │ Magento GraphQL
┌─────────────────────────▼───────────────────────────────┐
│          Magento 2.4.7 Backend (localhost:8080)         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  GraphQL API | MySQL | Elasticsearch | Redis     │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### GraphQL Architecture

The application uses a **two-layer GraphQL architecture**:

1. **Frontend Layer (Apollo Client)**
   - Location: `lib/apollo/`
   - Purpose: React components → Middleware communication
   - Format: Canonical GraphQL (abstracted)
   - Features: Automatic caching, React hooks, error handling

2. **Middleware Layer (Magento GraphQL Client)**
   - Location: `middleware/lib/magento/client.ts`
   - Purpose: Middleware → Magento communication
   - Format: Magento-specific GraphQL
   - Features: Authentication, error normalization, retry logic

### Data Flow Example

**Adding Product to Cart:**
1. Frontend: `useAddToCart()` hook → Apollo Client → `/api/graphql`
2. Middleware: Translates canonical mutation → Magento GraphQL
3. Magento: Executes mutation, returns response
4. Middleware: Normalizes response → Returns to Apollo Client
5. Frontend: Apollo Client updates cache automatically

## 💻 Development

### Using Apollo Client

#### Client Components (React Hooks)

```tsx
'use client';

import { useProduct, useAddToCart, useCart } from '@/lib/apollo/hooks';

export function ProductPage({ slug }: { slug: string }) {
  const { product, loading, error } = useProduct(slug);
  const { addToCart, loading: adding } = useAddToCart();
  const { cart } = useCart();

  const handleAddToCart = async () => {
    try {
      await addToCart(product.sku, 1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>{product.name}</h1>
      <button onClick={handleAddToCart} disabled={adding}>
        Add to Cart
      </button>
    </div>
  );
}
```

#### Server Components

```tsx
import { getApolloClient } from '@/lib/apollo/client';
import { GET_PRODUCTS_BY_CATEGORY } from '@/lib/apollo/queries';

export default async function HomePage() {
  const client = getApolloClient();
  const { data } = await client.query({
    query: GET_PRODUCTS_BY_CATEGORY,
    variables: {
      categorySlug: 'gear',
      pagination: { limit: 10 },
    },
    fetchPolicy: 'no-cache',
  });

  return (
    <div>
      {data.productsByCategory.items.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
```

### Available Apollo Hooks

**Query Hooks:**
- `useProduct(slug)` - Get single product
- `useProductsByCategory(categorySlug, pagination?, filters?, sort?)` - Get products by category
- `useCategories(parentId?)` - Get categories
- `useCategory(slug)` - Get single category
- `useSearchProducts(query, pagination?, filters?, sort?)` - Search products
- `useCart()` - Get current cart
- `useCustomer()` - Get current customer
- `useCustomerOrders(pagination?)` - Get customer orders
- `useOrder(orderNumber)` - Get order by order number

**Mutation Hooks:**
- `useAddToCart()` - Add product to cart
- `useUpdateCartItem()` - Update cart item quantity
- `useRemoveCartItem()` - Remove item from cart
- `useApplyCoupon()` - Apply coupon code
- `useRemoveCoupon()` - Remove coupon
- `useRegister()` - Register new customer
- `useLogin()` - Login customer
- `useLogout()` - Logout customer
- `usePlaceOrder()` - Place order
- `useSetShippingAddress()` - Set shipping address
- `useSetBillingAddress()` - Set billing address
- `useSetShippingMethod()` - Set shipping method
- `useSetPaymentMethod()` - Set payment method

## 🐳 Docker Commands

```bash
# Start all services
cd docker && docker compose up -d

# View logs
docker logs -f headless-magento
docker compose logs -f [service_name]

# Stop services
docker compose down

# Fresh restart (deletes all data)
docker compose down -v && docker compose up -d

# Access Magento CLI
docker exec headless-magento bin/magento [command]

# Fix CSS/JS issues (if frontend/admin looks broken)
cd docker && ./fix-static-content.sh
```

## 🧪 Testing

### Test Cart Functionality

#### Direct Magento API Test

```bash
# Create cart
CART_ID=$(curl -s "http://localhost:8080/graphql" -X POST \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { createEmptyCart }"}' | jq -r '.data.createEmptyCart')

# Add product to cart
curl -s "http://localhost:8080/graphql" -X POST \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"mutation { addProductsToCart(cartId: \\\"$CART_ID\\\", cartItems: [{ sku: \\\"24-WG01\\\", quantity: 1.0 }]) { cart { id items { id quantity product { name } } } user_errors { message } } }\"}"
```

#### Test via Next.js API (with cookies)

```bash
# Get cart (creates cart token cookie)
curl -s "http://localhost:3000/api/graphql" -X POST \
  -H "Content-Type: application/json" \
  -d '{"query":"query { cart { id itemCount } }","operationName":"GetCart"}' \
  -c /tmp/cookies.txt

# Add to cart (uses cart token from cookie)
curl -s "http://localhost:3000/api/graphql" -X POST \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation AddToCart($input: AddToCartInput!) { addToCart(input: $input) { cart { id itemCount items { id quantity product { name } } } errors { message } } }","variables":{"input":{"sku":"24-WG01","quantity":1}},"operationName":"AddToCart"}' \
  -b /tmp/cookies.txt -c /tmp/cookies.txt
```

## 🔧 Troubleshooting

### CSS/JS Issues (Layout Breaking)

If Magento frontend or admin panel CSS is not loading:

```bash
cd docker && ./fix-static-content.sh
```

Or manually:

```bash
docker exec headless-magento bash -c "cd /var/www/html && \
  bin/magento deploy:mode:set developer && \
  bin/magento setup:static-content:deploy -f en_US && \
  bin/magento cache:flush && \
  chown -R www-data:www-data ."
```

### Magento 503 Error

- Wait for installation to complete: `docker logs -f headless-magento`
- Check MySQL is healthy: `docker ps | grep mysql`

### Database Connection Error

```bash
# Check MySQL status
docker ps | grep mysql

# Should show "healthy" status
```

### Permission Issues

```bash
docker exec headless-magento chown -R www-data:www-data /var/www/html
```

### Cart Token Issues

If products aren't adding to cart:
- Ensure cookies are enabled in browser
- Check browser DevTools → Network tab for cookie headers
- Verify cart token is created on first request

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), React 18, TypeScript |
| GraphQL Client | Apollo Client |
| Backend | Magento 2.4.7, GraphQL API |
| Database | MySQL 8.0 |
| Search | Elasticsearch 7.17 |
| Cache | Redis 7 |
| Web Server | Nginx |
| PHP Runtime | PHP-FPM 8.2 |

## 📁 Project Structure

```
headlessEcommerce/
├── app/                    # Next.js app router pages
│   ├── api/graphql/       # GraphQL middleware endpoint
│   ├── page.tsx           # Homepage
│   ├── product/[slug]/    # Product pages
│   ├── cart/              # Cart page
│   └── ...
├── components/            # React components
│   ├── atoms/            # Basic components
│   ├── molecules/        # Composite components
│   ├── organisms/        # Complex components
│   └── ...
├── lib/
│   ├── apollo/           # Apollo Client setup & hooks
│   │   ├── client.ts     # Apollo Client configuration
│   │   ├── hooks.ts      # React hooks for GraphQL
│   │   ├── queries.ts    # GraphQL query documents
│   │   └── mutations.ts  # GraphQL mutation documents
│   └── graphql/
│       └── types.ts      # TypeScript type definitions
├── middleware/           # GraphQL middleware layer
│   └── lib/
│       ├── translators/  # Canonical → Magento translation
│       ├── magento/      # Magento GraphQL client
│       └── ...
└── docker/              # Docker configuration
    ├── docker-compose.yml
    ├── Dockerfile.magento
    └── entrypoint.sh    # Automated Magento installation
```

## 🔑 Adobe Credentials

Adobe Commerce Marketplace credentials are stored in `docker/auth.json`:
- **Public Key**: 903a085d52adb99acec8bc43ce31be08
- **Private Key**: e01cc3e6d30310552a150996fc98032f

These are used to download Magento packages from `repo.magento.com`.

## 📝 Key Features

- ✅ Fully automated Magento installation via Docker
- ✅ Apollo Client for GraphQL operations
- ✅ React hooks for easy component integration
- ✅ GraphQL middleware for API abstraction
- ✅ Type-safe with TypeScript
- ✅ Server-side rendering support
- ✅ Automatic cart management
- ✅ Error handling and normalization

## 📄 License

MIT
