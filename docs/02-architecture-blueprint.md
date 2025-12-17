# Architecture Blueprint
## Headless eCommerce Portal - Phase 1 (MVP)

**Document Version:** 1.0  
**Date:** 2024  
**Status:** Final

---

## Overview

This headless eCommerce portal follows a **3-layer architecture**:

1. **Frontend Layer (Next.js Storefront)** - User interface and UX
2. **Middleware Layer (GraphQL Normalization Gateway)** - Translation and normalization
3. **Backend Layer (Magento 2)** - System of record

**Key Principles:**
- Frontend never calls Magento directly
- All communication happens through the canonical GraphQL API
- Middleware hides Magento-specific details from the frontend
- Type-safe operations end-to-end

---

## 3-Layer Architecture

### Layer 1: React Storefront (Next.js)

**Location:** Vercel (Frontend deployment)  
**Technology:** Next.js 14+ (App Router), React 18+, TypeScript

**Responsibilities:**
- UI rendering (Server Components + Client Components)
- Routing and navigation
- SEO optimization (SSR, ISR, meta tags)
- User experience and interactions
- Form handling and validation (client-side)
- State management (React Context, Server State)
- Image optimization
- Accessibility compliance

### Layer 2: GraphQL Normalization Gateway (Middleware)

**Location:** Vercel (`/api/graphql` route)  
**Technology:** Next.js API Routes, GraphQL, TypeScript

**Responsibilities:**
- Canonical GraphQL API exposure
- Operation registry and whitelisting
- Request validation and sanitization
- Magento GraphQL translation
- Response normalization
- Error normalization
- Authentication and session management
- Cart merge logic
- Caching strategy implementation
- Rate limiting
- Observability (logging, correlation IDs)

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

---

## Data Flow

```
User Browser
    │
    ▼
Next.js Frontend (Vercel)
    │
    │ Canonical GraphQL
    ▼
GraphQL Middleware (/api/graphql)
    │
    │ Magento GraphQL
    ▼
Magento 2 Backend
```

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18, TypeScript |
| Styling | CSS Variables, styled-jsx |
| Backend | Magento 2.4.7, GraphQL |
| Database | MySQL 8.0 |
| Search | Elasticsearch 7.17 |
| Cache | Redis 7 |
| Container | Docker, Docker Compose |

---

## Summary

This architecture blueprint provides a complete design for a production-ready headless eCommerce portal:

1. **3-Layer Architecture**: Clear separation of concerns
2. **Component Interactions**: Detailed flow diagrams
3. **Data Flow**: Request/response normalization
4. **Error Handling**: Comprehensive error normalization
5. **Caching Strategy**: Multi-layer caching
6. **Security**: Defense in depth
7. **Deployment**: Vercel-optimized
8. **Extension Points**: Phase 2 ready

All components communicate through the canonical GraphQL API, ensuring frontend-Magento isolation.
