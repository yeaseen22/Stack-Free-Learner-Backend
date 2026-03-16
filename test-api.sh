#!/bin/bash

echo "Testing Server on port 8000..."
echo "-----------------------------------"
echo ""

echo "Testing Root Endpoint..."
ROOT_RESPONSE=$(curl -s http://localhost:8000/)
echo "Root Response:"
echo $ROOT_RESPONSE | python3 -m json.tool 2>/dev/null || echo $ROOT_RESPONSE
echo ""
echo "-----------------------------------"
echo ""

echo "Testing Registration..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:8000/api/auth/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "testuser789@example.com",
    "password": "Test123456"
  }')

echo "Registration Response:"
echo $REGISTER_RESPONSE | python3 -m json.tool 2>/dev/null || echo $REGISTER_RESPONSE
echo ""
echo "-----------------------------------"
echo ""

echo "Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8000/api/auth/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser789@example.com",
    "password": "Test123456"
  }')

echo "Login Response:"
echo $LOGIN_RESPONSE | python3 -m json.tool 2>/dev/null || echo $LOGIN_RESPONSE
