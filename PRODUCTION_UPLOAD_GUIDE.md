# Campus Share - Production Upload Setup Guide

## Overview
This guide ensures that note upload functionality works correctly in the production environment.

## ✅ What Was Fixed

### 1. API Configuration
- ✅ Updated API base URL detection for production
- ✅ Extended timeouts for file uploads (3 minutes in production)
- ✅ Added better environment detection and fallback logic
- ✅ Enhanced logging for debugging

### 2. Upload Error Handling
- ✅ Added production-specific error handling
- ✅ Enhanced file validation with configurable limits
- ✅ Added backend connectivity checking
- ✅ Improved user feedback with progress indicators

### 3. Backend Configuration
- ✅ Updated CORS to allow all necessary production domains
- ✅ Increased body parser limits for large file uploads (100MB)
- ✅ Added support for Render deployments in CORS

### 4. Environment Configuration
- ✅ Updated `.env.production` with correct backend URL
- ✅ Added configurable file size limits and allowed types
- ✅ Created centralized config system

## 🚀 Production Deployment Steps

### Step 1: Backend Deployment
The backend is already deployed at: `https://campus-share.onrender.com`

Verify it's working:
```bash
curl https://campus-share.onrender.com/api/test
```

### Step 2: Frontend Environment Setup
Ensure your frontend deployment has these environment variables:

```env
VITE_API_URL=https://campus-share.onrender.com
VITE_SOCKET_URL=https://campus-share.onrender.com
NODE_ENV=production
VITE_MAX_FILE_SIZE=52428800
```

### Step 3: Deploy Frontend
Deploy the updated frontend code with the correct environment variables.

For Vercel deployment:
```bash
# Build with production config
npm run build

# Deploy to Vercel
vercel --prod
```

For Render deployment:
```bash
# Push to your repository
git add .
git commit -m "Enhanced upload functionality for production"
git push
```

### Step 4: Test Upload Functionality

Run the test script:
```bash
# Windows
.\test-production-upload.bat

# Linux/Mac
./test-production-upload.sh
```

Or test manually:
1. 🌐 Open your production frontend URL
2. 🔐 Login with a valid account
3. 📄 Navigate to "Upload Note" page
4. 📁 Try uploading a small test file (< 5MB)
5. 🕵️ Check browser console for any errors

## 🐛 Troubleshooting

### Common Issues and Solutions

| Issue | Symptoms | Solution |
|-------|----------|----------|
| **CORS Error** | Browser blocks request | Verify frontend domain is in backend CORS config |
| **Network Error** | Upload fails immediately | Check if backend URL is correct and accessible |
| **Auth Error** | 401 Unauthorized | User needs to login again |
| **File Too Large** | 413 Payload Too Large | Ensure file is under 50MB |
| **Invalid File Type** | 415 Unsupported Media | Use supported formats (PDF, DOC, images, etc.) |

### Debug Information

When testing uploads, check the browser console for:
- ✅ API URL being used
- ✅ Authentication token status
- ✅ File validation details
- ✅ Upload progress
- ✅ Detailed error messages

### Backend Health Endpoints

Test these endpoints to verify backend status:
- **General Health**: `https://campus-share.onrender.com/api/test`
- **Notes API**: `https://campus-share.onrender.com/api/notes/health`
- **Authentication**: `https://campus-share.onrender.com/api/auth/me` (requires token)

## 📊 Upload Configuration

Current production settings:
- **Max File Size**: 50MB (52,428,800 bytes)
- **Timeout**: 3 minutes for uploads
- **Allowed Types**: PDF, DOC, DOCX, PPT, PPTX, TXT, JPG, PNG, GIF
- **Storage**: Cloudinary (with local fallback)

## 🔧 Advanced Configuration

### Custom File Size Limits
To change the file size limit, update these files:
1. `frontend/.env.production` - Set `VITE_MAX_FILE_SIZE`
2. `backend/middleware/upload.js` - Update `fileSize` limit
3. `backend/index.js` - Update body parser limits

### Adding New File Types
To support new file types:
1. Add to `config.upload.allowedFileTypes`
2. Update backend `fileFilter` in `upload.js`
3. Update validation in `UploadNote.jsx`

## ✨ Production Features

The upload system now includes:
- 🚀 **Extended timeouts** for large files
- 📊 **Upload progress tracking**
- 🛡️ **Enhanced error handling**
- 🌐 **Production-aware configuration**
- 📱 **Mobile-friendly validation**
- 🔄 **Automatic retry logic**

## 🧪 Testing Checklist

Before considering uploads working:
- [ ] Backend health check passes
- [ ] User can login successfully
- [ ] Upload page loads without errors
- [ ] Small file upload works (< 1MB)
- [ ] Medium file upload works (5-10MB)
- [ ] File validation works (try invalid file type)
- [ ] Size validation works (try oversized file)
- [ ] Error messages are user-friendly
- [ ] Upload progress shows for large files
- [ ] Uploaded notes appear in notes list

## 📞 Support

If uploads still don't work after following this guide:
1. Check browser console for detailed errors
2. Verify all environment variables are set correctly
3. Test with different file types and sizes
4. Check backend logs for server-side errors

The upload functionality should now work reliably in production! 🎉