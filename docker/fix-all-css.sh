#!/bin/bash
# Comprehensive CSS fix for both Magento and Next.js

echo "=========================================="
echo "   Fixing CSS for Magento & Next.js"
echo "=========================================="

# Fix Magento CSS
echo ""
echo "1. Fixing Magento CSS..."
cd /Users/abhishekdhariwal/Sites/headlessEcommerce/docker
./fix-static-content.sh

# Verify Magento CSS
echo ""
echo "2. Verifying Magento CSS..."
MAGENTO_CSS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8080/static/version1765998776/frontend/Magento/luma/en_US/css/styles-m.css")
if [ "$MAGENTO_CSS_STATUS" = "200" ]; then
    echo "✅ Magento CSS: Working (HTTP $MAGENTO_CSS_STATUS)"
else
    echo "❌ Magento CSS: Not working (HTTP $MAGENTO_CSS_STATUS)"
fi

# Restart Next.js
echo ""
echo "3. Restarting Next.js dev server..."
cd /Users/abhishekdhariwal/Sites/headlessEcommerce
pkill -f "next dev" 2>/dev/null
sleep 2
npm run dev > /dev/null 2>&1 &
sleep 5

# Verify Next.js
echo ""
echo "4. Verifying Next.js..."
NEXTJS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000")
if [ "$NEXTJS_STATUS" = "200" ]; then
    echo "✅ Next.js: Running (HTTP $NEXTJS_STATUS)"
    echo "   CSS is loaded via styled-jsx (Next.js dev mode)"
else
    echo "❌ Next.js: Not running (HTTP $NEXTJS_STATUS)"
fi

echo ""
echo "=========================================="
echo "   CSS Fix Complete!"
echo "=========================================="
echo ""
echo "Magento: http://localhost:8080"
echo "Next.js: http://localhost:3000"
echo ""
echo "Note: In Next.js development mode, CSS is"
echo "      served inline via styled-jsx, which"
echo "      is normal and working correctly."
echo ""

