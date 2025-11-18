#!/bin/bash

echo "=== Campus Share Production Upload Test ==="
echo "Testing note upload functionality in production..."
echo

# Check if API is accessible
echo "1. Testing backend connectivity..."
API_URL="https://campus-share.onrender.com"
if curl -sf "${API_URL}/api/test" > /dev/null 2>&1; then
    echo "✅ Backend is accessible at ${API_URL}"
else
    echo "❌ Backend is not accessible at ${API_URL}"
    echo "   Please check if the backend is deployed and running"
    exit 1
fi

# Check upload endpoint
echo
echo "2. Testing upload endpoint availability..."
if curl -sf -X OPTIONS "${API_URL}/api/notes/upload" > /dev/null 2>&1; then
    echo "✅ Upload endpoint is accessible"
else
    echo "⚠️  Upload endpoint OPTIONS check failed (may be normal)"
fi

# Check CORS configuration
echo
echo "3. Testing CORS configuration..."
CORS_RESPONSE=$(curl -s -X OPTIONS "${API_URL}/api/notes/upload" \
    -H "Origin: https://campus-share-frontend.onrender.com" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: Content-Type,Authorization" \
    -w "%{http_code}" -o /dev/null)

if [ "$CORS_RESPONSE" = "200" ] || [ "$CORS_RESPONSE" = "204" ]; then
    echo "✅ CORS is configured correctly"
else
    echo "⚠️  CORS preflight returned: $CORS_RESPONSE"
fi

# Test with authentication
echo
echo "4. Testing authentication requirement..."
AUTH_RESPONSE=$(curl -s -X POST "${API_URL}/api/notes/upload" \
    -w "%{http_code}" -o /dev/null)

if [ "$AUTH_RESPONSE" = "401" ]; then
    echo "✅ Authentication is properly required"
else
    echo "⚠️  Unexpected auth response: $AUTH_RESPONSE"
fi

echo
echo "=== Test Summary ==="
echo "Backend URL: ${API_URL}"
echo "Frontend should be deployed with:"
echo "  VITE_API_URL=${API_URL}"
echo "  VITE_SOCKET_URL=${API_URL}"
echo
echo "To test upload functionality:"
echo "1. Deploy frontend with correct environment variables"
echo "2. Login to the application"
echo "3. Navigate to Upload Note page"
echo "4. Try uploading a small test file"
echo "5. Check browser console for any errors"
echo
echo "If upload fails, check:"
echo "- User is logged in"
echo "- File size is under 50MB"
echo "- File type is allowed (PDF, DOC, DOCX, PPT, PPTX, TXT, images)"
echo "- Backend logs for detailed error messages"