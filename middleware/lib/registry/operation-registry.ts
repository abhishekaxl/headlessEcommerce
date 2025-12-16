/**
 * Operation Registry
 * Whitelist of allowed canonical GraphQL operations
 * Only operations in this registry can be executed
 */

export enum OperationType {
  QUERY = 'query',
  MUTATION = 'mutation',
}

export interface OperationDefinition {
  name: string;
  type: OperationType;
  description?: string;
  requiresAuth?: boolean;
  rateLimit?: {
    requestsPerMinute: number;
  };
}

/**
 * Whitelist of allowed operations
 * Add new operations here as they are implemented
 */
export const ALLOWED_OPERATIONS: Record<string, OperationDefinition> = {
  // Catalog Queries
  GetProduct: {
    name: 'GetProduct',
    type: OperationType.QUERY,
    description: 'Get a single product by slug',
    requiresAuth: false,
  },
  GetCategory: {
    name: 'GetCategory',
    type: OperationType.QUERY,
    description: 'Get a single category by slug',
    requiresAuth: false,
  },
  GetCategories: {
    name: 'GetCategories',
    type: OperationType.QUERY,
    description: 'Get all categories',
    requiresAuth: false,
  },
  ProductsByCategory: {
    name: 'ProductsByCategory',
    type: OperationType.QUERY,
    description: 'Get products by category',
    requiresAuth: false,
  },
  SearchProducts: {
    name: 'SearchProducts',
    type: OperationType.QUERY,
    description: 'Search products by keyword',
    requiresAuth: false,
  },

  // Cart Queries
  GetCart: {
    name: 'GetCart',
    type: OperationType.QUERY,
    description: 'Get current cart',
    requiresAuth: false,
  },

  // Cart Mutations
  AddToCart: {
    name: 'AddToCart',
    type: OperationType.MUTATION,
    description: 'Add product to cart',
    requiresAuth: false,
  },
  UpdateCartItem: {
    name: 'UpdateCartItem',
    type: OperationType.MUTATION,
    description: 'Update cart item quantity',
    requiresAuth: false,
  },
  RemoveCartItem: {
    name: 'RemoveCartItem',
    type: OperationType.MUTATION,
    description: 'Remove item from cart',
    requiresAuth: false,
  },
  ApplyCoupon: {
    name: 'ApplyCoupon',
    type: OperationType.MUTATION,
    description: 'Apply coupon code to cart',
    requiresAuth: false,
  },
  RemoveCoupon: {
    name: 'RemoveCoupon',
    type: OperationType.MUTATION,
    description: 'Remove coupon from cart',
    requiresAuth: false,
  },

  // Checkout Queries
  GetCheckout: {
    name: 'GetCheckout',
    type: OperationType.QUERY,
    description: 'Get checkout state',
    requiresAuth: false,
  },

  // Checkout Mutations
  SetShippingAddress: {
    name: 'SetShippingAddress',
    type: OperationType.MUTATION,
    description: 'Set shipping address',
    requiresAuth: false,
  },
  SetBillingAddress: {
    name: 'SetBillingAddress',
    type: OperationType.MUTATION,
    description: 'Set billing address',
    requiresAuth: false,
  },
  SetShippingMethod: {
    name: 'SetShippingMethod',
    type: OperationType.MUTATION,
    description: 'Set shipping method',
    requiresAuth: false,
  },
  SetPaymentMethod: {
    name: 'SetPaymentMethod',
    type: OperationType.MUTATION,
    description: 'Set payment method',
    requiresAuth: false,
  },
  PlaceOrder: {
    name: 'PlaceOrder',
    type: OperationType.MUTATION,
    description: 'Place order',
    requiresAuth: false, // Can be guest checkout
  },

  // Customer Queries
  GetCustomer: {
    name: 'GetCustomer',
    type: OperationType.QUERY,
    description: 'Get current customer',
    requiresAuth: true,
  },
  GetCustomerOrders: {
    name: 'GetCustomerOrders',
    type: OperationType.QUERY,
    description: 'Get customer orders',
    requiresAuth: true,
  },
  GetOrder: {
    name: 'GetOrder',
    type: OperationType.QUERY,
    description: 'Get order by order number',
    requiresAuth: true,
  },

  // Customer Authentication Mutations
  Register: {
    name: 'Register',
    type: OperationType.MUTATION,
    description: 'Register new customer',
    requiresAuth: false,
  },
  Login: {
    name: 'Login',
    type: OperationType.MUTATION,
    description: 'Login customer',
    requiresAuth: false,
  },
  Logout: {
    name: 'Logout',
    type: OperationType.MUTATION,
    description: 'Logout customer',
    requiresAuth: true,
  },
  RequestPasswordReset: {
    name: 'RequestPasswordReset',
    type: OperationType.MUTATION,
    description: 'Request password reset',
    requiresAuth: false,
  },
  ResetPassword: {
    name: 'ResetPassword',
    type: OperationType.MUTATION,
    description: 'Reset password',
    requiresAuth: false,
  },

  // Customer Profile Mutations
  UpdateProfile: {
    name: 'UpdateProfile',
    type: OperationType.MUTATION,
    description: 'Update customer profile',
    requiresAuth: true,
  },
  ChangePassword: {
    name: 'ChangePassword',
    type: OperationType.MUTATION,
    description: 'Change password',
    requiresAuth: true,
  },
  AddAddress: {
    name: 'AddAddress',
    type: OperationType.MUTATION,
    description: 'Add address',
    requiresAuth: true,
  },
  UpdateAddress: {
    name: 'UpdateAddress',
    type: OperationType.MUTATION,
    description: 'Update address',
    requiresAuth: true,
  },
  DeleteAddress: {
    name: 'DeleteAddress',
    type: OperationType.MUTATION,
    description: 'Delete address',
    requiresAuth: true,
  },
  SetDefaultShippingAddress: {
    name: 'SetDefaultShippingAddress',
    type: OperationType.MUTATION,
    description: 'Set default shipping address',
    requiresAuth: true,
  },
  SetDefaultBillingAddress: {
    name: 'SetDefaultBillingAddress',
    type: OperationType.MUTATION,
    description: 'Set default billing address',
    requiresAuth: true,
  },
};

/**
 * Check if an operation is allowed
 */
export function isOperationAllowed(operationName: string): boolean {
  return operationName in ALLOWED_OPERATIONS;
}

/**
 * Get operation definition
 */
export function getOperationDefinition(operationName: string): OperationDefinition | undefined {
  return ALLOWED_OPERATIONS[operationName];
}

/**
 * Get all allowed operation names
 */
export function getAllowedOperations(): string[] {
  return Object.keys(ALLOWED_OPERATIONS);
}

/**
 * Check if operation requires authentication
 */
export function requiresAuth(operationName: string): boolean {
  const operation = getOperationDefinition(operationName);
  return operation?.requiresAuth === true;
}

