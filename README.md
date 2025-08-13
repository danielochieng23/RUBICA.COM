# Rubica.com - Premium Adult Services Directory

A modern, full-stack web application that replicates the functionality of Skokka.in, built with React, Node.js, Express, and MongoDB. The platform provides a secure and user-friendly directory for adult services with advanced search capabilities, user management, and content moderation.

## Features

### Frontend
- **Modern React Application** with TypeScript
- **Responsive Design** using styled-components
- **Montserrat Font Family** throughout the application
- **Advanced Search & Filtering** capabilities
- **User Authentication** with JWT tokens
- **Real-time Notifications** using react-hot-toast
- **Mobile-First Responsive Design**
- **Category-based Browse** functionality
- **City-wise Listings** organization
- **Premium Listing** highlights

### Backend
- **RESTful API** built with Express.js and TypeScript
- **MongoDB Database** with Mongoose ODM
- **JWT Authentication** with secure password hashing
- **Image Upload** support with Multer
- **Rate Limiting** and security middleware
- **Input Validation** with express-validator
- **Email Integration** for notifications
- **Role-based Access Control** (User, Moderator, Admin)

### Security Features
- **Helmet.js** for security headers
- **CORS** configuration
- **Rate Limiting** to prevent abuse
- **Password Hashing** with bcrypt
- **JWT Token** authentication
- **Input Sanitization** and validation

## Tech Stack

### Frontend
- React 19 with TypeScript
- Styled Components for styling
- React Router for navigation
- React Query for data fetching
- React Hook Form for form handling
- Axios for HTTP requests
- React Icons for iconography

### Backend
- Node.js with Express.js
- TypeScript for type safety
- MongoDB with Mongoose
- JWT for authentication
- Multer for file uploads
- Nodemailer for emails
- Various security middleware

## Project Structure

```
rubica/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── index.ts
│   ├── uploads/
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── styles/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── App.tsx
│   └── package.json
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/rubica
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

5. Start the development server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Start the development server:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/change-password` - Change password

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Listings
- `GET /api/listings` - Get all listings with filters
- `POST /api/listings` - Create new listing
- `GET /api/listings/:id` - Get specific listing
- `PUT /api/listings/:id` - Update listing
- `DELETE /api/listings/:id` - Delete listing

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)

### Admin
- `GET /api/admin/dashboard` - Admin dashboard stats
- `GET /api/admin/listings` - Manage listings
- `PUT /api/admin/listings/:id/approve` - Approve listing
- `PUT /api/admin/listings/:id/reject` - Reject listing

## Database Models

### User Model
- Email, password, name, phone
- Role (user, admin, moderator)
- Verification status
- Profile information
- Preferences

### Category Model
- Name, slug, description
- Icon, parent category
- Sort order, meta information

### Listing Model
- Title, description, category
- Images, price, location
- Contact information
- Availability, services
- Verification status
- Statistics (views, likes)

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow ESLint and Prettier configurations
- Use meaningful variable and function names
- Write descriptive commit messages

### Security Best Practices
- Never commit sensitive data
- Use environment variables for configuration
- Validate all user inputs
- Implement proper error handling
- Use HTTPS in production

### Performance Optimization
- Implement pagination for large datasets
- Use database indexes for search queries
- Optimize images and assets
- Implement caching strategies
- Monitor application performance

## Deployment

### Backend Deployment
1. Build the TypeScript code:
```bash
npm run build
```

2. Set production environment variables
3. Deploy to your preferred hosting service (Heroku, AWS, DigitalOcean)

### Frontend Deployment
1. Build the React application:
```bash
npm run build
```

2. Deploy the build folder to a static hosting service (Netlify, Vercel, AWS S3)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is proprietary and confidential. All rights reserved.

## Support

For support and questions, please contact the development team.

---

**Note**: This application is intended for adult content and services. Please ensure compliance with local laws and regulations when deploying and using this platform.