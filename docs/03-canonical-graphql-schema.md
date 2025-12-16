# Deliverable #3: Canonical GraphQL Schema
## Headless eCommerce Portal - Phase 1 (MVP)

**Document Version:** 1.0  
**Date:** 2024  
**Status:** Draft

---

## Table of Contents
1. [Overview](#overview)
2. [Schema Design Principles](#schema-design-principles)
3. [Scalar Types](#scalar-types)
4. [Core Types](#core-types)
5. [Catalog Types](#catalog-types)
6. [Cart Types](#cart-types)
7. [Checkout Types](#checkout-types)
8. [Customer Types](#customer-types)
9. [Order Types](#order-types)
10. [Error Types](#error-types)
11. [Queries](#queries)
12. [Mutations](#mutations)
13. [Input Types](#input-types)
14. [Schema Implementation Notes](#schema-implementation-notes)

---

## Overview

यह canonical GraphQL schema frontend और middleware के बीच contract define करता है। यह schema:

- **Magento-agnostic**: Frontend को Magento schema के बारे में knowledge नहीं होगी
- **Normalized**: Flattened structures, consistent naming
- **Type-safe**: TypeScript types generate हो सकेंगे
- **Extensible**: Phase 2 features के लिए extension points

**Schema Location:**
- Definition: `/middleware/lib/types/schema.graphql`
- TypeScript types: `/middleware/lib/types/index.ts`
- Frontend types: `/lib/graphql/types.ts` (generated)

---

## Schema Design Principles

1. **Normalized Structure**: Deeply nested Magento structures को flatten किया जाएगा
2. **Consistent Naming**: camelCase for fields, PascalCase for types
3. **Non-nullable by Default**: Fields explicitly nullable होंगे जहां needed
4. **Error Handling**: All operations errors return कर सकते हैं (NormalizedError[])
5. **Pagination**: Cursor-based pagination (extensible to offset-based)
6. **Money Handling**: Money type always includes amount और currency
7. **Media Handling**: Media type consistent across all entities

---

## Scalar Types

```graphql
"""
Custom scalar types
"""

scalar DateTime
scalar JSON
scalar URL
```

**Usage:**
- `DateTime`: ISO 8601 date-time strings
- `JSON`: Arbitrary JSON data (for extensibility)
- `URL`: Valid URL strings

---

## Core Types

### Money

```graphql
"""
Represents a monetary value with currency
"""
type Money {
  """
  The monetary amount (e.g., 1299.99)
  """
  amount: Float!
  
  """
  The currency code (ISO 4217, e.g., "USD", "EUR")
  """
  currency: String!
  
  """
  Formatted display string (e.g., "$1,299.99")
  """
  formatted: String!
}
```

### PriceRange

```graphql
"""
Represents a price range (min-max) for products with variable pricing
"""
type PriceRange {
  """
  Minimum price in the range
  """
  min: Money!
  
  """
  Maximum price in the range
  """
  max: Money!
}
```

### Address

```graphql
"""
Represents a physical address
"""
type Address {
  """
  Unique identifier for the address
  """
  id: ID
  
  """
  First name
  """
  firstName: String!
  
  """
  Last name
  """
  lastName: String!
  
  """
  Company name (optional)
  """
  company: String
  
  """
  Street address (line 1)
  """
  street1: String!
  
  """
  Street address (line 2, optional)
  """
  street2: String
  
  """
  City
  """
  city: String!
  
  """
  State/Province
  """
  state: String!
  
  """
  Postal/ZIP code
  """
  postalCode: String!
  
  """
  Country code (ISO 3166-1 alpha-2, e.g., "US", "IN")
  """
  country: String!
  
  """
  Phone number
  """
  phone: String
  
  """
  Whether this is the default shipping address
  """
  isDefaultShipping: Boolean
  
  """
  Whether this is the default billing address
  """
  isDefaultBilling: Boolean
}
```

### Media

```graphql
"""
Represents a media item (image, video, etc.)
"""
type Media {
  """
  Media URL
  """
  url: URL!
  
  """
  Alternative text for accessibility
  """
  alt: String
  
  """
  Media type (e.g., "image", "video")
  """
  type: String!
  
  """
  Width in pixels (for images)
  """
  width: Int
  
  """
  Height in pixels (for images)
  """
  height: Int
  
  """
  Thumbnail URL (if applicable)
  """
  thumbnail: URL
}
```

### Pagination

```graphql
"""
Pagination information
"""
type PageInfo {
  """
  Whether there is a next page
  """
  hasNextPage: Boolean!
  
  """
  Whether there is a previous page
  """
  hasPreviousPage: Boolean!
  
  """
  Cursor for the first item (for pagination)
  """
  startCursor: String
  
  """
  Cursor for the last item (for pagination)
  """
  endCursor: String
  
  """
  Total number of items (if available)
  """
  totalCount: Int
}

"""
Pagination input
"""
input PaginationInput {
  """
  Number of items per page
  """
  limit: Int = 20
  
  """
  Cursor for pagination (null for first page)
  """
  cursor: String
}
```

---

## Catalog Types

### Product

```graphql
"""
Represents a product in the catalog
"""
type Product {
  """
  Unique product identifier
  """
  id: ID!
  
  """
  Product SKU
  """
  sku: String!
  
  """
  Product name
  """
  name: String!
  
  """
  Product URL slug (for routing)
  """
  slug: String!
  
  """
  Product description (HTML)
  """
  description: String
  
  """
  Short description
  """
  shortDescription: String
  
  """
  Product price (for simple products) or price range (for configurable)
  """
  price: Money
  
  """
  Price range (for variable pricing)
  """
  priceRange: PriceRange
  
  """
  Special/Sale price (if applicable)
  """
  specialPrice: Money
  
  """
  Product images
  """
  images: [Media!]!
  
  """
  Product type (SIMPLE, CONFIGURABLE, etc.)
  """
  type: ProductType!
  
  """
  Stock status
  """
  stockStatus: StockStatus!
  
  """
  Whether product is in stock
  """
  inStock: Boolean!
  
  """
  Available quantity (if trackable)
  """
  quantity: Int
  
  """
  Product attributes (for filtering/display)
  """
  attributes: [ProductAttribute!]
  
  """
  Configurable options (for configurable products)
  """
  configurableOptions: [ConfigurableOption!]
  
  """
  Related products
  """
  relatedProducts: [Product!]
  
  """
  SEO meta title
  """
  metaTitle: String
  
  """
  SEO meta description
  """
  metaDescription: String
  
  """
  Canonical URL
  """
  canonicalUrl: URL
}

"""
Product type enumeration
"""
enum ProductType {
  SIMPLE
  CONFIGURABLE
  BUNDLE
  GROUPED
  VIRTUAL
  DOWNLOADABLE
}

"""
Stock status enumeration
"""
enum StockStatus {
  IN_STOCK
  OUT_OF_STOCK
  BACKORDER
}

"""
Product attribute
"""
type ProductAttribute {
  """
  Attribute code
  """
  code: String!
  
  """
  Attribute label
  """
  label: String!
  
  """
  Attribute value
  """
  value: String!
}

"""
Configurable option for configurable products
"""
type ConfigurableOption {
  """
  Option ID
  """
  id: ID!
  
  """
  Option label (e.g., "Color", "Size")
  """
  label: String!
  
  """
  Option code
  """
  code: String!
  
  """
  Available option values
  """
  values: [ConfigurableOptionValue!]!
}

"""
Configurable option value
"""
type ConfigurableOptionValue {
  """
  Value ID
  """
  id: ID!
  
  """
  Value label (e.g., "Red", "Large")
  """
  label: String!
  
  """
  Value code
  """
  code: String!
  
  """
  Swatch/image URL (if applicable)
  """
  swatch: URL
}
```

### ProductVariant

```graphql
"""
Represents a product variant (for configurable products)
"""
type ProductVariant {
  """
  Variant ID
  """
  id: ID!
  
  """
  Variant SKU
  """
  sku: String!
  
  """
  Variant name
  """
  name: String!
  
  """
  Variant price
  """
  price: Money!
  
  """
  Variant images
  """
  images: [Media!]!
  
  """
  Stock status
  """
  stockStatus: StockStatus!
  
  """
  Whether variant is in stock
  """
  inStock: Boolean!
  
  """
  Available quantity
  """
  quantity: Int
  
  """
  Selected option values for this variant
  """
  options: [ProductAttribute!]!
}
```

### Category

```graphql
"""
Represents a product category
"""
type Category {
  """
  Category ID
  """
  id: ID!
  
  """
  Category name
  """
  name: String!
  
  """
  Category URL slug
  """
  slug: String!
  
  """
  Category description
  """
  description: String
  
  """
  Category image
  """
  image: Media
  
  """
  Parent category ID (null for root categories)
  """
  parentId: ID
  
  """
  Child categories
  """
  children: [Category!]
  
  """
  Breadcrumb path
  """
  breadcrumbs: [Category!]!
  
  """
  SEO meta title
  """
  metaTitle: String
  
  """
  SEO meta description
  """
  metaDescription: String
  
  """
  Canonical URL
  """
  canonicalUrl: URL
}
```

### ProductConnection

```graphql
"""
Paginated product connection
"""
type ProductConnection {
  """
  List of products
  """
  items: [Product!]!
  
  """
  Pagination information
  """
  pageInfo: PageInfo!
  
  """
  Total count (if available)
  """
  totalCount: Int
}
```

---

## Cart Types

### Cart

```graphql
"""
Represents a shopping cart
"""
type Cart {
  """
  Cart ID
  """
  id: ID!
  
  """
  Cart items
  """
  items: [CartItem!]!
  
  """
  Number of items in cart
  """
  itemCount: Int!
  
  """
  Cart subtotal (before discounts, tax, shipping)
  """
  subtotal: Money!
  
  """
  Applied discount amount
  """
  discount: Money
  
  """
  Applied coupon code (if any)
  """
  couponCode: String
  
  """
  Tax amount
  """
  tax: Money
  
  """
  Shipping amount (if calculated)
  """
  shipping: Money
  
  """
  Grand total
  """
  total: Money!
  
  """
  Applied shipping method (if selected)
  """
  shippingMethod: ShippingMethod
  
  """
  Applied payment method (if selected)
  """
  paymentMethod: PaymentMethod
}

"""
Cart item
"""
type CartItem {
  """
  Cart item ID
  """
  id: ID!
  
  """
  Product reference
  """
  product: Product!
  
  """
  Selected variant (for configurable products)
  """
  variant: ProductVariant
  
  """
  Quantity
  """
  quantity: Int!
  
  """
  Unit price
  """
  unitPrice: Money!
  
  """
  Row total (quantity × unit price)
  """
  rowTotal: Money!
  
  """
  Selected product options (for configurable products)
  """
  options: [ProductAttribute!]
}
```

---

## Checkout Types

### ShippingMethod

```graphql
"""
Represents a shipping method
"""
type ShippingMethod {
  """
  Shipping method code
  """
  code: String!
  
  """
  Shipping method name
  """
  name: String!
  
  """
  Shipping method description
  """
  description: String
  
  """
  Shipping cost
  """
  cost: Money!
  
  """
  Estimated delivery time (optional)
  """
  estimatedDelivery: String
}
```

### PaymentMethod

```graphql
"""
Represents a payment method
"""
type PaymentMethod {
  """
  Payment method code
  """
  code: String!
  
  """
  Payment method name
  """
  name: String!
  
  """
  Payment method title/display name
  """
  title: String!
  
  """
  Whether this method is available
  """
  available: Boolean!
  
  """
  Additional configuration (JSON)
  """
  config: JSON
}
```

### Checkout

```graphql
"""
Represents checkout state
"""
type Checkout {
  """
  Associated cart
  """
  cart: Cart!
  
  """
  Shipping address
  """
  shippingAddress: Address
  
  """
  Billing address
  """
  billingAddress: Address
  
  """
  Available shipping methods
  """
  availableShippingMethods: [ShippingMethod!]!
  
  """
  Selected shipping method
  """
  selectedShippingMethod: ShippingMethod
  
  """
  Available payment methods
  """
  availablePaymentMethods: [PaymentMethod!]!
  
  """
  Selected payment method
  """
  selectedPaymentMethod: PaymentMethod
}
```

---

## Customer Types

### Customer

```graphql
"""
Represents a customer account
"""
type Customer {
  """
  Customer ID
  """
  id: ID!
  
  """
  Email address
  """
  email: String!
  
  """
  First name
  """
  firstName: String!
  
  """
  Last name
  """
  lastName: String!
  
  """
  Full name (computed)
  """
  fullName: String!
  
  """
  Phone number
  """
  phone: String
  
  """
  Date of birth (optional)
  """
  dateOfBirth: DateTime
  
  """
  Gender (optional)
  """
  gender: String
  
  """
  Default shipping address
  """
  defaultShippingAddress: Address
  
  """
  Default billing address
  """
  defaultBillingAddress: Address
  
  """
  All saved addresses
  """
  addresses: [Address!]!
  
  """
  Whether email is verified
  """
  isEmailVerified: Boolean!
  
  """
  Account creation date
  """
  createdAt: DateTime!
}
```

### CustomerAuth

```graphql
"""
Customer authentication result
"""
type CustomerAuth {
  """
  Customer information
  """
  customer: Customer!
  
  """
  Authentication token (for session management)
  """
  token: String!
}
```

---

## Order Types

### Order

```graphql
"""
Represents an order
"""
type Order {
  """
  Order number (human-readable)
  """
  orderNumber: String!
  
  """
  Order ID (system)
  """
  id: ID!
  
  """
  Order status
  """
  status: OrderStatus!
  
  """
  Order state
  """
  state: OrderState!
  
  """
  Order items
  """
  items: [OrderItem!]!
  
  """
  Subtotal
  """
  subtotal: Money!
  
  """
  Discount amount
  """
  discount: Money
  
  """
  Applied coupon code
  """
  couponCode: String
  
  """
  Tax amount
  """
  tax: Money
  
  """
  Shipping amount
  """
  shipping: Money
  
  """
  Grand total
  """
  total: Money!
  
  """
  Shipping address
  """
  shippingAddress: Address!
  
  """
  Billing address
  """
  billingAddress: Address!
  
  """
  Shipping method used
  """
  shippingMethod: ShippingMethod
  
  """
  Payment method used
  """
  paymentMethod: PaymentMethod
  
  """
  Order date
  """
  orderDate: DateTime!
  
  """
  Tracking number (if available)
  """
  trackingNumber: String
  
  """
  Tracking URL (if available)
  """
  trackingUrl: URL
}

"""
Order status enumeration
"""
enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  COMPLETE
  CANCELLED
  REFUNDED
}

"""
Order state enumeration (more granular than status)
"""
enum OrderState {
  NEW
  PROCESSING
  COMPLETE
  CLOSED
  CANCELED
  HOLDED
  PAYMENT_REVIEW
}

"""
Order item
"""
type OrderItem {
  """
  Order item ID
  """
  id: ID!
  
  """
  Product SKU
  """
  sku: String!
  
  """
  Product name
  """
  name: String!
  
  """
  Product image
  """
  image: Media
  
  """
  Quantity ordered
  """
  quantity: Int!
  
  """
  Unit price
  """
  unitPrice: Money!
  
  """
  Row total
  """
  rowTotal: Money!
  
  """
  Product options (if applicable)
  """
  options: [ProductAttribute!]
}
```

### OrderConnection

```graphql
"""
Paginated order connection
"""
type OrderConnection {
  """
  List of orders
  """
  items: [Order!]!
  
  """
  Pagination information
  """
  pageInfo: PageInfo!
  
  """
  Total count
  """
  totalCount: Int
}
```

---

## Error Types

### NormalizedError

```graphql
"""
Normalized error type (consistent across all operations)
"""
type NormalizedError {
  """
  Error code (canonical)
  """
  code: String!
  
  """
  User-friendly error message
  """
  message: String!
  
  """
  Error severity level
  """
  severity: ErrorSeverity!
  
  """
  HTTP status code
  """
  httpStatus: Int!
  
  """
  Whether the operation can be retried
  """
  retryable: Boolean!
  
  """
  GraphQL path where error occurred
  """
  path: [String!]
  
  """
  Error source
  """
  source: ErrorSource!
  
  """
  Additional error details (JSON)
  """
  details: JSON
}

"""
Error severity enumeration
"""
enum ErrorSeverity {
  INFO
  WARN
  ERROR
}

"""
Error source enumeration
"""
enum ErrorSource {
  MAGENTO
  MIDDLEWARE
}
```

---

## Queries

### Catalog Queries

```graphql
type Query {
  """
  Get a single product by slug
  """
  product(slug: String!): Product
  
  """
  Get products by category
  """
  productsByCategory(
    categorySlug: String!
    pagination: PaginationInput
    filters: ProductFilters
    sort: ProductSort
  ): ProductConnection!
  
  """
  Get all categories (tree structure)
  """
  categories(parentId: ID): [Category!]!
  
  """
  Get a single category by slug
  """
  category(slug: String!): Category
  
  """
  Search products
  """
  searchProducts(
    query: String!
    pagination: PaginationInput
    filters: ProductFilters
    sort: ProductSort
  ): ProductConnection!
}
```

### Cart Queries

```graphql
type Query {
  """
  Get current cart
  """
  cart: Cart
}
```

### Customer Queries

```graphql
type Query {
  """
  Get current customer (requires authentication)
  """
  customer: Customer
  
  """
  Get customer orders
  """
  customerOrders(
    pagination: PaginationInput
  ): OrderConnection!
  
  """
  Get a single order by order number
  """
  order(orderNumber: String!): Order
}
```

### Checkout Queries

```graphql
type Query {
  """
  Get checkout state
  """
  checkout: Checkout
}
```

---

## Mutations

### Cart Mutations

```graphql
type Mutation {
  """
  Add product to cart
  """
  addToCart(input: AddToCartInput!): AddToCartPayload!
  
  """
  Update cart item quantity
  """
  updateCartItem(input: UpdateCartItemInput!): UpdateCartItemPayload!
  
  """
  Remove item from cart
  """
  removeCartItem(itemId: ID!): RemoveCartItemPayload!
  
  """
  Apply coupon code to cart
  """
  applyCoupon(couponCode: String!): ApplyCouponPayload!
  
  """
  Remove coupon from cart
  """
  removeCoupon: RemoveCouponPayload!
}
```

### Checkout Mutations

```graphql
type Mutation {
  """
  Set shipping address
  """
  setShippingAddress(input: AddressInput!): SetShippingAddressPayload!
  
  """
  Set billing address
  """
  setBillingAddress(input: AddressInput!): SetBillingAddressPayload!
  
  """
  Set shipping method
  """
  setShippingMethod(shippingMethodCode: String!): SetShippingMethodPayload!
  
  """
  Set payment method
  """
  setPaymentMethod(paymentMethodCode: String!): SetPaymentMethodPayload!
  
  """
  Place order
  """
  placeOrder(input: PlaceOrderInput!): PlaceOrderPayload!
}
```

### Customer Authentication Mutations

```graphql
type Mutation {
  """
  Register a new customer
  """
  register(input: RegisterInput!): RegisterPayload!
  
  """
  Login customer
  """
  login(email: String!, password: String!): LoginPayload!
  
  """
  Logout customer
  """
  logout: LogoutPayload!
  
  """
  Request password reset
  """
  requestPasswordReset(email: String!): RequestPasswordResetPayload!
  
  """
  Reset password
  """
  resetPassword(input: ResetPasswordInput!): ResetPasswordPayload!
}
```

### Customer Profile Mutations

```graphql
type Mutation {
  """
  Update customer profile
  """
  updateProfile(input: UpdateProfileInput!): UpdateProfilePayload!
  
  """
  Change password
  """
  changePassword(input: ChangePasswordInput!): ChangePasswordPayload!
  
  """
  Add address
  """
  addAddress(input: AddressInput!): AddAddressPayload!
  
  """
  Update address
  """
  updateAddress(id: ID!, input: AddressInput!): UpdateAddressPayload!
  
  """
  Delete address
  """
  deleteAddress(id: ID!): DeleteAddressPayload!
  
  """
  Set default shipping address
  """
  setDefaultShippingAddress(id: ID!): SetDefaultShippingAddressPayload!
  
  """
  Set default billing address
  """
  setDefaultBillingAddress(id: ID!): SetDefaultBillingAddressPayload!
}
```

---

## Input Types

### Product Filters

```graphql
"""
Product filtering input
"""
input ProductFilters {
  """
  Price range filter
  """
  priceRange: PriceRangeInput
  
  """
  Attribute filters (e.g., color, size)
  """
  attributes: [AttributeFilterInput!]
  
  """
  Stock status filter
  """
  inStock: Boolean
}

"""
Price range input
"""
input PriceRangeInput {
  min: Float!
  max: Float!
}

"""
Attribute filter input
"""
input AttributeFilterInput {
  code: String!
  values: [String!]!
}

"""
Product sort options
"""
input ProductSort {
  field: ProductSortField!
  direction: SortDirection!
}

"""
Product sort field enumeration
"""
enum ProductSortField {
  NAME
  PRICE
  CREATED_AT
  RELEVANCE
}

"""
Sort direction enumeration
"""
enum SortDirection {
  ASC
  DESC
}
```

### Cart Inputs

```graphql
"""
Add to cart input
"""
input AddToCartInput {
  """
  Product SKU
  """
  sku: String!
  
  """
  Quantity
  """
  quantity: Int! = 1
  
  """
  Selected variant options (for configurable products)
  """
  options: [OptionInput!]
}

"""
Option input (for configurable products)
"""
input OptionInput {
  code: String!
  value: String!
}

"""
Update cart item input
"""
input UpdateCartItemInput {
  """
  Cart item ID
  """
  itemId: ID!
  
  """
  New quantity
  """
  quantity: Int!
}
```

### Address Input

```graphql
"""
Address input
"""
input AddressInput {
  firstName: String!
  lastName: String!
  company: String
  street1: String!
  street2: String
  city: String!
  state: String!
  postalCode: String!
  country: String!
  phone: String
  isDefaultShipping: Boolean
  isDefaultBilling: Boolean
}
```

### Checkout Inputs

```graphql
"""
Place order input
"""
input PlaceOrderInput {
  """
  Agree to terms and conditions
  """
  agreeToTerms: Boolean!
  
  """
  Additional order comments (optional)
  """
  comments: String
}
```

### Customer Registration Input

```graphql
"""
Customer registration input
"""
input RegisterInput {
  email: String!
  password: String!
  firstName: String!
  lastName: String!
  phone: String
}
```

### Profile Update Input

```graphql
"""
Update profile input
"""
input UpdateProfileInput {
  firstName: String
  lastName: String
  phone: String
  dateOfBirth: DateTime
  gender: String
}
```

### Password Change Input

```graphql
"""
Change password input
"""
input ChangePasswordInput {
  currentPassword: String!
  newPassword: String!
  confirmPassword: String!
}
```

### Password Reset Input

```graphql
"""
Reset password input
"""
input ResetPasswordInput {
  email: String!
  resetToken: String!
  newPassword: String!
  confirmPassword: String!
}
```

---

## Payload Types

सभी mutations standardized payload return करती हैं:

```graphql
"""
Standard mutation payload pattern
"""
type AddToCartPayload {
  cart: Cart
  errors: [NormalizedError!]
}

type UpdateCartItemPayload {
  cart: Cart
  errors: [NormalizedError!]
}

type RemoveCartItemPayload {
  cart: Cart
  errors: [NormalizedError!]
}

type ApplyCouponPayload {
  cart: Cart
  errors: [NormalizedError!]
}

type RemoveCouponPayload {
  cart: Cart
  errors: [NormalizedError!]
}

type SetShippingAddressPayload {
  checkout: Checkout
  errors: [NormalizedError!]
}

type SetBillingAddressPayload {
  checkout: Checkout
  errors: [NormalizedError!]
}

type SetShippingMethodPayload {
  checkout: Checkout
  errors: [NormalizedError!]
}

type SetPaymentMethodPayload {
  checkout: Checkout
  errors: [NormalizedError!]
}

type PlaceOrderPayload {
  order: Order
  errors: [NormalizedError!]
}

type RegisterPayload {
  customer: CustomerAuth
  errors: [NormalizedError!]
}

type LoginPayload {
  customer: CustomerAuth
  errors: [NormalizedError!]
}

type LogoutPayload {
  success: Boolean!
  errors: [NormalizedError!]
}

type RequestPasswordResetPayload {
  success: Boolean!
  errors: [NormalizedError!]
}

type ResetPasswordPayload {
  success: Boolean!
  errors: [NormalizedError!]
}

type UpdateProfilePayload {
  customer: Customer
  errors: [NormalizedError!]
}

type ChangePasswordPayload {
  success: Boolean!
  errors: [NormalizedError!]
}

type AddAddressPayload {
  address: Address
  errors: [NormalizedError!]
}

type UpdateAddressPayload {
  address: Address
  errors: [NormalizedError!]
}

type DeleteAddressPayload {
  success: Boolean!
  errors: [NormalizedError!]
}

type SetDefaultShippingAddressPayload {
  customer: Customer
  errors: [NormalizedError!]
}

type SetDefaultBillingAddressPayload {
  customer: Customer
  errors: [NormalizedError!]
}
```

---

## Schema Implementation Notes

### 1. Error Handling

सभी operations errors return कर सकते हैं:

```graphql
# Example: Query with potential errors
type Query {
  product(slug: String!): Product
  # Errors can be returned in GraphQL errors array
  # using NormalizedError format
}
```

Mutations में errors payload में include होते हैं:

```graphql
# Example: Mutation with error payload
type Mutation {
  addToCart(input: AddToCartInput!): AddToCartPayload!
  # Payload includes both data and errors
}
```

### 2. Nullability Strategy

- **Queries**: Return types nullable हो सकते हैं (e.g., `product: Product`)
- **Mutations**: Payload types non-nullable, लेकिन data fields nullable
- **Lists**: Empty arrays return हो सकते हैं, null नहीं (e.g., `items: [Product!]!`)

### 3. Pagination

Phase 1 में cursor-based pagination use होगी, लेकिन design offset-based के लिए भी extensible है:

```graphql
# Current: Cursor-based
input PaginationInput {
  limit: Int = 20
  cursor: String
}

# Future: Can extend to offset-based
# input PaginationInput {
#   limit: Int = 20
#   cursor: String
#   offset: Int  # Future addition
# }
```

### 4. Extensibility

Schema Phase 2 features के लिए extensible है:

- **CMS Content**: Content types add हो सकते हैं
- **AI/Recommendations**: Recommendation queries add हो सकते हैं
- **Loyalty**: Loyalty points types add हो सकते हैं
- **Reviews**: Review types add हो सकते हैं

### 5. Type Generation

TypeScript types automatically generate होंगे:

```bash
# Middleware types
graphql-codegen --config codegen.middleware.yml

# Frontend types
graphql-codegen --config codegen.frontend.yml
```

### 6. Schema Validation

Middleware में operation registry के माध्यम से only whitelisted operations allow होंगे:

```typescript
// Example operation registry
const ALLOWED_OPERATIONS = [
  'GetProduct',
  'GetCategory',
  'SearchProducts',
  'AddToCart',
  // ... etc
];
```

### 7. Versioning Strategy

Schema versioning के लिए:

- **Current**: No versioning in Phase 1 (single version)
- **Future**: Schema versioning via headers या query parameters

### 8. Introspection

Production में GraphQL introspection disable हो सकती है (optional):

```typescript
// Middleware configuration
const config = {
  introspection: process.env.NODE_ENV !== 'production',
};
```

---

## Example Queries

### Get Product

```graphql
query GetProduct($slug: String!) {
  product(slug: $slug) {
    id
    sku
    name
    slug
    description
    price {
      amount
      currency
      formatted
    }
    images {
      url
      alt
    }
    stockStatus
    inStock
    configurableOptions {
      id
      label
      code
      values {
        id
        label
        code
        swatch
      }
    }
  }
}
```

### Search Products

```graphql
query SearchProducts(
  $query: String!
  $pagination: PaginationInput
  $filters: ProductFilters
  $sort: ProductSort
) {
  searchProducts(
    query: $query
    pagination: $pagination
    filters: $filters
    sort: $sort
  ) {
    items {
      id
      sku
      name
      slug
      price {
        amount
        currency
        formatted
      }
      images {
        url
        alt
      }
      inStock
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
  }
}
```

### Get Cart

```graphql
query GetCart {
  cart {
    id
    itemCount
    items {
      id
      product {
        id
        name
        sku
        images {
          url
          alt
        }
      }
      variant {
        id
        name
      }
      quantity
      unitPrice {
        amount
        currency
        formatted
      }
      rowTotal {
        amount
        currency
        formatted
      }
    }
    subtotal {
      amount
      currency
      formatted
    }
    discount {
      amount
      currency
      formatted
    }
    total {
      amount
      currency
      formatted
    }
  }
}
```

## Example Mutations

### Add to Cart

```graphql
mutation AddToCart($input: AddToCartInput!) {
  addToCart(input: $input) {
    cart {
      id
      itemCount
      items {
        id
        product {
          name
        }
        quantity
        rowTotal {
          formatted
        }
      }
      total {
        formatted
      }
    }
    errors {
      code
      message
      severity
      retryable
    }
  }
}
```

### Place Order

```graphql
mutation PlaceOrder($input: PlaceOrderInput!) {
  placeOrder(input: $input) {
    order {
      orderNumber
      status
      total {
        formatted
      }
      items {
        name
        quantity
        rowTotal {
          formatted
        }
      }
    }
    errors {
      code
      message
      severity
      httpStatus
      retryable
    }
  }
}
```

---

## Summary

यह canonical GraphQL schema:

1. **Complete Type System**: सभी required types define किए गए हैं
2. **Normalized Structure**: Magento-specific details hidden हैं
3. **Error Handling**: Consistent error format (NormalizedError)
4. **Type Safety**: TypeScript types generate हो सकेंगे
5. **Extensible**: Phase 2 features के लिए ready
6. **Production Ready**: Pagination, filtering, sorting support

Schema implementation में:
- Middleware में schema definition
- Type generation setup
- Operation registry integration
- Frontend type generation

---

**Document Owner:** Engineering Team  
**Last Updated:** 2024  
**Next Review:** After Phase 1 completion

