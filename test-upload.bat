@echo off
echo Testing Note Upload Functionality...

echo.
echo =================================
echo Campus Share - Upload Test
echo =================================
echo.

echo 1. Testing Backend API Health...
curl -s -o nul -w "%%{http_code}" https://campus-share.onrender.com/api/test > temp_response.txt
set /p response=<temp_response.txt
del temp_response.txt

if "%response%"=="200" (
    echo ✅ Backend API is healthy
) else (
    echo ❌ Backend API is not responding properly ^(Status: %response%^)
    echo Please check backend deployment
    pause
    exit /b 1
)

echo.
echo 2. Testing Notes API Health...
curl -s -o nul -w "%%{http_code}" https://campus-share.onrender.com/api/notes/health > temp_response2.txt
set /p response2=<temp_response2.txt
del temp_response2.txt

if "%response2%"=="200" (
    echo ✅ Notes API is healthy
) else (
    echo ❌ Notes API is not responding properly ^(Status: %response2%^)
)

echo.
echo 3. Checking Frontend Build Configuration...
cd frontend
if exist "dist" (
    echo ✅ Frontend build directory exists
) else (
    echo ⚠️  Frontend not built. Run 'npm run build' first.
)

echo.
echo =================================
echo Test Summary
echo =================================
echo.
echo Backend Status: 
if "%response%"=="200" (echo ✅ Working) else (echo ❌ Failed)
echo Notes API Status: 
if "%response2%"=="200" (echo ✅ Working) else (echo ❌ Failed)

echo.
echo To test upload functionality:
echo 1. Make sure you have built the frontend
echo 2. Deploy both frontend and backend 
echo 3. Try uploading a note through the web interface
echo 4. Check browser console for detailed error messages

pause