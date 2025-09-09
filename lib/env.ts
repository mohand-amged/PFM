// Environment variable validation and configuration

interface EnvConfig {
  DATABASE_URL: string;
  JWT_SECRET: string;
  NODE_ENV: string;
  NEXT_PUBLIC_APP_URL?: string;
}

function validateEnvironment(): EnvConfig {
  const requiredVars = {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    NODE_ENV: process.env.NODE_ENV || 'development',
  };

  const missingVars: string[] = [];
  
  for (const [key, value] of Object.entries(requiredVars)) {
    if (!value) {
      missingVars.push(key);
    }
  }

  if (missingVars.length > 0) {
    const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}`;
    console.error('❌ Environment validation failed:', errorMessage);
    console.error('💡 Please set these variables in your Vercel dashboard:');
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    throw new Error(errorMessage);
  }

  console.log('✅ Environment variables validated successfully');
  
  return {
    ...requiredVars,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  } as EnvConfig;
}

// Export validated environment config
export const env = validateEnvironment();

// Helper function to check if we're in production
export const isProduction = env.NODE_ENV === 'production';

// Helper function to get app URL
export const getAppUrl = () => {
  if (isProduction && env.NEXT_PUBLIC_APP_URL) {
    return env.NEXT_PUBLIC_APP_URL;
  }
  return 'http://localhost:3000';
};
