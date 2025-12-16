/**
 * GraphQL Queries
 * Pre-defined queries for common operations
 */

import { query } from './client';
import { Product, Category, ProductConnection, Cart, Customer, Order, OrderConnection } from './types';

/**
 * Get a single product by slug
 */
export async function getProduct(slug: string): Promise<Product | null> {
  const result = await query<{ product: Product | null }>(
    `
      query GetProduct($slug: String!) {
        product(slug: $slug) {
          id
          sku
          name
          slug
          description
          shortDescription
          price {
            amount
            currency
            formatted
          }
          priceRange {
            min {
              amount
              currency
              formatted
            }
            max {
              amount
              currency
              formatted
            }
          }
          specialPrice {
            amount
            currency
            formatted
          }
          images {
            url
            alt
            type
            width
            height
            thumbnail
          }
          type
          stockStatus
          inStock
          quantity
          attributes {
            code
            label
            value
          }
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
          relatedProducts {
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
          metaTitle
          metaDescription
          canonicalUrl
        }
      }
    `,
    { slug },
    'GetProduct'
  );

  return result.product;
}

/**
 * Get products by category
 */
export async function getProductsByCategory(
  categorySlug: string,
  pagination?: { limit?: number; cursor?: string },
  filters?: Record<string, unknown>,
  sort?: { field: string; direction: string }
): Promise<ProductConnection> {
  const result = await query<{ productsByCategory: ProductConnection }>(
    `
      query ProductsByCategory(
        $categorySlug: String!
        $pagination: PaginationInput
        $filters: ProductFilters
        $sort: ProductSort
      ) {
        productsByCategory(
          categorySlug: $categorySlug
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
            stockStatus
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
            totalCount
          }
          totalCount
        }
      }
    `,
    {
      categorySlug,
      pagination,
      filters,
      sort,
    },
    'ProductsByCategory'
  );

  return result.productsByCategory;
}

/**
 * Get all categories
 */
export async function getCategories(parentId?: string): Promise<Category[]> {
  const result = await query<{ categories: Category[] }>(
    `
      query GetCategories($parentId: ID) {
        categories(parentId: $parentId) {
          id
          name
          slug
          description
          image {
            url
            alt
          }
          parentId
          children {
            id
            name
            slug
          }
          breadcrumbs {
            id
            name
            slug
          }
        }
      }
    `,
    { parentId },
    'GetCategories'
  );

  // Handle empty or null result
  if (!result) {
    console.warn('GetCategories: No result returned');
    return [];
  }
  
  // Handle different response structures
  if (result.categories && Array.isArray(result.categories)) {
    return result.categories;
  }
  
  // If result itself is an array, return it
  if (Array.isArray(result)) {
    return result;
  }
  
  // If result has a data property with categories (nested structure)
  if (result && typeof result === 'object' && 'data' in result) {
    const data = (result as { data?: unknown }).data;
    if (data && typeof data === 'object' && 'categories' in data) {
      const categories = (data as { categories?: unknown }).categories;
      if (Array.isArray(categories)) {
        return categories;
      }
    }
  }
  
  console.warn('GetCategories: Unexpected result structure', result);
  return [];
}

/**
 * Get a single category by slug
 */
export async function getCategory(slug: string): Promise<Category | null> {
  const result = await query<{ category: Category | null }>(
    `
      query GetCategory($slug: String!) {
        category(slug: $slug) {
          id
          name
          slug
          description
          image {
            url
            alt
          }
          parentId
          children {
            id
            name
            slug
          }
          breadcrumbs {
            id
            name
            slug
          }
          metaTitle
          metaDescription
          canonicalUrl
        }
      }
    `,
    { slug },
    'GetCategory'
  );

  return result.category;
}

/**
 * Search products
 */
export async function searchProducts(
  searchQuery: string,
  pagination?: { limit?: number; cursor?: string },
  filters?: Record<string, unknown>,
  sort?: { field: string; direction: string }
): Promise<ProductConnection> {
  const result = await query<{ searchProducts: ProductConnection }>(
    `
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
            stockStatus
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
            totalCount
          }
          totalCount
        }
      }
    `,
    {
      query: searchQuery,
      pagination,
      filters,
      sort,
    },
    'SearchProducts'
  );

  return result.searchProducts;
}

/**
 * Get current cart
 */
export async function getCart(): Promise<Cart | null> {
  const result = await query<{ cart: Cart | null }>(
    `
      query GetCart {
        cart {
          id
          items {
            id
            product {
              id
              sku
              name
              slug
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
            options {
              code
              label
              value
            }
          }
          itemCount
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
          couponCode
          tax {
            amount
            currency
            formatted
          }
          shipping {
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
    `,
    undefined,
    'GetCart'
  );

  return result.cart;
}

/**
 * Get current customer (requires authentication)
 */
export async function getCustomer(): Promise<Customer | null> {
  const result = await query<{ customer: Customer | null }>(
    `
      query GetCustomer {
        customer {
          id
          email
          firstName
          lastName
          fullName
          phone
          defaultShippingAddress {
            id
            firstName
            lastName
            street1
            city
            state
            postalCode
            country
            phone
          }
          defaultBillingAddress {
            id
            firstName
            lastName
            street1
            city
            state
            postalCode
            country
            phone
          }
          addresses {
            id
            firstName
            lastName
            street1
            street2
            city
            state
            postalCode
            country
            phone
            isDefaultShipping
            isDefaultBilling
          }
          isEmailVerified
          createdAt
        }
      }
    `,
    undefined,
    'GetCustomer'
  );

  return result.customer;
}

/**
 * Get customer orders
 */
export async function getCustomerOrders(
  pagination?: { limit?: number; cursor?: string }
): Promise<OrderConnection> {
  const result = await query<{ customerOrders: OrderConnection }>(
    `
      query GetCustomerOrders($pagination: PaginationInput) {
        customerOrders(pagination: $pagination) {
          items {
            orderNumber
            id
            status
            state
            items {
              id
              sku
              name
              image {
                url
                alt
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
            tax {
              amount
              currency
              formatted
            }
            shipping {
              amount
              currency
              formatted
            }
            total {
              amount
              currency
              formatted
            }
            orderDate
            trackingNumber
            trackingUrl
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
            totalCount
          }
          totalCount
        }
      }
    `,
    { pagination },
    'GetCustomerOrders'
  );

  return result.customerOrders;
}

/**
 * Get order by order number
 */
export async function getOrder(orderNumber: string): Promise<Order | null> {
  const result = await query<{ order: Order | null }>(
    `
      query GetOrder($orderNumber: String!) {
        order(orderNumber: $orderNumber) {
          orderNumber
          id
          status
          state
          items {
            id
            sku
            name
            image {
              url
              alt
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
            options {
              code
              label
              value
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
          couponCode
          tax {
            amount
            currency
            formatted
          }
          shipping {
            amount
            currency
            formatted
          }
          total {
            amount
            currency
            formatted
          }
          shippingAddress {
            id
            firstName
            lastName
            street1
            street2
            city
            state
            postalCode
            country
            phone
          }
          billingAddress {
            id
            firstName
            lastName
            street1
            street2
            city
            state
            postalCode
            country
            phone
          }
          orderDate
          trackingNumber
          trackingUrl
        }
      }
    `,
    { orderNumber },
    'GetOrder'
  );

  return result.order;
}

