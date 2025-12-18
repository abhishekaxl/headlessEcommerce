# Cart Testing Guide

## Testing Add to Cart

### 1. Test Direct Magento API

```bash
# Create cart
CART_ID=$(curl -s "http://localhost:8080/graphql" -X POST -H "Content-Type: application/json" -d '{"query":"mutation { createEmptyCart }"}' | jq -r '.data.createEmptyCart')

# Add product to cart
curl -s "http://localhost:8080/graphql" -X POST -H "Content-Type: application/json" -d "{\"query\":\"mutation { addProductsToCart(cartId: \\\"$CART_ID\\\", cartItems: [{ sku: \\\"24-WG01\\\", quantity: 1.0 }]) { cart { id items { id quantity product { name } } } user_errors { message } } }\"}"
```

### 2. Test via Next.js API (with cookies)

```bash
# Get cart (creates cart token cookie)
curl -s "http://localhost:3000/api/graphql" -X POST -H "Content-Type: application/json" -d '{"query":"query { cart { id itemCount } }","operationName":"GetCart"}' -c /tmp/cookies.txt

# Add to cart (uses cart token from cookie)
curl -s "http://localhost:3000/api/graphql" -X POST -H "Content-Type: application/json" -d '{"query":"mutation AddToCart($input: AddToCartInput!) { addToCart(input: $input) { cart { id itemCount items { id quantity product { name } } } errors { message } } }","variables":{"input":{"sku":"24-WG01","quantity":1}},"operationName":"AddToCart"}' -b /tmp/cookies.txt -c /tmp/cookies.txt
```

### 3. Test in Browser

1. Open browser DevTools → Network tab
2. Go to http://localhost:3000
3. Click "Add to cart" on any product
4. Check:
   - Request includes `Cookie: cart-token=...`
   - Response sets `Set-Cookie: cart-token=...`
   - Response contains cart with items

### Common Issues

1. **Cart token not created**: Ensure `GetCart` is called first or `AddToCart` automatically creates one
2. **GROUPED products**: These require options - redirect to product page to select
3. **Cookie not sent**: Check CORS and SameSite cookie settings
4. **Quantity error**: Ensure quantity is a number (not string)
