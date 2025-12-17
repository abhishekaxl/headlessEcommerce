/**
 * GraphQL API Route
 * Main endpoint for canonical GraphQL operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { GraphQLRequest, GraphQLResponse, RequestContext } from '../../middleware/lib/types';
import { validateRequest } from '../../middleware/lib/validation/request-validator';
import { buildContext } from '../../middleware/lib/context/context-builder';
import { getTranslator } from '../../middleware/lib/translators';
import { executeMagentoGraphQL } from '../../middleware/lib/magento/client';
import { requiresAuthentication } from '../../middleware/lib/auth/auth-handler';
import { ensureCartToken } from '../../middleware/lib/cart/cart-handler';
import { normalizeValidationError } from '../../middleware/lib/errors/normalizer';
import { isOperationAllowed, getOperationDefinition } from '../../middleware/lib/registry/operation-registry';
import { config } from '../../middleware/lib/config';
import { ErrorSeverity, ErrorSource } from '../../middleware/lib/types';

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
            headers: { 'Content-Type': 'application/json' },
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
            headers: { 'Content-Type': 'application/json' },
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
            headers: { 'Content-Type': 'application/json' },
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
          headers: { 'Content-Type': 'application/json' },
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
          headers: { 'Content-Type': 'application/json' },
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
    let operationName: string | undefined = body.operationName ?? undefined;
    if (!operationName) {
      const extracted = extractOperationName(body.query);
      operationName = extracted === null ? undefined : extracted;
    }

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
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if operation is allowed
    if (!isOperationAllowed(operationName)) {
      return NextResponse.json(
        {
          errors: [
            normalizeValidationError(`Operation "${operationName}" is not allowed`),
          ],
          data: null,
        } as GraphQLResponse,
        { status: 403 }
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
            headers: { 'Content-Type': 'application/json' },
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
          headers: { 'Content-Type': 'application/json' },
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
          headers: { 'Content-Type': 'application/json' },
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
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Normalize response
    let normalizedData: unknown = null;
    if (magentoResult.data) {
      try {
        normalizedData = translator.normalize(magentoResult.data, context);
      } catch (error) {
        console.error('Error normalizing response:', error);
        // Return raw data if normalization fails
        normalizedData = magentoResult.data;
      }
    }

    // Build response
    const response: GraphQLResponse = {
      data: normalizedData as Record<string, unknown>,
      errors: magentoResult.errors,
    };

    // Set response headers
    const responseHeaders = new Headers();
    responseHeaders.set('X-Correlation-ID', context.correlationId);
    responseHeaders.set('Content-Type', 'application/json');

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

