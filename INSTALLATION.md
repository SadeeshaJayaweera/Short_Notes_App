# 🚀 Complete Installation & Setup Guide

## Short Notes - AI-Powered Note Taking Application

Welcome! This guide will help you get the Short Notes application up and running.

---

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Quick Start (5 minutes)](#quick-start)
3. [Detailed Setup](#detailed-setup)
4. [Database Configuration](#database-configuration)
5. [API Keys & Credentials](#api-keys-credentials)
6. [Running the Application](#running-the-application)
7. [Verification & Testing](#verification-testing)
8. [Troubleshooting](#troubleshooting)
9. [Deployment](#deployment)

---

## System Requirements

### Minimum Requirements

- **Node.js**: 18.0.0 or higher
- **npm**: 8.0.0 or higher
- **PostgreSQL**: 12 or higher
- **RAM**: 2GB minimum
- **Disk Space**: 1GB

### Recommended

- **Node.js**: 20.x LTS
- **PostgreSQL**: 15 or higher
- **RAM**: 4GB
- **Disk Space**: 2GB

### Verify Installed Versions

```bash
node --version    # Should be v18.0.0 or higher
npm --version     # Should be 8.0.0 or higher
psql --version    # Should be PostgreSQL 12 or higher
```

---

## Quick Start

Complete setup in 5 minutes:

### 1. Install Dependencies
```bash
cd Short_Notes_App
npm install
```

### 2. Setup Database
```bash
# Create database
createdb short_notes_db

# Run migrations
npm run db:push
```

### 3. Configure Environment
```bash
cp .env.example .env.local
# Edit .env.local with your values
```

### 4. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` in your browser!

---

## Detailed Setup

### Step 1: Clone/Navigate to Project

```bash
cd Short_Notes_App
```

### Step 2: Install Node.js Dependencies

```bash
npm install
```

**What gets installed:**
- Next.js 14 (React framework)
- React 18 (UI library)
- TypeScript (Type safety)
- Prisma ORM (Database)
- NextAuth.js (Authentication)
- Tailwind CSS (Styling)
- OpenAI API client
- Document parsers (PDF, Word)
- Export libraries (PDF, Word, Markdown)

**Expected output:**
```
added 500+ packages, and audited 600+ packages in 2m
```

---

## Database Configuration

### Option A: PostgreSQL Locally (Recommended for Development)

#### Mac (Homebrew)
```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Create database
createdb short_notes_db

# Verify connection
psql short_notes_db -c "SELECT 1"
```

#### Windows
1. Download [PostgreSQL installer](https://www.postgresql.org/download/windows/)
2. Run the installer
3. Remember the password you set for `postgres` user
4. Open Command Prompt and run:
   ```cmd
   createdb -U postgres short_notes_db
   ```

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get install postgresql postgresql-contrib

sudo -u postgres createdb short_notes_db

# Verify
sudo -u postgres psql -d short_notes_db -c "SELECT 1"
```

### Option B: Docker PostgreSQL

```bash
docker run --name short-notes-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=short_notes_db \
  -p 5432:5432 \
  -v short_notes_data:/var/lib/postgresql/data \
  -d postgres:15
```

### Option C: Cloud Database

- **Supabase** (PostgreSQL): https://supabase.com (Free tier available)
- **Railway**: https://railway.app (Free tier available)
- **AWS RDS**: https://aws.amazon.com/rds/
- **DigitalOcean Managed Databases**: https://www.digitalocean.com/

---

## API Keys & Credentials

### 1. OpenAI API Key (Required)

1. Go to: https://platform.openai.com/account/api-keys
2. Sign up or log in with your OpenAI account
3. Click "Create new secret key"
4. Copy the key (you won't see it again!)
5. Save it in `.env.local` as `OPENAI_API_KEY`

**Pricing**: ~$0.03 per 1000 tokens with GPT-4 Turbo

### 2. NextAuth Secret

Generate a random secret:

```bash
openssl rand -base64 32
```

Add to `.env.local` as `NEXTAUTH_SECRET`

### 3. Google OAuth (Optional)

For Google sign-in:

1. Go to: https://console.cloud.google.com
2. Create new project
3. Enable "Google+ API"
4. Create OAuth 2.0 credentials (Web application):
   - Redirect URI: `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID and Secret to `.env.local`

### 4. GitHub OAuth (Optional)

For GitHub sign-in:

1. Go to: https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in details:
   - **Application name**: Short Notes
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Secret to `.env.local`

---

## Configure .env.local

### Create the file

```bash
cp .env.example .env.local
```

### Fill in values

```env
# DATABASE
# Format: postgresql://user:password@host:port/dbname
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/short_notes_db"

# NEXTAUTH
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<your-secret-from-openssl-above>"

# OPENAI
OPENAI_API_KEY="sk-<your-api-key>"
OPENAI_MODEL="gpt-4-turbo-preview"

# OAUTH (Optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
```

### For Production (Vercel, Railway, etc.)

```env
DATABASE_URL="postgresql://user:password@production-host:5432/short_notes_db"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="<new-secret-for-production>"
OPENAI_API_KEY="sk-your-production-key"
NODE_ENV="production"
```

---

## Setup Database Schema

Run Prisma to create database tables:

```bash
npm run db:push
```

Or use migrations:

```bash
npm run db:migrate
```

**What this does:**
- Creates all database tables
- Sets up relationships
- Creates indexes
- Initializes the schema

**Output:**
```
✅ Database synced
```

---

## Running the Application

### Development Mode

```bash
npm run dev
```

**Available at**:
- Frontend: http://localhost:3000
- API: http://localhost:3000/api
- Prisma Studio: Run `npm run db:studio`

**Features in dev mode**:
- Hot reload on code changes
- Detailed error messages
- API request logging

### Production Mode

```bash
npm run build
npm start
```

### Alternative: Production with Environment

```bash
NODE_ENV=production npm run build
NODE_ENV=production npm start
```

---

## Verification & Testing

### 1. Health Check

```bash
curl http://localhost:3000
```

Should return HTML page.

### 2. Database Connection

Open Prisma Studio:

```bash
npm run db:studio
```

You should see all database tables loaded.

### 3. API Test

```bash
# This should return 401 (Unauthorized) - that's correct!
curl http://localhost:3000/api/notes
```

### 4. Manual Testing

1. Open http://localhost:3000
2. Click "Get Started"
3. Create account with email: `test@example.com`
4. Create a new note
5. Upload a PDF or paste text
6. Verify note is created

---

## Troubleshooting

### Installation Issues

#### Error: `npm ERR! code ERESOLVE`

**Solution:**
```bash
npm install --legacy-peer-deps
```

#### Error: `Module not found`

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Database Issues

#### Error: `connect ECONNREFUSED 127.0.0.1:5432`

**Solutions:**
1. Check PostgreSQL is running:
   ```bash
   # Mac
   brew services list
   
   # Linux
   sudo systemctl status postgresql
   ```

2. Start PostgreSQL:
   ```bash
   # Mac
   brew services start postgresql@15
   
   # Linux
   sudo systemctl start postgresql
   ```

3. Verify connection string in `.env.local`

#### Error: `ERROR: database "short_notes_db" does not exist`

**Solution:**
```bash
createdb short_notes_db
npm run db:push
```

### OpenAI Issues

#### Error: `401 Unauthorized`

**Solutions:**
1. Verify API key in `.env.local`
2. Check API key is active on platform.openai.com
3. Verify account has credits
4. Try generating new API key

#### Error: `Rate limit exceeded`

**Solutions:**
1. Wait a few minutes before retrying
2. Check OpenAI usage dashboard
3. Upgrade to paid plan if needed

### Port Issues

#### Error: `EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

### Build Issues

#### Error: `TypeScript error`

**Solution:**
```bash
npm run lint
# Fix the reported errors
```

---

## Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Go to https://vercel.com/new
3. Import your GitHub repository
4. Add environment variables:
   - `DATABASE_URL`
   - `NEXTAUTH_URL` (your domain)
   - `NEXTAUTH_SECRET`
   - `OPENAI_API_KEY`
5. Click "Deploy"

### Deploy to Railway

1. Go to https://railway.app
2. Create new project
3. Connect GitHub repository
4. Add PostgreSQL plugin
5. Add environment variables
6. Deploy

### Deploy to Self-Hosted (Docker)

```bash
# Build image
docker build -t short-notes .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e NEXTAUTH_SECRET="..." \
  -e OPENAI_API_KEY="..." \
  short-notes
```

### Deploy to Traditional VPS

```bash
# SSH into server
ssh user@your-vps

# Install Node.js & PostgreSQL
sudo apt-get update
sudo apt-get install nodejs npm postgresql

# Clone repository
git clone https://github.com/yourusername/short-notes.git

# Install dependencies
npm install

# Setup database
createdb short_notes_db

# Build for production
npm run build

# Start with PM2
npm install -g pm2
pm2 start npm --name "short-notes" -- start
```

---

## Essential Commands

```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm run build           # Build for production
npm start               # Start production server
npm run lint            # Check code quality

# Database
npm run db:push         # Sync schema with database
npm run db:migrate      # Run migrations
npm run db:studio       # Open database UI

# Cleaning
rm -rf node_modules     # Remove node_modules
npm cache clean --force # Clear npm cache
npm install             # Fresh install
```

---

## File Structure

```
Short_Notes_App/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── migrations/         # Database migrations
├── public/
│   └── uploads/           # Uploaded files
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── (auth)/        # Auth pages
│   │   ├── dashboard/     # App pages
│   │   ├── layout.tsx     # Root layout
│   │   └── globals.css    # Global CSS
│   ├── components/        # React components
│   ├── lib/              # Utility functions
│   └── types/            # TypeScript types
├── .env.local            # Environment variables (local)
├── .env.example          # Example env vars
├── next.config.js        # Next.js config
├── tailwind.config.js    # Tailwind config
├── tsconfig.json         # TypeScript config
├── package.json          # Dependencies
└── README.md             # Documentation
```

---

## Security Checklist

Before deploying to production:

- [ ] Change `NEXTAUTH_SECRET` to new secure value
- [ ] Update database credentials
- [ ] Enable HTTPS/SSL
- [ ] Set `NODE_ENV=production`
- [ ] Use strong passwords
- [ ] Enable database backups
- [ ] Set up monitoring
- [ ] Review CORS settings
- [ ] Implement rate limiting
- [ ] Set up error logging

---

## Getting Help

### Resources

- **Documentation**: See [README.md](./README.md)
- **Setup Guide**: See [SETUP.md](./SETUP.md)
- **Next.js**: https://nextjs.org/docs
- **Prisma**: https://www.prisma.io/docs
- **NextAuth.js**: https://next-auth.js.org
- **OpenAI**: https://platform.openai.com/docs

### Common Issues

Check the [Troubleshooting](#troubleshooting) section above.

### Report Issues

1. Check existing GitHub issues
2. Create detailed issue with:
   - Error message
   - Steps to reproduce
   - Your environment (OS, Node version, etc.)

---

## Next Steps

1. ✅ Install dependencies
2. ✅ Configure environment variables
3. ✅ Set up database
4. ✅ Start development server
5. 🚀 **Visit http://localhost:3000**
6. 📝 Create your first account
7. 📄 Upload a document or create a note
8. 🎉 Enjoy!

---

## Tips for Success

- **Start Small**: Test with simple text first, then upload files
- **Monitor API Usage**: Check OpenAI dashboard regularly
- **Keep Backups**: Backup your database regularly
- **Stay Updated**: Run `npm update` periodically
- **Read Logs**: Check console and server logs for errors

---

**Happy Note Taking! 🎉**

If you encounter issues, consult the [Troubleshooting](#troubleshooting) section or check the documentation files.
