#!/bin/bash

# Test delete video API
# Replace with your actual JWT token and IDs

JWT_TOKEN="your_jwt_token_here"
MODULE_CONTENT_ID="69aef1988884f0990ae90c37"
VIDEO_ID="69aef1a48884f0990ae90c38"

curl -X DELETE \
  "http://localhost:8000/api/courses/content-delete/${MODULE_CONTENT_ID}/${VIDEO_ID}" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -v
