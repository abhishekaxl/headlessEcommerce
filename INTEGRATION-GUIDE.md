# 🔗 Integration Guide: Connecting Frontend to Magento

## ✅ Current Setup Status

### Magento 2 Backend
- ✅ **GraphQL Endpoint**: http://localhost/graphql
- ✅ **Status**: Running and accessible
- ✅ **Version**: Magento 2.4.7

### Middleware (GraphQL Normalization Gateway)
- ✅ **Location**: `/api/graphql` (Next.js API route)
- ✅ **Status**: Configured
- ✅ **Magento Connection**: Ready

### Frontend (Next.js)
- ✅ **Framework**: Next.js 14 (App Router)
- ✅ **Status**: Scaffold ready
- ✅ **GraphQL Client**: Configured

## 🔧 Configuration

### Environment Variables (`.env.local`)
```bash
# Magento 2 Configuration
MAGENTO_GRAPHQL_URL=http://localhost/graphql
MAGENTO_STORE_CODE=default
DEFAULT_LOCALE=en_US
DEFAULT_CURRENCY=USD

# Frontend Configuration
NEXT_PUBLIC_GRAPHQL_URL=/api/graphql
```

### Architecture Flow
```
Frontend (Next.js) 
  → /api/graphql (Middleware)
    → http://localhost/graphql (Magento 2)
```

## 🚀 Next Steps

### Step 1: Install Dependencies
```bash
cd /Users/abhishekdhariwal/Sites/headless-ecommerce-portal
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```

This will start:
- **Frontend**: http://localhost:3000
- **Middleware API**: http://localhost:3000/api/graphql

### Step 3: Test GraphQL Connection

#### Test 1: Direct Magento GraphQL
```bash
curl -X POST http://localhost/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ products(search: \"\", pageSize: 5) { items { name sku } } }"}'
```

#### Test 2: Through Middleware
```bash
curl -X POST http://localhost:3000/api/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query { products(search: \"\", pageSize: 5) { items { name sku price { value currency } } } }"}'
```

### Step 4: Install Sample Data (Optional)
```bash
cd magento2
bash sample-data.sh
```

This will add sample products, categories, and orders to test with.

### Step 5: Test Frontend Pages

1. **Homepage**: http://localhost:3000
2. **Product Page**: http://localhost:3000/product/[slug]
3. **Category Page**: http://localhost:3000/category/[slug]
4. **Cart**: http://localhost:3000/cart
5. **Search**: http://localhost:3000/search?q=test

## 📋 Testing Checklist

- [ ] Magento GraphQL endpoint accessible
- [ ] Middleware API route working
- [ ] Frontend development server running
- [ ] GraphQL queries working through middleware
- [ ] Frontend pages loading
- [ ] Sample data installed (optional)

## 🔍 Troubleshooting

### Middleware Not Connecting to Magento?

1. **Check Magento is running**:
   ```bash
   docker compose ps
   ```

2. **Test Magento GraphQL directly**:
   ```bash
   curl -X POST http://localhost/graphql \
     -H "Content-Type: application/json" \
     -d '{"query":"{ __schema { queryType { name } } }"}'
   ```

3. **Check environment variables**:
   ```bash
   cat .env.local
   ```

4. **Check middleware logs**:
   - Check Next.js console output
   - Check browser network tab

### Frontend Not Loading?

1. **Check dependencies installed**:
   ```bash
   npm list
   ```

2. **Clear Next.js cache**:
   ```bash
   rm -rf .next
   npm run dev
   ```

3. **Check TypeScript errors**:
   ```bash
   npm run type-check
   ```

## 📚 Next Development Steps

1. **Implement Product Listing**: Connect to `GetProducts` query
2. **Implement Product Details**: Connect to `GetProduct` query
3. **Implement Cart**: Connect to cart mutations
4. **Implement Search**: Connect to `SearchProducts` query
5. **Implement Checkout**: Connect to checkout mutations
6. **Add Authentication**: Implement customer login/logout
7. **Add Error Handling**: Implement proper error boundaries
8. **Add Loading States**: Implement skeleton loaders
9. **Add SEO**: Implement meta tags and structured data
10. **Add Analytics**: Implement tracking

---

**Ready to start development!** 🚀

Run `npm run dev` to start the development server and begin building your headless eCommerce portal!

