/**
 * GraphQL Mutation Documents
 * Using Apollo Client gql tag for mutations
 */

import { gql } from '@apollo/client';

export const ADD_TO_CART = gql`
  mutation AddToCart($input: AddToCartInput!) {
    addToCart(input: $input) {
      cart {
        id
        items {
          id
          product {
            id
            name
            sku
          }
          quantity
          rowTotal {
            formatted
          }
        }
        itemCount
        total {
          formatted
        }
      }
      errors {
        code
        message
        severity
      }
    }
  }
`;

export const UPDATE_CART_ITEM = gql`
  mutation UpdateCartItem($input: UpdateCartItemInput!) {
    updateCartItem(input: $input) {
      cart {
        id
        items {
          id
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
      }
    }
  }
`;

export const REMOVE_CART_ITEM = gql`
  mutation RemoveCartItem($itemId: ID!) {
    removeCartItem(itemId: $itemId) {
      cart {
        id
        items {
          id
        }
        itemCount
        total {
          formatted
        }
      }
      errors {
        code
        message
      }
    }
  }
`;

export const APPLY_COUPON = gql`
  mutation ApplyCoupon($couponCode: String!) {
    applyCoupon(couponCode: $couponCode) {
      cart {
        id
        discount {
          formatted
        }
        couponCode
        total {
          formatted
        }
      }
      errors {
        code
        message
      }
    }
  }
`;

export const REMOVE_COUPON = gql`
  mutation RemoveCoupon {
    removeCoupon {
      cart {
        id
        discount
        couponCode
        total {
          formatted
        }
      }
      errors {
        code
        message
      }
    }
  }
`;

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      customer {
        customer {
          id
          email
          firstName
          lastName
        }
        token
      }
      errors {
        code
        message
      }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      customer {
        customer {
          id
          email
          firstName
          lastName
        }
        token
      }
      errors {
        code
        message
      }
    }
  }
`;

export const LOGOUT = gql`
  mutation Logout {
    logout {
      success
      errors {
        code
        message
      }
    }
  }
`;

export const PLACE_ORDER = gql`
  mutation PlaceOrder($input: PlaceOrderInput!) {
    placeOrder(input: $input) {
      order {
        orderNumber
        id
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
`;

export const SET_SHIPPING_ADDRESS = gql`
  mutation SetShippingAddress($input: AddressInput!) {
    setShippingAddress(input: $input) {
      errors {
        code
        message
      }
    }
  }
`;

export const SET_BILLING_ADDRESS = gql`
  mutation SetBillingAddress($input: AddressInput!) {
    setBillingAddress(input: $input) {
      errors {
        code
        message
      }
    }
  }
`;

export const SET_SHIPPING_METHOD = gql`
  mutation SetShippingMethod($shippingMethodCode: String!) {
    setShippingMethod(shippingMethodCode: $shippingMethodCode) {
      errors {
        code
        message
      }
    }
  }
`;

export const SET_PAYMENT_METHOD = gql`
  mutation SetPaymentMethod($paymentMethodCode: String!) {
    setPaymentMethod(paymentMethodCode: $paymentMethodCode) {
      errors {
        code
        message
      }
    }
  }
`;


