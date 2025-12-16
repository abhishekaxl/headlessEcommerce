#!/bin/bash

# Integration Test Script
# Tests the connection between Frontend, Middleware, and Magento

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🧪 Testing Headless eCommerce Portal Integration...${NC}"
echo ""

# Test 1: Magento GraphQL Endpoint
echo -e "${YELLOW}Test 1: Magento GraphQL Endpoint${NC}"
MAGENTO_RESPONSE=$(curl -s -X POST http://localhost/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __schema { queryType { name } } }"}')

if echo "$MAGENTO_RESPONSE" | grep -q "Query"; then
  echo -e "${GREEN}✅ Magento GraphQL is accessible${NC}"
else
  echo -e "${RED}❌ Magento GraphQL is not accessible${NC}"
  echo "Response: $MAGENTO_RESPONSE"
  exit 1
fi

# Test 2: Test Products Query
echo -e "${YELLOW}Test 2: Products Query${NC}"
PRODUCTS_RESPONSE=$(curl -s -X POST http://localhost/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ products(search: \"\", pageSize: 2) { items { name sku } } }"}')

if echo "$PRODUCTS_RESPONSE" | grep -q "items"; then
  echo -e "${GREEN}✅ Products query working${NC}"
  echo "$PRODUCTS_RESPONSE" | head -10
else
  echo -e "${YELLOW}⚠️  Products query returned no items (may need sample data)${NC}"
  echo "$PRODUCTS_RESPONSE" | head -5
fi

# Test 3: Check Docker Services
echo -e "${YELLOW}Test 3: Docker Services Status${NC}"
docker compose ps | grep -E "magento|nginx|db|redis|elasticsearch" | while read line; do
  if echo "$line" | grep -q "Up"; then
    SERVICE=$(echo "$line" | awk '{print $1}')
    echo -e "${GREEN}✅ $SERVICE is running${NC}"
  fi
done

# Test 4: Check MailHog
echo -e "${YELLOW}Test 4: MailHog Status${NC}"
if curl -s http://localhost:8025/api/v2/messages > /dev/null 2>&1; then
  echo -e "${GREEN}✅ MailHog is accessible${NC}"
else
  echo -e "${YELLOW}⚠️  MailHog may not be running${NC}"
fi

# Test 5: Check Environment Variables
echo -e "${YELLOW}Test 5: Environment Configuration${NC}"
if [ -f ".env.local" ]; then
  echo -e "${GREEN}✅ .env.local file exists${NC}"
  if grep -q "MAGENTO_GRAPHQL_URL" .env.local; then
    echo -e "${GREEN}✅ MAGENTO_GRAPHQL_URL configured${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  .env.local file not found${NC}"
fi

# Test 6: Check Node Modules
echo -e "${YELLOW}Test 6: Frontend Dependencies${NC}"
if [ -d "node_modules" ]; then
  echo -e "${GREEN}✅ Node modules installed${NC}"
else
  echo -e "${RED}❌ Node modules not installed. Run: npm install${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Integration tests complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Start Next.js dev server: npm run dev"
echo "  2. Open http://localhost:3000"
echo "  3. Test GraphQL queries through middleware"
echo ""

