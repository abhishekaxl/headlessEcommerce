# Canonical GraphQL Schema
## Headless eCommerce Portal

**Document Version:** 1.0  
**Date:** 2024  
**Status:** Final

---

## Overview

This canonical GraphQL schema defines the contract between the frontend and middleware. This schema:

- **Magento-agnostic**: Frontend has no knowledge of Magento schema
- **Consistent naming**: camelCase for fields, PascalCase for types
- **Type-safe**: TypeScript types can be generated
- **Extensible**: Extension points for Phase 2 features

---

## Design Principles

1. **Normalized Structure**: Deeply nested Magento structures are flattened
2. **Consistent Naming**: camelCase for fields, PascalCase for types
3. **Non-nullable by Default**: Fields are explicitly nullable where needed
4. **Error Handling**: All operations can return errors (NormalizedError[])
5. **Pagination**: Cursor-based pagination with PageInfo
6. **Money Handling**: Money type always includes amount and currency

---

## Core Types

### Product

```graphql
type Product {
  id: ID!
  sku: String!
  name: String!
  slug: String!
  description: String
  shortDescription: String
  price: Money!
  priceRange: PriceRange
  specialPrice: Money
  images: [ProductImage!]!
  type: ProductType!
  stockStatus: StockStatus!
  inStock: Boolean!
  quantity: Int
  attributes: [ProductAttribute!]!
  configurableOptions: [ConfigurableOption!]
  relatedProducts: [Product!]
  metaTitle: String
  metaDescription: String
  canonicalUrl: String
}
```

### Category

```graphql
type Category {
  id: ID!
  name: String!
  slug: String!
  description: String
  image: CategoryImage
  parentId: ID
  children: [Category!]
  breadcrumbs: [Breadcrumb!]
  metaTitle: String
  metaDescription: String
  canonicalUrl: String
}
```

### Cart

```graphql
type Cart {
  id: ID!
  items: [CartItem!]!
  itemCount: Int!
  subtotal: Money!
  discount: Money
  couponCode: String
  tax: Money
  shipping: Money
  total: Money!
}
```

### Customer

```graphql
type Customer {
  id: ID!
  email: String!
  firstName: String!
  lastName: String!
  addresses: [Address!]!
  defaultShippingAddress: Address
  defaultBillingAddress: Address
  orders: OrderConnection
}
```

---

## Queries

```graphql
type Query {
  # Catalog
  product(slug: String!): Product
  products(first: Int, after: String, filter: ProductFilter, sort: ProductSort): ProductConnection!
  category(slug: String!): Category
  categories(parentId: ID): [Category!]!
  
  # Search
  searchProducts(query: String!, first: Int, after: String, filter: ProductFilter, sort: ProductSort): ProductConnection!
  
  # Cart
  cart: Cart
  
  # Customer
  customer: Customer
  
  # Checkout
  checkout: Checkout
}
```

---

## Mutations

```graphql
type Mutation {
  # Cart
  addToCart(input: AddToCartInput!): AddToCartPayload!
  updateCartItem(input: UpdateCartItemInput!): UpdateCartItemPayload!
  removeCartItem(itemId: ID!): RemoveCartItemPayload!
  applyCoupon(couponCode: String!): ApplyCouponPayload!
  removeCoupon: RemoveCouponPayload!
  
  # Checkout
  setShippingAddress(input: AddressInput!): SetShippingAddressPayload!
  setBillingAddress(input: AddressInput!): SetBillingAddressPayload!
  setShippingMethod(shippingMethodCode: String!): SetShippingMethodPayload!
  setPaymentMethod(paymentMethodCode: String!): SetPaymentMethodPayload!
  placeOrder(input: PlaceOrderInput!): PlaceOrderPayload!
  
  # Customer
  login(email: String!, password: String!): LoginPayload!
  register(input: RegisterInput!): RegisterPayload!
  logout: LogoutPayload!
  updateCustomer(input: UpdateCustomerInput!): UpdateCustomerPayload!
}
```

---

## Error Handling

All operations can return errors:

```graphql
type NormalizedError {
  code: String!
  message: String!
  severity: ErrorSeverity!
  httpStatus: Int!
  retryable: Boolean!
  path: [String!]
  source: ErrorSource!
}

enum ErrorSeverity {
  INFO
  WARN
  ERROR
}

enum ErrorSource {
  MAGENTO
  MIDDLEWARE
}
```

---

## Summary

This canonical GraphQL schema:

1. **Complete Type System**: All required types are defined
2. **Normalized Structure**: Magento-specific details are hidden
3. **Consistent Naming**: camelCase fields, PascalCase types
4. **Type Safety**: TypeScript types can be generated
5. **Extensible**: Ready for Phase 2 features
