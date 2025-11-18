@echo off
setlocal

echo === Campus Share Production Upload Test ===
echo Testing note upload functionality in production...
echo.

set API_URL=https://campus-share.onrender.com

REM Check if API is accessible
echo 1. Testing backend connectivity...
powershell -Command "try { $response = Invoke-WebRequest -Uri '%API_URL%/api/test' -Method Get -TimeoutSec 10; if ($response.StatusCode -eq 200) { Write-Host '✅ Backend is accessible at %API_URL%' -ForegroundColor Green } else { Write-Host '❌ Backend returned status:' $response.StatusCode -ForegroundColor Red } } catch { Write-Host '❌ Backend is not accessible at %API_URL%' -ForegroundColor Red; Write-Host '   Please check if the backend is deployed and running'; exit 1 }"

echo.
echo 2. Testing upload endpoint availability...
powershell -Command "try { $response = Invoke-WebRequest -Uri '%API_URL%/api/notes/upload' -Method Options -TimeoutSec 10; Write-Host '✅ Upload endpoint is accessible' -ForegroundColor Green } catch { Write-Host '⚠️ Upload endpoint OPTIONS check failed (may be normal)' -ForegroundColor Yellow }"

echo.
echo 3. Testing CORS configuration...
powershell -Command "try { $headers = @{'Origin'='https://campus-share-frontend.onrender.com'; 'Access-Control-Request-Method'='POST'; 'Access-Control-Request-Headers'='Content-Type,Authorization'}; $response = Invoke-WebRequest -Uri '%API_URL%/api/notes/upload' -Method Options -Headers $headers -TimeoutSec 10; if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 204) { Write-Host '✅ CORS is configured correctly' -ForegroundColor Green } else { Write-Host '⚠️ CORS preflight returned:' $response.StatusCode -ForegroundColor Yellow } } catch { Write-Host '⚠️ CORS test failed:' $_.Exception.Message -ForegroundColor Yellow }"

echo.
echo 4. Testing authentication requirement...
powershell -Command "try { $response = Invoke-WebRequest -Uri '%API_URL%/api/notes/upload' -Method Post -TimeoutSec 10; Write-Host '⚠️ Unexpected auth response:' $response.StatusCode -ForegroundColor Yellow } catch { if ($_.Exception.Response.StatusCode -eq 401) { Write-Host '✅ Authentication is properly required' -ForegroundColor Green } else { Write-Host '⚠️ Unexpected auth error:' $_.Exception.Response.StatusCode -ForegroundColor Yellow } }"

echo.
echo === Test Summary ===
echo Backend URL: %API_URL%
echo Frontend should be deployed with:
echo   VITE_API_URL=%API_URL%
echo   VITE_SOCKET_URL=%API_URL%
echo.
echo To test upload functionality:
echo 1. Deploy frontend with correct environment variables
echo 2. Login to the application
echo 3. Navigate to Upload Note page
echo 4. Try uploading a small test file
echo 5. Check browser console for any errors
echo.
echo If upload fails, check:
echo - User is logged in
echo - File size is under 50MB
echo - File type is allowed (PDF, DOC, DOCX, PPT, PPTX, TXT, images)
echo - Backend logs for detailed error messages

pause