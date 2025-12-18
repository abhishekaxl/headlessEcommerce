# Apollo Client Integration

This directory contains the Apollo Client setup for GraphQL operations.

## Setup

Apollo Client is configured in `client.ts` and provided to the app via `ApolloProvider.tsx`.

## Usage

### Client Components (React Hooks)

For client-side components, use the hooks from `hooks.ts`:

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
      // Cart will automatically refetch
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

### Server Components

For server-side components, you can still use the old query functions from `@/lib/graphql/queries`:

```tsx
import { getProductsByCategory } from '@/lib/graphql/queries';

export default async function HomePage() {
  const products = await getProductsByCategory('gear', { limit: 10 });
  
  return (
    <div>
      {products.items.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
```

Or use Apollo Client directly in server components:

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

## Available Hooks

### Query Hooks
- `useProduct(slug)` - Get a single product
- `useProductsByCategory(categorySlug, pagination?, filters?, sort?)` - Get products by category
- `useCategories(parentId?)` - Get categories
- `useCategory(slug)` - Get a single category
- `useSearchProducts(query, pagination?, filters?, sort?)` - Search products
- `useCart()` - Get current cart
- `useCustomer()` - Get current customer
- `useCustomerOrders(pagination?)` - Get customer orders
- `useOrder(orderNumber)` - Get order by order number

### Mutation Hooks
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

## Features

- **Automatic Cache Management**: Apollo Client handles caching automatically
- **Automatic Refetching**: Mutations automatically refetch related queries (e.g., adding to cart refetches cart)
- **Error Handling**: Built-in error handling with `errorPolicy: 'all'`
- **SSR Support**: Works with Next.js server-side rendering
- **Cookie Forwarding**: Automatically forwards cookies for cart/customer state

## Migration Guide

### From Old Client to Apollo Hooks

**Before:**
```tsx
import { addToCart } from '@/lib/graphql/mutations';

const handleAdd = async () => {
  await addToCart(sku, 1);
};
```

**After:**
```tsx
import { useAddToCart } from '@/lib/apollo/hooks';

const { addToCart, loading } = useAddToCart();

const handleAdd = async () => {
  await addToCart(sku, 1);
};
```

The old functions in `lib/graphql/queries.ts` and `lib/graphql/mutations.ts` are still available for backward compatibility, but new code should use Apollo hooks.
