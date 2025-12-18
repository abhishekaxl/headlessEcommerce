# GraphQL Architecture

## Overview

This application uses a **two-layer GraphQL architecture**:

1. **Frontend Layer**: Apollo Client for React components
2. **Middleware Layer**: Magento GraphQL Client for backend communication

## Architecture Flow

```
┌─────────────────┐
│  React Components│
│  (Frontend)      │
└────────┬─────────┘
         │
         │ Apollo Client
         │ (Canonical GraphQL)
         ▼
┌─────────────────┐
│  /api/graphql   │
│  (Next.js API)  │
│  - Translators  │
│  - Normalizers  │
└────────┬─────────┘
         │
         │ Magento GraphQL Client
         │ (Magento-specific GraphQL)
         ▼
┌─────────────────┐
│  Magento API    │
│  (Backend)      │
└─────────────────┘
```

## Layer Responsibilities

### 1. Apollo Client (Frontend)
- **Purpose**: Frontend-to-Middleware communication
- **Location**: `lib/apollo/`
- **Used by**: React components (client-side)
- **Features**:
  - Automatic caching
  - React hooks (useQuery, useMutation)
  - Error handling
  - Loading states

### 2. Magento GraphQL Client (Middleware)
- **Purpose**: Middleware-to-Magento communication
- **Location**: `middleware/lib/magento/client.ts`
- **Used by**: API route handlers (server-side)
- **Features**:
  - Direct Magento API communication
  - Authentication handling
  - Error normalization
  - Retry logic
  - Request timeout handling

## Why Both Are Required

### Apollo Client is Required For:
- ✅ Frontend components to make GraphQL requests
- ✅ Client-side caching and state management
- ✅ React hooks for easy component integration
- ✅ Automatic refetching after mutations

### Magento GraphQL Client is Required For:
- ✅ **Server-side middleware** to communicate with Magento
- ✅ **Translation layer** - Converts canonical GraphQL to Magento-specific GraphQL
- ✅ **Authentication** - Handles Magento auth tokens and headers
- ✅ **Error normalization** - Converts Magento errors to canonical format
- ✅ **Retry logic** - Handles transient failures
- ✅ **Request context** - Adds store code, locale, currency headers

## Data Flow Example

### Example: Adding Product to Cart

1. **Frontend** (React Component):
   ```tsx
   const { addToCart } = useAddToCart();
   await addToCart('SKU-123', 1);
   ```
   - Apollo Client sends canonical mutation to `/api/graphql`

2. **Middleware** (`/api/graphql/route.ts`):
   ```typescript
   // Receives: { mutation: "AddToCart", variables: { input: {...} } }
   // Translates to Magento GraphQL using CartTranslator
   const magentoRequest = translator.translate('AddToCart', variables);
   // Executes using Magento GraphQL Client
   const result = await executeMagentoGraphQL(magentoRequest, context);
   ```
   - Translates canonical query to Magento format
   - Executes against Magento using Magento GraphQL Client
   - Normalizes response back to canonical format

3. **Magento**:
   - Receives Magento-specific GraphQL query
   - Returns Magento response format

4. **Response**:
   - Magento response normalized to canonical format
   - Returned to Apollo Client
   - Apollo Client updates cache automatically

## Key Differences

| Feature | Apollo Client | Magento GraphQL Client |
|---------|--------------|----------------------|
| **Layer** | Frontend | Middleware/Backend |
| **Target** | `/api/graphql` (Next.js) | Magento API directly |
| **GraphQL Format** | Canonical (abstracted) | Magento-specific |
| **Used By** | React components | API route handlers |
| **Caching** | Automatic (InMemoryCache) | None (direct API calls) |
| **Authentication** | Cookies (handled by middleware) | Headers (customer/cart tokens) |
| **Error Handling** | React error boundaries | Normalized error format |

## Conclusion

**Both clients are required** and serve different purposes:

- **Apollo Client**: Frontend abstraction layer for React components
- **Magento GraphQL Client**: Backend communication layer for Magento API

They work together to provide:
- Clean frontend API (canonical GraphQL)
- Backend abstraction (Magento-specific details hidden)
- Better developer experience (React hooks)
- Proper error handling and normalization

## Migration Status

✅ **Frontend**: All components migrated to Apollo Client hooks
✅ **Middleware**: Still uses Magento GraphQL Client (required)
✅ **Architecture**: Two-layer system working correctly
