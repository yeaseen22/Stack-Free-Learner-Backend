# ⚔️ Programming Stack Free Learner Backend Server

A powerful and scalable backend server for the **Programming Stack Free Learner Platform** platform, built with Node.js and Express.

## 🚀 Features

- RESTful API for user authentication, course & content management
- JWT-based secure authentication and authorization
- MongoDB database integration for efficient data storage
- Well-structured, modular codebase for maintainability
- Environment-based configuration support
- Built-in error handling and request logging
- Input validation and sanitization
- Rate limiting and security middleware
- Email functionality for password reset
- Course enrollment and rating system
- User profile management

## 🛠️ Getting Started

### ✅ Prerequisites

- Node.js (v16 or higher)
- npm, yarn, or bun (recommended)
- A MongoDB instance (local or cloud)

### 📦 Installation

\`\`\`bash
git clone https://github.com/yourusername/pf-backend.git
cd pf-backend
npm install
# or
yarn install
# or
bun install
\`\`\`

### ⚙️ Configuration

1. Copy the example environment file:
\`\`\`bash
cp .env.example .env
\`\`\`

2. Update the \`.env\` file with your configuration:

\`\`\`env
DATABASE_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EXPIRES_IN=30d
PORT=5000
NODE_ENV=development
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SERVICE=gmail
SMTP_MAIL=your_email@gmail.com
SMTP_PASSWORD=your_email_password
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SERVER_URL=http://localhost:5000
\`\`\`

### ▶️ Running the Server

\`\`\`bash
# Development mode
npm run dev

# Production mode
npm start
\`\`\`

The server will be running on: 🔗 \`http://localhost:5000\`

## 📚 API Endpoints

### Authentication Routes (\`/api/auth\`)

- \`POST /register\` - Register a new user
- \`POST /login\` - Login user
- \`GET /me\` - Get current user profile
- \`PUT /profile\` - Update user profile
- \`PUT /change-password\` - Change user password
- \`POST /forgot-password\` - Request password reset
- \`PUT /reset-password/:token\` - Reset password with token

### Course Routes (\`/api/courses\`)

- \`GET /\` - Get all courses (with filtering and pagination)
- \`GET /:id\` - Get single course
- \`POST /\` - Create new course (Instructor/Admin only)
- \`PUT /:id\` - Update course (Course owner/Admin only)
- \`DELETE /:id\` - Delete course (Course owner/Admin only)
- \`POST /:id/enroll\` - Enroll in course
- \`POST /:id/rating\` - Add course rating

### User Routes (\`/api/users\`)

- \`GET /\` - Get all users (Admin only)
- \`GET /:id\` - Get user by ID
- \`PUT /:id\` - Update user (Admin only)
- \`DELETE /:id\` - Delete user (Admin only)

## 🗂️ Project Structure

\`\`\`
pf-backend/
├── controllers/          # Route controllers
│   ├── authController.js
│   ├── courseController.js
│   └── userController.js
├── models/              # Database models
│   ├── User.js
│   └── Course.js
├── routes/              # API routes
│   ├── authRoutes.js
│   ├── courseRoutes.js
│   └── userRoutes.js
├── middlewares/         # Custom middleware
│   ├── authMiddleware.js
│   ├── errorMiddleware.js
│   └── validationMiddleware.js
├── utils/               # Utility functions
│   ├── ApiError.js
│   ├── ApiResponse.js
│   ├── asyncHandler.js
│   └── sendEmail.js
├── server.js           # Main server file
├── package.json
├── .env.example
└── README.md
\`\`\`

## 🔒 Security Features

- **Helmet.js** - Sets various HTTP headers
- **Rate Limiting** - Prevents brute force attacks
- **CORS** - Cross-origin resource sharing configuration
- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - Bcrypt for password security
- **Input Validation** - Express-validator for request validation
- **Error Handling** - Centralized error handling

## 🚀 Deployment

### Environment Variables for Production

Make sure to set these environment variables in your production environment:

- \`DATABASE_URL\` - Your MongoDB connection string
- \`JWT_SECRET\` - A strong secret key for JWT
- \`NODE_ENV=production\`
- Email configuration variables
- Other required environment variables

### Deploy to Vercel

1. Install Vercel CLI: \`npm i -g vercel\`
2. Run: \`vercel\`
3. Follow the prompts

### Deploy to Railway

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push

## 🧪 Testing

\`\`\`bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you have any questions or need help, please:

1. Check the existing issues
2. Create a new issue with detailed information
3. Contact the development team

## 🙏 Acknowledgments

- Express.js team for the amazing framework
- MongoDB team for the database
- All contributors who helped build this project

---

**Happy Coding! ⚔️**
\`\`\`
