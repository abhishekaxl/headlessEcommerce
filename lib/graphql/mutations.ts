/**
 * GraphQL Mutations
 * Pre-defined mutations for common operations
 */

import { mutate } from './client';
import { Cart, Customer, Order, Address } from './types';

/**
 * Add product to cart
 */
export async function addToCart(
  sku: string,
  quantity: number = 1,
  options?: Array<{ code: string; value: string }>
): Promise<Cart> {
  const result = await mutate<{ addToCart: { cart: Cart | null; errors?: unknown[] } }>(
    `
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
    `,
    {
      input: {
        sku,
        quantity,
        options,
      },
    },
    'AddToCart'
  );

  if (result.addToCart.errors && result.addToCart.errors.length > 0) {
    const firstError = result.addToCart.errors[0];
    throw new Error(typeof firstError === 'object' && firstError !== null && 'message' in firstError 
      ? String(firstError.message) 
      : 'Unknown error');
  }

  if (!result.addToCart.cart) {
    throw new Error('Failed to add item to cart');
  }

  return result.addToCart.cart;
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(itemId: string, quantity: number): Promise<Cart> {
  const result = await mutate<{ updateCartItem: { cart: Cart | null; errors?: unknown[] } }>(
    `
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
    `,
    {
      input: {
        itemId,
        quantity,
      },
    },
    'UpdateCartItem'
  );

  if (result.updateCartItem.errors && result.updateCartItem.errors.length > 0) {
    const firstError = result.updateCartItem.errors[0];
    throw new Error(typeof firstError === 'object' && firstError !== null && 'message' in firstError 
      ? String(firstError.message) 
      : 'Unknown error');
  }

  if (!result.updateCartItem.cart) {
    throw new Error('Failed to update cart item');
  }

  return result.updateCartItem.cart;
}

/**
 * Remove item from cart
 */
export async function removeCartItem(itemId: string): Promise<Cart> {
  const result = await mutate<{ removeCartItem: { cart: Cart | null; errors?: unknown[] } }>(
    `
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
    `,
    { itemId },
    'RemoveCartItem'
  );

  if (result.removeCartItem.errors && result.removeCartItem.errors.length > 0) {
    const firstError = result.removeCartItem.errors[0]; throw new Error(typeof firstError === 'object' && firstError !== null && 'message' in firstError ? String(firstError.message) : 'Unknown error');
  }

  if (!result.removeCartItem.cart) {
    throw new Error('Failed to remove cart item');
  }

  return result.removeCartItem.cart;
}

/**
 * Apply coupon code
 */
export async function applyCoupon(couponCode: string): Promise<Cart> {
  const result = await mutate<{ applyCoupon: { cart: Cart | null; errors?: unknown[] } }>(
    `
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
    `,
    { couponCode },
    'ApplyCoupon'
  );

  if (result.applyCoupon.errors && result.applyCoupon.errors.length > 0) {
    const firstError = result.applyCoupon.errors[0]; throw new Error(typeof firstError === 'object' && firstError !== null && 'message' in firstError ? String(firstError.message) : 'Unknown error');
  }

  if (!result.applyCoupon.cart) {
    throw new Error('Failed to apply coupon');
  }

  return result.applyCoupon.cart;
}

/**
 * Remove coupon from cart
 */
export async function removeCoupon(): Promise<Cart> {
  const result = await mutate<{ removeCoupon: { cart: Cart | null; errors?: unknown[] } }>(
    `
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
    `,
    undefined,
    'RemoveCoupon'
  );

  if (result.removeCoupon.errors && result.removeCoupon.errors.length > 0) {
    const firstError = result.removeCoupon.errors[0]; throw new Error(typeof firstError === 'object' && firstError !== null && 'message' in firstError ? String(firstError.message) : 'Unknown error');
  }

  if (!result.removeCoupon.cart) {
    throw new Error('Failed to remove coupon');
  }

  return result.removeCoupon.cart;
}

/**
 * Register new customer
 */
export async function register(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  phone?: string
): Promise<Customer> {
  const result = await mutate<{ register: { customer: Customer | null; errors?: Array<{ message: string }> } }>(
    `
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
    `,
    {
      input: {
        email,
        password,
        firstName,
        lastName,
        phone,
      },
    },
    'Register'
  );

  if (result.register.errors && result.register.errors.length > 0) {
    const firstError = result.register.errors[0]; throw new Error(typeof firstError === 'object' && firstError !== null && 'message' in firstError ? String(firstError.message) : 'Unknown error');
  }

  if (!result.register.customer) {
    throw new Error('Failed to register');
  }

  return result.register.customer;
}

/**
 * Login customer
 */
export async function login(email: string, password: string): Promise<Customer> {
  const result = await mutate<{ login: { customer: Customer | null; errors?: Array<{ message: string }> } }>(
    `
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
    `,
    { email, password },
    'Login'
  );

  if (result.login.errors && result.login.errors.length > 0) {
    const firstError = result.login.errors[0]; throw new Error(typeof firstError === 'object' && firstError !== null && 'message' in firstError ? String(firstError.message) : 'Unknown error');
  }

  if (!result.login.customer) {
    throw new Error('Failed to login');
  }

  return result.login.customer;
}

/**
 * Logout customer
 */
export async function logout(): Promise<void> {
  const result = await mutate<{ logout: { success: boolean; errors?: unknown[] } }>(
    `
      mutation Logout {
        logout {
          success
          errors {
            code
            message
          }
        }
      }
    `,
    undefined,
    'Logout'
  );

  if (result.logout.errors && result.logout.errors.length > 0) {
    const firstError = result.logout.errors[0]; throw new Error(typeof firstError === 'object' && firstError !== null && 'message' in firstError ? String(firstError.message) : 'Unknown error');
  }
}

/**
 * Place order
 */
export async function placeOrder(
  agreeToTerms: boolean,
  comments?: string
): Promise<Order> {
  const result = await mutate<{ placeOrder: { order: Order | null; errors?: unknown[] } }>(
    `
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
    `,
    {
      input: {
        agreeToTerms,
        comments,
      },
    },
    'PlaceOrder'
  );

  if (result.placeOrder.errors && result.placeOrder.errors.length > 0) {
    const firstError = result.placeOrder.errors[0]; throw new Error(typeof firstError === 'object' && firstError !== null && 'message' in firstError ? String(firstError.message) : 'Unknown error');
  }

  if (!result.placeOrder.order) {
    throw new Error('Failed to place order');
  }

  return result.placeOrder.order;
}

/**
 * Set shipping address
 */
export async function setShippingAddress(address: Address): Promise<void> {
  const result = await mutate<{ setShippingAddress: { errors?: unknown[] } }>(
    `
      mutation SetShippingAddress($input: AddressInput!) {
        setShippingAddress(input: $input) {
          errors {
            code
            message
          }
        }
      }
    `,
    { input: address },
    'SetShippingAddress'
  );

  if (result.setShippingAddress.errors && result.setShippingAddress.errors.length > 0) {
    const firstError = result.setShippingAddress.errors[0]; throw new Error(typeof firstError === 'object' && firstError !== null && 'message' in firstError ? String(firstError.message) : 'Unknown error');
  }
}

/**
 * Set billing address
 */
export async function setBillingAddress(address: Address): Promise<void> {
  const result = await mutate<{ setBillingAddress: { errors?: unknown[] } }>(
    `
      mutation SetBillingAddress($input: AddressInput!) {
        setBillingAddress(input: $input) {
          errors {
            code
            message
          }
        }
      }
    `,
    { input: address },
    'SetBillingAddress'
  );

  if (result.setBillingAddress.errors && result.setBillingAddress.errors.length > 0) {
    const firstError = result.setBillingAddress.errors[0]; throw new Error(typeof firstError === 'object' && firstError !== null && 'message' in firstError ? String(firstError.message) : 'Unknown error');
  }
}

/**
 * Set shipping method
 */
export async function setShippingMethod(shippingMethodCode: string): Promise<void> {
  const result = await mutate<{ setShippingMethod: { errors?: unknown[] } }>(
    `
      mutation SetShippingMethod($shippingMethodCode: String!) {
        setShippingMethod(shippingMethodCode: $shippingMethodCode) {
          errors {
            code
            message
          }
        }
      }
    `,
    { shippingMethodCode },
    'SetShippingMethod'
  );

  if (result.setShippingMethod.errors && result.setShippingMethod.errors.length > 0) {
    const firstError = result.setShippingMethod.errors[0]; throw new Error(typeof firstError === 'object' && firstError !== null && 'message' in firstError ? String(firstError.message) : 'Unknown error');
  }
}

/**
 * Set payment method
 */
export async function setPaymentMethod(paymentMethodCode: string): Promise<void> {
  const result = await mutate<{ setPaymentMethod: { errors?: unknown[] } }>(
    `
      mutation SetPaymentMethod($paymentMethodCode: String!) {
        setPaymentMethod(paymentMethodCode: $paymentMethodCode) {
          errors {
            code
            message
          }
        }
      }
    `,
    { paymentMethodCode },
    'SetPaymentMethod'
  );

  if (result.setPaymentMethod.errors && result.setPaymentMethod.errors.length > 0) {
    const firstError = result.setPaymentMethod.errors[0]; throw new Error(typeof firstError === 'object' && firstError !== null && 'message' in firstError ? String(firstError.message) : 'Unknown error');
  }
}

