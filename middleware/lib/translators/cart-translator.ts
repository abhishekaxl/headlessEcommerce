/**
 * Cart + Checkout Translator
 * Translates cart/checkout canonical operations to Magento GraphQL
 */

import { BaseTranslator } from './base-translator';
import { RequestContext } from '../types';
import { MagentoGraphQLRequest } from '../magento/client';
import { ErrorSeverity, ErrorSource, NormalizedError } from '../types';

type MagentoMoney = { value?: number; currency?: string };

function money(value: number | undefined, currency: string | undefined) {
  const v = typeof value === 'number' ? value : 0;
  const c = currency || 'USD';
  return {
    amount: v,
    currency: c,
    formatted: `${c} ${v.toFixed(2)}`,
  };
}

function normalizeErrors(userErrors: Array<{ code?: string; message?: string }> | undefined): NormalizedError[] {
  if (!userErrors || userErrors.length === 0) return [];
  return userErrors.map((e) => ({
    code: e.code || 'MAGENTO_ERROR',
    message: e.message || 'Magento error',
    severity: ErrorSeverity.ERROR,
    httpStatus: 400,
    retryable: false,
    source: ErrorSource.MAGENTO,
  }));
}

function normalizeMagentoCart(cart: any) {
  // Magento cart: prices.subtotal_excluding_tax, prices.grand_total, etc.
  const subtotalMoney: MagentoMoney | undefined = cart?.prices?.subtotal_excluding_tax;
  const grandMoney: MagentoMoney | undefined = cart?.prices?.grand_total;
  const appliedTaxes = cart?.prices?.applied_taxes;
  const discounts = cart?.prices?.discounts;

  const discountAmount =
    Array.isArray(discounts) && discounts.length > 0
      ? (discounts[0]?.amount?.value as number | undefined)
      : undefined;
  const discountCurrency =
    Array.isArray(discounts) && discounts.length > 0
      ? (discounts[0]?.amount?.currency as string | undefined)
      : undefined;

  const taxAmount =
    Array.isArray(appliedTaxes) && appliedTaxes.length > 0
      ? (appliedTaxes[0]?.amount?.value as number | undefined)
      : undefined;
  const taxCurrency =
    Array.isArray(appliedTaxes) && appliedTaxes.length > 0
      ? (appliedTaxes[0]?.amount?.currency as string | undefined)
      : undefined;

  const shippingValue =
    cart?.shipping_addresses?.[0]?.selected_shipping_method?.amount?.value as number | undefined;
  const shippingCurrency =
    cart?.shipping_addresses?.[0]?.selected_shipping_method?.amount?.currency as string | undefined;

  const items = (cart?.items || []).map((item: any) => {
    const unit = item?.prices?.price as MagentoMoney | undefined;
    const row = item?.prices?.row_total as MagentoMoney | undefined;
    const product = item?.product;
    return {
      id: String(item?.id ?? ''),
      product: {
        id: product?.sku || '',
        sku: product?.sku || '',
        name: product?.name || '',
        slug: product?.url_key || '',
        images: product?.image
          ? [
              {
                url: product.image.url,
                alt: product.image.label || product.name || '',
                type: 'image',
              },
            ]
          : [],
        type: 'SIMPLE',
        stockStatus: 'IN_STOCK',
        inStock: true,
      },
      quantity: item?.quantity || 1,
      unitPrice: money(unit?.value, unit?.currency),
      rowTotal: money(row?.value, row?.currency),
      options: [],
    };
  });

  const couponCode = cart?.applied_coupons?.[0]?.code || undefined;

  return {
    id: String(cart?.id ?? ''),
    items,
    itemCount: items.reduce((sum: number, it: any) => sum + (it.quantity || 0), 0),
    subtotal: money(subtotalMoney?.value, subtotalMoney?.currency),
    discount: discountAmount !== undefined ? money(Math.abs(discountAmount), discountCurrency) : null,
    couponCode,
    tax: taxAmount !== undefined ? money(taxAmount, taxCurrency) : null,
    shipping: shippingValue !== undefined ? money(shippingValue, shippingCurrency) : null,
    total: money(grandMoney?.value, grandMoney?.currency),
  };
}

function normalizeCheckoutFromCart(cart: any) {
  const normalizedCart = normalizeMagentoCart(cart);

  const shipAddr = cart?.shipping_addresses?.[0]?.shipping_address;
  const billAddr = cart?.billing_address;

  const toAddr = (a: any) =>
    a
      ? {
          firstName: a.firstname || '',
          lastName: a.lastname || '',
          company: a.company || undefined,
          street1: Array.isArray(a.street) ? a.street[0] || '' : a.street || '',
          street2: Array.isArray(a.street) ? a.street[1] || undefined : undefined,
          city: a.city || '',
          state: a.region?.code || a.region?.region || '',
          postalCode: a.postcode || '',
          country: a.country?.code || a.country_code || 'US',
          phone: a.telephone || '',
        }
      : null;

  const availableShippingMethods = (
    cart?.shipping_addresses?.[0]?.available_shipping_methods || []
  ).map((m: any) => ({
    code: `${m.carrier_code}_${m.method_code}`,
    name: m.method_title || m.carrier_title || `${m.carrier_code}/${m.method_code}`,
    description: m.carrier_title || null,
    cost: money(m.amount?.value, m.amount?.currency),
    estimatedDelivery: null,
  }));

  const selectedShip = cart?.shipping_addresses?.[0]?.selected_shipping_method;
  const selectedShippingMethod = selectedShip
    ? {
        code: `${selectedShip.carrier_code}_${selectedShip.method_code}`,
        name: selectedShip.method_title || selectedShip.carrier_title || '',
        description: selectedShip.carrier_title || null,
        cost: money(selectedShip.amount?.value, selectedShip.amount?.currency),
        estimatedDelivery: null,
      }
    : null;

  const availablePaymentMethods = (cart?.available_payment_methods || []).map((m: any) => ({
    code: m.code || '',
    name: m.title || m.code || '',
    title: m.title || m.code || '',
    available: true,
    config: null,
  }));

  const selectedPay = cart?.selected_payment_method;
  const selectedPaymentMethod = selectedPay
    ? {
        code: selectedPay.code || '',
        name: selectedPay.title || selectedPay.code || '',
        title: selectedPay.title || selectedPay.code || '',
        available: true,
        config: null,
      }
    : null;

  return {
    cart: normalizedCart,
    shippingAddress: toAddr(shipAddr),
    billingAddress: toAddr(billAddr),
    availableShippingMethods,
    selectedShippingMethod,
    availablePaymentMethods,
    selectedPaymentMethod,
  };
}

export class CartTranslator extends BaseTranslator {
  translate(operationName: string, variables: Record<string, unknown>, context: RequestContext): MagentoGraphQLRequest {
    const cartId = context.cartToken;
    if (!cartId && operationName !== 'GetCart') {
      // Most operations need cart id; GetCart will also need it for guest carts.
      // We still proceed; Magento will error and we normalize it.
    }

    switch (operationName) {
      case 'GetCart':
        return {
          query: `
            query GetCart($cartId: String!) {
              cart(cart_id: $cartId) {
                id
                items {
                  id
                  quantity
                  product {
                    sku
                    name
                    url_key
                    image { url label }
                  }
                  prices {
                    price { value currency }
                    row_total { value currency }
                  }
                }
                prices {
                  grand_total { value currency }
                  subtotal_excluding_tax { value currency }
                  discounts { amount { value currency } label }
                  applied_taxes { amount { value currency } label }
                }
                applied_coupons { code }
              }
            }
          `,
          variables: { cartId },
          operationName: 'GetCart',
        };

      case 'GetCheckout':
        return {
          query: `
            query GetCheckout($cartId: String!) {
              cart(cart_id: $cartId) {
                id
                items {
                  id
                  quantity
                  product {
                    sku
                    name
                    url_key
                    image { url label }
                  }
                  prices {
                    price { value currency }
                    row_total { value currency }
                  }
                }
                prices {
                  grand_total { value currency }
                  subtotal_excluding_tax { value currency }
                  discounts { amount { value currency } label }
                  applied_taxes { amount { value currency } label }
                }
                applied_coupons { code }
                shipping_addresses {
                  selected_shipping_method {
                    carrier_code
                    method_code
                    carrier_title
                    method_title
                    amount { value currency }
                  }
                  available_shipping_methods {
                    carrier_code
                    method_code
                    carrier_title
                    method_title
                    amount { value currency }
                  }
                  shipping_address {
                    firstname
                    lastname
                    company
                    street
                    city
                    region { code region }
                    postcode
                    country { code }
                    telephone
                  }
                }
                billing_address {
                  firstname
                  lastname
                  company
                  street
                  city
                  region { code region }
                  postcode
                  country { code }
                  telephone
                }
                available_payment_methods { code title }
                selected_payment_method { code title }
              }
            }
          `,
          variables: { cartId },
          operationName: 'GetCheckout',
        };

      case 'AddToCart': {
        const input = variables.input as { sku: string; quantity?: number } | undefined;
        return {
          query: `
            mutation AddToCart($cartId: String!, $sku: String!, $qty: Float!) {
              addProductsToCart(
                cartId: $cartId
                cartItems: [{ sku: $sku, quantity: $qty }]
              ) {
                cart {
                  id
                  items {
                    id
                    quantity
                    product { sku name url_key image { url label } }
                    prices { price { value currency } row_total { value currency } }
                  }
                  prices { grand_total { value currency } subtotal_excluding_tax { value currency } }
                  applied_coupons { code }
                }
                user_errors { code message }
              }
            }
          `,
          variables: { cartId, sku: input?.sku, qty: input?.quantity ?? 1 },
          operationName: 'AddToCart',
        };
      }

      case 'UpdateCartItem': {
        const input = variables.input as { itemId: string; quantity: number } | undefined;
        return {
          query: `
            mutation UpdateCartItem($cartId: String!, $itemId: Int!, $qty: Float!) {
              updateCartItems(
                input: { cart_id: $cartId, cart_items: [{ cart_item_id: $itemId, quantity: $qty }] }
              ) {
                cart {
                  id
                  items { id quantity product { sku name url_key image { url label } } prices { price { value currency } row_total { value currency } } }
                  prices { grand_total { value currency } subtotal_excluding_tax { value currency } }
                  applied_coupons { code }
                }
                user_errors { code message }
              }
            }
          `,
          variables: { cartId, itemId: Number(input?.itemId), qty: input?.quantity ?? 1 },
          operationName: 'UpdateCartItem',
        };
      }

      case 'RemoveCartItem': {
        const itemId = variables.itemId as string;
        return {
          query: `
            mutation RemoveCartItem($cartId: String!, $itemId: Int!) {
              removeItemFromCart(input: { cart_id: $cartId, cart_item_id: $itemId }) {
                cart {
                  id
                  items { id quantity product { sku name url_key image { url label } } prices { price { value currency } row_total { value currency } } }
                  prices { grand_total { value currency } subtotal_excluding_tax { value currency } }
                  applied_coupons { code }
                }
              }
            }
          `,
          variables: { cartId, itemId: Number(itemId) },
          operationName: 'RemoveCartItem',
        };
      }

      case 'ApplyCoupon': {
        const couponCode = variables.couponCode as string;
        return {
          query: `
            mutation ApplyCoupon($cartId: String!, $code: String!) {
              applyCouponToCart(input: { cart_id: $cartId, coupon_code: $code }) {
                cart {
                  id
                  prices { grand_total { value currency } subtotal_excluding_tax { value currency } discounts { amount { value currency } label } }
                  applied_coupons { code }
                }
              }
            }
          `,
          variables: { cartId, code: couponCode },
          operationName: 'ApplyCoupon',
        };
      }

      case 'RemoveCoupon':
        return {
          query: `
            mutation RemoveCoupon($cartId: String!) {
              removeCouponFromCart(input: { cart_id: $cartId }) {
                cart {
                  id
                  prices { grand_total { value currency } subtotal_excluding_tax { value currency } discounts { amount { value currency } label } }
                  applied_coupons { code }
                }
              }
            }
          `,
          variables: { cartId },
          operationName: 'RemoveCoupon',
        };

      case 'SetShippingAddress': {
        const input = variables.input as any;
        const email = (variables.email as string | undefined) || (variables.guestEmail as string | undefined) || '';
        return {
          query: `
            mutation SetShippingAddress($cartId: String!, $address: CartAddressInput!, $email: String!) {
              setGuestEmailOnCart(input: { cart_id: $cartId, email: $email })
              setShippingAddressesOnCart(input: { cart_id: $cartId, shipping_addresses: [{ address: $address }] }) {
                cart {
                  id
                  shipping_addresses {
                    shipping_address {
                      firstname lastname company street city region { code region } postcode country { code } telephone
                    }
                    available_shipping_methods { carrier_code method_code carrier_title method_title amount { value currency } }
                    selected_shipping_method { carrier_code method_code carrier_title method_title amount { value currency } }
                  }
                  available_payment_methods { code title }
                  selected_payment_method { code title }
                  items { id quantity product { sku name url_key image { url label } } prices { price { value currency } row_total { value currency } } }
                  prices { grand_total { value currency } subtotal_excluding_tax { value currency } }
                  applied_coupons { code }
                }
              }
            }
          `,
          variables: {
            cartId,
            email,
            address: {
              firstname: input?.firstName,
              lastname: input?.lastName,
              company: input?.company,
              street: [input?.street1, input?.street2].filter(Boolean),
              city: input?.city,
              region: input?.state,
              postcode: input?.postalCode,
              country_code: input?.country,
              telephone: input?.phone,
            },
          },
          operationName: 'SetShippingAddress',
        };
      }

      case 'SetBillingAddress': {
        const input = variables.input as any;
        return {
          query: `
            mutation SetBillingAddress($cartId: String!, $address: CartAddressInput!) {
              setBillingAddressOnCart(input: { cart_id: $cartId, billing_address: { address: $address } }) {
                cart {
                  id
                  billing_address {
                    firstname lastname company street city region { code region } postcode country { code } telephone
                  }
                  shipping_addresses {
                    shipping_address { firstname lastname company street city region { code region } postcode country { code } telephone }
                    available_shipping_methods { carrier_code method_code carrier_title method_title amount { value currency } }
                    selected_shipping_method { carrier_code method_code carrier_title method_title amount { value currency } }
                  }
                  available_payment_methods { code title }
                  selected_payment_method { code title }
                  items { id quantity product { sku name url_key image { url label } } prices { price { value currency } row_total { value currency } } }
                  prices { grand_total { value currency } subtotal_excluding_tax { value currency } }
                  applied_coupons { code }
                }
              }
            }
          `,
          variables: {
            cartId,
            address: {
              firstname: input?.firstName,
              lastname: input?.lastName,
              company: input?.company,
              street: [input?.street1, input?.street2].filter(Boolean),
              city: input?.city,
              region: input?.state,
              postcode: input?.postalCode,
              country_code: input?.country,
              telephone: input?.phone,
            },
          },
          operationName: 'SetBillingAddress',
        };
      }

      case 'SetShippingMethod': {
        const shippingMethodCode = variables.shippingMethodCode as string;
        const [carrierCode, methodCode] = shippingMethodCode.split('_');
        return {
          query: `
            mutation SetShippingMethod($cartId: String!, $carrier: String!, $method: String!) {
              setShippingMethodsOnCart(input: { cart_id: $cartId, shipping_methods: [{ carrier_code: $carrier, method_code: $method }] }) {
                cart {
                  id
                  shipping_addresses {
                    selected_shipping_method { carrier_code method_code carrier_title method_title amount { value currency } }
                    available_shipping_methods { carrier_code method_code carrier_title method_title amount { value currency } }
                    shipping_address { firstname lastname company street city region { code region } postcode country { code } telephone }
                  }
                  available_payment_methods { code title }
                  selected_payment_method { code title }
                  items { id quantity product { sku name url_key image { url label } } prices { price { value currency } row_total { value currency } } }
                  prices { grand_total { value currency } subtotal_excluding_tax { value currency } }
                  applied_coupons { code }
                }
              }
            }
          `,
          variables: { cartId, carrier: carrierCode, method: methodCode },
          operationName: 'SetShippingMethod',
        };
      }

      case 'SetPaymentMethod': {
        const paymentMethodCode = variables.paymentMethodCode as string;
        return {
          query: `
            mutation SetPaymentMethod($cartId: String!, $code: String!) {
              setPaymentMethodOnCart(input: { cart_id: $cartId, payment_method: { code: $code } }) {
                cart {
                  id
                  available_payment_methods { code title }
                  selected_payment_method { code title }
                  shipping_addresses {
                    selected_shipping_method { carrier_code method_code carrier_title method_title amount { value currency } }
                    shipping_address { firstname lastname company street city region { code region } postcode country { code } telephone }
                  }
                  billing_address { firstname lastname company street city region { code region } postcode country { code } telephone }
                  items { id quantity product { sku name url_key image { url label } } prices { price { value currency } row_total { value currency } } }
                  prices { grand_total { value currency } subtotal_excluding_tax { value currency } }
                  applied_coupons { code }
                }
              }
            }
          `,
          variables: { cartId, code: paymentMethodCode },
          operationName: 'SetPaymentMethod',
        };
      }

      case 'PlaceOrder':
        return {
          query: `
            mutation PlaceOrder($cartId: String!) {
              placeOrder(input: { cart_id: $cartId }) {
                order { order_number }
                errors { message }
              }
            }
          `,
          variables: { cartId },
          operationName: 'PlaceOrder',
        };

      default:
        throw new Error(`Unknown cart/checkout operation: ${operationName}`);
    }
  }

  normalize(magentoData: unknown, _context: RequestContext): unknown {
    if (!magentoData || typeof magentoData !== 'object') return magentoData;
    const data = magentoData as Record<string, any>;

    // Queries
    if (data.cart && typeof data.cart === 'object') {
      // Could be GetCart or GetCheckout; if checkout fields present, normalize as checkout
      const cart = data.cart;
      const hasCheckoutFields =
        Array.isArray(cart.shipping_addresses) ||
        Array.isArray(cart.available_payment_methods) ||
        cart.selected_payment_method;
      if (hasCheckoutFields) {
        return { checkout: normalizeCheckoutFromCart(cart) };
      }
      return { cart: normalizeMagentoCart(cart) };
    }

    // Mutations
    if (data.addProductsToCart) {
      return {
        addToCart: {
          cart: normalizeMagentoCart(data.addProductsToCart.cart),
          errors: normalizeErrors(data.addProductsToCart.user_errors),
        },
      };
    }

    if (data.updateCartItems) {
      return {
        updateCartItem: {
          cart: normalizeMagentoCart(data.updateCartItems.cart),
          errors: normalizeErrors(data.updateCartItems.user_errors),
        },
      };
    }

    if (data.removeItemFromCart) {
      return {
        removeCartItem: {
          cart: normalizeMagentoCart(data.removeItemFromCart.cart),
          errors: [],
        },
      };
    }

    if (data.applyCouponToCart) {
      return {
        applyCoupon: {
          cart: normalizeMagentoCart(data.applyCouponToCart.cart),
          errors: [],
        },
      };
    }

    if (data.removeCouponFromCart) {
      return {
        removeCoupon: {
          cart: normalizeMagentoCart(data.removeCouponFromCart.cart),
          errors: [],
        },
      };
    }

    if (data.setShippingAddressesOnCart) {
      return {
        setShippingAddress: {
          checkout: normalizeCheckoutFromCart(data.setShippingAddressesOnCart.cart),
          errors: [],
        },
      };
    }

    if (data.setBillingAddressOnCart) {
      return {
        setBillingAddress: {
          checkout: normalizeCheckoutFromCart(data.setBillingAddressOnCart.cart),
          errors: [],
        },
      };
    }

    if (data.setShippingMethodsOnCart) {
      return {
        setShippingMethod: {
          checkout: normalizeCheckoutFromCart(data.setShippingMethodsOnCart.cart),
          errors: [],
        },
      };
    }

    if (data.setPaymentMethodOnCart) {
      return {
        setPaymentMethod: {
          checkout: normalizeCheckoutFromCart(data.setPaymentMethodOnCart.cart),
          errors: [],
        },
      };
    }

    if (data.placeOrder) {
      const orderNumber = data.placeOrder.order?.order_number || '';
      return {
        placeOrder: {
          order: {
            orderNumber,
            id: orderNumber,
            status: 'PENDING',
            state: 'NEW',
            items: [],
            subtotal: money(0, 'USD'),
            discount: null,
            couponCode: null,
            tax: null,
            shipping: null,
            total: money(0, 'USD'),
            shippingAddress: {
              firstName: '',
              lastName: '',
              street1: '',
              city: '',
              state: '',
              postalCode: '',
              country: 'US',
              phone: '',
            },
            billingAddress: {
              firstName: '',
              lastName: '',
              street1: '',
              city: '',
              state: '',
              postalCode: '',
              country: 'US',
              phone: '',
            },
            shippingMethod: null,
            paymentMethod: null,
            orderDate: new Date().toISOString(),
            trackingNumber: null,
            trackingUrl: null,
          },
          errors: normalizeErrors(data.placeOrder.errors),
        },
      };
    }

    return magentoData;
  }
}


