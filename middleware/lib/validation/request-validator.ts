/**
 * Request Validator
 * Validates incoming GraphQL requests
 */

import { GraphQLRequest } from '../types';
import { config } from '../config';
import { normalizeValidationError } from '../errors/normalizer';
import { isOperationAllowed, getOperationDefinition } from '../registry/operation-registry';

export interface ValidationResult {
  valid: boolean;
  errors?: Array<{
    code: string;
    message: string;
    path?: string[];
  }>;
}

/**
 * Validate GraphQL request
 */
export function validateRequest(request: GraphQLRequest): ValidationResult {
  const errors: Array<{ code: string; message: string; path?: string[] }> = [];

  // Check if query is provided
  if (!request.query || typeof request.query !== 'string') {
    errors.push({
      code: 'VALIDATION_ERROR',
      message: 'Query is required and must be a string',
    });
    return { valid: false, errors };
  }

  // Check payload size
  const payloadSize = JSON.stringify(request).length;
  if (payloadSize > config.security.maxPayloadSize) {
    errors.push({
      code: 'PAYLOAD_TOO_LARGE',
      message: `Payload size exceeds maximum allowed size of ${config.security.maxPayloadSize} bytes`,
    });
  }

  // Extract operation name from query
  const operationName = extractOperationName(request.query) || request.operationName;

  if (!operationName) {
    errors.push({
      code: 'VALIDATION_ERROR',
      message: 'Operation name is required',
    });
    return { valid: false, errors };
  }

  // Check if operation is allowed
  if (!isOperationAllowed(operationName)) {
    errors.push({
      code: 'OPERATION_NOT_ALLOWED',
      message: `Operation "${operationName}" is not allowed`,
    });
  }

  // Check query depth (simplified check)
  const queryDepth = calculateQueryDepth(request.query);
  if (queryDepth > config.security.maxQueryDepth) {
    errors.push({
      code: 'QUERY_TOO_DEEP',
      message: `Query depth (${queryDepth}) exceeds maximum allowed depth of ${config.security.maxQueryDepth}`,
    });
  }

  // Validate variables if provided
  if (request.variables && typeof request.variables !== 'object') {
    errors.push({
      code: 'VALIDATION_ERROR',
      message: 'Variables must be an object',
    });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true };
}

/**
 * Extract operation name from GraphQL query
 */
function extractOperationName(query: string): string | null {
  // Simple regex to extract operation name
  // Matches: query GetProduct, mutation AddToCart, etc.
  const match = query.match(/(?:query|mutation|subscription)\s+(\w+)/);
  return match ? match[1] : null;
}

/**
 * Calculate query depth (simplified)
 */
function calculateQueryDepth(query: string): number {
  let depth = 0;
  let maxDepth = 0;
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < query.length; i++) {
    const char = query[i];

    // Handle strings
    if ((char === '"' || char === "'") && (i === 0 || query[i - 1] !== '\\')) {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
        stringChar = '';
      }
      continue;
    }

    if (inString) {
      continue;
    }

    // Count braces
    if (char === '{') {
      depth++;
      maxDepth = Math.max(maxDepth, depth);
    } else if (char === '}') {
      depth--;
    }
  }

  return maxDepth;
}

/**
 * Validate operation-specific requirements
 */
export function validateOperationRequirements(
  operationName: string,
  variables: Record<string, unknown>
): ValidationResult {
  const operation = getOperationDefinition(operationName);
  if (!operation) {
    return {
      valid: false,
      errors: [
        {
          code: 'OPERATION_NOT_FOUND',
          message: `Operation "${operationName}" not found`,
        },
      ],
    };
  }

  const errors: Array<{ code: string; message: string; path?: string[] }> = [];

  // Add operation-specific validation here
  // For example, check required variables

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true };
}


