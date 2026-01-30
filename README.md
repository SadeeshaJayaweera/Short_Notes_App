<div align="center">

# 📝 Short Notes

### AI-Powered Note Taking That Actually Makes Sense

*Transform lengthy documents into crystal-clear bullet points in seconds*

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748)](https://www.prisma.io/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-412991)](https://openai.com/)

[Live Demo](#) • [Documentation](#) • [Report Bug](https://github.com/yourusername/short-notes/issues) • [Request Feature](https://github.com/yourusername/short-notes/issues)

</div>

---

## ✨ What Makes Short Notes Special?

<table>
<tr>
<td width="33%" align="center">

### 🤖 AI-Powered
GPT-4 automatically converts your lengthy documents into concise, actionable bullet points

</td>
<td width="33%" align="center">

### 🚀 Lightning Fast
Upload, process, and summarize documents in seconds, not minutes

</td>
<td width="33%" align="center">

### 🔒 Secure & Private
Enterprise-grade security with OAuth, JWT, and encrypted database storage

</td>
</tr>
</table>

---

## 🎯 Key Features

<details open>
<summary><b>📄 Multi-Format Document Processing</b></summary>
<br>

- ✅ **PDF Support** - Extract text from any PDF document
- ✅ **Word Documents** - Process .docx and .doc files seamlessly
- ✅ **Plain Text** - Paste or type content directly
- ✅ **Batch Processing** - Handle multiple files at once

</details>

<details open>
<summary><b>🧠 Intelligent AI Features</b></summary>
<br>

- 🎯 **Smart Summarization** - GPT-4 powered bullet-point generation
- 📝 **Auto Title Generation** - Intelligent titles based on content
- 🏷️ **Auto-Tagging** (Coming Soon) - Automatic tag suggestions
- 📊 **Sentiment Analysis** (Coming Soon) - Understand document tone

</details>

<details open>
<summary><b>🗂️ Organization & Management</b></summary>
<br>

- 📁 **Folder System** - Create folders with custom colors
- 🏷️ **Tagging** - Tag notes for better categorization
- 🔍 **Powerful Search** - Full-text search with fuzzy matching
- ⭐ **Favorites & Pinning** - Quick access to important notes
- 📜 **Version History** - Track changes and restore previous versions

</details>

<details open>
<summary><b>🌐 Export & Sharing</b></summary>
<br>

- 📥 **Multiple Formats** - Export to PDF, Word, Markdown, HTML, JSON
- 🔗 **Shareable Links** - Generate secure sharing links
- 🔐 **Permission Control** - Set view-only or edit access
- ⏰ **Expiration Dates** - Time-limited sharing
- 📱 **Responsive Design** - Access from any device

</details>

<details open>
<summary><b>🎨 User Experience</b></summary>
<br>

- 🌓 **Dark/Light Mode** - Full theme customization
- 📱 **Responsive Design** - Perfect on desktop, tablet, and mobile
- ⚡ **Real-time Updates** - Instant UI feedback
- 🔔 **Toast Notifications** - User-friendly action feedback
- ♿ **Accessibility** - WCAG compliant interface

</details>

---

## 🛠️ Tech Stack

<div align="center">

### Frontend
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

### Backend & Database
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)

### AI & Processing
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)

### Authentication
![NextAuth](https://img.shields.io/badge/NextAuth-000000?style=for-the-badge&logo=next.js&logoColor=white)
![Google](https://img.shields.io/badge/Google_OAuth-4285F4?style=for-the-badge&logo=google&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub_OAuth-181717?style=for-the-badge&logo=github&logoColor=white)

</div>

---

## 🚀 Quick Start

### Prerequisites

```bash
# Required
Node.js 18+
PostgreSQL 14+
OpenAI API Key

# Optional (for OAuth)
Google OAuth Credentials
GitHub OAuth Credentials
```

### Installation

<details>
<summary><b>📦 Step 1: Clone and Install</b></summary>

```bash
# Clone the repository
git clone https://github.com/yourusername/short-notes.git
cd short-notes

# Install dependencies
npm install
```

</details>

<details>
<summary><b>⚙️ Step 2: Environment Setup</b></summary>

```bash
# Copy environment template
cp .env.example .env.local
```

Configure your `.env.local`:

```env
# 🗄️ Database
DATABASE_URL="postgresql://user:password@localhost:5432/short_notes_db"

# 🔐 Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-min-32-chars"

# 🤖 OpenAI API
OPENAI_API_KEY="sk-your-openai-api-key"
OPENAI_MODEL="gpt-4-turbo-preview"

# 🔑 OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

</details>

<details>
<summary><b>🗃️ Step 3: Database Setup</b></summary>

```bash
# Create PostgreSQL database
createdb short_notes_db

# Run Prisma migrations
npx prisma generate
npx prisma db push

# (Optional) Seed sample data
npm run seed
```

</details>

<details>
<summary><b>▶️ Step 4: Launch</b></summary>

```bash
# Start development server
npm run dev

# Open browser to
# http://localhost:3000
```

</details>

---

## 📖 Usage Guide

### Creating Your First Note

```bash
1. 📤 Upload a Document
   └─ Click "New Note" → Upload PDF/Word or paste text

2. 🤖 AI Processing
   └─ GPT-4 automatically generates title & bullet points

3. ✏️ Edit & Organize
   └─ Add tags, move to folders, customize as needed

4. 💾 Auto-Save
   └─ All changes saved automatically with version history
```

### Organizing Notes

| Feature | Description | Shortcut |
|---------|-------------|----------|
| 📁 **Folders** | Create custom folders with colors | `Ctrl+Shift+N` |
| 🏷️ **Tags** | Add multiple tags per note | `Ctrl+T` |
| ⭐ **Favorites** | Star important notes | `Ctrl+D` |
| 📌 **Pin** | Pin notes to top | `Ctrl+P` |
| 🔍 **Search** | Full-text search | `Ctrl+K` |

### Exporting Notes

<table>
<tr>
<td align="center">📄<br><b>PDF</b></td>
<td align="center">📝<br><b>Word</b></td>
<td align="center">📋<br><b>Markdown</b></td>
<td align="center">🌐<br><b>HTML</b></td>
<td align="center">📊<br><b>JSON</b></td>
</tr>
</table>

```typescript
// Export via API
const response = await fetch(`/api/notes/${noteId}/export/pdf`);
const blob = await response.blob();
```

### Sharing Notes

```bash
🔗 Generate Link → Set Permissions → Share
   ├─ 👁️ View Only (read-only access)
   ├─ ✏️ Edit Access (full editing rights)
   └─ ⏰ Expiration (optional time limit)
```

---

## 🏗️ Project Structure

```
Short_Notes_App/
├── 📂 prisma/
│   └── schema.prisma              # Database schema & models
├── 📂 public/
│   └── uploads/                   # Temporary file storage
├── 📂 src/
│   ├── 📂 app/
│   │   ├── 📂 api/                # API routes
│   │   │   ├── auth/              # Authentication endpoints
│   │   │   ├── notes/             # Note CRUD operations
│   │   │   ├── folders/           # Folder management
│   │   │   └── upload/            # File upload handler
│   │   ├── 📂 (auth)/             # Auth pages (login, register)
│   │   ├── 📂 dashboard/          # Main application
│   │   │   ├── page.tsx           # Dashboard home
│   │   │   ├── notes/             # Note pages
│   │   │   └── settings/          # User settings
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Landing page
│   │   └── globals.css            # Global styles
│   ├── 📂 components/
│   │   ├── 📂 ui/                 # Reusable UI components
│   │   ├── 📂 dashboard/          # Dashboard-specific components
│   │   ├── 📂 editors/            # Note editor components
│   │   └── landing-page.tsx       # Landing page component
│   ├── 📂 lib/
│   │   ├── auth.ts                # NextAuth configuration
│   │   ├── prisma.ts              # Prisma client instance
│   │   ├── openai.ts              # OpenAI integration
│   │   ├── 📂 parsers/            # Document parsers
│   │   │   ├── pdf.ts             # PDF parser
│   │   │   └── docx.ts            # Word parser
│   │   ├── 📂 export/             # Export utilities
│   │   │   ├── pdf.ts             # PDF export
│   │   │   ├── docx.ts            # Word export
│   │   │   └── markdown.ts        # Markdown export
│   │   ├── helpers.ts             # Helper functions
│   │   └── utils.ts               # Utility functions
│   └── 📂 types/
│       └── index.ts               # TypeScript definitions
├── 📄 next.config.js              # Next.js configuration
├── 📄 tsconfig.json               # TypeScript config
├── 📄 tailwind.config.js          # Tailwind CSS config
├── 📄 postcss.config.js           # PostCSS config
└── 📄 package.json                # Dependencies & scripts
```

---

## 🔌 API Reference

### Authentication

```typescript
// Register new user
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure_password"
}

// Login (handled by NextAuth)
POST /api/auth/signin
```

### Notes

```typescript
// Get all notes (paginated)
GET /api/notes?page=1&limit=10&search=query&tag=important

// Create note
POST /api/notes
{
  "title": "Meeting Notes",
  "content": "Bullet points...",
  "folderId": "folder_id",
  "tags": ["meeting", "work"]
}

// Get specific note
GET /api/notes/[id]

// Update note
PUT /api/notes/[id]
{
  "title": "Updated Title",
  "content": "Updated content..."
}

// Delete note
DELETE /api/notes/[id]

// Share note
POST /api/notes/[id]/share
{
  "isPublic": true,
  "canEdit": false,
  "expiresAt": "2024-12-31T23:59:59Z"
}

// Export note
GET /api/notes/[id]/export/[format]
// formats: pdf, docx, markdown, html, json
```

### File Upload

```typescript
// Upload and process document
POST /api/upload
Content-Type: multipart/form-data
{
  file: File // PDF or DOCX
}

Response:
{
  "title": "Generated Title",
  "content": "Extracted text...",
  "summary": "AI-generated summary",
  "bulletPoints": ["Point 1", "Point 2"]
}
```

### Folders

```typescript
// Get all folders
GET /api/folders

// Create folder
POST /api/folders
{
  "name": "Work Notes",
  "color": "#3b82f6"
}
```

---

## 🔐 Security Features

<table>
<tr>
<td width="50%">

### 🛡️ Authentication
- ✅ Password hashing (bcryptjs)
- ✅ JWT session management
- ✅ OAuth 2.0 (Google, GitHub)
- ✅ Session expiration
- ✅ CSRF protection

</td>
<td width="50%">

### 🔒 Data Protection
- ✅ SQL injection prevention (Prisma)
- ✅ XSS protection (React escaping)
- ✅ CORS protection (Next.js)
- ✅ Rate limiting ready
- ✅ Secure headers

</td>
</tr>
</table>

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/short-notes)

```bash
# 1. Push to GitHub
git push origin main

# 2. Import to Vercel
# 3. Add environment variables
# 4. Deploy! 🎉
```

### Docker Deployment

```dockerfile
# Build image
docker build -t short-notes .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e NEXTAUTH_SECRET="..." \
  -e OPENAI_API_KEY="..." \
  short-notes
```

### Environment Variables for Production

```env
# ⚠️ Update these for production
DATABASE_URL="postgresql://prod-user:prod-pass@prod-host/db"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
OPENAI_API_KEY="sk-prod-api-key"
NODE_ENV="production"
```

---

## 🐛 Troubleshooting

<details>
<summary><b>Database Connection Issues</b></summary>

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -U postgres -c "SELECT version();"

# Reset database
npx prisma db push --force-reset
```

</details>

<details>
<summary><b>OpenAI API Errors</b></summary>

```bash
# Test API key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Check rate limits
# Visit: https://platform.openai.com/account/rate-limits
```

</details>

<details>
<summary><b>File Upload Issues</b></summary>

```bash
# Check disk space
df -h

# Verify upload directory permissions
chmod 755 public/uploads

# Check file size limits in next.config.js
```

</details>

<details>
<summary><b>Build Errors</b></summary>

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

</details>

---

## 📚 Documentation

- 📖 [User Guide](docs/USER_GUIDE.md) - Complete usage documentation
- 🛠️ [API Documentation](docs/API.md) - Full API reference
- 🏗️ [Architecture](docs/ARCHITECTURE.md) - System design details
- 🤝 [Contributing](CONTRIBUTING.md) - Contribution guidelines
- 📝 [Changelog](CHANGELOG.md) - Version history

---

## 🗺️ Roadmap

### 🎯 Version 2.0 (Q2 2024)

- [ ] 🤝 Real-time collaboration with WebSockets
- [ ] 🏷️ Auto-tagging with AI
- [ ] 📊 Advanced analytics dashboard
- [ ] 🎨 Custom summarization templates
- [ ] 🌍 Multi-language support

### 🚀 Version 3.0 (Q4 2024)

- [ ] 📱 Mobile apps (iOS/Android)
- [ ] 🔗 API for third-party integrations
- [ ] 👥 Team workspaces
- [ ] 📈 Usage insights & statistics
- [ ] 🔌 Browser extension

### 💡 Future Ideas

- [ ] Voice-to-text notes
- [ ] AI-powered search improvements
- [ ] Custom AI model training
- [ ] Offline support (PWA)
- [ ] Integration with popular tools (Notion, Slack, etc.)

[View Full Roadmap →](docs/ROADMAP.md)

---

## 🤝 Contributing

We love contributions! 🎉

<table>
<tr>
<td align="center">
<b>🐛 Found a Bug?</b><br>
<a href="https://github.com/yourusername/short-notes/issues">Report it</a>
</td>
<td align="center">
<b>💡 Have an Idea?</b><br>
<a href="https://github.com/yourusername/short-notes/issues">Suggest it</a>
</td>
<td align="center">
<b>🔧 Want to Code?</b><br>
<a href="CONTRIBUTING.md">Contribute</a>
</td>
</tr>
</table>

### Quick Contribution Guide

```bash
# 1. Fork the repository
# 2. Create your feature branch
git checkout -b feature/amazing-feature

# 3. Commit your changes
git commit -m '✨ Add amazing feature'

# 4. Push to the branch
git push origin feature/amazing-feature

# 5. Open a Pull Request
```

Please read our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting PRs.

---

## 📊 Project Stats

<div align="center">

![GitHub stars](https://img.shields.io/github/stars/yourusername/short-notes?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/short-notes?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/short-notes)
![GitHub pull requests](https://img.shields.io/github/issues-pr/yourusername/short-notes)
![GitHub contributors](https://img.shields.io/github/contributors/yourusername/short-notes)
![GitHub last commit](https://img.shields.io/github/last-commit/yourusername/short-notes)

</div>

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Sadeesha Jay

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

## 💖 Acknowledgments

Built with love using:
- [Next.js](https://nextjs.org/) - The React Framework
- [OpenAI](https://openai.com/) - AI-powered summarization
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [Vercel](https://vercel.com/) - Deployment platform

Special thanks to all our [contributors](https://github.com/yourusername/short-notes/graphs/contributors)! 🙏

---

## 📞 Support & Community

<div align="center">

### Need Help?

[![Discord](https://img.shields.io/badge/Discord-Join_Chat-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/shortnotes)
[![Twitter](https://img.shields.io/badge/Twitter-Follow_Us-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/shortnotes)
[![Email](https://img.shields.io/badge/Email-Contact_Us-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:support@shortnotes.com)

### Show Your Support

If you find Short Notes helpful, please consider:

⭐ Starring the repo
🐦 Sharing on Twitter
💬 Joining our Discord
☕ [Buy me a coffee](https://buymeacoffee.com/shortnotes)

</div>

---

<div align="center">

**[⬆ Back to Top](#-short-notes)**

Made with ❤️ by [Sadeesha Jay](https://github.com/sadeeshajay)

*Transform your note-taking workflow today!*

</div>
