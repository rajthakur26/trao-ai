import dotenv from 'dotenv';

dotenv.config();

/**
 * Centralised, validated access to environment variables.
 * Throws early (at boot) if something required is missing in production.
 */
const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  clientOrigins: (process.env.CLIENT_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/trao',
  jwtSecret: process.env.JWT_SECRET || 'dev_insecure_secret_change_me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  groqApiKey: process.env.GROQ_API_KEY || '',
  groqModel: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
  // Default currency for budgets/prices (ISO 4217 code). INR for Indian users.
  currency: process.env.DEFAULT_CURRENCY || 'INR',
};

env.isProduction = env.nodeEnv === 'production';
env.hasLlm = Boolean(env.groqApiKey);

if (env.isProduction) {
  const required = { MONGODB_URI: process.env.MONGODB_URI, JWT_SECRET: process.env.JWT_SECRET };
  const missing = Object.entries(required)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length) {
    throw new Error(`Missing required env vars in production: ${missing.join(', ')}`);
  }
}

export default env;
