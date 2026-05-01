# Environment Variables Setup Guide

This guide provides step-by-step instructions for configuring all required environment variables for the Code Battle Platform.

## Table of Contents
1. [Core Configuration](#core-configuration)
2. [Database & Cache](#database--cache)
3. [Authentication (JWT)](#authentication-jwt)
4. [Email Configuration](#email-configuration)
5. [External APIs](#external-apis)
6. [Security](#security)
7. [Blockchain (Aptos)](#blockchain-aptos)
8. [OAuth Credentials (Optional)](#oauth-credentials-optional)

---

## Core Configuration

### NODE_ENV
- **Description**: Application environment
- **Value**: `development`, `production`, or `test`
- **Default**: `development`
- **Example**: `NODE_ENV=development`

### PORT
- **Description**: Server port
- **Default**: `5000`
- **Example**: `PORT=5000`

### FRONTEND_URL
- **Description**: URL where frontend is deployed
- **Must be**: Valid HTTPS URL (except localhost)
- **Example**: 
  - Dev: `FRONTEND_URL=http://localhost:3000`
  - Prod: `FRONTEND_URL=https://yourdomain.com`

---

## Database & Cache

### MONGODB_URI
- **Description**: MongoDB connection string
- **How to get**:
  1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
  2. Create a free account
  3. Create a new project and cluster (free tier available)
  4. Click "Connect" on your cluster
  5. Choose "Drivers" and copy the connection string
  6. Replace `<username>` and `<password>` with your credentials
- **Example**: `MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority`

### REDIS_URL
- **Description**: Redis connection string
- **How to get**:
  1. Go to [Redis Labs](https://redis.com/try-free) or [Upstash Redis](https://upstash.com/)
  2. Create a free account
  3. Create a new Redis database
  4. Copy the connection URL from dashboard
  5. Format: `redis://:[password]@[host]:[port]`
- **Example**: `REDIS_URL=redis://redis-16219.c265.us-east-1-2.ec2.cloud.redislabs.com:16219`

### REDIS_PASSWORD
- **Description**: Redis authentication password
- **How to get**: Copy from Redis dashboard (if using managed Redis)
- **Example**: `REDIS_PASSWORD=your_redis_password`
- **Note**: Leave empty if password is included in REDIS_URL

---

## Authentication (JWT)

### JWT_SECRET
- **Description**: Secret key for signing JWT tokens
- **How to generate**:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- **Requirements**: 
  - Minimum 32 characters
  - Should be random and unique
  - Never commit to repository
- **Example**: `JWT_SECRET=1206df0ed7bb21f87ad52fb4606b47cd5549b640fd6886ba616f64d963a7725a7931356368c600268c0c9e0405e7fce7`

### JWT_EXPIRES_IN
- **Description**: JWT token expiration time
- **Default**: `7d`
- **Allowed values**: `7d`, `30d`, `1h`, `24h`, etc.
- **Example**: `JWT_EXPIRES_IN=7d`

### JWT_REFRESH_EXPIRES_IN
- **Description**: Refresh token expiration time
- **Default**: `30d`
- **Example**: `JWT_REFRESH_EXPIRES_IN=30d`

---

## Email Configuration

### EMAIL_HOST
- **Description**: SMTP server host
- **For Gmail**: `smtp.gmail.com`
- **Example**: `EMAIL_HOST=smtp.gmail.com`

### EMAIL_PORT
- **Description**: SMTP port
- **Common values**: 
  - `587` for TLS
  - `465` for SSL
- **Example**: `EMAIL_PORT=587`

### EMAIL_SECURE
- **Description**: Use TLS/SSL encryption
- **Values**: `true` or `false`
- **For Gmail on port 587**: `false` (uses STARTTLS)
- **For port 465**: `true`
- **Example**: `EMAIL_SECURE=false`

### EMAIL_USER
- **Description**: SMTP account email
- **For Gmail**: Your Gmail address
- **Example**: `EMAIL_USER=codeclash25@gmail.com`

### EMAIL_PASSWORD
- **Description**: SMTP account password
- **For Gmail**: Generate an App Password (NOT your regular password)
- **How to get Gmail App Password**:
  1. Enable 2-Factor Authentication on your Google account
  2. Go to [Google Account Security](https://myaccount.google.com/security)
  3. Find "App passwords" (appears only if 2FA is enabled)
  4. Select "Mail" and "Windows Computer" (or your device)
  5. Copy the 16-character password
  6. Use this password in EMAIL_PASSWORD
- **Example**: `EMAIL_PASSWORD=iinm dpbi qzeu xefc`
- **Security Note**: This is less secure than OAuth2. Consider using OAuth2 for production.

### EMAIL_FROM
- **Description**: Display name and email for sent emails
- **Example**: `EMAIL_FROM=Code Clash <codeclash25@gmail.com>`

### EMAIL_OAUTH_* (Optional - OAuth2 Alternative)
If using Gmail OAuth2 instead of app password:
- `EMAIL_OAUTH_CLIENT_ID`: OAuth2 Client ID
- `EMAIL_OAUTH_CLIENT_SECRET`: OAuth2 Client Secret
- `EMAIL_OAUTH_REFRESH_TOKEN`: OAuth2 Refresh Token
- `EMAIL_OAUTH_ACCESS_TOKEN`: OAuth2 Access Token

---

## External APIs

### JUDGE0_API_URL
- **Description**: Judge0 API endpoint for code execution
- **Value**: `https://judge0-ce.p.rapidapi.com`
- **Example**: `JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com`

### JUDGE0_API_KEY
- **Description**: Judge0 API key
- **How to get**:
  1. Go to [Judge0 RapidAPI](https://rapidapi.com/judge0-official/api/judge0-ce)
  2. Sign up for free account
  3. Subscribe to Judge0 API (free tier available)
  4. Copy the X-RapidAPI-Key from the code snippets
- **Example**: `JUDGE0_API_KEY=434874fde6msh7099858f29642cdp131ab4jsnd29a8f36f625`

### AI_AGENT_API_URL
- **Description**: Lyzr AI Agent API endpoint
- **Default**: `https://agent-prod.studio.lyzr.ai/v3/inference/chat/`
- **Example**: `AI_AGENT_API_URL=https://agent-prod.studio.lyzr.ai/v3/inference/chat/`

### AI_AGENT_API_KEY
- **Description**: Lyzr AI Agent API key
- **How to get**:
  1. Go to [Lyzr Studio](https://studio.lyzr.ai/)
  2. Create an account
  3. Create a new agent
  4. Copy your API key from settings
- **Example**: `AI_AGENT_API_KEY=sk-default-EiUxVZWVhWT0SRuI7bHOK4oKm7oUoNzD`

### AI_AGENT_ID
- **Description**: Lyzr AI Agent ID
- **How to get**: Copy from your agent settings in Lyzr Studio
- **Example**: `AI_AGENT_ID=691ce37f499310d238fb1c96`

---

## Security

### BCRYPT_SALT_ROUNDS
- **Description**: Bcrypt salt rounds for password hashing
- **Default**: `10`
- **Recommended**: `10-12`
- **Higher = more secure but slower**
- **Example**: `BCRYPT_SALT_ROUNDS=10`

### MAX_BETS_PER_DAY
- **Description**: Maximum number of bets a user can place per day
- **Default**: `5`
- **Example**: `MAX_BETS_PER_DAY=5`

### RATE_LIMIT_WINDOW_MS
- **Description**: Rate limiting window in milliseconds
- **Default**: `900000` (15 minutes)
- **Example**: `RATE_LIMIT_WINDOW_MS=900000`

### RATE_LIMIT_MAX_REQUESTS
- **Description**: Maximum requests allowed in the window
- **Default**: `100`
- **Example**: `RATE_LIMIT_MAX_REQUESTS=100`

### TROPHY_WIN_AMOUNT & TROPHY_LOSS_AMOUNT
- **Description**: Trophy points awarded/lost per win/loss
- **Default**: `100` each
- **Example**: 
  - `TROPHY_WIN_AMOUNT=100`
  - `TROPHY_LOSS_AMOUNT=100`

---

## Blockchain (Aptos)

The application is now using **Aptos blockchain** with **Petra wallet**. Replace all Ethereum/Sepolia references.

### APTOS_NETWORK
- **Description**: Aptos network to use
- **Values**: `testnet` or `mainnet`
- **Recommended for development**: `testnet`
- **Default**: `testnet`
- **Example**: `APTOS_NETWORK=testnet`

### APTOS_NODE_URL
- **Description**: Aptos RPC endpoint
- **Testnet**: `https://fullnode.testnet.aptoslabs.com/v1`
- **Mainnet**: `https://fullnode.mainnet.aptoslabs.com/v1`
- **Optional**: Leave empty to use defaults
- **Example**: `APTOS_NODE_URL=https://fullnode.testnet.aptoslabs.com/v1`

### APTOS_CONTRACT_ADDRESS
- **Description**: Deployed Aptos smart contract address
- **How to get**:
  1. Develop your Move smart contract
  2. Deploy to Aptos testnet/mainnet
  3. Copy the published package address
- **Format**: `0x[hex address]`
- **Optional**: Can be added after contract deployment
- **Example**: `APTOS_CONTRACT_ADDRESS=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef`

### Setting up Petra Wallet
1. Install [Petra Wallet Extension](https://petra.app/) for Chrome
2. Create a new wallet or import existing
3. Switch to Testnet in wallet settings
4. Request testnet APT from faucet: `https://faucet.testnet.aptoslabs.com/`

---

## OAuth Credentials (Optional)

These are optional if you want to enable social login (Google, GitHub).

### Google OAuth
- **How to get**:
  1. Go to [Google Cloud Console](https://console.cloud.google.com/)
  2. Create a new project
  3. Enable OAuth 2.0 Consent Screen
  4. Create OAuth 2.0 Credentials (Web Application)
  5. Add authorized redirect URI: `http://localhost:5000/auth/google/callback`
  6. Copy Client ID and Client Secret

- **GOOGLE_CLIENT_ID**: Example: `123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com`
- **GOOGLE_CLIENT_SECRET**: Example: `GOCSPX-aBcDeFgHiJkLmNoPqRsT`

### GitHub OAuth
- **How to get**:
  1. Go to GitHub Settings → Developer settings → OAuth Apps
  2. Create New OAuth App
  3. Set Authorization callback URL: `http://localhost:5000/auth/github/callback`
  4. Copy Client ID and Client Secret

- **GITHUB_ID**: Example: `abc123def456ghi789`
- **GITHUB_SECRET**: Example: `abcdef1234567890abcdef1234567890`

### Cloudinary (Image Upload)
- **How to get**:
  1. Sign up at [Cloudinary](https://cloudinary.com/)
  2. Copy credentials from dashboard
  
- **CLOUDINARY_CLOUD_NAME**: Example: `your-cloud-name`
- **CLOUDINARY_API_KEY**: Example: `123456789012345`
- **CLOUDINARY_API_SECRET**: Example: `abcdefghijklmnopqrstuvwxyz123456`

---

## Complete .env Template

```env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname

# Redis
REDIS_URL=redis://host:port
REDIS_PASSWORD=your_password

# JWT
JWT_SECRET=your_generated_secret_here_minimum_32_characters
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=Code Clash <your_email@gmail.com>

# Judge0 API
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your_judge0_api_key

# AI Agent
AI_AGENT_API_URL=https://agent-prod.studio.lyzr.ai/v3/inference/chat/
AI_AGENT_API_KEY=your_api_key
AI_AGENT_ID=your_agent_id

# Security
BCRYPT_SALT_ROUNDS=10
MAX_BETS_PER_DAY=5
TROPHY_WIN_AMOUNT=100
TROPHY_LOSS_AMOUNT=100
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Blockchain - Aptos
APTOS_NETWORK=testnet
APTOS_NODE_URL=https://fullnode.testnet.aptoslabs.com/v1
APTOS_CONTRACT_ADDRESS=0x...

# OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_ID=your_github_id
GITHUB_SECRET=your_github_secret

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## Troubleshooting

### "COMMISSION_WALLET_PRIVATE_KEY not set"
- ✅ **Fixed**: This was a Sepolia (Ethereum) config that's been removed
- Now using Aptos with APTOS_CONTRACT_ADDRESS instead

### "ZodError: Required" for missing env vars
- Check that all required variables are in your `.env` file
- Restart the server after updating `.env`
- Use correct format: `KEY=value` (no quotes needed)

### Email not sending
- Make sure EMAIL_PASSWORD is an [App Password](https://support.google.com/accounts/answer/185833) for Gmail
- Verify EMAIL_SECURE matches your EMAIL_PORT:
  - Port 587 → EMAIL_SECURE=false
  - Port 465 → EMAIL_SECURE=true

### Aptos wallet not connecting
- Install [Petra Wallet](https://petra.app/)
- Switch to Testnet in wallet settings
- Request APT from [testnet faucet](https://faucet.testnet.aptoslabs.com/)

---

## Security Best Practices

1. **Never commit `.env` file** to version control
2. **Keep JWT_SECRET secret** - generate unique value per environment
3. **Use strong passwords** for database and redis
4. **Rotate API keys regularly**
5. **Use environment-specific values** (different for dev/prod)
6. **In production**: Use managed services (Atlas for MongoDB, Redis Cloud, etc.)
7. **Enable 2FA** on all services (Google, GitHub, etc.)

---

## Support

For issues with specific services:
- **MongoDB**: [MongoDB Support](https://www.mongodb.com/support)
- **Redis**: [Redis Labs Support](https://redis.com/support)
- **Judge0**: [Judge0 Docs](https://judge0.com/)
- **Aptos**: [Aptos Docs](https://aptos.dev/)
- **Petra Wallet**: [Petra Support](https://petra.app/help)
