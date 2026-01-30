# Setup Guide - Short Notes Application

This guide will walk you through setting up the Short Notes application on your local machine.

## Prerequisites

Before you begin, make sure you have:

- **Node.js 18.0.0 or higher** - [Download here](https://nodejs.org/)
- **npm 8.0.0 or higher** - Comes with Node.js
- **PostgreSQL 12 or higher** - [Download here](https://www.postgresql.org/download/)
- **Git** - [Download here](https://git-scm.com/)

## Step 1: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 14
- React 18
- Prisma ORM
- NextAuth.js
- OpenAI API client
- Document parsers (PDF, Word)
- Export libraries (PDF, Word, Markdown)
- Tailwind CSS and UI components

## Step 2: Set Up PostgreSQL Database

### Option A: Using PostgreSQL CLI

```bash
# Connect to PostgreSQL
psql -U postgres

# Create a new database
CREATE DATABASE short_notes_db;

# Create a user (optional, for security)
CREATE USER short_notes_user WITH PASSWORD 'secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE short_notes_db TO short_notes_user;

# Exit psql
\q
```

### Option B: Using PgAdmin

1. Open PgAdmin
2. Right-click "Databases"
3. Click "Create" > "Database"
4. Name it `short_notes_db`
5. Click "Save"

### Option C: Using Docker

```bash
docker run --name short-notes-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=short_notes_db \
  -p 5432:5432 \
  -d postgres:15
```

## Step 3: Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env.local
```

2. Edit `.env.local` and fill in your values:

```env
# Database Configuration
# Format: postgresql://username:password@host:port/database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/short_notes_db"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
# Generate a random secret: `openssl rand -base64 32`
NEXTAUTH_SECRET="your-random-secret-here"

# OpenAI Configuration
OPENAI_API_KEY="sk-your-openai-api-key"
OPENAI_MODEL="gpt-4-turbo-preview"

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
```

## Step 4: Set Up OpenAI API

1. Go to [OpenAI Platform](https://platform.openai.com)
2. Sign up or log in
3. Navigate to "API keys"
4. Create a new API key
5. Copy and paste it in `.env.local` as `OPENAI_API_KEY`

### Important: API Credits

- Free trial accounts come with $5 in credits (expires after 3 months)
- After that, you'll need to add a payment method
- Estimates:
  - $0.03 per 1K prompt tokens (GPT-4 Turbo)
  - Typical note: 500-2000 tokens

## Step 5: Set Up Database Schema

Run Prisma migrations to create database tables:

```bash
npm run db:push
```

This will:
- Create all required tables
- Set up relationships
- Create indexes
- Initialize the database

Alternatively, run migrations:
```bash
npm run db:migrate
```

## Step 6: (Optional) Set Up OAuth

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable "Google+ API"
4. Go to "OAuth consent screen"
   - Choose "External" type
   - Fill in app name and scopes
5. Create OAuth credentials:
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Add authorized redirect URLs:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://yourdomain.com/api/auth/callback/google` (for production)
6. Copy Client ID and Secret to `.env.local`

### GitHub OAuth

1. Go to GitHub Settings > Developer settings > [OAuth Apps](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in application details:
   - **Application name**: Short Notes
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Client Secret to `.env.local`

## Step 7: Start Development Server

```bash
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3000/api

## Step 8: Create Your First Account

1. Open http://localhost:3000 in your browser
2. Click "Get Started"
3. Create an account with email and password
4. Or sign in with Google/GitHub (if configured)
5. Start creating notes!

## Verification Steps

### Check Database Connection

```bash
npm run db:studio
```

This opens Prisma Studio where you can:
- View all database tables
- Add/edit/delete records
- Verify data structure

### Test API

```bash
# Get all notes (requires authentication)
curl -X GET http://localhost:3000/api/notes
```

## Troubleshooting

### PostgreSQL Connection Failed

**Error**: `connect ECONNREFUSED 127.0.0.1:5432`

**Solutions**:
1. Check PostgreSQL is running:
   ```bash
   # macOS
   brew services list
   
   # Linux
   systemctl status postgresql
   
   # Windows
   # Check Services app
   ```

2. Verify database credentials in `.env.local`

3. Test connection:
   ```bash
   psql -U postgres -d short_notes_db -c "SELECT 1"
   ```

### OpenAI API Key Invalid

**Error**: `401 Unauthorized`

**Solutions**:
1. Verify API key is correct
2. Check API key hasn't expired
3. Verify account has credits/payment method
4. Check rate limits not exceeded

### Port 3000 Already in Use

**Error**: `EADDRINUSE: address already in use :::3000`

**Solutions**:
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

### Module Not Found

**Error**: `Cannot find module '@radix-ui/react-slot'`

**Solutions**:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Production Deployment

### Environment Variables for Production

```env
DATABASE_URL="postgresql://prod_user:secure_password@prod-host:5432/short_notes_db"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="generate-new-secure-secret"
OPENAI_API_KEY="your-production-api-key"
NODE_ENV="production"
```

### Deploy to Vercel

1. Push code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Click "New Project"
4. Import GitHub repository
5. Add environment variables
6. Click "Deploy"

### Deploy to Self-Hosted (Docker)

```bash
# Build Docker image
docker build -t short-notes .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e NEXTAUTH_SECRET="..." \
  -e OPENAI_API_KEY="..." \
  short-notes
```

## Essential Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm start               # Start production server
npm run lint            # Check code quality

# Database
npm run db:push         # Push schema changes
npm run db:studio       # Open Prisma Studio
npm run db:migrate      # Run migrations

# Cleanup
npm run clean           # Remove build files
npm install             # Reinstall dependencies
```

## Next Steps

1. **Create your first note** - Upload a PDF or paste text
2. **Explore features** - Try folders, tags, and sharing
3. **Customize** - Update colors and preferences
4. **Invite others** - Share notes securely

## Getting Help

- Check [README.md](./README.md) for full documentation
- Review [GitHub Issues](https://github.com/yourusername/short-notes-app/issues)
- Check browser console for error messages
- Look at server logs for API errors

## Security Reminders

⚠️ **Important for Production**:

1. **Change `NEXTAUTH_SECRET`**: Generate a random secret
   ```bash
   openssl rand -base64 32
   ```

2. **Use strong passwords** for database and OAuth

3. **Enable HTTPS** in production

4. **Set proper CORS** headers

5. **Implement rate limiting** on API routes

6. **Keep dependencies updated**:
   ```bash
   npm audit
   npm update
   ```

---

You're all set! Start the development server and begin creating summarized notes. 🚀
