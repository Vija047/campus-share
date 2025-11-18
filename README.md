# Campus Share - Student Notes Hub 

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Campus%20Share-blue?style=for-the-badge&logo=vercel)](https://campus-share-six.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/Vija047/campus-share)

 **Live Project**: [https://campus-share-six.vercel.app/](https://campus-share-six.vercel.app/)

A comprehensive MERN stack application designed to facilitate note sharing, collaboration, and community building among students. This platform enables students to upload, share, discover academic notes, engage in real-time chat, and build a supportive learning community.

##  Features

### Core Features
- ** Note Management**: Upload, organize, and share academic notes with advanced categorization
- ** AI-Powered Analysis**: Automatic document analysis with GPT for summaries, key topics, and difficulty assessment (NEW!)
- ** Smart Search**: Powerful search functionality with AI-enhanced topic discovery
- ** Real-time Chat**: Instant messaging system for student collaboration
- ** Community Posts**: Share updates, questions, and academic discussions
- ** Bookmarking**: Save and organize favorite notes for quick access
- ** Dashboard Analytics**: Track your contributions and engagement metrics
- ** Smart Notifications**: Stay updated with real-time notifications

### Advanced Features
- ** Content Extraction**: Automatic text extraction from uploaded documents (PDF, DOCX)
- ** AI Insights**: Get instant summaries, key topics, difficulty levels, and prerequisites for any PDF
- ** Cloud Storage**: Secure file storage with Cloudinary integration
- ** Security**: JWT authentication, rate limiting, and input validation
- ** Email Integration**: Password reset and notification emails
- ** Real-time Updates**: Socket.io integration for instant updates
- ** Responsive Design**: Mobile-first design with Tailwind CSS

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **Socket.io** - Real-time bidirectional communication
- **JWT** - Authentication and authorization
- **OpenAI GPT** - AI-powered document analysis and summarization (NEW!)
- **pdf-parse** - PDF text extraction for AI analysis
- **Cloudinary** - Cloud-based image and video management
- **Nodemailer** - Email sending functionality
- **Multer** - File upload handling
- **Bcrypt** - Password hashing

### Frontend
- **React 19** - UI library with latest features
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router v7** - Client-side routing
- **Axios** - HTTP client for API requests
- **Socket.io Client** - Real-time communication
- **React Hot Toast** - Notification system
- **Lucide React** - Modern icon library
- **Headless UI** - Accessible UI components

### Development Tools
- **ESLint** - Code linting and quality
- **Nodemon** - Development server auto-restart
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Express Rate Limit** - API rate limiting

##  Quick Start

###  Live Demo
Experience Campus Share in action: **[https://campus-share-six.vercel.app/](https://campus-share-six.vercel.app/)**

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Vija047/campus-share.git
   cd campus-share
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

### Environment Configuration

Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/campus-share

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@campusshare.com

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   The backend server will start on `http://localhost:5000`

2. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`

##  Project Structure

```
campus-share/
├── backend/                    # Node.js/Express backend
│   ├── controllers/           # Route controllers
│   │   ├── authController.js  # Authentication logic
│   │   ├── noteController.js  # Note management
│   │   ├── postController.js  # Community posts
│   │   └── chatController.js  # Chat functionality
│   ├── middleware/            # Custom middleware
│   │   ├── auth.js           # JWT authentication
│   │   ├── upload.js         # File upload handling
│   │   └── rateLimiter.js    # API rate limiting
│   ├── models/               # Mongoose schemas
│   │   ├── User.js          # User model
│   │   ├── Note.js          # Note model
│   │   ├── Post.js          # Post model
│   │   └── Chat.js          # Chat model
│   ├── routes/               # API routes
│   ├── socket/               # Socket.io handlers
│   ├── utils/                # Utility functions
│   └── uploads/              # File upload directory
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   ├── common/       # Common UI components
│   │   │   ├── layout/       # Layout components
│   │   │   └── notifications/ # Notification components
│   │   ├── pages/            # Page components
│   │   ├── context/          # React contexts
│   │   ├── hooks/            # Custom hooks
│   │   ├── services/         # API services
│   │   └── utils/            # Utility functions
│   └── public/               # Static assets
└── README.md
```

##  API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/profile` - Get user profile

### Notes
- `GET /api/notes` - Get all notes with filtering
- `POST /api/notes` - Upload new note
- `GET /api/notes/:id` - Get specific note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `POST /api/notes/:id/bookmark` - Bookmark/unbookmark note

### Posts
- `GET /api/posts` - Get community posts
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like/unlike post

### Chat
- `GET /api/chat/conversations` - Get user conversations
- `GET /api/chat/messages/:conversationId` - Get conversation messages
- `POST /api/chat/messages` - Send new message

##  Security Features

- **JWT Authentication** - Secure token-based authentication
- **Rate Limiting** - Prevent API abuse and DOS attacks
- **Input Validation** - Comprehensive request validation
- **Password Hashing** - Bcrypt for secure password storage
- **CORS Configuration** - Controlled cross-origin requests
- **Helmet Integration** - Security headers and protection
- **File Upload Security** - Validated file types and sizes

##  Deployment & Workflow

### Production Deployment

#### Live Application
- **Frontend**: [https://campus-share-six.vercel.app/](https://campus-share-six.vercel.app/)
- **Backend API**: Deployed on Render/Railway
- **Database**: MongoDB Atlas

#### Backend Deployment (Render/Railway)
1. **Prepare for deployment**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables** on your hosting platform:
   ```env
   NODE_ENV=production
   MONGODB_URI=your-mongodb-atlas-connection-string
   JWT_SECRET=your-production-jwt-secret
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   OPENAI_API_KEY=your-openai-api-key
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   FRONTEND_URL=https://campus-share-six.vercel.app
   ```

3. **Deploy using Git**
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push origin main
   ```

#### Frontend Deployment (Vercel)
1. **Build and deploy**
   ```bash
   cd frontend
   npm run build
   vercel --prod
   ```

2. **Configure environment variables** in Vercel dashboard:
   ```env
   VITE_API_URL=your-backend-api-url
   VITE_SOCKET_URL=your-backend-socket-url
   ```

### Development Workflow

#### 1. Local Development Setup
```bash
# Clone and setup
git clone https://github.com/Vija047/campus-share.git
cd campus-share

# Install dependencies
npm run install:all  # If you have this script, or run individually:
cd backend && npm install
cd ../frontend && npm install
```

#### 2. Development Servers
```bash
# Terminal 1: Backend (Port 5000)
cd backend
npm run dev

# Terminal 2: Frontend (Port 5173)
cd frontend
npm run dev
```

#### 3. Git Workflow
```bash
# Feature development
git checkout -b feature/new-feature
git add .
git commit -m "Add: new feature description"
git push origin feature/new-feature

# Create PR and merge to main
git checkout main
git pull origin main
git branch -d feature/new-feature
```

#### 4. Testing & Quality Assurance
```bash
# Backend testing
cd backend
npm test

# Frontend linting and building
cd frontend
npm run lint
npm run build
```

### Continuous Integration & Deployment

#### Auto-deployment triggers:
- **Frontend**: Automatically deploys on push to `main` branch via Vercel
- **Backend**: Manually deployed or triggered via webhooks

#### Environment Management:
- **Development**: `http://localhost:5173` (Frontend) + `http://localhost:5000` (Backend)
- **Staging**: Optional staging environment
- **Production**: [https://campus-share-six.vercel.app/](https://campus-share-six.vercel.app/)

### Environment Variables for Production
Make sure to set all environment variables in your deployment platform:
- Database connection string (MongoDB Atlas)
- JWT secret (strong, unique secret)
- Cloudinary credentials (for file storage)
- Email service credentials (for notifications)
- OpenAI API key (for AI features)

## � AI-Powered Document Analysis

Campus Share now includes intelligent document analysis powered by OpenAI GPT! This feature automatically analyzes uploaded PDFs to help students quickly understand resource content.

### What You Get
- ** Smart Summaries**: 2-3 sentence overview of each document
- ** Key Topics**: Main subjects covered (3-5 topics)
- **Difficulty Level**: Beginner, Intermediate, Advanced, or Expert
- ** Read Time**: Estimated time to go through the material
- ** Main Concepts**: Core ideas and concepts explained
- ** Prerequisites**: Suggested prior knowledge needed

### Quick Setup
```bash
# 1. Get OpenAI API key from https://platform.openai.com/
# 2. Add to backend/.env
OPENAI_API_KEY=sk-your-api-key-here

# 3. Restart backend
cd backend
npm start
```

### Usage
- **Automatic**: PDFs are analyzed automatically on upload
- **Manual**: Click "Get AI Summary & Insights" button on any note
- **Search**: Find notes by AI-extracted topics and concepts

 **Full documentation**: See [AI_QUICK_START.md](AI_QUICK_START.md) and [AI_FEATURE_README.md](AI_FEATURE_README.md)

---

##  Project Status & Statistics

[![Deployment Status](https://img.shields.io/website?url=https%3A%2F%2Fcampus-share-six.vercel.app%2F&label=Live%20Demo&style=flat-square)](https://campus-share-six.vercel.app/)
[![GitHub last commit](https://img.shields.io/github/last-commit/Vija047/campus-share?style=flat-square)](https://github.com/Vija047/campus-share/commits/main)
[![GitHub stars](https://img.shields.io/github/stars/Vija047/campus-share?style=flat-square)](https://github.com/Vija047/campus-share/stargazers)

### Features Status
-  User Authentication & Authorization
-  Note Upload & Management
-  AI-Powered Document Analysis
-  Real-time Chat System
-  Community Posts & Discussions
-  Bookmark & Search Functionality
-  Responsive Design
-  Cloud Storage Integration
-  Email Notifications
-  Production Deployment

##  Contributing

We welcome contributions to Campus Share! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style and conventions
- Write meaningful commit messages
- Add appropriate comments to your code
- Test your changes thoroughly
- Update documentation as needed

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  Acknowledgments

- **MongoDB** for the robust database solution
- **React Team** for the amazing frontend library
- **Tailwind CSS** for the beautiful styling framework
- **Socket.io** for real-time communication
- **Cloudinary** for reliable file storage
- **OpenAI** for powerful AI document analysis
- **Vercel** for seamless deployment

## Support & Community

If you encounter any issues or have questions:

1. ** Try the Live Demo**: [https://campus-share-six.vercel.app/](https://campus-share-six.vercel.app/)
2. ** Check Issues**: Visit our [Issues](https://github.com/Vija047/campus-share/issues) page
3. ** Create New Issue**: If your problem isn't addressed, create a detailed issue
4. ** Contact**: Provide error messages and steps to reproduce

### Quick Links
-  **Live Application**: [campus-share-six.vercel.app](https://campus-share-six.vercel.app/)
-  **Repository**: [github.com/Vija047/campus-share](https://github.com/Vija047/campus-share)
- **Report Issues**: [GitHub Issues](https://github.com/Vija047/campus-share/issues)
-  **Documentation**: Available in the repository

##  Future Enhancements

- [x] AI-powered document analysis and summarization
- [ ] Mobile application (React Native)
- [ ] Advanced AI recommendations based on learning patterns
- [ ] Video note sharing and streaming
- [ ] Integration with university LMS systems
- [ ] Multi-language support for AI analysis
- [ ] Dark mode theme
- [ ] Advanced analytics dashboard
- [ ] Collaborative note editing
- [ ] Study group management
- [ ] Calendar integration for exam schedules
- [ ] AI-generated flashcards and quizzes

---

**Happy Learning! **

Built with  by [Vija047](https://github.com/Vija047) for students, by students.

** Don't forget to star the repository if you found it helpful!**

---

*Campus Share - Connecting Students Through Knowledge Sharing*
