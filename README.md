# Student Notes Hub

A full-stack web application for students to upload, download, and share notes with real-time chat functionality.

## Features

### Frontend (React + TailwindCSS)
- **Pages**: Home, Login/Signup, Upload Notes, Notes by Semester, Community, Profile
- **File Upload**: Support for PDF, DOCX, PPT files with metadata
- **Notes Display**: Card layout with download, like, and share functionality
- **Search & Filter**: Filter by semester and subject
- **Community**: Posts, comments, and upvotes system
- **Real-time Chat**: Semester-based chat rooms using Socket.IO
- **Responsive Design**: Mobile-first approach with TailwindCSS

### Backend (Node.js + Express)
- **Authentication**: JWT-based auth with role management
- **File Storage**: Cloudinary integration for file uploads
- **Real-time Features**: Socket.IO for chat and notifications
- **RESTful API**: CRUD operations for all resources
- **Rate Limiting**: Protection against abuse
- **Error Handling**: Comprehensive error handling and validation

### Database (MongoDB)
- **Users**: Profile management with semester and role
- **Notes**: File metadata with likes, downloads, and analytics
- **Posts**: Community posts with replies and voting
- **Chats**: Real-time messaging per semester
- **Notifications**: System for user engagement

## Tech Stack

### Frontend
- React 19
- React Router DOM
- TailwindCSS 4
- Axios
- Socket.IO Client
- React Hot Toast
- Lucide React Icons
- Vite

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.IO
- JWT Authentication
- Cloudinary
- Multer
- Bcryptjs
- Helmet (Security)
- CORS
- Rate Limiting

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- Cloudinary account (for file uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd campus-share
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Copy environment variables
   cp .env.example .env
   
   # Edit .env with your configuration
   # - MongoDB URI
   # - JWT Secret
   # - Cloudinary credentials
   # - Email configuration
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   
   # Copy environment variables
   cp .env.example .env
   
   # Edit .env with your API URL
   ```

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/student-notes-hub
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Running the Application

1. **Start MongoDB**
   ```bash
   mongod
   ```

2. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```

3. **Start Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/health

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Notes
- `POST /api/notes/upload` - Upload note
- `GET /api/notes` - Get notes with filters
- `GET /api/notes/:id` - Get single note
- `POST /api/notes/:id/like` - Toggle like
- `GET /api/notes/:id/download` - Download note
- `POST /api/notes/:id/share` - Generate share link

### Community Posts
- `POST /api/posts` - Create post
- `GET /api/posts` - Get posts
- `GET /api/posts/:id` - Get single post
- `POST /api/posts/:id/vote` - Vote on post
- `POST /api/posts/:id/reply` - Add reply
- `DELETE /api/posts/:id` - Delete post

### Chat
- `GET /api/chat/:semesterId` - Get chat messages
- `POST /api/chat/:semesterId` - Send message
- `PUT /api/chat/:messageId` - Edit message
- `DELETE /api/chat/:messageId` - Delete message
- `POST /api/chat/:messageId/reaction` - Add reaction

### Statistics
- `GET /api/stats/dashboard` - User dashboard stats
- `GET /api/stats/leaderboard` - Community leaderboard
- `GET /api/stats/general` - General platform stats

## Socket.IO Events

### Client to Server
- `join-room` - Join semester chat room
- `leave-room` - Leave chat room
- `send-message` - Send chat message
- `edit-message` - Edit message
- `delete-message` - Delete message
- `add-reaction` - Add emoji reaction
- `typing-start` - Start typing indicator
- `typing-stop` - Stop typing indicator

### Server to Client
- `new-message` - New chat message
- `message-edited` - Message edited
- `message-deleted` - Message deleted
- `reaction-updated` - Reaction updated
- `user-typing` - User typing indicator
- `user-connected` - User connected
- `user-disconnected` - User disconnected
- `notification` - System notification
- `new-note-notification` - New note uploaded

## Features Overview

### File Management
- Upload PDF, DOCX, PPT files
- Cloudinary storage with automatic optimization
- File type validation and size limits
- Download tracking and analytics

### Social Features
- Like and share notes
- Community posts with voting
- Real-time chat by semester
- User profiles and leaderboards

### Search & Discovery
- Filter notes by semester and subject
- Search by title, description, or tags
- Sort by date, popularity, or downloads
- Related notes suggestions

### Notifications
- Real-time notifications for likes, downloads
- Email notifications for important events
- In-app notification system
- Push notifications (future enhancement)

## Deployment

### Backend Deployment
1. Set up MongoDB Atlas or your preferred MongoDB hosting
2. Configure Cloudinary for production
3. Set up email service (Gmail, SendGrid, etc.)
4. Deploy to Heroku, DigitalOcean, or AWS
5. Update environment variables for production

### Frontend Deployment
1. Build the frontend: `npm run build`
2. Deploy to Netlify, Vercel, or serve static files
3. Update API URLs for production environment

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@studentnoteshub.com or create an issue in the repository.

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced search with AI
- [ ] Video notes support
- [ ] Study groups and collaboration
- [ ] Gamification features
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Offline mode capabilities
