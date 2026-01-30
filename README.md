# Short Notes - AI-Powered Note Taking Application

A fullstack AI-powered notes application that automatically converts long documents, PDFs, and Word files into concise bullet-point summaries using OpenAI's GPT-4.

## 🌟 Features

### Core Features
- **Multi-Format Support**: Upload PDFs, Word documents, or paste text
- **AI-Powered Summarization**: Automatically converts content into bullet-point summaries using GPT-4
- **Auto Title Generation**: Intelligent title generation based on content
- **Version History**: Track all changes and restore previous versions

### Organization & Management
- **Folder Organization**: Create and organize notes into folders with custom colors
- **Tags System**: Tag notes for better categorization and search
- **Search Functionality**: Full-text search across all notes with fuzzy matching
- **Favorites & Pinning**: Mark important notes as favorites or pin them

### Export & Sharing
- **Multiple Export Formats**: Export to PDF, Word (.docx), Markdown, HTML, and JSON
- **Easy Sharing**: Generate shareable links with configurable permissions
- **Share Control**: Set expiration dates and edit permissions for shared notes

### User Experience
- **Dark/Light Mode**: Full theme support with next-themes
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Real-time Updates**: Instant UI updates with React
- **Toast Notifications**: User-friendly feedback for all actions

### Security & Authentication
- **Email/Password Authentication**: Secure signup with bcryptjs hashing
- **OAuth Integration**: Sign in with Google or GitHub
- **Session Management**: JWT-based session handling with NextAuth
- **Database Encryption**: Secure data storage with Prisma

## 🚀 Tech Stack

### Frontend
- **Next.js 14**: Modern React framework with App Router
- **React 18**: UI component library
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Beautiful icon library
- **React Hot Toast**: Toast notifications
- **Next Themes**: Dark mode support

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **Node.js**: JavaScript runtime

### Database
- **PostgreSQL**: Reliable relational database
- **Prisma ORM**: Type-safe database client with migrations

### AI & Document Processing
- **OpenAI GPT-4**: Text summarization and analysis
- **pdf-parse**: PDF text extraction
- **mammoth**: Word document parsing

### Export & Integration
- **jsPDF**: PDF generation
- **docx**: Word document generation
- **Marked**: Markdown parsing
- **html2canvas**: HTML to image conversion

### Authentication & Security
- **NextAuth.js**: Authentication and authorization
- **bcryptjs**: Password hashing
- **OAuth 2.0**: Google & GitHub integration

### Testing & Quality
- **TypeScript**: Type safety
- **ESLint**: Code linting
- **Zod**: Schema validation

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- OpenAI API key (for GPT-4 summarization)
- Google OAuth credentials (optional)
- GitHub OAuth credentials (optional)

## 🔧 Installation

1. **Clone the repository**
```bash
cd Short_Notes_App
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Configure the following in `.env.local`:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/short_notes_db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# OpenAI API
OPENAI_API_KEY="sk-your-api-key"
OPENAI_MODEL="gpt-4-turbo-preview"

# OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

4. **Set up the database**
```bash
# Create a new PostgreSQL database
createdb short_notes_db

# Run Prisma migrations
npm run db:push
```

5. **Start the development server**
```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

## 🗂️ Project Structure

```
Short_Notes_App/
├── prisma/
│   └── schema.prisma           # Database schema
├── public/
│   └── uploads/                # Temporary file storage
├── src/
│   ├── app/
│   │   ├── api/                # API routes
│   │   ├── (auth)/             # Authentication pages
│   │   ├── dashboard/          # Main app pages
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── ui/                 # UI components
│   │   ├── dashboard/          # Dashboard components
│   │   └── landing-page.tsx    # Landing page
│   ├── lib/
│   │   ├── auth.ts             # NextAuth configuration
│   │   ├── prisma.ts           # Prisma client
│   │   ├── openai.ts           # OpenAI integration
│   │   ├── parsers/            # Document parsers
│   │   ├── export/             # Export utilities
│   │   ├── helpers.ts          # Helper functions
│   │   └── utils.ts            # Utility functions
│   └── types/
│       └── index.ts            # TypeScript types
├── next.config.js              # Next.js configuration
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
└── package.json                # Dependencies
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth endpoint

### Notes
- `GET /api/notes` - Get all notes (paginated)
- `POST /api/notes` - Create new note
- `GET /api/notes/[id]` - Get specific note
- `PUT /api/notes/[id]` - Update note
- `DELETE /api/notes/[id]` - Delete note
- `POST /api/notes/[id]/share` - Share note
- `DELETE /api/notes/[id]/share` - Remove share
- `GET /api/notes/[id]/export/[format]` - Export note

### Files
- `POST /api/upload` - Upload and process document

### Folders
- `GET /api/folders` - Get all folders
- `POST /api/folders` - Create folder

## 🎯 Usage Guide

### Creating a Note

1. Click **"New Note"** button in the dashboard
2. Either:
   - Upload a PDF/Word document
   - Paste or type text
3. The app will automatically:
   - Extract text from documents
   - Generate a title
   - Create a summary
   - Generate bullet points

### Organizing Notes

1. Create folders to organize notes
2. Move notes to folders
3. Add tags for better categorization
4. Use search to find notes quickly

### Exporting Notes

1. Open a note
2. Click the export button
3. Choose format: PDF, Word, Markdown, HTML, or JSON
4. Download the exported file

### Sharing Notes

1. Open a note
2. Click share button
3. Toggle public/private
4. Set permissions (view only or edit)
5. Set expiration date (optional)
6. Copy and share the link

## 🔐 Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **Session Management**: JWT tokens with NextAuth.js
- **CORS Protection**: Built-in Next.js protection
- **SQL Injection Prevention**: Prisma parameterized queries
- **XSS Protection**: React's built-in escaping
- **Rate Limiting**: Implement on API routes as needed

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

### Docker

```bash
# Build Docker image
docker build -t short-notes .

# Run container
docker run -p 3000:3000 short-notes
```

### Environment Variables for Production

```env
DATABASE_URL="postgresql://prod-user:prod-password@prod-host/short_notes_db"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="generate-secure-secret"
OPENAI_API_KEY="sk-prod-api-key"
```

## 📚 Advanced Features

### Version History

All note changes are automatically saved. Access version history to:
- View previous versions
- Compare versions
- Restore old versions

### Search

Advanced search supports:
- Full-text search across notes
- Fuzzy matching for typos
- Search by tags
- Filter by date range

### Collaboration

- Share notes with custom permissions
- View-only mode for shared notes
- Optional edit permissions

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
psql -U postgres

# Verify database exists
psql -l | grep short_notes_db

# Reset migrations
npm run db:push
```

### OpenAI API Errors
- Verify API key is valid
- Check API quotas and rate limits
- Ensure model name is correct

### File Upload Issues
- Check file size limits
- Verify file format is supported
- Check disk space

## 📄 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues and questions:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Include error logs and steps to reproduce

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Guide](https://next-auth.js.org)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🗺️ Roadmap

- [ ] Real-time collaboration with WebSockets
- [ ] Advanced AI features (auto-tagging, sentiment analysis)
- [ ] Batch processing for multiple files
- [ ] Custom summarization templates
- [ ] Team collaboration features
- [ ] Advanced analytics and insights
- [ ] Mobile native apps (iOS/Android)
- [ ] API for third-party integrations
- [ ] Custom AI model training
- [ ] Offline support with service workers

---

Made with ❤️ for smarter note-taking
