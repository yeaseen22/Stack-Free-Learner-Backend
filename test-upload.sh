#!/bin/bash

# Get token
TOKEN=$(curl -s -X POST "http://localhost:8000/api/auth/user/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123"}' | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

echo "Token: ${TOKEN:0:50}..."

# Upload video
echo "\n=== Uploading Video ==="
curl -X POST "http://localhost:8000/api/courses/upload-content" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "moduleId": "69aeaed1d0a5fbfcff227017",
    "title": "React Basics",
    "type": "video",
    "videoId": "SqcY0GlETPk",
    "thumbnail": "https://img.youtube.com/vi/SqcY0GlETPk/maxresdefault.jpg"
  }' | python3 -m json.tool

# Get video ID from response
VIDEO_ID="temp_id"
MODULE_CONTENT_ID="69aef1988884f0990ae90c37"

# Update video
echo "\n=== Updating Video ==="
curl -X PUT "http://localhost:8000/api/courses/video-update/$MODULE_CONTENT_ID/$VIDEO_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "React Advanced",
    "videoId": "w7ejDZ8SWv8",
    "thumbnail": "https://img.youtube.com/vi/w7ejDZ8SWv8/maxresdefault.jpg"
  }' | python3 -m json.tool

# Delete video
echo "\n=== Deleting Video ==="
curl -X DELETE "http://localhost:8000/api/courses/content-delete/$MODULE_CONTENT_ID/$VIDEO_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | python3 -m json.tool
