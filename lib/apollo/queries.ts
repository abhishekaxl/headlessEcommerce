/**
 * GraphQL Query Documents
 * Using Apollo Client gql tag for queries
 */

import { gql } from '@apollo/client';

export const GET_PRODUCT = gql`
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
`;

export const GET_PRODUCTS_BY_CATEGORY = gql`
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
        type
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
`;

export const GET_CATEGORIES = gql`
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
`;

export const GET_CATEGORY = gql`
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
`;

export const SEARCH_PRODUCTS = gql`
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
        type
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
`;

export const GET_CART = gql`
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
`;

export const GET_CUSTOMER = gql`
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
`;

export const GET_CUSTOMER_ORDERS = gql`
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
`;

export const GET_ORDER = gql`
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
`;

