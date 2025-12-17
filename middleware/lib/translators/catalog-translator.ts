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
        query GetCategory($slug: String!) {
          categoryList(filters: { url_key: { eq: $slug } }) {
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
        slug,
      },
      operationName: 'GetCategory',
    };
  }

  private translateGetCategories(
    variables: Record<string, unknown>,
    context: RequestContext
  ): MagentoGraphQLRequest {
    const parentId = variables.parentId as string | undefined;
    
    // Magento's parent_id filter expects a String, not Int
    // Default to "2" (root category) if not provided
    const magentoParentId = parentId || '2';

    return {
      query: `
        query GetCategories($parentId: String!) {
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
        parentId: magentoParentId,
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

    // Build sort - Magento's category.products expects a single ProductAttributeSortInput object
    const magentoSort = this.buildMagentoSortSingle(sort);
    const hasSort = magentoSort !== undefined;

    // Strategy: Use category.products which should include subcategories if category is "anchor"
    // If that returns 0, we'll need to handle it in normalization by making a second query
    // For now, return the query that gets category info and products
    return {
      query: hasSort
        ? `
          query ProductsByCategory(
            $categorySlug: String!
            $pageSize: Int!
            $currentPage: Int!
            $sort: ProductAttributeSortInput
          ) {
            categoryList(filters: { url_key: { eq: $categorySlug } }) {
              id
              children {
                id
              }
              products(
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
          }
        `
        : `
          query ProductsByCategory(
            $categorySlug: String!
            $pageSize: Int!
            $currentPage: Int!
          ) {
            categoryList(filters: { url_key: { eq: $categorySlug } }) {
              id
              children {
                id
              }
              products(
                pageSize: $pageSize
                currentPage: $currentPage
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
          }
        `,
      variables: hasSort
        ? {
            categorySlug,
            pageSize,
            currentPage,
            sort: magentoSort,
          }
        : {
            categorySlug,
            pageSize,
            currentPage,
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

  private buildMagentoSortSingle(
    sort?: { field: string; direction: string }
  ): { field: string; direction: string } | undefined {
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

    // Magento's category.products expects a single ProductAttributeSortInput, not an array
    return { field: magentoField, direction: magentoDirection };
  }

  normalize(magentoData: unknown, context: RequestContext): unknown {
    // Convert Magento response structure to canonical format
    if (!magentoData || typeof magentoData !== 'object') {
      return magentoData;
    }

    const data = magentoData as Record<string, unknown>;

    // Handle products from products query FIRST (ProductsByCategory)
    // This comes from the products query with category_id filter
    if (data.products && typeof data.products === 'object') {
      const productsData = data.products as {
        items?: Array<{
          sku: string;
          name: string;
          url_key: string;
          price_range?: {
            minimum_price?: {
              final_price?: {
                value: number;
                currency: string;
              };
            };
          };
          image?: {
            url: string;
            label: string;
          };
          stock_status?: string;
        }>;
        page_info?: {
          current_page: number;
          page_size: number;
          total_pages: number;
        };
        total_count?: number;
      };

      return {
        productsByCategory: {
          items: (productsData.items || []).map((item: any) => ({
            id: item.sku || '',
            sku: item.sku || '',
            name: item.name || '',
            slug: item.url_key || '',
            price: item.price_range?.minimum_price?.final_price
              ? {
                  amount: item.price_range.minimum_price.final_price.value,
                  currency: item.price_range.minimum_price.final_price.currency,
                  formatted: `${item.price_range.minimum_price.final_price.currency} ${item.price_range.minimum_price.final_price.value.toFixed(2)}`,
                }
              : null,
            images: item.image
              ? [
                  {
                    url: item.image.url,
                    alt: item.image.label || item.name || '',
                  },
                ]
              : [],
            inStock: item.stock_status === 'IN_STOCK',
            stockStatus: item.stock_status || 'OUT_OF_STOCK',
          })),
          pageInfo: productsData.page_info
            ? {
                hasNextPage: (productsData.page_info.current_page || 0) < (productsData.page_info.total_pages || 0),
                hasPreviousPage: (productsData.page_info.current_page || 0) > 1,
                startCursor: undefined,
                endCursor: undefined,
                totalCount: productsData.total_count || 0,
              }
            : {
                hasNextPage: false,
                hasPreviousPage: false,
                startCursor: undefined,
                endCursor: undefined,
                totalCount: productsData.total_count || 0,
              },
          totalCount: productsData.total_count || 0,
        },
      };
    }

    // Handle categoryList (GetCategories, GetCategory) - check for GetCategory first
    // If categoryList has a single category without products field, it's GetCategory
    if (data.categoryList && Array.isArray(data.categoryList) && data.categoryList.length === 1) {
      const cat = data.categoryList[0] as any;
      
      // If category doesn't have products field, this is GetCategory query
      if (!('products' in cat)) {
        return {
          category: {
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
            breadcrumbs: cat.path ? cat.path.split('/').filter(Boolean).slice(0, -1).map((id: string) => ({
              id: String(id),
              name: '', // Would need to fetch names separately
              slug: '',
            })) : [],
            metaTitle: null, // Magento doesn't return this in categoryList
            metaDescription: null,
            canonicalUrl: null,
          },
        };
      }
    }

    // Handle products from categoryList.products (ProductsByCategory)
    // This is the primary path - category.products should include subcategory products if category is "anchor"
    if (data.categoryList && Array.isArray(data.categoryList) && data.categoryList.length > 0) {
      const category = data.categoryList[0] as {
        id?: string;
        children?: Array<{ id?: string }>;
        products?: {
          items?: Array<{
            sku: string;
            name: string;
            url_key: string;
            price_range?: {
              minimum_price?: {
                final_price?: {
                  value: number;
                  currency: string;
                };
              };
            };
            image?: {
              url: string;
              label: string;
            };
            stock_status?: string;
          }>;
          page_info?: {
            current_page: number;
            page_size: number;
            total_pages: number;
          };
          total_count?: number;
        };
      };

      // If category has products, return them
      if (category.products && category.products.items && category.products.items.length > 0) {
        return {
          productsByCategory: {
            items: category.products.items.map((item: any) => ({
              id: item.sku || '',
              sku: item.sku || '',
              name: item.name || '',
              slug: item.url_key || '',
              price: item.price_range?.minimum_price?.final_price
                ? {
                    amount: item.price_range.minimum_price.final_price.value,
                    currency: item.price_range.minimum_price.final_price.currency,
                    formatted: `${item.price_range.minimum_price.final_price.currency} ${item.price_range.minimum_price.final_price.value.toFixed(2)}`,
                  }
                : null,
              images: item.image
                ? [
                    {
                      url: item.image.url,
                      alt: item.image.label || item.name || '',
                    },
                  ]
                : [],
              inStock: item.stock_status === 'IN_STOCK',
              stockStatus: item.stock_status || 'OUT_OF_STOCK',
            })),
            pageInfo: category.products.page_info
              ? {
                  hasNextPage: (category.products.page_info.current_page || 0) < (category.products.page_info.total_pages || 0),
                  hasPreviousPage: (category.products.page_info.current_page || 0) > 1,
                  totalCount: category.products.total_count,
                }
              : {
                  hasNextPage: false,
                  hasPreviousPage: false,
                },
          },
        };
      }

      // If category.products is empty but we have children, return empty
      // The route handler will need to make a second query with category_id 'in' filter
      // For now, we'll return a special marker that indicates we need subcategory query
      if (category.products && (!category.products.items || category.products.items.length === 0) && 
          category.children && category.children.length > 0) {
        // Return empty - the route handler should detect this and make a second query
        // TODO: Implement two-query approach in route handler
        return {
          productsByCategory: {
            items: [],
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
            },
          },
        };
      }
    }

    // Handle multiple categories (GetCategories) - only if no products and not single category
    if (data.categoryList && Array.isArray(data.categoryList) && data.categoryList.length > 1) {
      // Multiple categories (GetCategories), return array
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
          breadcrumbs: cat.path ? cat.path.split('/').filter(Boolean).slice(0, -1).map((id: string) => ({
            id: String(id),
            name: '', // Would need to fetch names separately
            slug: '',
          })) : [],
        })),
      };
    }


    // Handle products from products query (SearchProducts, etc.)
    if (data.products && typeof data.products === 'object') {
      const productsData = data.products as {
        items?: Array<{
          sku: string;
          name: string;
          url_key: string;
          price_range?: {
            minimum_price?: {
              final_price?: {
                value: number;
                currency: string;
              };
            };
          };
          image?: {
            url: string;
            label: string;
          };
          stock_status?: string;
        }>;
        page_info?: {
          current_page: number;
          page_size: number;
          total_pages: number;
        };
        total_count?: number;
      };

      return {
        products: productsData.items || [],
        pageInfo: productsData.page_info
          ? {
              hasNextPage: (productsData.page_info.current_page || 0) < (productsData.page_info.total_pages || 0),
              hasPreviousPage: (productsData.page_info.current_page || 0) > 1,
              totalCount: productsData.total_count,
            }
          : {
              hasNextPage: false,
              hasPreviousPage: false,
            },
      };
    }

    // Return as-is if no transformation needed
    return magentoData;
  }
}

