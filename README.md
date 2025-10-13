# Campus Share - Student Notes Hub 

A comprehensive MERN stack application designed to facilitate note sharing, collaboration, and community building among students. This platform enables students to upload, share, discover academic notes, engage in real-time chat, and build a supportive learning community.

## 🌟 Features

### Core Features
- **📝 Note Management**: Upload, organize, and share academic notes with advanced categorization
- **🤖 AI-Powered Analysis**: Automatic document analysis with GPT for summaries, key topics, and difficulty assessment (NEW!)
- **🔍 Smart Search**: Powerful search functionality with AI-enhanced topic discovery
- **💬 Real-time Chat**: Instant messaging system for student collaboration
- **📱 Community Posts**: Share updates, questions, and academic discussions
- **🔖 Bookmarking**: Save and organize favorite notes for quick access
- **📊 Dashboard Analytics**: Track your contributions and engagement metrics
- **🔔 Smart Notifications**: Stay updated with real-time notifications

### Advanced Features
- **🎯 Content Extraction**: Automatic text extraction from uploaded documents (PDF, DOCX)
- **🧠 AI Insights**: Get instant summaries, key topics, difficulty levels, and prerequisites for any PDF
- **☁️ Cloud Storage**: Secure file storage with Cloudinary integration
- **🛡️ Security**: JWT authentication, rate limiting, and input validation
- **📧 Email Integration**: Password reset and notification emails
- **🔄 Real-time Updates**: Socket.io integration for instant updates
- **📱 Responsive Design**: Mobile-first design with Tailwind CSS

## 🛠️ Tech Stack

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

## 🚀 Getting Started

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

## 📁 Project Structure

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

## 🔧 API Endpoints

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

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Rate Limiting** - Prevent API abuse and DOS attacks
- **Input Validation** - Comprehensive request validation
- **Password Hashing** - Bcrypt for secure password storage
- **CORS Configuration** - Controlled cross-origin requests
- **Helmet Integration** - Security headers and protection
- **File Upload Security** - Validated file types and sizes

## 🚀 Deployment

### Backend Deployment (Vercel)
1. Install Vercel CLI: `npm i -g vercel`
2. Configure `vercel.json` in backend directory
3. Deploy: `vercel --prod`

### Frontend Deployment (Vercel)
1. Build the project: `npm run build`
2. Configure `vercel.json` in frontend directory
3. Deploy: `vercel --prod`

### Environment Variables for Production
Make sure to set all environment variables in your deployment platform:
- Database connection string
- JWT secret
- Cloudinary credentials
- Email service credentials

## � AI-Powered Document Analysis

Campus Share now includes intelligent document analysis powered by OpenAI GPT! This feature automatically analyzes uploaded PDFs to help students quickly understand resource content.

### What You Get
- **📝 Smart Summaries**: 2-3 sentence overview of each document
- **🎯 Key Topics**: Main subjects covered (3-5 topics)
- **🏆 Difficulty Level**: Beginner, Intermediate, Advanced, or Expert
- **⏱️ Read Time**: Estimated time to go through the material
- **💡 Main Concepts**: Core ideas and concepts explained
- **📚 Prerequisites**: Suggested prior knowledge needed

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

📚 **Full documentation**: See [AI_QUICK_START.md](AI_QUICK_START.md) and [AI_FEATURE_README.md](AI_FEATURE_README.md)

---

## �🤝 Contributing

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

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **MongoDB** for the robust database solution
- **React Team** for the amazing frontend library
- **Tailwind CSS** for the beautiful styling framework
- **Socket.io** for real-time communication
- **Cloudinary** for reliable file storage
- **OpenAI** for powerful AI document analysis
- **Vercel** for seamless deployment

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/Vija047/campus-share/issues) page
2. Create a new issue if your problem isn't already addressed
3. Provide detailed information about your problem
4. Include error messages and steps to reproduce

## 🎯 Future Enhancements

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

**Happy Learning! 🎓**

Built with ❤️ by the Campus Share team for students, by students.
