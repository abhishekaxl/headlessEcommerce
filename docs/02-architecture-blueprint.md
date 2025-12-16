# Deliverable #2: Architecture Blueprint
## Headless eCommerce Portal - Phase 1 (MVP)

**Document Version:** 1.0  
**Date:** 2024  
**Status:** Draft

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [3-Layer Architecture](#3-layer-architecture)
3. [Component Interaction Diagrams](#component-interaction-diagrams)
4. [Data Flow Diagrams](#data-flow-diagrams)
5. [Request/Response Flow](#requestresponse-flow)
6. [Authentication & Session Management](#authentication--session-management)
7. [Error Handling Architecture](#error-handling-architecture)
8. [Caching Strategy](#caching-strategy)
9. [Security Architecture](#security-architecture)
10. [Deployment Architecture](#deployment-architecture)
11. [Technology Stack Details](#technology-stack-details)

---

## Architecture Overview

यह headless eCommerce portal एक **3-layer architecture** follow करता है जहां:

1. **Frontend Layer (Next.js Storefront)** - User interface और UX
2. **Middleware Layer (GraphQL Normalization Gateway)** - Translation और normalization
3. **Backend Layer (Magento 2)** - System of record

**Key Principles:**
- Frontend कभी भी Magento को directly call नहीं करता
- सभी communication canonical GraphQL API के माध्यम से होती है
- Middleware Magento-specific details को frontend से hide करता है
- Type-safe operations end-to-end

---

## 3-Layer Architecture

### Layer 1: React Storefront (Next.js)

**Location:** Vercel (Frontend deployment)  
**Technology:** Next.js 14+ (App Router), React 18+, TypeScript

**Responsibilities:**
- UI rendering (Server Components + Client Components)
- Routing और navigation
- SEO optimization (SSR, ISR, meta tags)
- User experience और interactions
- Form handling और validation (client-side)
- State management (React Context, Server State)
- Image optimization
- Accessibility compliance

**Key Components:**
```
/app                          # Next.js App Router
  /(routes)                   # Public routes
    /category/[slug]          # Category pages
    /product/[slug]           # Product detail pages
    /search                   # Search results
    /cart                     # Cart page
    /checkout                 # Checkout flow
    /account                  # Customer account (protected)
  /api                        # API routes (if needed for server actions)
/components                   # React components
  /ui                         # Base UI components
  /catalog                    # Catalog components
  /cart                       # Cart components
  /checkout                   # Checkout components
  /account                    # Account components
/lib                          # Utilities and helpers
  /graphql                    # GraphQL client, queries, mutations
  /types                      # TypeScript types
  /utils                      # Helper functions
```

**Communication Pattern:**
- Frontend → Middleware: Canonical GraphQL queries/mutations
- Frontend → Middleware: HTTP POST requests to `/api/graphql`
- Frontend ← Middleware: Normalized GraphQL responses

---

### Layer 2: GraphQL Normalization Gateway (Middleware)

**Location:** Vercel (`/api/graphql` route)  
**Technology:** Next.js API Routes, GraphQL, TypeScript

**Responsibilities:**
- Canonical GraphQL API exposure
- Operation registry और whitelisting
- Request validation और sanitization
- Magento GraphQL translation
- Response normalization
- Error normalization
- Authentication और session management
- Cart merge logic
- Caching strategy implementation
- Rate limiting
- Observability (logging, correlation IDs)

**Key Components:**
```
/api/graphql                  # Main GraphQL endpoint
/middleware
  /registry                   # Operation registry
  /translators                # Magento GraphQL translators
  /normalizers                # Response normalizers
  /errors                     # Error normalizer
  /auth                       # Authentication handlers
  /cart                       # Cart management logic
  /cache                      # Caching utilities
  /validation                 # Request validators
  /observability              # Logging, metrics
/lib
  /types                      # Canonical GraphQL types
  /config                     # Environment config
```

**Communication Pattern:**
- Middleware → Magento: Magento GraphQL API calls
- Middleware → Magento: HTTP POST requests with authentication
- Middleware ← Magento: Magento GraphQL responses

---

### Layer 3: Magento 2 (Backend)

**Location:** External (assumed deployed)  
**Technology:** Magento 2, GraphQL API

**Responsibilities:**
- Product catalog management
- Inventory management
- Pricing rules
- Cart persistence
- Checkout processing
- Order management
- Customer management
- Payment processing integration
- Shipping calculation

**Assumed Endpoints:**
- GraphQL endpoint: `https://magento-instance.com/graphql`
- Authentication: Customer tokens, guest cart tokens

---

## Component Interaction Diagrams

### High-Level System Interaction

```
┌─────────────────────────────────────────────────────────────┐
│                    User Browser                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTPS Requests
                       │ (Next.js Pages)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Next.js Storefront (Vercel)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Pages      │  │  Components  │  │  Server      │     │
│  │  (App Router)│  │  (React)     │  │  Components  │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │             │
│         └──────────────────┼──────────────────┘             │
│                            │                                 │
│                            │ Canonical GraphQL               │
│                            │ (POST /api/graphql)             │
│                            ▼                                 │
│  ┌──────────────────────────────────────────┐               │
│  │      GraphQL Client Library              │               │
│  │  - Query builders                        │               │
│  │  - Type-safe operations                  │               │
│  └──────────────────────────────────────────┘               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTP POST
                       │ Canonical GraphQL Operations
                       ▼
┌─────────────────────────────────────────────────────────────┐
│        GraphQL Normalization Gateway (Middleware)           │
│                    /api/graphql (Vercel)                    │
│  ┌────────────────────────────────────────────────────┐    │
│  │           Request Handler                          │    │
│  │  - Operation registry check                       │    │
│  │  - Request validation                              │    │
│  │  - Correlation ID injection                        │    │
│  │  - Store/locale/currency injection                │    │
│  └──────────────────┬─────────────────────────────────┘    │
│                     │                                       │
│                     ▼                                       │
│  ┌────────────────────────────────────────────────────┐    │
│  │           Translator Layer                         │    │
│  │  - Canonical → Magento GraphQL translation        │    │
│  │  - Parameter mapping                               │    │
│  └──────────────────┬─────────────────────────────────┘    │
│                     │                                       │
│                     ▼                                       │
│  ┌────────────────────────────────────────────────────┐    │
│  │           Magento Client                           │    │
│  │  - HTTP client                                     │    │
│  │  - Authentication token management                 │    │
│  │  - Request retry logic                             │    │
│  └──────────────────┬─────────────────────────────────┘    │
│                     │                                       │
│                     │ HTTP POST                             │
│                     │ Magento GraphQL                       │
│                     ▼                                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTPS
                       │ Magento GraphQL API
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Magento 2 Instance                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Catalog    │  │    Cart      │  │   Checkout   │    │
│  │   Module     │  │    Module    │  │   Module     │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Customer    │  │    Order     │  │   Payment    │    │
│  │   Module     │  │    Module    │  │   Module     │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

### Catalog Page Request Flow

```
User Request: /category/electronics
     │
     ▼
┌─────────────────────────────────────┐
│  Next.js Page (Server Component)    │
│  /app/category/[slug]/page.tsx      │
└──────────────┬──────────────────────┘
               │
               │ 1. Fetch category data
               ▼
┌─────────────────────────────────────┐
│  GraphQL Query Builder              │
│  query GetCategory($slug: String!)  │
└──────────────┬──────────────────────┘
               │
               │ 2. POST /api/graphql
               │    { query: "GetCategory", variables: {...} }
               ▼
┌─────────────────────────────────────┐
│  Middleware: Request Handler        │
│  - Validate operation                │
│  - Check operation registry          │
│  - Inject store/locale/currency     │
└──────────────┬──────────────────────┘
               │
               │ 3. Translate to Magento
               ▼
┌─────────────────────────────────────┐
│  Middleware: Translator             │
│  Canonical: GetCategory             │
│    → Magento: categoryList          │
└──────────────┬──────────────────────┘
               │
               │ 4. POST to Magento GraphQL
               │    { query: "categoryList", ... }
               ▼
┌─────────────────────────────────────┐
│  Magento 2                          │
│  - Execute categoryList query       │
│  - Return category data              │
└──────────────┬──────────────────────┘
               │
               │ 5. Magento Response
               │    { data: { categories: {...} } }
               ▼
┌─────────────────────────────────────┐
│  Middleware: Normalizer             │
│  - Flatten nested structures        │
│  - Map to canonical types           │
│  - Normalize errors (if any)        │
└──────────────┬──────────────────────┘
               │
               │ 6. Normalized Response
               │    { data: { category: {...} } }
               ▼
┌─────────────────────────────────────┐
│  Next.js Page                       │
│  - Receive normalized data           │
│  - Render with Server Component     │
│  - Stream to client                  │
└─────────────────────────────────────┘
```

---

### Add to Cart Flow

```
User Action: Click "Add to Cart"
     │
     ▼
┌─────────────────────────────────────┐
│  Client Component                   │
│  ProductDetailPage.tsx              │
│  - Handle button click              │
│  - Optimistic UI update             │
└──────────────┬──────────────────────┘
               │
               │ 1. Build mutation
               ▼
┌─────────────────────────────────────┐
│  GraphQL Mutation Builder           │
│  mutation AddToCart($input: ...)    │
└──────────────┬──────────────────────┘
               │
               │ 2. POST /api/graphql
               │    { mutation: "AddToCart", ... }
               ▼
┌─────────────────────────────────────┐
│  Middleware: Request Handler        │
│  - Validate mutation                │
│  - Check authentication state       │
│  - Get/merge cart token             │
└──────────────┬──────────────────────┘
               │
               │ 3. Translate to Magento
               ▼
┌─────────────────────────────────────┐
│  Middleware: Translator             │
│  Canonical: AddToCart               │
│    → Magento: addProductsToCart     │
└──────────────┬──────────────────────┘
               │
               │ 4. POST to Magento
               │    { mutation: "addProductsToCart", ... }
               ▼
┌─────────────────────────────────────┐
│  Magento 2                          │
│  - Validate product/quantity         │
│  - Check stock availability          │
│  - Add to cart                      │
│  - Return updated cart               │
└──────────────┬──────────────────────┘
               │
               │ 5. Magento Response
               │    { data: { cart: {...} } }
               ▼
┌─────────────────────────────────────┐
│  Middleware: Normalizer             │
│  - Normalize cart structure          │
│  - Map to canonical Cart type        │
│  - Handle errors (out-of-stock, etc)│
└──────────────┬──────────────────────┘
               │
               │ 6. Normalized Response
               │    { data: { cart: {...} } }
               ▼
┌─────────────────────────────────────┐
│  Client Component                   │
│  - Update UI with new cart state    │
│  - Show success notification         │
│  - Update cart count in header      │
└─────────────────────────────────────┘
```

---

## Data Flow Diagrams

### Request Data Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    Frontend Request                          │
│                                                               │
│  {                                                           │
│    query: "GetProduct",                                      │
│    variables: { slug: "laptop-123" },                        │
│    operationName: "GetProduct"                              │
│  }                                                           │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│              Middleware: Request Processing                  │
│                                                               │
│  1. Operation Registry Check                                 │
│     ✓ "GetProduct" is whitelisted                            │
│                                                               │
│  2. Request Validation                                       │
│     ✓ Variables structure valid                              │
│     ✓ Payload size within limits                            │
│                                                               │
│  3. Context Injection                                        │
│     + store: "default"                                       │
│     + locale: "en_US"                                        │
│     + currency: "USD"                                        │
│     + correlationId: "req-abc-123"                          │
│     + customerToken: (if logged in)                         │
│     + cartToken: (from cookie/session)                      │
│                                                               │
│  4. Enhanced Request                                         │
│  {                                                           │
│    query: "GetProduct",                                      │
│    variables: {                                              │
│      slug: "laptop-123",                                     │
│      store: "default",                                       │
│      locale: "en_US",                                        │
│      currency: "USD"                                         │
│    },                                                        │
│    headers: {                                                │
│      "X-Correlation-ID": "req-abc-123",                     │
│      "Authorization": "Bearer <token>" (if applicable)      │
│    }                                                         │
│  }                                                           │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│              Middleware: Translation Layer                   │
│                                                               │
│  Canonical Operation: GetProduct                            │
│    ↓                                                          │
│  Magento Operation: products (filter by url_key)            │
│                                                               │
│  Translation Mapping:                                        │
│    slug → url_key                                            │
│    store → store_code                                        │
│    locale → locale                                           │
│    currency → currency                                       │
│                                                               │
│  Magento GraphQL Query:                                      │
│  {                                                           │
│    products(                                                  │
│      filter: { url_key: { eq: "laptop-123" } }              │
│    ) {                                                        │
│      items {                                                  │
│        sku                                                    │
│        name                                                   │
│        price_range { ... }                                    │
│        ...                                                    │
│      }                                                        │
│    }                                                          │
│  }                                                           │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ HTTP POST to Magento
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                    Magento 2 Response                        │
│                                                               │
│  {                                                           │
│    data: {                                                   │
│      products: {                                             │
│        items: [{                                             │
│          sku: "LAPTOP-123",                                 │
│          name: "Gaming Laptop",                              │
│          price_range: {                                      │
│            minimum_price: {                                  │
│              final_price: {                                  │
│                value: 1299.99,                               │
│                currency: "USD"                               │
│              }                                               │
│            }                                                 │
│          },                                                  │
│          ... (deeply nested Magento structure)              │
│        }]                                                    │
│      }                                                       │
│    }                                                         │
│  }                                                           │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│              Middleware: Normalization Layer                 │
│                                                               │
│  1. Flatten Nested Structure                                 │
│     price_range.minimum_price.final_price.value              │
│       → price.amount                                         │
│                                                               │
│  2. Map to Canonical Types                                   │
│     Magento Product → Canonical Product                      │
│     - sku → sku                                              │
│     - name → name                                            │
│     - price_range → price (Money type)                      │
│     - images → media (Media[] type)                         │
│                                                               │
│  3. Error Normalization (if any)                             │
│     Magento errors → NormalizedError[]                       │
│                                                               │
│  Normalized Response:                                       │
│  {                                                           │
│    data: {                                                   │
│      product: {                                              │
│        id: "LAPTOP-123",                                    │
│        sku: "LAPTOP-123",                                   │
│        name: "Gaming Laptop",                                │
│        price: {                                              │
│          amount: 1299.99,                                    │
│          currency: "USD"                                     │
│        },                                                    │
│        media: [...],                                         │
│        ...                                                   │
│      }                                                       │
│    }                                                         │
│  }                                                           │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                    Frontend Response                         │
│                                                               │
│  Type-safe Product object                                    │
│  - Used in Server/Client Components                          │
│  - Rendered to UI                                            │
└──────────────────────────────────────────────────────────────┘
```

---

### Error Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    Error Occurs                              │
│  (Magento returns error or middleware validation fails)     │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│              Error Detection                                 │
│                                                               │
│  Sources:                                                    │
│  1. Magento GraphQL errors array                             │
│  2. Magento HTTP errors (4xx, 5xx)                          │
│  3. Middleware validation errors                            │
│  4. Network/timeout errors                                  │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│              Error Normalizer                                │
│                                                               │
│  Input: Magento Error / HTTP Error / Validation Error       │
│    ↓                                                          │
│  Normalize to: NormalizedError                               │
│  {                                                           │
│    code: "PRODUCT_NOT_FOUND",                                │
│    message: "The requested product is not available",       │
│    severity: "ERROR",                                        │
│    httpStatus: 404,                                          │
│    retryable: false,                                         │
│    path: ["product"],                                        │
│    source: "MAGENTO"                                         │
│  }                                                           │
│                                                               │
│  Error Mapping Rules:                                        │
│  - Magento error codes → Canonical error codes              │
│  - User-friendly messages (mask internal details)           │
│  - Determine retryability                                   │
│  - Set appropriate HTTP status                               │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│              Error Response                                  │
│                                                               │
│  GraphQL Error Response:                                     │
│  {                                                           │
│    errors: [{                                                │
│      code: "PRODUCT_NOT_FOUND",                             │
│      message: "The requested product is not available",    │
│      severity: "ERROR",                                      │
│      httpStatus: 404,                                        │
│      retryable: false,                                       │
│      path: ["product"],                                      │
│      source: "MAGENTO"                                       │
│    }],                                                       │
│    data: null                                                │
│  }                                                           │
│                                                               │
│  + Logging (with correlation ID)                             │
│  + Metrics (error rate tracking)                            │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│              Frontend Error Handling                         │
│                                                               │
│  1. Parse NormalizedError                                    │
│  2. Display user-friendly message                            │
│  3. Show appropriate UI state (error boundary)               │
│  4. Provide recovery actions (if retryable)                 │
└──────────────────────────────────────────────────────────────┘
```

---

## Request/Response Flow

### Standard Query Flow

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ 1. User navigates to /product/laptop-123
       ▼
┌─────────────────────────────────────┐
│  Next.js Server Component           │
│  - Renders on server                │
│  - Fetches data via GraphQL         │
└──────┬──────────────────────────────┘
       │
       │ 2. POST /api/graphql
       │    { query: "GetProduct", variables: {...} }
       ▼
┌─────────────────────────────────────┐
│  Middleware: /api/graphql            │
│  - Validate request                  │
│  - Check operation registry          │
│  - Inject context                    │
└──────┬──────────────────────────────┘
       │
       │ 3. Translate canonical → Magento
       ▼
┌─────────────────────────────────────┐
│  Middleware: Magento Client          │
│  - Build Magento GraphQL query      │
│  - Add authentication headers        │
│  - POST to Magento /graphql          │
└──────┬──────────────────────────────┘
       │
       │ 4. HTTP POST to Magento
       │    { query: "products(...)", ... }
       ▼
┌─────────────────────────────────────┐
│  Magento 2                          │
│  - Execute query                    │
│  - Return data/errors                │
└──────┬──────────────────────────────┘
       │
       │ 5. Magento Response
       │    { data: {...}, errors: [...] }
       ▼
┌─────────────────────────────────────┐
│  Middleware: Normalizer             │
│  - Flatten structure                │
│  - Map to canonical types           │
│  - Normalize errors                 │
└──────┬──────────────────────────────┘
       │
       │ 6. Normalized Response
       │    { data: { product: {...} } }
       ▼
┌─────────────────────────────────────┐
│  Next.js Server Component           │
│  - Receive data                     │
│  - Render HTML                      │
│  - Stream to browser                │
└──────┬──────────────────────────────┘
       │
       │ 7. HTML Response
       ▼
┌─────────────┐
│   Browser   │
│  - Display page                     │
└─────────────┘
```

---

### Mutation Flow (Add to Cart Example)

```
┌─────────────┐
│   Browser   │
│  (User clicks "Add to Cart")        │
└──────┬──────┘
       │
       │ 1. Client Component triggers mutation
       ▼
┌─────────────────────────────────────┐
│  Next.js Client Component           │
│  - Optimistic UI update             │
│  - Build mutation                   │
└──────┬──────────────────────────────┘
       │
       │ 2. POST /api/graphql
       │    { mutation: "AddToCart", variables: {...} }
       ▼
┌─────────────────────────────────────┐
│  Middleware: /api/graphql            │
│  - Validate mutation                │
│  - Check auth state                 │
│  - Get/merge cart token             │
└──────┬──────────────────────────────┘
       │
       │ 3. Translate canonical → Magento
       ▼
┌─────────────────────────────────────┐
│  Middleware: Magento Client          │
│  - Build Magento mutation           │
│  - Add cart token to headers         │
│  - POST to Magento /graphql          │
└──────┬──────────────────────────────┘
       │
       │ 4. HTTP POST to Magento
       │    { mutation: "addProductsToCart", ... }
       ▼
┌─────────────────────────────────────┐
│  Magento 2                          │
│  - Validate product/quantity         │
│  - Check stock                      │
│  - Add to cart                      │
│  - Return updated cart               │
└──────┬──────────────────────────────┘
       │
       │ 5. Magento Response
       │    { data: { cart: {...} } }
       ▼
┌─────────────────────────────────────┐
│  Middleware: Normalizer             │
│  - Normalize cart structure          │
│  - Map to canonical Cart type        │
└──────┬──────────────────────────────┘
       │
       │ 6. Normalized Response
       │    { data: { cart: {...} } }
       ▼
┌─────────────────────────────────────┐
│  Next.js Client Component           │
│  - Update UI with cart state        │
│  - Show success notification         │
│  - Update cart count                │
└──────┬──────────────────────────────┘
       │
       │ 7. UI Update
       ▼
┌─────────────┐
│   Browser   │
│  - Display updated cart              │
└─────────────┘
```

---

## Authentication & Session Management

### Authentication Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    Guest User                                │
│                                                               │
│  1. Browse catalog (no auth required)                        │
│  2. Add to cart → Guest cart token generated                │
│  3. Cart token stored in:                                    │
│     - HTTP-only cookie (secure)                              │
│     - Session storage (middleware)                           │
│                                                               │
│  Guest Cart Token Flow:                                      │
│  Frontend → Middleware → Magento (with guest cart token)    │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    Login Flow                                │
│                                                               │
│  1. User submits login form                                  │
│     POST /api/graphql                                        │
│     { mutation: "Login", email, password }                   │
│                                                               │
│  2. Middleware translates to Magento:                        │
│     generateCustomerToken(email, password)                   │
│                                                               │
│  3. Magento returns customer token                           │
│                                                               │
│  4. Middleware:                                              │
│     a. Store customer token (secure, HTTP-only cookie)       │
│     b. Merge guest cart → customer cart                     │
│     c. Return normalized response                            │
│                                                               │
│  5. Frontend:                                                │
│     - Update auth state                                      │
│     - Redirect to intended page                              │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    Authenticated User                        │
│                                                               │
│  1. All requests include customer token (via cookie)        │
│  2. Middleware forwards token to Magento                    │
│  3. Magento validates token and returns customer data       │
│  4. Cart operations use customer cart (not guest cart)       │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    Logout Flow                               │
│                                                               │
│  1. User clicks logout                                       │
│     POST /api/graphql                                        │
│     { mutation: "Logout" }                                  │
│                                                               │
│  2. Middleware:                                              │
│     a. Call Magento: revokeCustomerToken                    │
│     b. Clear customer token cookie                           │
│     c. Convert customer cart → guest cart (optional)        │
│                                                               │
│  3. Frontend:                                                │
│     - Clear auth state                                       │
│     - Redirect to home/login                                 │
└──────────────────────────────────────────────────────────────┘
```

### Cart Merge Logic

```
┌──────────────────────────────────────────────────────────────┐
│              Cart Merge Strategy                              │
│                                                               │
│  Scenario: Guest user adds items, then logs in               │
│                                                               │
│  1. Guest Cart State:                                        │
│     - Items: [Product A (qty: 2), Product B (qty: 1)]       │
│     - Guest cart token: "guest-token-123"                   │
│                                                               │
│  2. User Logs In:                                            │
│     - Customer token received                                │
│     - Customer cart retrieved (may be empty or have items)  │
│                                                               │
│  3. Merge Logic:                                             │
│     a. Retrieve guest cart items                             │
│     b. Retrieve customer cart items                          │
│     c. For each guest cart item:                             │
│        - If same product exists in customer cart:             │
│          → Add quantities together                           │
│        - If product doesn't exist:                           │
│          → Add as new item                                   │
│     d. Update customer cart with merged items                │
│     e. Clear guest cart                                      │
│                                                               │
│  4. Result:                                                  │
│     - Customer cart contains merged items                    │
│     - Guest cart is empty                                    │
│     - User sees all items in their cart                      │
└──────────────────────────────────────────────────────────────┘
```

---

## Error Handling Architecture

### Error Normalization Strategy

```
┌──────────────────────────────────────────────────────────────┐
│              Error Sources                                    │
│                                                               │
│  1. Magento GraphQL Errors                                   │
│     {                                                         │
│       errors: [{                                              │
│         message: "The requested product is not found",       │
│         category: "graphql-no-such-entity",                  │
│         extensions: { ... }                                  │
│       }]                                                      │
│     }                                                         │
│                                                               │
│  2. Magento HTTP Errors                                      │
│     - 400 Bad Request                                         │
│     - 401 Unauthorized                                        │
│     - 404 Not Found                                           │
│     - 500 Internal Server Error                              │
│                                                               │
│  3. Middleware Validation Errors                             │
│     - Invalid operation name                                 │
│     - Invalid variable types                                  │
│     - Payload size exceeded                                  │
│                                                               │
│  4. Network Errors                                           │
│     - Timeout                                                 │
│     - Connection refused                                      │
│     - DNS resolution failed                                   │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│              Error Normalizer                                │
│                                                               │
│  Input: Any error type                                        │
│    ↓                                                          │
│  Normalize to: NormalizedError                                │
│  {                                                           │
│    code: string,          // Canonical error code           │
│    message: string,        // User-friendly message          │
│    severity: "INFO" | "WARN" | "ERROR",                     │
│    httpStatus: number,     // HTTP status code              │
│    retryable: boolean,     // Can retry?                     │
│    path?: string[],        // GraphQL path                   │
│    source: "MAGENTO" | "MIDDLEWARE"                          │
│  }                                                           │
│                                                               │
│  Error Code Mapping Examples:                                │
│  - "graphql-no-such-entity" → "PRODUCT_NOT_FOUND"          │
│  - "graphql-authorization" → "UNAUTHORIZED"                │
│  - "graphql-input" → "INVALID_INPUT"                       │
│  - Network timeout → "NETWORK_ERROR" (retryable: true)     │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│              Error Response Format                            │
│                                                               │
│  GraphQL Error Response:                                     │
│  {                                                           │
│    errors: [                                                 │
│      {                                                       │
│        code: "PRODUCT_NOT_FOUND",                           │
│        message: "The requested product is not available",  │
│        severity: "ERROR",                                    │
│        httpStatus: 404,                                      │
│        retryable: false,                                     │
│        path: ["product"],                                    │
│        source: "MAGENTO"                                     │
│      }                                                       │
│    ],                                                        │
│    data: null  // or partial data if some fields succeeded  │
│  }                                                           │
│                                                               │
│  + Structured logging (with correlation ID)                 │
│  + Error metrics tracking                                   │
└──────────────────────────────────────────────────────────────┘
```

---

## Caching Strategy

### Caching Layers

```
┌──────────────────────────────────────────────────────────────┐
│              Layer 1: CDN Cache (Vercel Edge)               │
│                                                               │
│  Cacheable:                                                  │
│  - Static pages (ISR)                                        │
│  - Product detail pages (ISR with revalidation)             │
│  - Category pages (ISR with revalidation)                   │
│                                                               │
│  Cache Headers:                                              │
│  - s-maxage: 3600 (1 hour)                                  │
│  - stale-while-revalidate: 86400 (24 hours)                 │
│                                                               │
│  Cache Keys:                                                 │
│  - URL path                                                  │
│  - Store code                                                │
│  - Locale                                                    │
│  - Currency                                                  │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│              Layer 2: Next.js Server Cache                   │
│                                                               │
│  Cacheable:                                                  │
│  - GraphQL query results (public data only)                 │
│                                                               │
│  Cache Strategy:                                             │
│  - ISR for catalog pages                                     │
│  - On-demand revalidation                                    │
│  - Cache tags for invalidation                               │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│              Layer 3: Middleware Cache                       │
│                                                               │
│  Cacheable:                                                  │
│  - Public catalog queries                                    │
│  - Category listings                                         │
│  - Product details (with TTL)                                │
│                                                               │
│  NOT Cacheable:                                               │
│  - Cart queries                                              │
│  - Checkout operations                                       │
│  - Customer account data                                      │
│  - Authenticated requests                                    │
│                                                               │
│  Cache Implementation:                                       │
│  - In-memory cache (for development)                        │
│  - Redis/Vercel KV (for production)                         │
│                                                               │
│  Cache Keys:                                                 │
│  - Operation name                                            │
│  - Variables (normalized)                                    │
│  - Store code                                                │
│  - Locale                                                    │
│  - Currency                                                  │
│                                                               │
│  TTL:                                                        │
│  - Product details: 5 minutes                                │
│  - Category listings: 10 minutes                            │
│  - Search results: 2 minutes                                 │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│              Layer 4: Magento Cache                          │
│                                                               │
│  (Handled by Magento - out of our control)                  │
│  - Magento's internal caching                                │
│  - Full page cache                                           │
│  - Block cache                                               │
└──────────────────────────────────────────────────────────────┘
```

### Cache Invalidation Strategy

```
┌──────────────────────────────────────────────────────────────┐
│              Cache Invalidation Triggers                     │
│                                                               │
│  1. Product Updates (Magento)                                │
│     → Webhook to middleware                                  │
│     → Invalidate product cache                               │
│     → Revalidate Next.js ISR pages                           │
│                                                               │
│  2. Category Updates                                          │
│     → Invalidate category cache                              │
│     → Invalidate category listing pages                      │
│                                                               │
│  3. Price Changes                                            │
│     → Invalidate product cache                               │
│     → Revalidate affected pages                              │
│                                                               │
│  4. Stock Changes                                            │
│     → Invalidate product cache                               │
│     → Real-time updates (via polling or webhooks)           │
│                                                               │
│  Cache Tags:                                                 │
│  - product:{sku}                                             │
│  - category:{id}                                             │
│  - search:{query}                                             │
│                                                               │
│  Invalidation API:                                           │
│  POST /api/cache/invalidate                                  │
│  { tags: ["product:LAPTOP-123"] }                           │
└──────────────────────────────────────────────────────────────┘
```

---

## Security Architecture

### Security Layers

```
┌──────────────────────────────────────────────────────────────┐
│              Layer 1: Network Security                        │
│                                                               │
│  - HTTPS only (TLS 1.3+)                                     │
│  - HSTS headers                                              │
│  - Vercel DDoS protection                                    │
│  - Rate limiting (per IP, per user)                          │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│              Layer 2: Application Security                    │
│                                                               │
│  Frontend:                                                   │
│  - Input validation (client-side)                            │
│  - XSS prevention (React auto-escaping)                     │
│  - CSRF tokens (if needed)                                   │
│  - Content Security Policy (CSP)                             │
│                                                               │
│  Middleware:                                                 │
│  - Operation registry (whitelist only)                      │
│  - Request validation (structure, size)                       │
│  - Input sanitization                                        │
│  - GraphQL query depth limiting                              │
│  - GraphQL query complexity limiting                        │
│  - Rate limiting per operation                               │
│  - Authentication token validation                           │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│              Layer 3: Data Security                           │
│                                                               │
│  - Sensitive data encryption                                 │
│  - Secure token storage (HTTP-only cookies)                  │
│  - PII masking in logs                                       │
│  - Secrets in environment variables only                     │
│  - No secrets in code or logs                                │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│              Layer 4: Magento Communication                   │
│                                                               │
│  - Secure API communication (HTTPS)                         │
│  - Token-based authentication                                │
│  - Token rotation                                            │
│  - Request signing (if required by Magento)                 │
└──────────────────────────────────────────────────────────────┘
```

### Rate Limiting Strategy

```
┌──────────────────────────────────────────────────────────────┐
│              Rate Limiting Rules                              │
│                                                               │
│  Global Limits (per IP):                                     │
│  - 100 requests per minute                                   │
│  - 1000 requests per hour                                    │
│                                                               │
│  Operation-Specific Limits:                                  │
│  - Catalog queries: 60/minute                                │
│  - Search queries: 30/minute                                 │
│  - Cart mutations: 20/minute                                 │
│  - Checkout mutations: 10/minute                             │
│  - Login attempts: 5/minute                                  │
│                                                               │
│  Authenticated User Limits:                                  │
│  - Higher limits for logged-in users                         │
│  - Per-user tracking                                        │
│                                                               │
│  Implementation:                                             │
│  - Vercel Edge Middleware                                    │
│  - Redis/Vercel KV for rate limit storage                   │
│                                                               │
│  Response:                                                   │
│  - 429 Too Many Requests                                     │
│  - Retry-After header                                        │
└──────────────────────────────────────────────────────────────┘
```

---

## Deployment Architecture

### Vercel Deployment Model

```
┌──────────────────────────────────────────────────────────────┐
│                    Vercel Platform                            │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │           Production Environment                    │     │
│  │                                                     │     │
│  │  Domain: store.example.com                         │     │
│  │                                                     │     │
│  │  ┌──────────────────────────────────────────────┐ │     │
│  │  │  Next.js Storefront                          │ │     │
│  │  │  - SSR/ISR pages                             │ │     │
│  │  │  - Static assets                              │ │     │
│  │  │  - Edge functions                             │ │     │
│  │  └──────────────────────────────────────────────┘ │     │
│  │                                                     │     │
│  │  ┌──────────────────────────────────────────────┐ │     │
│  │  │  Middleware (/api/graphql)                   │ │     │
│  │  │  - GraphQL endpoint                          │ │     │
│  │  │  - Serverless functions                      │ │     │
│  │  └──────────────────────────────────────────────┘ │     │
│  │                                                     │     │
│  │  Environment Variables:                            │     │
│  │  - MAGENTO_GRAPHQL_URL                             │     │
│  │  - MAGENTO_STORE_CODE                              │     │
│  │  - CACHE_TTL_*                                     │     │
│  │  - RATE_LIMIT_*                                    │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │           Staging Environment                         │     │
│  │                                                     │     │
│  │  Domain: store-staging.example.com                  │     │
│  │  (Similar structure to production)                  │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │           Development Environment                    │     │
│  │                                                     │     │
│  │  - Local development (next dev)                    │     │
│  │  - Preview deployments (per PR)                     │     │
│  └─────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS
                            ▼
┌──────────────────────────────────────────────────────────────┐
│              External Services                                │
│                                                               │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  Magento 2       │  │  Vercel KV       │                │
│  │  Instance        │  │  (Cache/State)   │                │
│  └──────────────────┘  └──────────────────┘                │
└──────────────────────────────────────────────────────────────┘
```

### CI/CD Pipeline

```
┌──────────────────────────────────────────────────────────────┐
│              CI/CD Flow                                        │
│                                                               │
│  1. Code Push (Git)                                           │
│     → Trigger GitHub Actions / Vercel CI                     │
│                                                               │
│  2. Quality Checks:                                           │
│     ✓ TypeScript type checking                               │
│     ✓ ESLint (code quality)                                 │
│     ✓ Prettier (code formatting)                            │
│     ✓ Unit tests                                             │
│     ✓ Build verification                                     │
│                                                               │
│  3. Build:                                                    │
│     → Next.js build                                          │
│     → Type checking                                          │
│     → Generate static pages                                  │
│                                                               │
│  4. Deployment:                                               │
│     - Main branch → Production                               │
│     - Staging branch → Staging                              │
│     - PR → Preview deployment                                │
│                                                               │
│  5. Post-Deployment:                                          │
│     → Health checks                                          │
│     → Smoke tests (optional)                                 │
└──────────────────────────────────────────────────────────────┘
```

---

## Technology Stack Details

### Frontend Stack

```
┌──────────────────────────────────────────────────────────────┐
│  Framework: Next.js 14+ (App Router)                         │
│  - Server Components                                          │
│  - Client Components                                          │
│  - Server Actions                                             │
│  - ISR (Incremental Static Regeneration)                     │
│                                                               │
│  Language: TypeScript 5+                                      │
│                                                               │
│  UI Library: React 18+                                        │
│  - Server Components (default)                               │
│  - Client Components (when needed)                           │
│                                                               │
│  Styling: (TBD - Tailwind CSS recommended)                   │
│                                                               │
│  GraphQL Client: (TBD - Apollo Client or urql)              │
│                                                               │
│  State Management:                                            │
│  - React Server State (Server Components)                    │
│  - React Context (Client Components)                         │
│  - React Query / SWR (optional, for client-side caching)     │
│                                                               │
│  Form Handling: React Hook Form (recommended)                │
│                                                               │
│  Testing:                                                     │
│  - Jest + React Testing Library                              │
│  - Playwright (E2E)                                          │
└──────────────────────────────────────────────────────────────┘
```

### Middleware Stack

```
┌──────────────────────────────────────────────────────────────┐
│  Runtime: Node.js 18+ (Vercel Serverless)                    │
│                                                               │
│  Framework: Next.js API Routes                               │
│  - /api/graphql endpoint                                     │
│                                                               │
│  Language: TypeScript 5+                                      │
│                                                               │
│  GraphQL:                                                     │
│  - GraphQL.js (schema definition)                            │
│  - Custom execution engine                                   │
│                                                               │
│  HTTP Client:                                                 │
│  - fetch API (native)                                        │
│  - Retry logic (custom)                                      │
│                                                               │
│  Caching:                                                     │
│  - Vercel KV (production)                                    │
│  - In-memory (development)                                   │
│                                                               │
│  Validation:                                                  │
│  - Zod (schema validation)                                   │
│  - Custom GraphQL validators                                 │
│                                                               │
│  Logging:                                                     │
│  - Structured logging (JSON)                                 │
│  - Correlation IDs                                           │
│  - Vercel Logs integration                                   │
└──────────────────────────────────────────────────────────────┘
```

### Backend Stack (Assumed)

```
┌──────────────────────────────────────────────────────────────┐
│  Platform: Magento 2 (External)                             │
│                                                               │
│  API: GraphQL                                                │
│  - Standard Magento GraphQL API                              │
│  - Authentication: Customer tokens, guest cart tokens       │
│                                                               │
│  Endpoints:                                                   │
│  - /graphql (GraphQL endpoint)                              │
│                                                               │
│  (Middleware communicates with Magento via HTTPS)           │
└──────────────────────────────────────────────────────────────┘
```

---

## Extension Points (Phase 2 Ready)

### CMS Integration Point

```
┌──────────────────────────────────────────────────────────────┐
│  Design: CMS Content Layer                                    │
│                                                               │
│  Interface:                                                   │
│  - Content queries in canonical GraphQL                      │
│  - Content types: Page, Block, Banner, etc.                  │
│                                                               │
│  Extension:                                                   │
│  - Middleware: CMS translator                                │
│  - Frontend: CMS components                                  │
│                                                               │
│  (Not implemented in Phase 1)                               │
└──────────────────────────────────────────────────────────────┘
```

### AI/Recommendation Integration Point

```
┌──────────────────────────────────────────────────────────────┐
│  Design: AI Search & Recommendations                         │
│                                                               │
│  Interface:                                                   │
│  - Extend search queries with AI parameters                  │
│  - Recommendation queries                                     │
│                                                               │
│  Extension:                                                   │
│  - Middleware: AI service integration                        │
│  - Frontend: Recommendation components                       │
│                                                               │
│  (Not implemented in Phase 1)                               │
└──────────────────────────────────────────────────────────────┘
```

---

## Summary

यह architecture blueprint एक production-ready headless eCommerce portal के लिए complete design provide करता है:

1. **3-Layer Architecture**: Clear separation of concerns
2. **Component Interactions**: Detailed flow diagrams
3. **Data Flow**: Request/response normalization
4. **Error Handling**: Comprehensive error normalization
5. **Caching Strategy**: Multi-layer caching
6. **Security**: Defense in depth
7. **Deployment**: Vercel-optimized
8. **Extension Points**: Phase 2 ready

सभी components canonical GraphQL API के माध्यम से communicate करते हैं, ensuring frontend-Magento isolation.

---

**Document Owner:** Engineering Team  
**Last Updated:** 2024  
**Next Review:** After Phase 1 completion

