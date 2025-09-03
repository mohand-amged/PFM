# Auth API 500 Errors - Deployment Fixes

## Issues Fixed

### 1. Cookie Setting in Serverless Environment
**Problem**: The original `setAuthCookie` function was trying to set cookies using the `cookies()` function directly, which doesn't work properly in serverless API routes.

**Solution**: Created `setAuthCookieResponse` function that sets cookies on the response object before returning it.

### 2. Database Connection Issues
**Problem**: No explicit database connection check in API routes, leading to connection timeouts.

**Solution**: Added `await prisma.$connect()` at the start of each auth route to ensure database connectivity.

### 3. Error Handling
**Problem**: Generic 500 errors without specific error messages for debugging.

**Solution**: Added specific error handling for database connection issues and validation errors.

### 4. Vercel Configuration
**Problem**: Missing runtime configuration for auth API routes.

**Solution**: Updated `vercel.json` with explicit Node.js 18.x runtime and increased timeout for auth operations.

## Files Modified

1. **`lib/auth.ts`**
   - Added `setAuthCookieResponse()` function
   - Added `clearAuthCookieResponse()` function

2. **`app/api/auth/signup/route.ts`**
   - Updated to use `setAuthCookieResponse()`
   - Added database connection check
   - Improved error handling

3. **`app/api/auth/login/route.ts`**
   - Updated to use `setAuthCookieResponse()`
   - Added database connection check
   - Improved error handling

4. **`app/api/auth/logout/route.ts`**
   - Updated to use `clearAuthCookieResponse()`

5. **`vercel.json`**
   - Added explicit runtime configuration
   - Added build command with Prisma generation

## Environment Variables Required

Make sure these are set in your Vercel dashboard:

```env
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/subs-tracker?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## Testing the Fixes

After deployment, test these endpoints:

1. **Signup**: `POST /api/auth/signup`
2. **Login**: `POST /api/auth/login`
3. **Logout**: `POST /api/auth/logout`

## Common Issues and Solutions

### Issue: Still getting 500 errors
**Solution**: 
1. Check Vercel function logs for specific error messages
2. Verify environment variables are set correctly
3. Ensure MongoDB Atlas cluster is running and accessible

### Issue: Cookies not being set
**Solution**: 
1. Check that the domain is correct
2. Verify HTTPS is enabled in production
3. Check browser developer tools for cookie settings

### Issue: Database connection timeouts
**Solution**:
1. Verify MongoDB Atlas IP whitelist includes Vercel IPs
2. Check database connection string format
3. Ensure database user has proper permissions

## Deployment Steps

1. **Commit and push changes**
2. **Verify environment variables in Vercel dashboard**
3. **Check build logs for any errors**
4. **Test API endpoints after deployment**
5. **Monitor Vercel function logs for any issues**

The fixes should resolve the 500 errors you were experiencing with the auth endpoints after deployment.
