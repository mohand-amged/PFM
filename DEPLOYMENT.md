# Deployment Guide for Subs Tracker

## Vercel Deployment

### Prerequisites
1. MongoDB database (MongoDB Atlas recommended)
2. Vercel account
3. Environment variables configured

### Environment Variables Required

Set these in your Vercel project settings:

```
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/subs-tracker?retryWrites=true&w=majority
JWT_SECRET=your-jwt-secret-here
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### Deployment Steps

1. **Connect your repository to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect it's a Next.js project

2. **Configure Environment Variables**
   - In your Vercel project dashboard, go to Settings > Environment Variables
   - Add all the required environment variables listed above

3. **Deploy**
   - Vercel will automatically deploy on every push to your main branch
   - Or manually trigger a deployment from the dashboard

### Build Configuration

The project is configured with:
- **Node.js version**: >=18.0.0 (specified in package.json)
- **Build command**: `prisma generate && next build`
- **Output directory**: `.next` (auto-detected by Vercel)
- **Framework**: Next.js (auto-detected)

### Common Issues and Solutions

1. **Build fails with Prisma errors**
   - Ensure `DATABASE_URL` is correctly set
   - Check that your MongoDB connection string is valid

2. **TypeScript errors during build**
   - The build is configured to fail on TypeScript errors
   - Fix any TypeScript issues before deploying

3. **ESLint errors during build**
   - The build is configured to fail on ESLint errors
   - Fix any linting issues before deploying

4. **API routes not working**
   - Ensure all environment variables are set
   - Check that your database is accessible from Vercel

### Local Testing

Before deploying, test your build locally:

```bash
npm install
npm run build
npm start
```

### Database Setup

1. Create a MongoDB Atlas cluster
2. Get your connection string
3. Set the `DATABASE_URL` environment variable
4. The Prisma client will be generated automatically during build

### Security Notes

- Never commit `.env` files to version control
- Use strong, unique secrets for `JWT_SECRET`
- Ensure your MongoDB database has proper access controls
- Your custom authentication system uses JWT tokens stored in HTTP-only cookies
