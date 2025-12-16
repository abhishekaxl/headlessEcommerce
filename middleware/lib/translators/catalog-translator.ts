/**
 * Catalog Translator
 * Translates catalog-related canonical operations to Magento GraphQL
 */

import { BaseTranslator } from './base-translator';
import { RequestContext } from '../types';
import { MagentoGraphQLRequest } from '../magento/client';

export class CatalogTranslator extends BaseTranslator {
  translate(
    operationName: string,
    variables: Record<string, unknown>,
    context: RequestContext
  ): MagentoGraphQLRequest {
    switch (operationName) {
      case 'GetProduct':
        return this.translateGetProduct(variables, context);
      case 'GetCategory':
        return this.translateGetCategory(variables, context);
      case 'GetCategories':
        return this.translateGetCategories(variables, context);
      case 'ProductsByCategory':
        return this.translateProductsByCategory(variables, context);
      case 'SearchProducts':
        return this.translateSearchProducts(variables, context);
      default:
        throw new Error(`Unknown catalog operation: ${operationName}`);
    }
  }

  private translateGetProduct(
    variables: Record<string, unknown>,
    context: RequestContext
  ): MagentoGraphQLRequest {
    const slug = variables.slug as string;

    return {
      query: `
        query GetProduct($urlKey: String!) {
          products(filter: { url_key: { eq: $urlKey } }) {
            items {
              sku
              name
              url_key
              description {
                html
              }
              short_description {
                html
              }
              price_range {
                minimum_price {
                  final_price {
                    value
                    currency
                  }
                  regular_price {
                    value
                    currency
                  }
                }
              }
              image {
                url
                label
              }
              media_gallery {
                url
                label
              }
              stock_status
              ... on ConfigurableProduct {
                configurable_options {
                  attribute_code
                  attribute_id
                  label
                  values {
                    value_index
                    label
                    swatch_data {
                      value
                    }
                  }
                }
                variants {
                  product {
                    sku
                    name
                    price_range {
                      minimum_price {
                        final_price {
                          value
                          currency
                        }
                      }
                    }
                    image {
                      url
                      label
                    }
                    stock_status
                  }
                  attributes {
                    code
                    value_index
                  }
                }
              }
            }
          }
        }
      `,
      variables: {
        urlKey: slug,
      },
      operationName: 'GetProduct',
    };
  }

  private translateGetCategory(
    variables: Record<string, unknown>,
    context: RequestContext
  ): MagentoGraphQLRequest {
    const slug = variables.slug as string;

    return {
      query: `
        query GetCategory($id: String!) {
          categoryList(filters: { url_path: { eq: $id } }) {
            id
            name
            url_key
            url_path
            description
            image
            level
            path
            children {
              id
              name
              url_key
              url_path
            }
          }
        }
      `,
      variables: {
        id: slug,
      },
      operationName: 'GetCategory',
    };
  }

  private translateGetCategories(
    variables: Record<string, unknown>,
    context: RequestContext
  ): MagentoGraphQLRequest {
    const parentId = variables.parentId as string | undefined;

    return {
      query: `
        query GetCategories($parentId: Int) {
          categoryList(filters: { parent_id: { eq: $parentId } }) {
            id
            name
            url_key
            url_path
            description
            image
            level
            path
            children {
              id
              name
              url_key
              url_path
            }
          }
        }
      `,
      variables: {
        parentId: parentId ? parseInt(parentId, 10) : 2, // Default to root category
      },
      operationName: 'GetCategories',
    };
  }

  private translateProductsByCategory(
    variables: Record<string, unknown>,
    context: RequestContext
  ): MagentoGraphQLRequest {
    const categorySlug = variables.categorySlug as string;
    const pagination = variables.pagination as { limit?: number; cursor?: string } | undefined;
    const filters = variables.filters as Record<string, unknown> | undefined;
    const sort = variables.sort as { field: string; direction: string } | undefined;

    const pageSize = pagination?.limit || 20;
    const currentPage = 1; // TODO: Calculate from cursor

    // Build Magento filter
    const magentoFilters: Record<string, unknown> = {
      category_id: { eq: categorySlug }, // TODO: Resolve category ID from slug
    };

    // Add price range filter if provided
    if (filters?.priceRange) {
      const priceRange = filters.priceRange as { min: number; max: number };
      magentoFilters.price = {
        from: priceRange.min,
        to: priceRange.max,
      };
    }

    // Build sort
    const magentoSort = this.buildMagentoSort(sort);

    return {
      query: `
        query ProductsByCategory(
          $filters: ProductAttributeFilterInput!
          $pageSize: Int!
          $currentPage: Int!
          $sort: [ProductAttributeSortInput]
        ) {
          products(
            filter: $filters
            pageSize: $pageSize
            currentPage: $currentPage
            sort: $sort
          ) {
            items {
              sku
              name
              url_key
              price_range {
                minimum_price {
                  final_price {
                    value
                    currency
                  }
                }
              }
              image {
                url
                label
              }
              stock_status
            }
            page_info {
              current_page
              page_size
              total_pages
            }
            total_count
          }
        }
      `,
      variables: {
        filters: magentoFilters,
        pageSize,
        currentPage,
        sort: magentoSort,
      },
      operationName: 'ProductsByCategory',
    };
  }

  private translateSearchProducts(
    variables: Record<string, unknown>,
    context: RequestContext
  ): MagentoGraphQLRequest {
    const query = variables.query as string;
    const pagination = variables.pagination as { limit?: number; cursor?: string } | undefined;
    const filters = variables.filters as Record<string, unknown> | undefined;
    const sort = variables.sort as { field: string; direction: string } | undefined;

    const pageSize = pagination?.limit || 20;
    const currentPage = 1; // TODO: Calculate from cursor

    // Build Magento filter
    const magentoFilters: Record<string, unknown> = {
      name: { match: query },
    };

    // Add price range filter if provided
    if (filters?.priceRange) {
      const priceRange = filters.priceRange as { min: number; max: number };
      magentoFilters.price = {
        from: priceRange.min,
        to: priceRange.max,
      };
    }

    // Build sort
    const magentoSort = this.buildMagentoSort(sort);

    return {
      query: `
        query SearchProducts(
          $search: String!
          $filters: ProductAttributeFilterInput!
          $pageSize: Int!
          $currentPage: Int!
          $sort: [ProductAttributeSortInput]
        ) {
          products(
            search: $search
            filter: $filters
            pageSize: $pageSize
            currentPage: $currentPage
            sort: $sort
          ) {
            items {
              sku
              name
              url_key
              price_range {
                minimum_price {
                  final_price {
                    value
                    currency
                  }
                }
              }
              image {
                url
                label
              }
              stock_status
            }
            page_info {
              current_page
              page_size
              total_pages
            }
            total_count
          }
        }
      `,
      variables: {
        search: query,
        filters: magentoFilters,
        pageSize,
        currentPage,
        sort: magentoSort,
      },
      operationName: 'SearchProducts',
    };
  }

  private buildMagentoSort(
    sort?: { field: string; direction: string }
  ): Array<{ field: string; direction: string }> | undefined {
    if (!sort) {
      return undefined;
    }

    const fieldMap: Record<string, string> = {
      NAME: 'name',
      PRICE: 'price',
      CREATED_AT: 'created_at',
      RELEVANCE: 'relevance',
    };

    const magentoField = fieldMap[sort.field] || sort.field.toLowerCase();
    const magentoDirection = sort.direction === 'ASC' ? 'ASC' : 'DESC';

    return [{ field: magentoField, direction: magentoDirection }];
  }

  normalize(magentoData: unknown, context: RequestContext): unknown {
    // Convert Magento response structure to canonical format
    if (!magentoData || typeof magentoData !== 'object') {
      return magentoData;
    }

    const data = magentoData as Record<string, unknown>;

    // Handle categoryList (GetCategories)
    if (data.categoryList && Array.isArray(data.categoryList)) {
      return {
        categories: data.categoryList.map((cat: any) => ({
          id: String(cat.id || ''),
          name: cat.name || '',
          slug: cat.url_key || cat.url_path || '',
          description: cat.description || null,
          image: cat.image ? {
            url: cat.image,
            alt: cat.name || '',
          } : null,
          parentId: cat.path ? cat.path.split('/').slice(-2, -1)[0] : null,
          children: (cat.children || []).map((child: any) => ({
            id: String(child.id || ''),
            name: child.name || '',
            slug: child.url_key || child.url_path || '',
          })),
          breadcrumbs: cat.path ? cat.path.split('/').filter(Boolean).slice(0, -1).map((id: string, index: number, arr: string[]) => ({
            id: String(id),
            name: '', // Would need to fetch names separately
            slug: '',
          })) : [],
        })),
      };
    }

    // Handle products
    if (data.products) {
      return {
        products: data.products,
      };
    }

    // Return as-is if no transformation needed
    return magentoData;
  }
}

