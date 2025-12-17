/**
 * Translator Registry
 * Maps canonical operations to their translators
 */

import { BaseTranslator } from './base-translator';
import { CatalogTranslator } from './catalog-translator';
import { CartTranslator } from './cart-translator';

const translators: Record<string, BaseTranslator> = {
  // Catalog operations
  GetProduct: new CatalogTranslator(),
  GetCategory: new CatalogTranslator(),
  GetCategories: new CatalogTranslator(),
  ProductsByCategory: new CatalogTranslator(),
  SearchProducts: new CatalogTranslator(),

  // Cart + Checkout operations
  GetCart: new CartTranslator(),
  AddToCart: new CartTranslator(),
  UpdateCartItem: new CartTranslator(),
  RemoveCartItem: new CartTranslator(),
  ApplyCoupon: new CartTranslator(),
  RemoveCoupon: new CartTranslator(),
  GetCheckout: new CartTranslator(),
  SetShippingAddress: new CartTranslator(),
  SetBillingAddress: new CartTranslator(),
  SetShippingMethod: new CartTranslator(),
  SetPaymentMethod: new CartTranslator(),
  PlaceOrder: new CartTranslator(),
};

/**
 * Get translator for an operation
 */
export function getTranslator(operationName: string): BaseTranslator | undefined {
  return translators[operationName];
}

/**
 * Register a translator
 */
export function registerTranslator(operationName: string, translator: BaseTranslator): void {
  translators[operationName] = translator;
}


