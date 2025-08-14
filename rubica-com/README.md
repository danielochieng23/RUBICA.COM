# RUBICA.COM - Adult Classifieds Platform

A modern, secure, and user-friendly adult classifieds platform built with Node.js, Express, MongoDB, and EJS.

## Features

- **User Authentication**: Secure registration and login system
- **Listing Management**: Create, edit, and manage classified ads
- **Search & Filters**: Advanced search with city and category filters
- **Categories**: Call Girls, Massages, Male Escorts, Transsexual, Adult Meetings
- **User Dashboard**: Personal dashboard to manage listings
- **Responsive Design**: Mobile-friendly interface
- **Image Uploads**: Support for multiple images per listing
- **Security**: Helmet.js for security headers, bcrypt for password hashing

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
cd /workspace/rubica-com
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env` file and update the values as needed
   - Make sure MongoDB is running

4. Start the application:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

5. Access the application:
   - Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
rubica-com/
├── app.js              # Main application file
├── models/             # MongoDB models
│   ├── User.js
│   └── Listing.js
├── routes/             # Express routes
│   ├── index.js
│   ├── auth.js
│   ├── listings.js
│   └── user.js
├── views/              # EJS templates
│   ├── partials/
│   └── pages/
├── public/             # Static assets
│   ├── css/
│   ├── js/
│   └── uploads/
├── middleware/         # Custom middleware
└── config/             # Configuration files
```

## Usage

1. **Register an Account**: Click on "Register" to create a new account
2. **Post an Ad**: After logging in, click "Post Ad" to create a new listing
3. **Browse Listings**: Browse by category or use the search function
4. **Manage Listings**: Access your dashboard to manage your ads

## Security Notes

- This platform is intended for adults (18+) only
- All passwords are hashed using bcrypt
- Sessions are secured with HTTP-only cookies
- Input validation and sanitization are implemented

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **View Engine**: EJS
- **Authentication**: Express-session, bcrypt
- **File Upload**: Multer
- **Security**: Helmet.js, CORS
- **Styling**: Custom CSS with Bootstrap

## License

This project is for demonstration purposes only. All rights reserved.

## Support

For support or questions, contact: info@rubica.com