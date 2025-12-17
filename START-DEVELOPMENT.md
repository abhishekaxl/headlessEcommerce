# 🚀 Start Development Guide

## ✅ Prerequisites Complete

- ✅ Magento 2.4.7 installed and running
- ✅ GraphQL API enabled
- ✅ 2FA configured
- ✅ Email system working (MailHog)
- ✅ Frontend dependencies installed
- ✅ Environment variables configured

## 🎯 Quick Start

### Step 1: Start All Services

**Terminal 1 - Magento Services:**
```bash
cd /Users/abhishekdhariwal/Sites/headless-ecommerce-portal/magento2
docker compose up -d
```

**Terminal 2 - Next.js Frontend:**
```bash
cd /Users/abhishekdhariwal/Sites/headless-ecommerce-portal
npm run dev
```

### Step 2: Access Your Application

- **Frontend**: http://localhost:3000
- **Magento Admin**: http://localhost/admin
- **GraphQL API**: http://localhost/graphql
- **Middleware API**: http://localhost:3000/api/graphql
- **MailHog**: http://localhost:8025

## 🧪 Test Integration

### Test 1: Magento GraphQL (Direct)
```bash
curl -X POST http://localhost/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ products(search: \"\", pageSize: 5) { items { name sku price { value currency } } } }"}'
```

### Test 2: Middleware API
```bash
curl -X POST http://localhost:3000/api/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query { products(search: \"\", pageSize: 5) { items { name sku price { value currency } } } }"}'
```

### Test 3: Run Integration Tests
```bash
cd /Users/abhishekdhariwal/Sites/headless-ecommerce-portal
bash test-integration.sh
```

## 📦 Install Sample Data (Recommended)

To test with real products and categories:

```bash
cd /Users/abhishekdhariwal/Sites/headless-ecommerce-portal/magento2
bash sample-data.sh
```

After installation, reindex:
```bash
docker compose exec -T magento sh -c "cd /var/www/html && php bin/magento indexer:reindex"
```

## 🏗️ Development Workflow

### 1. Frontend Development
- **Location**: `/app`, `/components`, `/lib`
- **Start**: `npm run dev`
- **Build**: `npm run build`
- **Type Check**: `npm run type-check`

### 2. Middleware Development
- **Location**: `/middleware`, `/api/graphql`
- **Test**: Use GraphQL queries through `/api/graphql`
- **Logs**: Check Next.js console and browser network tab

### 3. Magento Backend
- **Admin**: http://localhost/admin
- **GraphQL**: http://localhost/graphql
- **CLI**: `docker compose exec -T magento sh -c "cd /var/www/html && php bin/magento ..."`

## 🔍 Debugging

### Check Magento Logs
```bash
docker compose exec -T magento sh -c "cd /var/www/html && tail -50 var/log/exception.log"
```

### Check Next.js Logs
- Check terminal where `npm run dev` is running
- Check browser console
- Check Network tab in DevTools

### Test GraphQL Queries
Use GraphQL Playground or curl:
```bash
curl -X POST http://localhost:3000/api/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"YOUR_QUERY_HERE"}'
```

## 📚 Available GraphQL Operations

### Queries
- `GetProduct(sku: String!)`
- `GetProducts(filters: ProductFilters, pageSize: Int, currentPage: Int)`
- `SearchProducts(query: String!, pageSize: Int, currentPage: Int)`
- `GetCategory(slug: String!)`
- `GetCart`
- `GetCustomer`

### Mutations
- `AddToCart(input: AddToCartInput!)`
- `UpdateCartItem(input: UpdateCartItemInput!)`
- `RemoveFromCart(itemId: ID!)`
- `ApplyCoupon(code: String!)`
- `PlaceOrder(input: PlaceOrderInput!)`
- `Login(email: String!, password: String!)`
- `Register(input: RegisterInput!)`

## 🎨 Frontend Pages

- `/` - Homepage
- `/category/[slug]` - Category listing
- `/product/[slug]` - Product details
- `/search` - Search results
- `/cart` - Shopping cart
- `/checkout` - Checkout
- `/account` - Customer account

## 🔐 Authentication

- **Guest Cart**: Automatically created
- **Customer Login**: Use `Login` mutation
- **Cart Merge**: Guest cart merges with customer cart on login

## 📝 Next Development Tasks

1. **Implement Product Listing Page**
   - Connect to `GetProducts` query
   - Add pagination
   - Add filters

2. **Implement Product Details Page**
   - Connect to `GetProduct` query
   - Add to cart functionality
   - Image gallery

3. **Implement Cart**
   - Connect to cart queries/mutations
   - Update quantities
   - Remove items

4. **Implement Search**
   - Connect to `SearchProducts` query
   - Add autocomplete
   - Add filters

5. **Implement Checkout**
   - Connect to checkout mutations
   - Add address forms
   - Add payment integration

6. **Add Authentication**
   - Login/Register pages
   - Session management
   - Protected routes

---

**Ready to code!** 🚀

Start with: `npm run dev` and open http://localhost:3000



