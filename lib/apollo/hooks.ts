/**
 * Apollo Client Hooks
 * React hooks for GraphQL operations using Apollo Client
 */

import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import {
  GET_PRODUCT,
  GET_PRODUCTS_BY_CATEGORY,
  GET_CATEGORIES,
  GET_CATEGORY,
  SEARCH_PRODUCTS,
  GET_CART,
  GET_CUSTOMER,
  GET_CUSTOMER_ORDERS,
  GET_ORDER,
} from './queries';
import {
  ADD_TO_CART,
  UPDATE_CART_ITEM,
  REMOVE_CART_ITEM,
  APPLY_COUPON,
  REMOVE_COUPON,
  REGISTER,
  LOGIN,
  LOGOUT,
  PLACE_ORDER,
  SET_SHIPPING_ADDRESS,
  SET_BILLING_ADDRESS,
  SET_SHIPPING_METHOD,
  SET_PAYMENT_METHOD,
} from './mutations';
import { Product, Category, ProductConnection, Cart, Customer, Order, OrderConnection } from '../graphql/types';

// Query Hooks

export function useProduct(slug: string) {
  const { data, loading, error, refetch } = useQuery<{ product: Product | null }>(GET_PRODUCT, {
    variables: { slug },
    skip: !slug,
    errorPolicy: 'all',
  });

  return {
    product: data?.product || null,
    loading,
    error,
    refetch,
  };
}

export function useProductsByCategory(
  categorySlug: string,
  pagination?: { limit?: number; cursor?: string },
  filters?: Record<string, unknown>,
  sort?: { field: string; direction: string }
) {
  const { data, loading, error, fetchMore } = useQuery<{ productsByCategory: ProductConnection }>(
    GET_PRODUCTS_BY_CATEGORY,
    {
      variables: {
        categorySlug,
        pagination,
        filters,
        sort,
      },
      skip: !categorySlug,
      errorPolicy: 'all',
    }
  );

  return {
    products: data?.productsByCategory || { items: [], pageInfo: { hasNextPage: false, hasPreviousPage: false, totalCount: 0 }, totalCount: 0 },
    loading,
    error,
    fetchMore,
  };
}

export function useCategories(parentId?: string) {
  const { data, loading, error, refetch } = useQuery<{ categories: Category[] }>(GET_CATEGORIES, {
    variables: { parentId },
    errorPolicy: 'all',
  });

  return {
    categories: data?.categories || [],
    loading,
    error,
    refetch,
  };
}

export function useCategory(slug: string) {
  const { data, loading, error, refetch } = useQuery<{ category: Category | null }>(GET_CATEGORY, {
    variables: { slug },
    skip: !slug,
    errorPolicy: 'all',
  });

  return {
    category: data?.category || null,
    loading,
    error,
    refetch,
  };
}

export function useSearchProducts(
  searchQuery: string,
  pagination?: { limit?: number; cursor?: string },
  filters?: Record<string, unknown>,
  sort?: { field: string; direction: string }
) {
  const { data, loading, error, fetchMore } = useQuery<{ searchProducts: ProductConnection }>(
    SEARCH_PRODUCTS,
    {
      variables: {
        query: searchQuery,
        pagination,
        filters,
        sort,
      },
      skip: !searchQuery,
      errorPolicy: 'all',
    }
  );

  return {
    products: data?.searchProducts || { items: [], pageInfo: { hasNextPage: false, hasPreviousPage: false, totalCount: 0 }, totalCount: 0 },
    loading,
    error,
    fetchMore,
  };
}

export function useCart() {
  const { data, loading, error, refetch } = useQuery<{ cart: Cart | null }>(GET_CART, {
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  });

  return {
    cart: data?.cart || null,
    loading,
    error,
    refetch,
  };
}

export function useCustomer() {
  const { data, loading, error, refetch } = useQuery<{ customer: Customer | null }>(GET_CUSTOMER, {
    errorPolicy: 'all',
  });

  return {
    customer: data?.customer || null,
    loading,
    error,
    refetch,
  };
}

export function useCustomerOrders(pagination?: { limit?: number; cursor?: string }) {
  const { data, loading, error, fetchMore } = useQuery<{ customerOrders: OrderConnection }>(
    GET_CUSTOMER_ORDERS,
    {
      variables: { pagination },
      errorPolicy: 'all',
    }
  );

  return {
    orders: data?.customerOrders || { items: [], pageInfo: { hasNextPage: false, hasPreviousPage: false, totalCount: 0 }, totalCount: 0 },
    loading,
    error,
    fetchMore,
  };
}

export function useOrder(orderNumber: string) {
  const { data, loading, error, refetch } = useQuery<{ order: Order | null }>(GET_ORDER, {
    variables: { orderNumber },
    skip: !orderNumber,
    errorPolicy: 'all',
  });

  return {
    order: data?.order || null,
    loading,
    error,
    refetch,
  };
}

// Mutation Hooks

export function useAddToCart() {
  const [mutate, { loading, error }] = useMutation(ADD_TO_CART, {
    refetchQueries: [{ query: GET_CART }],
    errorPolicy: 'all',
  });

  return {
    addToCart: async (
      sku: string,
      quantity: number = 1,
      options?: Array<{ code: string; value: string }>
    ) => {
      const result = await mutate({
        variables: {
          input: {
            sku,
            quantity,
            options,
          },
        },
      });

      if (result.data?.addToCart?.errors && result.data.addToCart.errors.length > 0) {
        const firstError = result.data.addToCart.errors[0];
        throw new Error(
          typeof firstError === 'object' && firstError !== null && 'message' in firstError
            ? String(firstError.message)
            : 'Unknown error'
        );
      }

      if (!result.data?.addToCart?.cart) {
        throw new Error('Failed to add item to cart');
      }

      return result.data.addToCart.cart;
    },
    loading,
    error,
  };
}

export function useUpdateCartItem() {
  const [mutate, { loading, error }] = useMutation(UPDATE_CART_ITEM, {
    refetchQueries: [{ query: GET_CART }],
    errorPolicy: 'all',
  });

  return {
    updateCartItem: async (itemId: string, quantity: number) => {
      const result = await mutate({
        variables: {
          input: {
            itemId,
            quantity,
          },
        },
      });

      if (result.data?.updateCartItem?.errors && result.data.updateCartItem.errors.length > 0) {
        const firstError = result.data.updateCartItem.errors[0];
        throw new Error(
          typeof firstError === 'object' && firstError !== null && 'message' in firstError
            ? String(firstError.message)
            : 'Unknown error'
        );
      }

      if (!result.data?.updateCartItem?.cart) {
        throw new Error('Failed to update cart item');
      }

      return result.data.updateCartItem.cart;
    },
    loading,
    error,
  };
}

export function useRemoveCartItem() {
  const [mutate, { loading, error }] = useMutation(REMOVE_CART_ITEM, {
    refetchQueries: [{ query: GET_CART }],
    errorPolicy: 'all',
  });

  return {
    removeCartItem: async (itemId: string) => {
      const result = await mutate({
        variables: { itemId },
      });

      if (result.data?.removeCartItem?.errors && result.data.removeCartItem.errors.length > 0) {
        const firstError = result.data.removeCartItem.errors[0];
        throw new Error(
          typeof firstError === 'object' && firstError !== null && 'message' in firstError
            ? String(firstError.message)
            : 'Unknown error'
        );
      }

      if (!result.data?.removeCartItem?.cart) {
        throw new Error('Failed to remove cart item');
      }

      return result.data.removeCartItem.cart;
    },
    loading,
    error,
  };
}

export function useApplyCoupon() {
  const [mutate, { loading, error }] = useMutation(APPLY_COUPON, {
    refetchQueries: [{ query: GET_CART }],
    errorPolicy: 'all',
  });

  return {
    applyCoupon: async (couponCode: string) => {
      const result = await mutate({
        variables: { couponCode },
      });

      if (result.data?.applyCoupon?.errors && result.data.applyCoupon.errors.length > 0) {
        const firstError = result.data.applyCoupon.errors[0];
        throw new Error(
          typeof firstError === 'object' && firstError !== null && 'message' in firstError
            ? String(firstError.message)
            : 'Unknown error'
        );
      }

      if (!result.data?.applyCoupon?.cart) {
        throw new Error('Failed to apply coupon');
      }

      return result.data.applyCoupon.cart;
    },
    loading,
    error,
  };
}

export function useRemoveCoupon() {
  const [mutate, { loading, error }] = useMutation(REMOVE_COUPON, {
    refetchQueries: [{ query: GET_CART }],
    errorPolicy: 'all',
  });

  return {
    removeCoupon: async () => {
      const result = await mutate();

      if (result.data?.removeCoupon?.errors && result.data.removeCoupon.errors.length > 0) {
        const firstError = result.data.removeCoupon.errors[0];
        throw new Error(
          typeof firstError === 'object' && firstError !== null && 'message' in firstError
            ? String(firstError.message)
            : 'Unknown error'
        );
      }

      if (!result.data?.removeCoupon?.cart) {
        throw new Error('Failed to remove coupon');
      }

      return result.data.removeCoupon.cart;
    },
    loading,
    error,
  };
}

export function useRegister() {
  const [mutate, { loading, error }] = useMutation(REGISTER, {
    errorPolicy: 'all',
  });

  return {
    register: async (
      email: string,
      password: string,
      firstName: string,
      lastName: string,
      phone?: string
    ) => {
      const result = await mutate({
        variables: {
          input: {
            email,
            password,
            firstName,
            lastName,
            phone,
          },
        },
      });

      if (result.data?.register?.errors && result.data.register.errors.length > 0) {
        const firstError = result.data.register.errors[0];
        throw new Error(
          typeof firstError === 'object' && firstError !== null && 'message' in firstError
            ? String(firstError.message)
            : 'Unknown error'
        );
      }

      if (!result.data?.register?.customer) {
        throw new Error('Failed to register');
      }

      return result.data.register.customer;
    },
    loading,
    error,
  };
}

export function useLogin() {
  const [mutate, { loading, error }] = useMutation(LOGIN, {
    errorPolicy: 'all',
  });

  return {
    login: async (email: string, password: string) => {
      const result = await mutate({
        variables: { email, password },
      });

      if (result.data?.login?.errors && result.data.login.errors.length > 0) {
        const firstError = result.data.login.errors[0];
        throw new Error(
          typeof firstError === 'object' && firstError !== null && 'message' in firstError
            ? String(firstError.message)
            : 'Unknown error'
        );
      }

      if (!result.data?.login?.customer) {
        throw new Error('Failed to login');
      }

      return result.data.login.customer;
    },
    loading,
    error,
  };
}

export function useLogout() {
  const [mutate, { loading, error }] = useMutation(LOGOUT, {
    errorPolicy: 'all',
  });

  return {
    logout: async () => {
      const result = await mutate();

      if (result.data?.logout?.errors && result.data.logout.errors.length > 0) {
        const firstError = result.data.logout.errors[0];
        throw new Error(
          typeof firstError === 'object' && firstError !== null && 'message' in firstError
            ? String(firstError.message)
            : 'Unknown error'
        );
      }
    },
    loading,
    error,
  };
}

export function usePlaceOrder() {
  const [mutate, { loading, error }] = useMutation(PLACE_ORDER, {
    errorPolicy: 'all',
  });

  return {
    placeOrder: async (agreeToTerms: boolean, comments?: string) => {
      const result = await mutate({
        variables: {
          input: {
            agreeToTerms,
            comments,
          },
        },
      });

      if (result.data?.placeOrder?.errors && result.data.placeOrder.errors.length > 0) {
        const firstError = result.data.placeOrder.errors[0];
        throw new Error(
          typeof firstError === 'object' && firstError !== null && 'message' in firstError
            ? String(firstError.message)
            : 'Unknown error'
        );
      }

      if (!result.data?.placeOrder?.order) {
        throw new Error('Failed to place order');
      }

      return result.data.placeOrder.order;
    },
    loading,
    error,
  };
}

export function useSetShippingAddress() {
  const [mutate, { loading, error }] = useMutation(SET_SHIPPING_ADDRESS, {
    errorPolicy: 'all',
  });

  return {
    setShippingAddress: async (address: any) => {
      const result = await mutate({
        variables: { input: address },
      });

      if (result.data?.setShippingAddress?.errors && result.data.setShippingAddress.errors.length > 0) {
        const firstError = result.data.setShippingAddress.errors[0];
        throw new Error(
          typeof firstError === 'object' && firstError !== null && 'message' in firstError
            ? String(firstError.message)
            : 'Unknown error'
        );
      }
    },
    loading,
    error,
  };
}

export function useSetBillingAddress() {
  const [mutate, { loading, error }] = useMutation(SET_BILLING_ADDRESS, {
    errorPolicy: 'all',
  });

  return {
    setBillingAddress: async (address: any) => {
      const result = await mutate({
        variables: { input: address },
      });

      if (result.data?.setBillingAddress?.errors && result.data.setBillingAddress.errors.length > 0) {
        const firstError = result.data.setBillingAddress.errors[0];
        throw new Error(
          typeof firstError === 'object' && firstError !== null && 'message' in firstError
            ? String(firstError.message)
            : 'Unknown error'
        );
      }
    },
    loading,
    error,
  };
}

export function useSetShippingMethod() {
  const [mutate, { loading, error }] = useMutation(SET_SHIPPING_METHOD, {
    errorPolicy: 'all',
  });

  return {
    setShippingMethod: async (shippingMethodCode: string) => {
      const result = await mutate({
        variables: { shippingMethodCode },
      });

      if (result.data?.setShippingMethod?.errors && result.data.setShippingMethod.errors.length > 0) {
        const firstError = result.data.setShippingMethod.errors[0];
        throw new Error(
          typeof firstError === 'object' && firstError !== null && 'message' in firstError
            ? String(firstError.message)
            : 'Unknown error'
        );
      }
    },
    loading,
    error,
  };
}

export function useSetPaymentMethod() {
  const [mutate, { loading, error }] = useMutation(SET_PAYMENT_METHOD, {
    errorPolicy: 'all',
  });

  return {
    setPaymentMethod: async (paymentMethodCode: string) => {
      const result = await mutate({
        variables: { paymentMethodCode },
      });

      if (result.data?.setPaymentMethod?.errors && result.data.setPaymentMethod.errors.length > 0) {
        const firstError = result.data.setPaymentMethod.errors[0];
        throw new Error(
          typeof firstError === 'object' && firstError !== null && 'message' in firstError
            ? String(firstError.message)
            : 'Unknown error'
        );
      }
    },
    loading,
    error,
  };
}
