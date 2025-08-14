// Authentication middleware
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    res.redirect('/auth/login');
};

// Admin middleware
const isAdmin = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    res.status(403).render('pages/error', {
        title: 'Access Denied',
        message: 'You do not have permission to access this page.'
    });
};

// Advertiser middleware
const isAdvertiser = (req, res, next) => {
    if (req.session && req.session.user && 
        (req.session.user.role === 'advertiser' || req.session.user.role === 'admin')) {
        return next();
    }
    res.status(403).render('pages/error', {
        title: 'Access Denied',
        message: 'Only advertisers can access this page.'
    });
};

module.exports = {
    isAuthenticated,
    isAdmin,
    isAdvertiser
};