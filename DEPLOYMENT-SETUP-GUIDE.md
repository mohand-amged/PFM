# Deployment Setup Guide

## 🚀 **Step-by-Step Deployment Process**

### **Step 1: Environment Variables Setup**

Go to your **Vercel Dashboard** → Your Project → Settings → Environment Variables

Add these variables:

```env
# Required - Database Connection
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/subs-tracker?retryWrites=true&w=majority

# Required - JWT Secret (generate a strong secret)
JWT_SECRET=your-super-secret-jwt-key-here-make-it-at-least-32-characters-long

# Optional - App URL (for production)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Optional - Node Environment (auto-set by Vercel)
NODE_ENV=production
```

### **Step 2: MongoDB Atlas Configuration**

1. **Create MongoDB Atlas Cluster**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com)
   - Create a new cluster
   - Choose the free tier (M0)

2. **Configure Database Access**
   - Go to Database Access
   - Create a new database user
   - Set username and password
   - Grant "Read and write to any database" permissions

3. **Configure Network Access**
   - Go to Network Access
   - Add IP Address: `0.0.0.0/0` (allows all IPs - for testing)
   - For production, add specific Vercel IP ranges

4. **Get Connection String**
   - Go to Clusters
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

### **Step 3: Deploy to Vercel**

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Build Settings**
   - Framework: Next.js (auto-detected)
   - Build Command: `prisma generate && next build`
   - Output Directory: `.next` (auto-detected)

3. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

### **Step 4: Post-Deployment Testing**

1. **Health Check**
   ```
   GET https://your-app.vercel.app/api/health
   ```
   Should return status 200 with health information

2. **Basic API Test**
   ```
   GET https://your-app.vercel.app/api/test
   ```
   Should return basic API functionality

3. **Auth Test**
   ```
   POST https://your-app.vercel.app/api/auth/signup-test
   Content-Type: application/json
   
   {
     "email": "test@example.com",
     "password": "testpassword123",
     "name": "Test User"
   }
   ```

## 🔍 **Troubleshooting**

### **If Health Check Fails:**

1. **Check Environment Variables**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Verify all required variables are set

2. **Check Database Connection**
   - Verify MongoDB Atlas cluster is running
   - Check IP whitelist includes 0.0.0.0/0
   - Verify connection string format

3. **Check Build Logs**
   - Go to Vercel Dashboard → Deployments
   - Click on latest deployment
   - Check build logs for errors

### **If Auth Endpoints Return 500:**

1. **Check Function Logs**
   - Go to Vercel Dashboard → Functions
   - Click on the failing function
   - Check logs for specific error messages

2. **Test Database Connection**
   - Use the health check endpoint
   - Check if database status is "healthy"

3. **Verify Environment Variables**
   - Ensure DATABASE_URL and JWT_SECRET are set
   - Check for typos in variable names

## ✅ **Success Indicators**

Your deployment is successful when:

- ✅ Health check returns status 200
- ✅ Database connection shows "healthy"
- ✅ Auth endpoints work without 500 errors
- ✅ Cookies are set properly in browser
- ✅ User can signup and login successfully

## 🛠️ **Monitoring**

### **Health Check Endpoint**
Monitor your app health with:
```
GET /api/health
```

Returns:
- Environment variable status
- Database connection status
- Response time
- App version and uptime

### **Vercel Function Logs**
- Go to Vercel Dashboard → Functions
- Monitor real-time logs
- Check for errors and performance issues

## 🎯 **Production Checklist**

Before going live:

- [ ] Environment variables set correctly
- [ ] Database connection working
- [ ] Health check passing
- [ ] Auth endpoints tested
- [ ] MongoDB Atlas IP whitelist configured
- [ ] Strong JWT_SECRET generated
- [ ] App URL configured
- [ ] Monitoring set up

Your app is now ready for production! 🚀
