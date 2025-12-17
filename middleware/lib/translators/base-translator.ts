/**
 * Base Translator
 * Abstract base class for translating canonical operations to Magento GraphQL
 */

import { RequestContext } from '../types';
import { MagentoGraphQLRequest } from '../magento/client';

export abstract class BaseTranslator {
  /**
   * Translate canonical operation to Magento GraphQL
   */
  abstract translate(
    operationName: string,
    variables: Record<string, unknown>,
    context: RequestContext
  ): MagentoGraphQLRequest;

  /**
   * Normalize Magento response to canonical format
   */
  abstract normalize(
    magentoData: unknown,
    context: RequestContext
  ): unknown;

  /**
   * Get Magento operation name from canonical operation
   */
  protected getMagentoOperationName(operationName: string): string {
    // Default mapping - can be overridden in subclasses
    const operationMap: Record<string, string> = {
      GetProduct: 'products',
      GetCategory: 'categoryList',
      GetCategories: 'categoryList',
      ProductsByCategory: 'products',
      SearchProducts: 'products',
      GetCart: 'cart',
      AddToCart: 'addProductsToCart',
      UpdateCartItem: 'updateCartItems',
      RemoveCartItem: 'removeItemFromCart',
      ApplyCoupon: 'applyCouponToCart',
      RemoveCoupon: 'removeCouponFromCart',
      GetCheckout: 'cart',
      SetShippingAddress: 'setShippingAddressesOnCart',
      SetBillingAddress: 'setBillingAddressOnCart',
      SetShippingMethod: 'setShippingMethodsOnCart',
      SetPaymentMethod: 'setPaymentMethodOnCart',
      PlaceOrder: 'placeOrder',
      GetCustomer: 'customer',
      Register: 'createCustomer',
      Login: 'generateCustomerToken',
      Logout: 'revokeCustomerToken',
      GetCustomerOrders: 'customerOrders',
      GetOrder: 'customerOrder',
      UpdateProfile: 'updateCustomer',
      ChangePassword: 'changeCustomerPassword',
      AddAddress: 'createCustomerAddress',
      UpdateAddress: 'updateCustomerAddress',
      DeleteAddress: 'deleteCustomerAddress',
    };

    return operationMap[operationName] || operationName;
  }
}


