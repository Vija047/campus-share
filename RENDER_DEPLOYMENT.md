# Campus Share - Render Deployment Guide

## Overview
This guide will help you deploy your MERN stack Campus Share application to Render. The application will be deployed as:
- **Backend**: Web service on Render
- **Frontend**: Static site on Render
- **Database**: MongoDB Atlas (recommended) or Render PostgreSQL

## Prerequisites
1. GitHub repository with your code
2. Render account (free tier available)
3. MongoDB Atlas account (for database)

## Step 1: Prepare Your Repository

### 1.1 Push Your Code to GitHub
Make sure your latest code is pushed to GitHub:
```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

## Step 2: Set Up MongoDB Database

### Option A: MongoDB Atlas (Recommended)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Set up database access (username/password)
4. Whitelist IP addresses (use `0.0.0.0/0` for all IPs or Render's IP ranges)
5. Get your connection string (it should look like):
   ```
   mongodb+srv://username:password@cluster.mongodb.net/campus_share?retryWrites=true&w=majority
   ```

### Option B: Render PostgreSQL (Alternative)
If you prefer Render's managed database, you'll need to modify your backend to use PostgreSQL instead of MongoDB.

## Step 3: Deploy to Render

### 3.1 Create New Web Service (Backend)
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `campus-share-backend`
   - **Environment**: Node
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 3.2 Configure Backend Environment Variables
Add these environment variables in the Render dashboard:

**Required Variables:**
```bash
NODE_ENV=production
PORT=10000
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=your_jwt_secret_here
```

**Optional Variables (for full functionality):**
```bash
# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Service (for notifications)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=your_email@gmail.com
```

### 3.3 Deploy Backend
1. Click "Create Web Service"
2. Wait for the deployment to complete
3. Your backend will be available at: `https://campus-share-backend.onrender.com`

### 3.4 Create Static Site (Frontend)
1. Go back to Render Dashboard
2. Click "New +" → "Static Site"
3. Connect the same GitHub repository
4. Configure the site:
   - **Name**: `campus-share-frontend`
   - **Branch**: `main`
   - **Root Directory**: Leave empty (it will use the root)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`

### 3.5 Configure Frontend Environment Variables (Optional)
If you want to override the default API URL:
```bash
NODE_ENV=production
VITE_API_URL=https://campus-share-backend.onrender.com/api
VITE_SOCKET_URL=https://campus-share-backend.onrender.com
```

### 3.6 Deploy Frontend
1. Click "Create Static Site"
2. Wait for the deployment to complete
3. Your frontend will be available at: `https://campus-share-frontend.onrender.com`

## Step 4: Update CORS (Already Done)
The CORS configuration has been updated to include:
- `https://campus-share-frontend.onrender.com`
- Local development URLs

## Step 5: Test Your Deployment

### 5.1 Test Backend Health
Visit: `https://campus-share-backend.onrender.com/health`
You should see a JSON response indicating the server is running.

### 5.2 Test Frontend
Visit: `https://campus-share-frontend.onrender.com`
Your React application should load properly.

### 5.3 Test Full Functionality
1. Register a new account
2. Login
3. Upload a note
4. Test chat functionality
5. Test real-time features

## Step 6: Custom Domain (Optional)
If you have a custom domain:
1. In Render dashboard, go to your services
2. Click "Settings" → "Custom Domains"
3. Add your domain and configure DNS

## Troubleshooting

### Common Issues

**1. Backend not connecting to database:**
- Check MongoDB Atlas IP whitelist
- Verify connection string format
- Ensure username/password are correct

**2. CORS errors:**
- Verify frontend URL is in allowedOrigins array
- Check environment variables

**3. Frontend not loading:**
- Check build logs in Render dashboard
- Verify build command and publish directory
- Ensure _redirects file exists for SPA routing

**4. Socket.io connection issues:**
- Verify VITE_SOCKET_URL environment variable
- Check that both HTTP and WebSocket are allowed

**5. File uploads not working:**
- Verify Cloudinary credentials
- Check file size limits in your backend

### Monitoring
- Use Render's built-in monitoring
- Check logs in Render dashboard
- Set up error tracking (Sentry, LogRocket, etc.)

## Environment Variables Summary

### Backend (.env)
```bash
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/campus_share?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=your_email@gmail.com
```

### Frontend (.env - optional)
```bash
NODE_ENV=production
VITE_API_URL=https://campus-share-backend.onrender.com/api
VITE_SOCKET_URL=https://campus-share-backend.onrender.com
```

## Post-Deployment Checklist
- [ ] Backend health check passes
- [ ] Frontend loads without errors
- [ ] User registration/login works
- [ ] File uploads work (if Cloudinary configured)
- [ ] Real-time chat works
- [ ] Email notifications work (if configured)
- [ ] All API endpoints respond correctly
- [ ] Database operations work properly

## Notes
- Render free tier services may "spin down" after 15 minutes of inactivity
- First request after spin-down may take 30+ seconds
- Consider upgrading to paid plans for production use
- Set up monitoring and error tracking for production

Your Campus Share application should now be live and accessible worldwide! 🎉