# Short Notes 2.0 — Deployment & Production Guide

This guide covers deploying Short Notes 2.0 to production environments.

---

## 1. Prerequisites
- **Node.js**: v20 LTS recommended.
- **PostgreSQL**: v15 or higher with `pgvector` extension enabled.
- **Domain & SSL**: Valid domain with HTTPS termination.
- **OpenAI Account**: API key with GPT-4 and text-embedding models enabled.

---

## 2. Environment Variables Configuration

Ensure the following environment variables are securely injected in production (e.g., via Vercel Project Settings or Docker secrets):

```env
# Database
DATABASE_URL="postgresql://user:password@db-host:5432/short_notes_db?sslmode=require"

# NextAuth
NEXTAUTH_URL="https://notes.yourdomain.com"
NEXTAUTH_SECRET="secure-random-32-byte-hex-or-base64"

# AI Engine
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-4-turbo-preview"

# Optional OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Limits
MAX_FILE_SIZE="15728640" # 15MB
NODE_ENV="production"
```

---

## 3. Database Preparation
Run Prisma migrations against the production database:
```bash
npx prisma migrate deploy
```

---

## 4. Build and Run
```bash
# Install dependencies
npm ci

# Generate Prisma Client
npx prisma generate

# Build Next.js application
npm run build

# Start production server
npm run start
```

