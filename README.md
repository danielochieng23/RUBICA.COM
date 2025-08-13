# Rubica.com - Professional Services Platform

A comprehensive full-stack web application replicating the functionality of skokka.in, built with modern technologies and professional design using the Montserrat font family.

## 🚀 Features

### Core Functionality
- **User Authentication & Authorization** - Secure JWT-based authentication
- **Service Listings Management** - Create, edit, delete, and browse service listings
- **Advanced Search & Filtering** - Search by keywords, location, category, price range
- **Category Management** - Organized service categories with subcategories
- **User Profiles** - Complete profile management with ratings and reviews
- **Image Upload** - Cloudinary integration for image management
- **Responsive Design** - Mobile-first design with Tailwind CSS
- **Admin Panel** - Comprehensive admin dashboard for content moderation

### Technologies Used

#### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Cloudinary** for image storage
- **Express Validator** for input validation
- **Helmet** for security headers
- **Rate limiting** for API protection

#### Frontend
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Query** for data fetching
- **React Hook Form** for form management
- **Framer Motion** for animations
- **Lucide React** for icons
- **React Hot Toast** for notifications

#### Font & Design
- **Montserrat** font family (as requested)
- Modern, clean UI design
- Professional color scheme
- Responsive layouts for all devices

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn**
- **Cloudinary account** (for image uploads)

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd rubica
```

### 2. Backend Setup
```bash
# Install backend dependencies
npm install

# Create environment file
cp .env.example .env

# Update environment variables in .env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/rubica
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d

# Cloudinary config
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email config (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

# Admin credentials
ADMIN_EMAIL=admin@rubica.com
ADMIN_PASSWORD=admin123
```

### 3. Frontend Setup
```bash
# Navigate to client directory
cd client

# Install frontend dependencies
npm install --legacy-peer-deps

# Create environment file
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
```

### 4. Database Setup
```bash
# Go back to root directory
cd ..

# Seed the database with initial categories
node seeders/categories.js
```

### 5. Start the Application

#### Development Mode
```bash
# Terminal 1 - Start backend server
npm run dev

# Terminal 2 - Start frontend (in client directory)
cd client
npm start
```

#### Production Mode
```bash
# Build frontend
cd client
npm run build
cd ..

# Start production server
npm start
```

## 🌐 Application URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Admin Panel**: http://localhost:3000/admin

## 📱 Key Features & Pages

### Public Pages
- **Homepage** - Hero section, categories, featured services
- **Browse Services** - Search and filter listings
- **Service Details** - Detailed view of individual services
- **Category Pages** - Services organized by categories

### User Features
- **Registration/Login** - Secure authentication
- **Profile Management** - Edit profile, view favorites
- **Create Listings** - Post new services
- **My Listings** - Manage your services
- **Favorites** - Save preferred services

### Admin Features
- **Dashboard** - Analytics and statistics
- **User Management** - Manage user accounts
- **Listing Moderation** - Approve/reject listings
- **Category Management** - Add/edit categories
- **Bulk Actions** - Mass operations on listings

## 🎨 Design Features

### Typography
- **Primary Font**: Montserrat (all weights)
- **Fallback**: System fonts for reliability

### Color Scheme
- **Primary**: Blue gradient (#667eea to #764ba2)
- **Secondary**: Professional grays
- **Accent**: Green for success states
- **Error**: Red for warnings

### Components
- Custom button styles (primary, secondary, accent)
- Input field styling with focus states
- Card components with hover effects
- Badge systems for status indicators
- Loading spinners and animations

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/logout` - Logout

### Listings
- `GET /api/listings` - Get all listings (with filters)
- `GET /api/listings/:id` - Get single listing
- `POST /api/listings` - Create new listing
- `PUT /api/listings/:id` - Update listing
- `DELETE /api/listings/:id` - Delete listing

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:slug` - Get category by slug
- `POST /api/categories` - Create category (admin)
- `PUT /api/categories/:id` - Update category (admin)

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/listings/pending` - Pending listings
- `PUT /api/admin/listings/:id/moderate` - Moderate listing

## 🚀 Deployment

### Environment Setup
1. Set up MongoDB Atlas or your preferred MongoDB hosting
2. Configure Cloudinary for image hosting
3. Update environment variables for production
4. Set up SSL certificates

### Deployment Options
- **Heroku**: Simple deployment with automatic builds
- **DigitalOcean**: VPS deployment with PM2
- **Vercel/Netlify**: Frontend hosting with serverless functions
- **AWS/GCP**: Full cloud deployment

## 📄 Project Structure

```
rubica/
├── models/           # MongoDB models
├── routes/           # Express routes
├── middleware/       # Custom middleware
├── utils/            # Utility functions
├── seeders/          # Database seeders
├── client/           # React frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── contexts/     # React contexts
│   │   ├── hooks/        # Custom hooks
│   │   ├── utils/        # Frontend utilities
│   │   └── types/        # TypeScript types
│   └── public/       # Static assets
├── .env              # Environment variables
├── server.js         # Main server file
└── package.json      # Dependencies
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Email: support@rubica.com
- Documentation: Check the code comments
- Issues: Create GitHub issues for bugs

## 🔄 Development Workflow

### Code Standards
- ESLint for JavaScript/TypeScript linting
- Prettier for code formatting
- TypeScript for type safety
- Comprehensive error handling

### Testing
- Unit tests for utilities
- Integration tests for API endpoints
- E2E tests for critical user flows

### Security
- Input validation and sanitization
- Rate limiting on API endpoints
- CORS configuration
- Helmet for security headers
- JWT token management

---

Built with ❤️ using Montserrat font family and modern web technologies.