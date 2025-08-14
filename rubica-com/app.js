const express = require('express');
const path = require('path');
const session = require('express-session');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const bodyParser = require('body-parser');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rubica', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false,
}));

// Middleware
app.use(compression());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'rubica-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    }
}));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Global middleware to pass user data to views
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.siteTitle = 'RUBICA - Adult Classifieds';
    next();
});

// Routes
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const listingsRouter = require('./routes/listings');
const userRouter = require('./routes/user');

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/listings', listingsRouter);
app.use('/user', userRouter);

// 404 handler
app.use((req, res, next) => {
    res.status(404).render('pages/404', { 
        title: 'Page Not Found',
        message: 'The page you are looking for does not exist.'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('pages/error', { 
        title: 'Error',
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`RUBICA.COM server running on http://localhost:${PORT}`);
});

module.exports = app;