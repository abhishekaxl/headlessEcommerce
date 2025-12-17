# How to Check Server Logs

## Method 1: Terminal Window (Recommended)

1. Open a new terminal window
2. Navigate to the project directory:
   ```bash
   cd /Users/abhishekdhariwal/Sites/headless-ecommerce-portal
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. The logs will appear in this terminal window
5. Open your browser and navigate to: `http://localhost:3000/category/gear`
6. Watch the terminal for logs like:
   - `[ProductsByCategory] First query raw response:`
   - `[ProductsByCategory] Category found:`
   - `[ProductsByCategory] Second query result:`
   - `[getProductsByCategory] Raw result:`

## Method 2: Check Running Process Logs

If the server is already running, you can:
1. Find the terminal window where you started the server
2. Or check if there's a log file (usually not created by default)

## Method 3: Browser Console

1. Open browser DevTools (F12 or Cmd+Option+I on Mac)
2. Go to the "Console" tab
3. Navigate to `http://localhost:3000/category/gear`
4. You'll see client-side logs like:
   - `[getProductsByCategory] Raw result:`
   - Any errors from the frontend

## Method 4: Network Tab

1. Open browser DevTools (F12 or Cmd+Option+I on Mac)
2. Go to the "Network" tab
3. Navigate to `http://localhost:3000/category/gear`
4. Click on the `/api/graphql` request
5. Check the "Response" tab to see the actual API response

## Quick Test

To see logs immediately, run this in a new terminal:
```bash
cd /Users/abhishekdhariwal/Sites/headless-ecommerce-portal && npm run dev
```

Then open `http://localhost:3000/category/gear` in your browser and watch the terminal output.



