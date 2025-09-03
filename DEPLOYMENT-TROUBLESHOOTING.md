# Deployment Troubleshooting Guide

## API Routes Showing 0 B in Build Output

When you see this in your build output:
```
├ ƒ /api/auth/login                      0 B                0 B
├ ƒ /api/auth/logout                     0 B                0 B
├ ƒ /api/auth/signup                     0 B                0 B
```

This is **NORMAL** for Node.js runtime API routes in Next.js 14. The 0 B size indicates they are serverless functions that will be dynamically loaded.

## Fixes Applied for Deployment

### 1. Runtime Configuration
✅ Added `runtime = 'nodejs'` to all API routes
✅ Added `dynamic = 'force-dynamic'` for proper SSR

### 2. Next.js Configuration
✅ Removed conflicting webpack externals
✅ Added `serverComponentsExternalPackages` for Prisma and bcrypt
✅ Simplified config for better deployment compatibility

### 3. Vercel Configuration
✅ Explicit Node.js 18.x runtime for API routes
✅ Increased maxDuration for auth operations
✅ Removed problematic rewrites that broke routing

### 4. Build Process
✅ Added `vercel-build` script with Prisma generation
✅ Proper dependency management for serverless

## Testing Deployment

### Local Testing
```bash
# Test database connection
npm run test-db

# Test API routes locally
npm run test-api

# Build and test
npm run build
npm start
```

### Production Testing
After deployment, test the API endpoints:

1. **Signup**: `POST /api/auth/signup`
   ```json
   {
     "email": "test@example.com",
     "password": "testpassword123",
     "name": "Test User"
   }
   ```

2. **Login**: `POST /api/auth/login`
   ```json
   {
     "email": "test@example.com", 
     "password": "testpassword123"
   }
   ```

3. **Logout**: `POST /api/auth/logout`

## Environment Variables for Deployment

Ensure these are set in your Vercel dashboard:

```env
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here
```

## Common Issues and Solutions

### Issue: API routes return 500 errors
**Solution**: Check environment variables are set correctly

### Issue: Database connection timeouts  
**Solution**: Verify MongoDB Atlas cluster is running and accessible

### Issue: Authentication not working
**Solution**: Ensure JWT_SECRET is set and cookies are enabled

### Issue: Build fails with Prisma errors
**Solution**: Run `npx prisma generate` before deployment

## Vercel Deployment Steps

1. **Connect Repository**: Link your GitHub repo to Vercel
2. **Set Environment Variables**: Add DATABASE_URL and JWT_SECRET
3. **Deploy**: Vercel will automatically build and deploy
4. **Test**: Verify all API routes work in production

## Success Indicators

✅ Build completes without errors
✅ All pages load correctly
✅ Login/signup functions work
✅ Protected routes redirect properly
✅ Database operations succeed

The 0 B showing for API routes is expected behavior - they're serverless functions that work correctly in production!
