/**
 * GraphQL API Route
 * Main endpoint for canonical GraphQL operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { GraphQLRequest, GraphQLResponse, RequestContext } from '../../../middleware/lib/types';
import { validateRequest } from '../../../middleware/lib/validation/request-validator';
import { buildContext } from '../../../middleware/lib/context/context-builder';
import { getTranslator } from '../../../middleware/lib/translators';
import { executeMagentoGraphQL } from '../../../middleware/lib/magento/client';
import { requiresAuthentication } from '../../../middleware/lib/auth/auth-handler';
import { ensureCartToken } from '../../../middleware/lib/cart/cart-handler';
import { normalizeValidationError } from '../../../middleware/lib/errors/normalizer';
import { isOperationAllowed, getOperationDefinition, getAllowedOperations } from '../../../middleware/lib/registry/operation-registry';
import { config } from '../../../middleware/lib/config';
import { ErrorSeverity, ErrorSource } from '../../../middleware/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * Parse cookies from request
 */
function parseCookies(request: NextRequest): Record<string, string> {
  const cookies: Record<string, string> = {};
  const cookieHeader = request.headers.get('cookie');

  if (cookieHeader) {
    cookieHeader.split(';').forEach((cookie) => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
    });
  }

  return cookies;
}

/**
 * Extract headers from request
 */
function extractHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {};

  request.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });

  return headers;
}

/**
 * Handle GraphQL request
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    let body: GraphQLRequest;
    try {
      // Check Content-Type header
      const contentType = request.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return NextResponse.json(
          {
            errors: [
              normalizeValidationError('Content-Type must be application/json'),
            ],
            data: null,
          } as GraphQLResponse,
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          }
        );
      }

      // Try to parse JSON body
      const requestBody = await request.json();

      if (!requestBody || typeof requestBody !== 'object') {
        return NextResponse.json(
          {
            errors: [
              normalizeValidationError('No payload for this request'),
            ],
            data: null,
          } as GraphQLResponse,
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          }
        );
      }

      body = requestBody as GraphQLRequest;
    } catch (error) {
      console.error('Failed to parse request body:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Check if it's a JSON parse error
      if (errorMessage.includes('JSON') || errorMessage.includes('Unexpected') || errorMessage.includes('payload')) {
        return NextResponse.json(
          {
            errors: [
              normalizeValidationError('No payload for this request'),
            ],
            data: null,
          } as GraphQLResponse,
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          }
        );
      }

      return NextResponse.json(
        {
          errors: [
            normalizeValidationError('Invalid JSON in request body'),
          ],
          data: null,
        } as GraphQLResponse,
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    // Validate that body has required fields
    if (!body || !body.query) {
      return NextResponse.json(
        {
          errors: [
            normalizeValidationError('GraphQL query is required'),
          ],
          data: null,
        } as GraphQLResponse,
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    // Build context
    const headers = extractHeaders(request);
    const cookies = parseCookies(request);
    const context = buildContext(headers, cookies);

    // Validate request
    const validation = validateRequest(body);
    if (!validation.valid) {
      const errors = validation.errors?.map((error) =>
        normalizeValidationError(error.message, error.path)
      ) || [];

      return NextResponse.json(
        {
          errors,
          data: null,
        } as GraphQLResponse,
        { status: 400 }
      );
    }

    // Extract operation name
    let operationName: string | undefined = body.operationName;
    if (!operationName) {
      const extracted = extractOperationName(body.query);
      operationName = extracted || undefined;
    }

    console.log(`[GraphQL API] Operation name: ${operationName || 'NOT FOUND'}`);
    console.log(`[GraphQL API] Query preview: ${body.query.substring(0, 200)}...`);

    if (!operationName) {
      return NextResponse.json(
        {
          errors: [
            normalizeValidationError('Operation name is required. Please provide operationName in the request or include it in the query (e.g., "query GetCategories { ... }")'),
          ],
          data: null,
        } as GraphQLResponse,
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    // Check if operation is allowed
    if (!isOperationAllowed(operationName)) {
      const allowedOps = getAllowedOperations().join(', ');
      console.error(`[GraphQL API] Operation "${operationName}" is not allowed. Allowed operations: ${allowedOps}`);
      
      return NextResponse.json(
        {
          errors: [
            normalizeValidationError(
              `Operation "${operationName}" is not allowed. ` +
              `Allowed operations: ${allowedOps.substring(0, 200)}${allowedOps.length > 200 ? '...' : ''}`
            ),
          ],
          data: null,
        } as GraphQLResponse,
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    // Check authentication requirements
    const authCheck = requiresAuthentication(operationName, !!context.customerToken);
    if (authCheck.required && authCheck.error) {
      return NextResponse.json(
        {
          errors: [
            normalizeValidationError(authCheck.error),
          ],
          data: null,
        } as GraphQLResponse,
        { status: 401 }
      );
    }

    // Ensure cart token for cart operations
    if (operationName.startsWith('AddToCart') || operationName.startsWith('GetCart')) {
      context.cartToken = await ensureCartToken(context);
    }

    // Get translator
    let translator;
    try {
      translator = getTranslator(operationName);
      if (!translator) {
        return NextResponse.json(
          {
            errors: [
              normalizeValidationError(`Translator not found for operation "${operationName}"`),
            ],
            data: null,
          } as GraphQLResponse,
          {
            status: 501,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          }
        );
      }
    } catch (error) {
      console.error('Error getting translator:', error);
      return NextResponse.json(
        {
          errors: [
            normalizeValidationError(`Failed to get translator for operation "${operationName}"`),
          ],
          data: null,
        } as GraphQLResponse,
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    // Translate canonical operation to Magento
    let magentoRequest;
    try {
      magentoRequest = translator.translate(
        operationName,
        body.variables || {},
        context
      );
    } catch (error) {
      console.error('Error translating request:', error);
      return NextResponse.json(
        {
          errors: [
            normalizeValidationError(`Failed to translate operation "${operationName}"`),
          ],
          data: null,
        } as GraphQLResponse,
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    // Execute Magento GraphQL
    let magentoResult;
    try {
      magentoResult = await executeMagentoGraphQL(magentoRequest, context);
    } catch (error) {
      console.error('Error executing Magento GraphQL:', error);
      return NextResponse.json(
        {
          errors: [
            normalizeValidationError('Failed to execute Magento GraphQL request'),
          ],
          data: null,
        } as GraphQLResponse,
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    // Normalize response
    let normalizedData: unknown = null;
    if (magentoResult.data) {
      try {
        console.log(`[${operationName}] Raw Magento data before normalization:`, JSON.stringify(magentoResult.data, null, 2).substring(0, 1000));
        
        // First, normalize the initial response
        normalizedData = translator.normalize(magentoResult.data, context);
        
        console.log(`[${operationName}] Normalized data:`, JSON.stringify(normalizedData, null, 2).substring(0, 1000));
        
        // Workaround for ProductsByCategory: Use products query if category.products is empty
        // This ensures we get all products assigned to the category, even if category.products doesn't return them
        if (operationName === 'ProductsByCategory' && magentoResult.data && typeof magentoResult.data === 'object') {
          const magentoData = magentoResult.data as Record<string, unknown>;
          console.log(`[ProductsByCategory] First query raw response:`, JSON.stringify(magentoData, null, 2).substring(0, 1000));
          
          // Check the raw Magento response to see if category.products has items
          let hasProductsFromFirstQuery = false;
          let category: {
            id?: string;
            name?: string;
            url_key?: string;
            children?: Array<{ id?: string }>;
            products?: {
              items?: unknown[];
              total_count?: number;
            };
          } | undefined;
          
          if (magentoData.categoryList && Array.isArray(magentoData.categoryList)) {
            console.log(`[ProductsByCategory] categoryList length:`, magentoData.categoryList.length);
            
            if (magentoData.categoryList.length > 0) {
              category = magentoData.categoryList[0] as {
                id?: string;
                name?: string;
                url_key?: string;
                children?: Array<{ id?: string }>;
                products?: {
                  items?: unknown[];
                  total_count?: number;
                };
              };
              
              console.log(`[ProductsByCategory] Category found:`, {
                id: category.id,
                name: category.name,
                url_key: category.url_key,
                childrenCount: category.children?.length || 0,
              });
              
              // Check if category.products has items in the raw response
              hasProductsFromFirstQuery = !!(category.products && category.products.items && category.products.items.length > 0);
              console.log(`[ProductsByCategory] First query has products:`, hasProductsFromFirstQuery, 'category.id:', category.id, 'products.count:', category.products?.items?.length || 0);
              console.log(`[ProductsByCategory] Category products structure:`, {
                hasProducts: !!category.products,
                hasItems: !!(category.products?.items),
                itemsLength: category.products?.items?.length || 0,
                totalCount: category.products?.total_count || 0,
              });
              
              // Build category IDs array (parent + children if they exist)
              // Always make second query if first query returned no products
              if (category.id && !hasProductsFromFirstQuery) {
              // Convert category IDs to integers (Magento expects Int for category_id)
              const categoryIds: number[] = [];
              const categoryIdInt = parseInt(category.id, 10);
              if (!isNaN(categoryIdInt)) {
                categoryIds.push(categoryIdInt);
              }
              
              // Include children if they exist
              if (category.children && category.children.length > 0) {
                category.children.forEach((child) => {
                  if (child.id) {
                    const childIdInt = parseInt(child.id, 10);
                    if (!isNaN(childIdInt)) {
                      categoryIds.push(childIdInt);
                    }
                  }
                });
              }
              
              console.log(`[ProductsByCategory] First query returned no products. Making second query with category IDs:`, categoryIds);
              
              // Make second query with category_id 'in' filter
              // This will get all products assigned to the category (and subcategories)
              const secondQuery = {
                query: `
                  query ProductsByCategorySubcategories(
                    $categoryIds: [Int]!
                    $pageSize: Int!
                    $currentPage: Int!
                  ) {
                    products(
                      filter: { category_id: { in: $categoryIds } }
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
                `,
                variables: {
                  categoryIds,
                  pageSize: (() => {
                    const vars = body.variables as Record<string, unknown> | undefined;
                    if (vars?.pagination) {
                      const pagination = vars.pagination as Record<string, unknown> | undefined;
                      return pagination?.limit as number || 20;
                    }
                    return 20;
                  })(),
                  currentPage: 1,
                },
                operationName: 'ProductsByCategorySubcategories',
              };
              
              try {
                const secondResult = await executeMagentoGraphQL(secondQuery, context);
                console.log(`[ProductsByCategory] Second query result:`, JSON.stringify(secondResult.data, null, 2).substring(0, 500));
                
                if (secondResult.data) {
                  console.log(`[ProductsByCategory] Second query raw data structure:`, {
                    hasProducts: !!(secondResult.data as Record<string, unknown>).products,
                    dataKeys: Object.keys(secondResult.data as Record<string, unknown>),
                  });
                  
                  // Normalize the second result
                  const secondNormalized = translator.normalize(secondResult.data, context);
                  console.log(`[ProductsByCategory] Second query normalized:`, JSON.stringify(secondNormalized, null, 2).substring(0, 1000));
                  
                  if (secondNormalized && typeof secondNormalized === 'object') {
                    const secondData = secondNormalized as Record<string, unknown>;
                    console.log(`[ProductsByCategory] Second normalized data keys:`, Object.keys(secondData));
                    
                    // Use products from second query if available
                    if (secondData.productsByCategory) {
                      const productCount = (secondData.productsByCategory as { items?: unknown[] }).items?.length || 0;
                      console.log(`[ProductsByCategory] Using products from second query. Count:`, productCount);
                      normalizedData = secondData;
                    } else {
                      console.log(`[ProductsByCategory] Second query normalized but no productsByCategory found. Keys:`, Object.keys(secondData));
                      console.log(`[ProductsByCategory] Second normalized data:`, JSON.stringify(secondData, null, 2).substring(0, 500));
                    }
                  } else {
                    console.log(`[ProductsByCategory] Second normalized data is not an object:`, typeof secondNormalized);
                  }
                } else {
                  console.log(`[ProductsByCategory] Second query returned no data`);
                }
              } catch (error) {
                console.error('[ProductsByCategory] Error executing second query for products:', error);
                // Continue with existing result if second query fails
              }
              } else {
                console.log(`[ProductsByCategory] Skipping second query - hasProductsFromFirstQuery:`, hasProductsFromFirstQuery, 'category.id:', category.id);
              }
            } else {
              console.log(`[ProductsByCategory] categoryList is empty`);
            }
          } else {
            console.log(`[ProductsByCategory] No categoryList found in Magento response`);
          }
        }
      } catch (error) {
        console.error('Error normalizing response:', error);
        // Return raw data if normalization fails
        normalizedData = magentoResult.data;
      }
    }

    // Build response
    console.log(`[${operationName}] Final normalizedData:`, JSON.stringify(normalizedData, null, 2).substring(0, 500));
    
    const response: GraphQLResponse = {
      data: normalizedData as Record<string, unknown>,
      errors: magentoResult.errors,
    };
    
    console.log(`[${operationName}] Final response structure:`, {
      hasData: !!response.data,
      dataKeys: response.data ? Object.keys(response.data) : [],
      hasErrors: !!(response.errors && response.errors.length > 0),
    });

    // Set response headers
    const responseHeaders = new Headers();
    responseHeaders.set('X-Correlation-ID', context.correlationId);
    responseHeaders.set('Content-Type', 'application/json');

    // Add CORS headers
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Correlation-ID, X-Store-Code, X-Locale, X-Currency, X-Cart-Token');

    // Add cache headers for public operations
    if (isPublicOperation(operationName)) {
      responseHeaders.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    } else {
      responseHeaders.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    }

    // Always return JSON, even if there are errors
    return NextResponse.json(response, {
      status: magentoResult.errors && magentoResult.errors.length > 0 ? 200 : 200,
      headers: {
        ...Object.fromEntries(responseHeaders.entries()),
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('GraphQL API error:', error);

    // Ensure we always return JSON, not HTML
    const errorMessage = error instanceof Error ? error.message : 'An internal error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;

    if (errorStack) {
      console.error('Error stack:', errorStack);
    }

    return NextResponse.json(
      {
        errors: [
          {
            code: 'INTERNAL_ERROR',
            message: errorMessage,
            severity: ErrorSeverity.ERROR,
            httpStatus: 500,
            retryable: false,
            source: ErrorSource.MIDDLEWARE,
          },
        ],
        data: null,
      } as GraphQLResponse,
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

/**
 * Extract operation name from GraphQL query string
 */
function extractOperationName(query: string): string | null {
  const match = query.match(/(?:query|mutation|subscription)\s+(\w+)/);
  return match ? match[1] : null;
}

/**
 * Check if operation is public (cacheable)
 */
function isPublicOperation(operationName: string): boolean {
  const publicOperations = [
    'GetProduct',
    'GetCategory',
    'GetCategories',
    'ProductsByCategory',
    'SearchProducts',
  ];

  return publicOperations.includes(operationName);
}

/**
 * Handle OPTIONS request (CORS preflight)
 */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Correlation-ID, X-Store-Code, X-Locale, X-Currency, X-Cart-Token',
    },
  });
}

