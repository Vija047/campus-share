# Campus Share - Deployment Guide

## ✅ Fixed Issues

1. **Backend vercel.json**: Updated with proper serverless function configuration
2. **Frontend vercel.json**: Simplified for Vite SPA deployment
3. **render.yaml**: Updated with correct build commands and environment setup
4. **CORS Configuration**: Made flexible to work with multiple deployment platforms
5. **Environment Variables**: Properly configured for both Vercel and Render

## 🚀 Deployment Instructions

### Option 1: Vercel Deployment (Recommended)

#### Backend Deployment:
1. Create a new project on Vercel
2. Connect your GitHub repository
3. Set root directory to `backend`
4. Add these environment variables in Vercel dashboard:
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   EMAIL_USER=your_email
   EMAIL_PASS=your_email_password
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   GOOGLE_AI_API_KEY=your_google_ai_key
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   ```
5. Deploy

#### Frontend Deployment:
1. Create another project on Vercel
2. Set root directory to `frontend`
3. Add environment variables:
   ```
   VITE_API_URL=https://your-backend-domain.vercel.app
   VITE_SOCKET_URL=https://your-backend-domain.vercel.app
   ```
4. Deploy

### Option 2: Render Deployment

1. Create a new web service on Render
2. Connect your GitHub repository
3. Use the `render.yaml` file in the root (it will deploy both services)
4. Set environment variables in Render dashboard (same as above)

## 🔧 Environment Variables Reference

### Required Backend Variables:
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT token signing
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name for file uploads
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_API_SECRET`: Cloudinary API secret
- `EMAIL_USER`: Email for sending notifications
- `EMAIL_PASS`: Email password or app password
- `GOOGLE_AI_API_KEY`: Google AI API key for chatbot

### Required Frontend Variables:
- `VITE_API_URL`: Backend API URL
- `VITE_SOCKET_URL`: Backend Socket.IO URL

## 🧪 Testing Deployment

After deployment, test these endpoints:
- `GET /health` - Health check
- `GET /api/test` - API connectivity test
- `POST /auth/login` - Authentication test

## 🔍 Troubleshooting

### Common Issues:
1. **CORS Errors**: Ensure frontend URL is added to `ALLOWED_ORIGINS` environment variable
2. **Database Connection**: Verify `MONGODB_URI` is correctly set
3. **File Uploads**: Check Cloudinary credentials
4. **Email Issues**: Use app-specific passwords for Gmail

### Debugging:
- Check deployment logs in Vercel/Render dashboard
- Use the health endpoint to verify service status
- Run `npm run verify-deployment` locally to check configuration

## 📝 Notes

- The backend uses serverless functions on Vercel with 60-second timeout
- File uploads are handled via Cloudinary (not local storage)
- Socket.IO works with both HTTP polling and WebSocket
- CORS is configured for common deployment domains

## 🎉 Success!

Your Campus Share application should now be deployed and functional! 

The key fixes implemented:
- ✅ Proper serverless configuration for Vercel
- ✅ Simplified frontend deployment config
- ✅ Flexible CORS handling
- ✅ Environment variable management
- ✅ Health check endpoints
- ✅ Error handling and logging