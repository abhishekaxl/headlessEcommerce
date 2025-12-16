# Deliverable #6: Test Strategy
## Headless eCommerce Portal - Phase 1 (MVP)

**Document Version:** 1.0  
**Date:** 2024  
**Status:** Draft

---

## Table of Contents
1. [Overview](#overview)
2. [Testing Pyramid](#testing-pyramid)
3. [Unit Tests](#unit-tests)
4. [Integration Tests](#integration-tests)
5. [Contract Tests](#contract-tests)
6. [E2E Tests](#e2e-tests)
7. [Test Tools & Setup](#test-tools--setup)
8. [Test Coverage Goals](#test-coverage-goals)
9. [CI/CD Integration](#cicd-integration)
10. [Test Data Management](#test-data-management)

---

## Overview

यह document comprehensive test strategy define करता है जो ensure करता है कि headless eCommerce portal reliable, maintainable, और production-ready है।

**Testing Principles:**
- **Test Pyramid**: More unit tests, fewer E2E tests
- **Fast Feedback**: Tests should run quickly
- **Isolation**: Tests should be independent
- **Repeatability**: Tests should produce consistent results
- **Maintainability**: Tests should be easy to update

**Testing Layers:**
1. **Unit Tests** - Individual functions/components
2. **Integration Tests** - Component interactions
3. **Contract Tests** - API contracts
4. **E2E Tests** - End-to-end user flows

---

## Testing Pyramid

```
                    /\
                   /  \
                  / E2E \          (10%)
                 /--------\
                /          \
               / Integration \     (20%)
              /----------------\
             /                  \
            /    Unit Tests      \  (70%)
           /----------------------\
```

**Distribution:**
- **Unit Tests**: 70% - Fast, isolated, comprehensive
- **Integration Tests**: 20% - Component interactions, API contracts
- **E2E Tests**: 10% - Critical user flows only

---

## Unit Tests

### Middleware Unit Tests

#### Error Normalizer Tests

**File:** `middleware/lib/errors/__tests__/normalizer.test.ts`

```typescript
describe('Error Normalizer', () => {
  describe('normalizeMagentoGraphQLError', () => {
    it('should normalize Magento GraphQL error to NormalizedError', () => {
      const magentoError = {
        message: 'Product not found',
        category: 'graphql-no-such-entity',
        path: ['product'],
      };
      
      const result = normalizeMagentoGraphQLError(magentoError);
      
      expect(result.code).toBe('PRODUCT_NOT_FOUND');
      expect(result.message).toBe('The requested product is not available');
      expect(result.severity).toBe('ERROR');
      expect(result.httpStatus).toBe(404);
      expect(result.retryable).toBe(false);
      expect(result.source).toBe('MAGENTO');
    });

    it('should map unknown error codes correctly', () => {
      const magentoError = {
        message: 'Unknown error',
        category: 'unknown-error',
      };
      
      const result = normalizeMagentoGraphQLError(magentoError);
      
      expect(result.code).toBe('UNKNOWN_ERROR');
    });

    it('should determine retryable errors correctly', () => {
      const networkError = {
        message: 'Network timeout',
        category: 'network-error',
      };
      
      const result = normalizeMagentoGraphQLError(networkError);
      
      expect(result.retryable).toBe(true);
    });
  });

  describe('normalizeMagentoHTTPError', () => {
    it('should normalize 404 error', () => {
      const httpError = {
        status: 404,
        statusText: 'Not Found',
      };
      
      const result = normalizeMagentoHTTPError(httpError);
      
      expect(result.code).toBe('NOT_FOUND');
      expect(result.httpStatus).toBe(404);
    });

    it('should normalize 500 error as retryable', () => {
      const httpError = {
        status: 500,
        statusText: 'Internal Server Error',
      };
      
      const result = normalizeMagentoHTTPError(httpError);
      
      expect(result.code).toBe('SERVICE_UNAVAILABLE');
      expect(result.retryable).toBe(true);
    });
  });

  describe('normalizeNetworkError', () => {
    it('should normalize timeout error', () => {
      const error = new Error('Request timeout');
      error.message = 'timeout';
      
      const result = normalizeNetworkError(error);
      
      expect(result.code).toBe('TIMEOUT');
      expect(result.retryable).toBe(true);
    });
  });
});
```

#### Operation Registry Tests

**File:** `middleware/lib/registry/__tests__/operation-registry.test.ts`

```typescript
describe('Operation Registry', () => {
  describe('isOperationAllowed', () => {
    it('should return true for allowed operations', () => {
      expect(isOperationAllowed('GetProduct')).toBe(true);
      expect(isOperationAllowed('AddToCart')).toBe(true);
    });

    it('should return false for disallowed operations', () => {
      expect(isOperationAllowed('InvalidOperation')).toBe(false);
    });
  });

  describe('requiresAuth', () => {
    it('should return true for auth-required operations', () => {
      expect(requiresAuth('GetCustomer')).toBe(true);
      expect(requiresAuth('UpdateProfile')).toBe(true);
    });

    it('should return false for public operations', () => {
      expect(requiresAuth('GetProduct')).toBe(false);
      expect(requiresAuth('GetCart')).toBe(false);
    });
  });

  describe('getOperationDefinition', () => {
    it('should return operation definition', () => {
      const definition = getOperationDefinition('GetProduct');
      
      expect(definition).toBeDefined();
      expect(definition?.name).toBe('GetProduct');
      expect(definition?.type).toBe('query');
    });
  });
});
```

#### Request Validator Tests

**File:** `middleware/lib/validation/__tests__/request-validator.test.ts`

```typescript
describe('Request Validator', () => {
  describe('validateRequest', () => {
    it('should validate valid GraphQL request', () => {
      const request = {
        query: 'query GetProduct($slug: String!) { product(slug: $slug) { id } }',
        variables: { slug: 'test-product' },
        operationName: 'GetProduct',
      };
      
      const result = validateRequest(request);
      
      expect(result.valid).toBe(true);
    });

    it('should reject request without query', () => {
      const request = {
        variables: { slug: 'test-product' },
      };
      
      const result = validateRequest(request);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should reject request with payload too large', () => {
      const largeQuery = 'query { ' + 'product { id } '.repeat(10000) + ' }';
      const request = {
        query: largeQuery,
      };
      
      const result = validateRequest(request);
      
      expect(result.valid).toBe(false);
    });

    it('should reject request with query depth too deep', () => {
      const deepQuery = 'query { product { related { product { related { product { id } } } } } }';
      const request = {
        query: deepQuery,
      };
      
      const result = validateRequest(request);
      
      expect(result.valid).toBe(false);
    });
  });

  describe('extractOperationName', () => {
    it('should extract operation name from query', () => {
      const query = 'query GetProduct { product { id } }';
      const name = extractOperationName(query);
      
      expect(name).toBe('GetProduct');
    });
  });
});
```

#### Translator Tests

**File:** `middleware/lib/translators/__tests__/catalog-translator.test.ts`

```typescript
describe('Catalog Translator', () => {
  let translator: CatalogTranslator;
  let mockContext: RequestContext;

  beforeEach(() => {
    translator = new CatalogTranslator();
    mockContext = {
      correlationId: 'test-123',
      storeCode: 'default',
      locale: 'en_US',
      currency: 'USD',
    };
  });

  describe('translateGetProduct', () => {
    it('should translate GetProduct to Magento query', () => {
      const variables = { slug: 'test-product' };
      const result = translator.translate('GetProduct', variables, mockContext);
      
      expect(result.operationName).toBe('GetProduct');
      expect(result.variables).toHaveProperty('urlKey', 'test-product');
      expect(result.query).toContain('products');
      expect(result.query).toContain('url_key');
    });
  });

  describe('translateSearchProducts', () => {
    it('should translate SearchProducts with filters', () => {
      const variables = {
        query: 'laptop',
        pagination: { limit: 20 },
        filters: { priceRange: { min: 100, max: 1000 } },
        sort: { field: 'PRICE', direction: 'ASC' },
      };
      
      const result = translator.translate('SearchProducts', variables, mockContext);
      
      expect(result.variables).toHaveProperty('search', 'laptop');
      expect(result.variables).toHaveProperty('pageSize', 20);
    });
  });
});
```

#### Context Builder Tests

**File:** `middleware/lib/context/__tests__/context-builder.test.ts`

```typescript
describe('Context Builder', () => {
  describe('buildContext', () => {
    it('should build context from headers', () => {
      const headers = {
        'x-correlation-id': 'test-123',
        'x-store-code': 'default',
        'x-locale': 'en_US',
        'x-currency': 'USD',
        'authorization': 'Bearer token-123',
      };
      
      const context = buildContext(headers, {});
      
      expect(context.correlationId).toBe('test-123');
      expect(context.storeCode).toBe('default');
      expect(context.locale).toBe('en_US');
      expect(context.currency).toBe('USD');
      expect(context.customerToken).toBe('token-123');
    });

    it('should generate correlation ID if not provided', () => {
      const headers = {};
      const context = buildContext(headers, {});
      
      expect(context.correlationId).toBeDefined();
      expect(context.correlationId.length).toBeGreaterThan(0);
    });

    it('should extract cart token from cookies', () => {
      const cookies = { 'cart-token': 'cart-123' };
      const context = buildContext({}, cookies);
      
      expect(context.cartToken).toBe('cart-123');
    });
  });
});
```

### Frontend Unit Tests

#### GraphQL Client Tests

**File:** `lib/graphql/__tests__/client.test.ts`

```typescript
describe('GraphQL Client', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  describe('executeGraphQL', () => {
    it('should execute GraphQL query successfully', async () => {
      const mockResponse = {
        data: { product: { id: '1', name: 'Test Product' } },
      };
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });
      
      const result = await executeGraphQL({
        query: 'query { product { id name } }',
      });
      
      expect(result.data).toEqual(mockResponse.data);
    });

    it('should handle GraphQL errors', async () => {
      const mockResponse = {
        errors: [{ message: 'Error occurred', code: 'ERROR' }],
      };
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });
      
      await expect(
        executeGraphQL({ query: 'query { product { id } }' })
      ).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      
      await expect(
        executeGraphQL({ query: 'query { product { id } }' })
      ).rejects.toThrow();
    });
  });
});
```

#### Component Tests

**File:** `components/cart/__tests__/AddToCartButton.test.tsx`

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddToCartButton } from '../AddToCartButton';
import { addToCart } from '@/lib/graphql/mutations';

jest.mock('@/lib/graphql/mutations');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

describe('AddToCartButton', () => {
  const mockProduct = {
    id: '1',
    sku: 'TEST-001',
    name: 'Test Product',
    inStock: true,
  };

  it('should render add to cart button', () => {
    render(<AddToCartButton product={mockProduct} />);
    
    expect(screen.getByText('Add to Cart')).toBeInTheDocument();
  });

  it('should disable button when product is out of stock', () => {
    const outOfStockProduct = { ...mockProduct, inStock: false };
    render(<AddToCartButton product={outOfStockProduct} />);
    
    const button = screen.getByText('Out of Stock');
    expect(button).toBeDisabled();
  });

  it('should call addToCart on click', async () => {
    (addToCart as jest.Mock).mockResolvedValue({});
    
    render(<AddToCartButton product={mockProduct} />);
    
    fireEvent.click(screen.getByText('Add to Cart'));
    
    await waitFor(() => {
      expect(addToCart).toHaveBeenCalledWith('TEST-001', 1, undefined);
    });
  });

  it('should display error message on failure', async () => {
    (addToCart as jest.Mock).mockRejectedValue(new Error('Failed to add'));
    
    render(<AddToCartButton product={mockProduct} />);
    
    fireEvent.click(screen.getByText('Add to Cart'));
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to add/i)).toBeInTheDocument();
    });
  });
});
```

---

## Integration Tests

### Middleware Integration Tests

#### GraphQL Endpoint Tests

**File:** `api/graphql/__tests__/route.test.ts`

```typescript
import { POST } from '../route';
import { NextRequest } from 'next/server';

describe('GraphQL API Route', () => {
  it('should handle valid query', async () => {
    const request = new NextRequest('http://localhost/api/graphql', {
      method: 'POST',
      body: JSON.stringify({
        query: 'query GetProduct($slug: String!) { product(slug: $slug) { id } }',
        variables: { slug: 'test' },
        operationName: 'GetProduct',
      }),
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('data');
  });

  it('should reject invalid operation', async () => {
    const request = new NextRequest('http://localhost/api/graphql', {
      method: 'POST',
      body: JSON.stringify({
        query: 'query InvalidOperation { invalid { id } }',
        operationName: 'InvalidOperation',
      }),
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(403);
    expect(data.errors).toBeDefined();
  });

  it('should require authentication for protected operations', async () => {
    const request = new NextRequest('http://localhost/api/graphql', {
      method: 'POST',
      body: JSON.stringify({
        query: 'query GetCustomer { customer { id } }',
        operationName: 'GetCustomer',
      }),
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(401);
    expect(data.errors).toBeDefined();
  });
});
```

### Frontend Integration Tests

#### Page Integration Tests

**File:** `app/product/__tests__/[slug]/page.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import ProductPage from '../[slug]/page';
import { getProduct } from '@/lib/graphql/queries';

jest.mock('@/lib/graphql/queries');

describe('ProductPage', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    slug: 'test-product',
    price: { amount: 99.99, currency: 'USD', formatted: '$99.99' },
    images: [{ url: '/test.jpg', alt: 'Test' }],
    inStock: true,
  };

  it('should render product details', async () => {
    (getProduct as jest.Mock).mockResolvedValue(mockProduct);
    
    const page = await ProductPage({ params: { slug: 'test-product' } });
    render(page);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
  });

  it('should show 404 for non-existent product', async () => {
    (getProduct as jest.Mock).mockResolvedValue(null);
    
    await expect(
      ProductPage({ params: { slug: 'non-existent' } })
    ).rejects.toThrow();
  });
});
```

---

## Contract Tests

### Canonical GraphQL API Contract Tests

**File:** `tests/contract/__tests__/canonical-api.test.ts`

```typescript
import { buildSchema } from 'graphql';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Canonical GraphQL API Contract', () => {
  let schema: any;

  beforeAll(() => {
    const schemaString = readFileSync(
      join(__dirname, '../../../middleware/lib/types/schema.graphql'),
      'utf-8'
    );
    schema = buildSchema(schemaString);
  });

  describe('Product Query', () => {
    it('should have correct Product type structure', () => {
      const productType = schema.getType('Product');
      expect(productType).toBeDefined();
      
      const fields = productType.getFields();
      expect(fields).toHaveProperty('id');
      expect(fields).toHaveProperty('name');
      expect(fields).toHaveProperty('price');
      expect(fields).toHaveProperty('images');
    });

    it('should have correct Money type', () => {
      const moneyType = schema.getType('Money');
      expect(moneyType).toBeDefined();
      
      const fields = moneyType.getFields();
      expect(fields).toHaveProperty('amount');
      expect(fields).toHaveProperty('currency');
      expect(fields).toHaveProperty('formatted');
    });
  });

  describe('Cart Mutation', () => {
    it('should have AddToCart mutation', () => {
      const mutationType = schema.getType('Mutation');
      const addToCart = mutationType.getFields().addToCart;
      
      expect(addToCart).toBeDefined();
      expect(addToCart.args).toHaveLength(1);
      expect(addToCart.args[0].name).toBe('input');
    });

    it('should return AddToCartPayload', () => {
      const mutationType = schema.getType('Mutation');
      const addToCart = mutationType.getFields().addToCart;
      const returnType = addToCart.type;
      
      expect(returnType.name).toBe('AddToCartPayload');
    });
  });

  describe('Error Types', () => {
    it('should have NormalizedError type', () => {
      const errorType = schema.getType('NormalizedError');
      expect(errorType).toBeDefined();
      
      const fields = errorType.getFields();
      expect(fields).toHaveProperty('code');
      expect(fields).toHaveProperty('message');
      expect(fields).toHaveProperty('severity');
      expect(fields).toHaveProperty('httpStatus');
      expect(fields).toHaveProperty('retryable');
      expect(fields).toHaveProperty('source');
    });
  });
});
```

### API Response Contract Tests

**File:** `tests/contract/__tests__/api-response.test.ts`

```typescript
describe('API Response Contracts', () => {
  describe('Product Response', () => {
    it('should match Product type structure', () => {
      const response = {
        data: {
          product: {
            id: '1',
            sku: 'TEST-001',
            name: 'Test Product',
            price: {
              amount: 99.99,
              currency: 'USD',
              formatted: '$99.99',
            },
            images: [
              {
                url: 'https://example.com/image.jpg',
                alt: 'Product image',
                type: 'image',
              },
            ],
            inStock: true,
            stockStatus: 'IN_STOCK',
          },
        },
      };
      
      // Validate structure
      expect(response.data.product).toHaveProperty('id');
      expect(response.data.product).toHaveProperty('price');
      expect(response.data.product.price).toHaveProperty('amount');
      expect(response.data.product.price).toHaveProperty('currency');
      expect(response.data.product.price).toHaveProperty('formatted');
    });
  });

  describe('Error Response', () => {
    it('should match NormalizedError structure', () => {
      const errorResponse = {
        errors: [
          {
            code: 'PRODUCT_NOT_FOUND',
            message: 'Product not found',
            severity: 'ERROR',
            httpStatus: 404,
            retryable: false,
            source: 'MAGENTO',
          },
        ],
      };
      
      expect(errorResponse.errors[0]).toHaveProperty('code');
      expect(errorResponse.errors[0]).toHaveProperty('message');
      expect(errorResponse.errors[0]).toHaveProperty('severity');
      expect(errorResponse.errors[0]).toHaveProperty('httpStatus');
      expect(errorResponse.errors[0]).toHaveProperty('retryable');
      expect(errorResponse.errors[0]).toHaveProperty('source');
    });
  });
});
```

---

## E2E Tests

### Critical User Flows

#### Happy Path: Complete Purchase Flow

**File:** `tests/e2e/purchase-flow.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Complete Purchase Flow', () => {
  test('guest user can complete purchase', async ({ page }) => {
    // 1. Browse catalog
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Welcome');

    // 2. Navigate to category
    await page.click('text=Electronics');
    await expect(page).toHaveURL(/\/category\/electronics/);

    // 3. View product
    await page.click('text=Product Name');
    await expect(page).toHaveURL(/\/product\//);

    // 4. Add to cart
    await page.click('text=Add to Cart');
    await expect(page.locator('text=Item added to cart')).toBeVisible();

    // 5. View cart
    await page.goto('/cart');
    await expect(page.locator('text=Shopping Cart')).toBeVisible();
    await expect(page.locator('text=Product Name')).toBeVisible();

    // 6. Proceed to checkout
    await page.click('text=Proceed to Checkout');
    await expect(page).toHaveURL('/checkout');

    // 7. Fill shipping address
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="street1"]', '123 Main St');
    await page.fill('input[name="city"]', 'New York');
    await page.fill('input[name="state"]', 'NY');
    await page.fill('input[name="postalCode"]', '10001');
    await page.selectOption('select[name="country"]', 'US');
    await page.fill('input[name="phone"]', '555-1234');

    // 8. Select shipping method
    await page.click('text=Standard Shipping');

    // 9. Select payment method
    await page.click('text=Credit Card');

    // 10. Place order
    await page.check('input[name="agreeToTerms"]');
    await page.click('text=Place Order');

    // 11. Verify order confirmation
    await expect(page).toHaveURL(/\/order-confirmation/);
    await expect(page.locator('text=Order Confirmed')).toBeVisible();
  });
});
```

#### Failure Path: Out of Stock Product

**File:** `tests/e2e/out-of-stock.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Out of Stock Handling', () => {
  test('should handle out of stock product', async ({ page }) => {
    // Navigate to out of stock product
    await page.goto('/product/out-of-stock-product');

    // Verify out of stock message
    await expect(page.locator('text=Out of Stock')).toBeVisible();

    // Verify add to cart button is disabled
    const addToCartButton = page.locator('button:has-text("Add to Cart")');
    await expect(addToCartButton).toBeDisabled();

    // Try to add to cart (should fail)
    await addToCartButton.click({ force: true });
    await expect(page.locator('text=Product is out of stock')).toBeVisible();
  });
});
```

#### Failure Path: Invalid Coupon

**File:** `tests/e2e/invalid-coupon.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Invalid Coupon Handling', () => {
  test('should handle invalid coupon code', async ({ page }) => {
    // Add item to cart
    await page.goto('/product/test-product');
    await page.click('text=Add to Cart');

    // Go to cart
    await page.goto('/cart');

    // Apply invalid coupon
    await page.fill('input[name="couponCode"]', 'INVALID-CODE');
    await page.click('text=Apply Coupon');

    // Verify error message
    await expect(page.locator('text=Invalid coupon code')).toBeVisible();
    await expect(page.locator('text=INVALID-CODE')).not.toBeVisible();
  });
});
```

#### Authentication Flow

**File:** `tests/e2e/authentication.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('user can register and login', async ({ page }) => {
    // Register
    await page.goto('/register');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.click('text=Register');

    // Should redirect to account or home
    await expect(page).toHaveURL(/\/(account|home)/);

    // Logout
    await page.click('text=Logout');
    await expect(page).toHaveURL('/');

    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('text=Login');

    // Should be logged in
    await expect(page.locator('text=My Account')).toBeVisible();
  });

  test('should handle invalid login credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('text=Login');

    await expect(page.locator('text=Invalid email or password')).toBeVisible();
  });
});
```

#### Cart Persistence Flow

**File:** `tests/e2e/cart-persistence.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Cart Persistence', () => {
  test('cart persists across browser sessions', async ({ page, context }) => {
    // Add item to cart
    await page.goto('/product/test-product');
    await page.click('text=Add to Cart');

    // Verify cart has item
    await page.goto('/cart');
    await expect(page.locator('text=test-product')).toBeVisible();

    // Close browser and reopen
    await context.close();
    const newContext = await browser.newContext();
    const newPage = await newContext.newPage();

    // Navigate to cart (should persist)
    await newPage.goto('/cart');
    await expect(newPage.locator('text=test-product')).toBeVisible();
  });

  test('cart merges when user logs in', async ({ page }) => {
    // Add item as guest
    await page.goto('/product/test-product');
    await page.click('text=Add to Cart');

    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('text=Login');

    // Verify cart still has item
    await page.goto('/cart');
    await expect(page.locator('text=test-product')).toBeVisible();
  });
});
```

---

## Test Tools & Setup

### Testing Stack

```json
{
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.1.0",
    "@testing-library/user-event": "^14.5.0",
    "@playwright/test": "^1.40.0",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "ts-jest": "^29.1.0",
    "@types/jest": "^29.5.0",
    "graphql": "^16.8.0"
  }
}
```

### Jest Configuration

**File:** `jest.config.js`

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

### Playwright Configuration

**File:** `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## Test Coverage Goals

### Coverage Targets

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: 60%+ coverage
- **E2E Tests**: Critical paths only (10-15 tests)

### Coverage by Layer

| Layer | Target Coverage | Priority |
|-------|----------------|----------|
| Middleware - Error Normalizer | 90% | High |
| Middleware - Translators | 80% | High |
| Middleware - Validators | 85% | High |
| Frontend - Components | 75% | Medium |
| Frontend - GraphQL Client | 80% | High |
| API Routes | 70% | Medium |

---

## CI/CD Integration

### GitHub Actions Workflow

**File:** `.github/workflows/test.yml`

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:coverage

  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

### Test Scripts

**File:** `package.json`

```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --testPathPattern=__tests__",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "playwright test",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch"
  }
}
```

---

## Test Data Management

### Mock Data

**File:** `tests/__mocks__/magento-responses.ts`

```typescript
export const mockMagentoProductResponse = {
  data: {
    products: {
      items: [
        {
          sku: 'TEST-001',
          name: 'Test Product',
          url_key: 'test-product',
          price_range: {
            minimum_price: {
              final_price: {
                value: 99.99,
                currency: 'USD',
              },
            },
          },
          image: {
            url: 'https://example.com/image.jpg',
            label: 'Test Product',
          },
          stock_status: 'IN_STOCK',
        },
      ],
    },
  },
};

export const mockMagentoCartResponse = {
  data: {
    cart: {
      id: 'cart-123',
      items: [
        {
          id: 'item-1',
          product: {
            sku: 'TEST-001',
            name: 'Test Product',
          },
          quantity: 1,
          prices: {
            price: {
              value: 99.99,
              currency: 'USD',
            },
          },
        },
      ],
      prices: {
        grand_total: {
          value: 99.99,
          currency: 'USD',
        },
      },
    },
  },
};
```

### Test Fixtures

**File:** `tests/fixtures/products.ts`

```typescript
export const testProducts = {
  simpleProduct: {
    id: '1',
    sku: 'SIMPLE-001',
    name: 'Simple Product',
    price: { amount: 99.99, currency: 'USD', formatted: '$99.99' },
    inStock: true,
  },
  configurableProduct: {
    id: '2',
    sku: 'CONFIG-001',
    name: 'Configurable Product',
    configurableOptions: [
      {
        id: '1',
        label: 'Color',
        code: 'color',
        values: [
          { id: '1', label: 'Red', code: 'red' },
          { id: '2', label: 'Blue', code: 'blue' },
        ],
      },
    ],
    inStock: true,
  },
  outOfStockProduct: {
    id: '3',
    sku: 'OOS-001',
    name: 'Out of Stock Product',
    inStock: false,
  },
};
```

---

## Summary

यह test strategy comprehensive testing approach provide करता है:

1. **Unit Tests** - Fast, isolated tests for individual functions
2. **Integration Tests** - Component and API interaction tests
3. **Contract Tests** - API schema and response validation
4. **E2E Tests** - Critical user flow validation

**Key Benefits:**
- Fast feedback loop
- High confidence in code quality
- Regression prevention
- Documentation through tests
- CI/CD integration ready

**Next Steps:**
- Implement test files
- Set up test infrastructure
- Configure CI/CD pipelines
- Establish test data management
- Monitor test coverage

---

**Document Owner:** Engineering Team  
**Last Updated:** 2024  
**Next Review:** After Phase 1 completion

