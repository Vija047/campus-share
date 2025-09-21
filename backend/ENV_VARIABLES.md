# Environment Variables for Campus Share Backend

## Required Environment Variables

### Database
- `MONGODB_URI` - MongoDB connection string (required)
  Example: `mongodb+srv://username:password@cluster.mongodb.net/campus-share`

### Authentication
- `JWT_SECRET` - Secret key for JWT token signing (required)
  Example: Generate a random 32+ character string
- `JWT_EXPIRES_IN` - JWT token expiration time (optional, defaults to '7d')
  Example: `7d`, `24h`, `30m`

### Cloudinary (File Storage) - Required for file uploads
- `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Your Cloudinary API key
- `CLOUDINARY_API_SECRET` - Your Cloudinary API secret

### Email Configuration (Required for email features)
- `EMAIL_HOST` - SMTP host (e.g., smtp.gmail.com)
- `EMAIL_PORT` - SMTP port (e.g., 587)
- `EMAIL_USER` - Email address for sending emails
- `EMAIL_PASS` - Email password or app-specific password

### Application Configuration
- `NODE_ENV` - Environment mode (production/development)
- `PORT` - Server port (defaults to 5000, Render uses 10000)
- `FRONTEND_URL` - Frontend application URL for CORS and shared links
  Example: `https://your-frontend-app.vercel.app`

### Rate Limiting (Optional)
- `RATE_LIMIT_WINDOW_MS` - Rate limit window in milliseconds (defaults to 900000 = 15 minutes)
- `RATE_LIMIT_MAX` - Maximum requests per window (defaults to 500)

## Render Deployment Setup

1. In your Render dashboard, go to your web service
2. Go to the "Environment" tab
3. Add all the required environment variables listed above
4. Make sure to set:
   - `NODE_ENV=production`
   - `PORT=10000` (Render's default)
   - `FRONTEND_URL` to your actual frontend URL

## Security Notes
- Never commit actual environment variable values to Git
- Use strong, unique values for JWT_SECRET
- Use app-specific passwords for email authentication
- Ensure your MongoDB user has appropriate permissions only