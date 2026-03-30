import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('5000'),
  FRONTEND_URL: z.string().url(),
  MONGODB_URI: z.string(),
  REDIS_URL: z.string(),
  REDIS_PASSWORD: z.string().optional(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  EMAIL_HOST: z.string(),
  EMAIL_PORT: z.string().transform(Number),
  EMAIL_SECURE: z.string().optional().default('false').transform((v) => v === 'true'),
  EMAIL_USER: z.string().email(),
  EMAIL_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string(),
  // Optional OAuth2 fields for Gmail
  EMAIL_OAUTH_CLIENT_ID: z.string().optional(),
  EMAIL_OAUTH_CLIENT_SECRET: z.string().optional(),
  EMAIL_OAUTH_REFRESH_TOKEN: z.string().optional(),
  EMAIL_OAUTH_ACCESS_TOKEN: z.string().optional(),
  // If not using OAuth2, EMAIL_PASSWORD should be provided
  JUDGE0_API_URL: z.string().url(),
  JUDGE0_API_KEY: z.string().optional(),
  BCRYPT_SALT_ROUNDS: z.string().transform(Number).default('10'),
  MAX_BETS_PER_DAY: z.string().transform(Number).default('5'),
  TROPHY_WIN_AMOUNT: z.string().transform(Number).default('100'),
  TROPHY_LOSS_AMOUNT: z.string().transform(Number).default('100'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  // AI Agent for problem generation
  AI_AGENT_API_URL: z.string().url().default('https://agent-prod.studio.lyzr.ai/v3/inference/chat/'),
  AI_AGENT_API_KEY: z.string().min(1),
  AI_AGENT_ID: z.string().min(1),
  // Blockchain
  SEPOLIA_RPC_URL: z.string().url().default('https://rpc.sepolia.org'),
  COMMISSION_WALLET_PRIVATE_KEY: z.string().min(1),
  CONTRACT_ADDRESS: z.string().min(1),
});

const env = envSchema.parse(process.env);
export default env;