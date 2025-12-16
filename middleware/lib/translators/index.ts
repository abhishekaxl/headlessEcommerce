/**
 * Translator Registry
 * Maps canonical operations to their translators
 */

import { BaseTranslator } from './base-translator';
import { CatalogTranslator } from './catalog-translator';

const translators: Record<string, BaseTranslator> = {
  // Catalog operations
  GetProduct: new CatalogTranslator(),
  GetCategory: new CatalogTranslator(),
  GetCategories: new CatalogTranslator(),
  ProductsByCategory: new CatalogTranslator(),
  SearchProducts: new CatalogTranslator(),

  // TODO: Add other translators
  // CartTranslator
  // CheckoutTranslator
  // CustomerTranslator
  // OrderTranslator
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

