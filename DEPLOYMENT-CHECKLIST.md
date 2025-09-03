# Deployment Checklist - Auth Issues

## ✅ **Environment Variables (CRITICAL)**

Make sure these are set in your **Vercel Dashboard** → Settings → Environment Variables:

```env
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/subs-tracker?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NODE_ENV=production
```

## 🔧 **Common Deployment Issues & Fixes**

### 1. **Environment Variables Not Set**
**Symptoms**: 500 errors, "Server configuration error"
**Fix**: 
- Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- Add all required variables
- Redeploy

### 2. **Database Connection Issues**
**Symptoms**: Database connection timeouts, 503 errors
**Fix**:
- Check MongoDB Atlas cluster is running
- Verify connection string format
- Ensure IP whitelist includes Vercel IPs (0.0.0.0/0 for testing)
- Check database user permissions

### 3. **Cookie Issues in Production**
**Symptoms**: Auth works but cookies not set
**Fix**:
- Ensure HTTPS is enabled (Vercel handles this)
- Check domain settings
- Verify secure cookie settings

### 4. **Prisma Client Not Generated**
**Symptoms**: Import errors, module not found
**Fix**:
- Ensure `vercel-build` script runs `prisma generate`
- Check build logs for Prisma errors

## 🚀 **Deployment Steps**

1. **Set Environment Variables** in Vercel Dashboard
2. **Push code** to trigger deployment
3. **Check build logs** for any errors
4. **Test endpoints**:
   - `GET /api/test` (basic test)
   - `POST /api/auth/signup-test` (detailed auth test)
   - `POST /api/auth/signup` (actual signup)

## 🔍 **Debugging Steps**

1. **Check Vercel Function Logs**:
   - Go to Vercel Dashboard → Functions tab
   - Look for console.log output
   - Check for specific error messages

2. **Test Basic Endpoint**:
   ```
   GET https://your-app.vercel.app/api/test
   ```

3. **Test Auth Endpoint**:
   ```
   POST https://your-app.vercel.app/api/auth/signup-test
   Content-Type: application/json
   
   {
     "email": "test@example.com",
     "password": "testpassword123",
     "name": "Test User"
   }
   ```

## ⚠️ **Most Common Issue**

**Environment Variables Not Set in Vercel Dashboard**

This is the #1 cause of auth working locally but failing in production. Double-check that all environment variables are properly set in your Vercel project settings.

## 🎯 **Quick Fix**

If you're still getting 500 errors:

1. Go to Vercel Dashboard
2. Settings → Environment Variables
3. Add these variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_APP_URL`
4. Redeploy
5. Test again

The debug logging will show exactly what's missing!
