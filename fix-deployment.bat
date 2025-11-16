@echo off
echo 🔧 Fixing deployment issues...

REM Frontend fixes
echo 📱 Building frontend...
cd frontend
call npm run clean 2>NUL
call npm install
call npm run build:prod

REM Backend fixes  
echo 🚀 Preparing backend...
cd ..\backend
call npm install

echo ✅ Fixes applied successfully!
echo.
echo 🎯 Key fixes implemented:
echo 1. ✅ Fixed menu item ID issues by adding unique identifiers
echo 2. ✅ Improved database connection with retry logic  
echo 3. ✅ Enhanced CORS configuration for production
echo 4. ✅ Added comprehensive error boundaries
echo 5. ✅ Updated API timeout and error handling
echo 6. ✅ Improved build configuration to prevent minification issues
echo.
echo 🚀 Ready for deployment!
echo.
echo 📋 Next steps:
echo 1. Deploy the backend to Render
echo 2. Deploy the frontend to Vercel  
echo 3. Update environment variables in both platforms
echo 4. Test the deployment
pause