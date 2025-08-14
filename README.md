# Rubica.com - Adult Classified Portal

A comprehensive, modern adult classified website built with HTML, CSS, and JavaScript. This is a complete replica of the Skokka.in functionality with enhanced features, responsive design, and modern web standards.

## 🚀 Features

### Core Functionality
- **Age Verification**: Mandatory 18+ age verification with local storage persistence
- **User Authentication**: Registration, login, and profile management
- **Ad Posting System**: Comprehensive ad creation with image upload and package selection
- **Category Browsing**: Six main categories with filtering and search
- **Location-based Search**: City-wise filtering and search functionality
- **Responsive Design**: Mobile-first approach with cross-device compatibility

### Categories
1. **Call Girls** - Premium escort services
2. **Massages** - Professional massage and therapy services
3. **Male Escorts** - Male companion services
4. **Transsexual** - Transgender escort services
5. **Adult Meetings** - Casual encounters
6. **BDSM** - Fetish and BDSM services

### Key Pages
- **Homepage** (`index.html`) - Featured ads, categories, search
- **Post Ad** (`post-ad.html`) - Comprehensive ad posting form
- **Category Pages** (`category.html`) - Filtered listings with pagination
- **Contact** (`contact.html`) - Contact form and support information
- **Legal Pages** - Terms of Service and Privacy Policy

### Advanced Features
- **Package System**: Free, Premium (₹499), and VIP (₹999) packages
- **Image Upload**: Drag-and-drop with preview and validation
- **Real-time Validation**: Form validation with error messaging
- **Search & Filters**: Advanced filtering by city, price, availability
- **Responsive Grid**: Dynamic layout adaptation
- **Loading States**: User feedback during operations
- **Error Handling**: Comprehensive error management

## 📁 Project Structure

```
/workspace
├── index.html              # Homepage
├── post-ad.html           # Ad posting page
├── category.html          # Category listings page
├── contact.html           # Contact page
├── terms.html             # Terms of Service
├── privacy.html           # Privacy Policy
├── css/
│   └── styles.css         # Main stylesheet (comprehensive)
├── js/
│   ├── main.js           # Core functionality
│   └── post-ad.js        # Ad posting functionality
├── images/               # Image assets directory
└── README.md            # This file
```

## 🛠️ Technologies Used

### Frontend
- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern styling with Grid, Flexbox, and animations
- **JavaScript (ES6+)**: Modern JavaScript with modules and async/await
- **Font Awesome**: Icon library for UI elements
- **jQuery**: DOM manipulation and AJAX requests

### External Libraries
- **Font Awesome 6.0.0**: Icons and symbols
- **jQuery 3.6.0**: JavaScript library
- **Lightbox2**: Image gallery functionality

## 🎨 Design Features

### Visual Design
- **Modern UI**: Clean, professional interface
- **Gradient Backgrounds**: Purple to blue gradient theme
- **Card-based Layout**: Modern card design for content
- **Hover Effects**: Interactive elements with smooth transitions
- **Loading Animations**: Spinners and progress indicators

### Responsive Design
- **Mobile-first**: Optimized for mobile devices
- **Breakpoints**: Tablet and desktop adaptations
- **Flexible Grid**: Auto-adjusting layouts
- **Touch-friendly**: Large tap targets for mobile users

## 🔒 Security & Compliance

### Age Verification
- Mandatory 18+ verification modal
- Local storage persistence
- Legal compliance notices

### Data Protection
- Privacy Policy implementation
- User consent management
- Secure form handling
- Content moderation guidelines

### Legal Compliance
- Terms of Service
- Privacy Policy
- Disclaimer notices
- Age verification requirements

## 📱 Responsive Breakpoints

```css
/* Mobile First */
Base: 320px+

/* Tablet */
@media (max-width: 768px)

/* Desktop */
@media (min-width: 1024px)

/* Large Desktop */
@media (min-width: 1200px)
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Web server (Apache, Nginx, or development server)
- Internet connection (for CDN resources)

### Installation

1. **Clone/Download the project**
   ```bash
   git clone <repository-url>
   cd rubica-website
   ```

2. **Start a local server**
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

### Development Setup

1. **File Structure**: Maintain the existing structure
2. **Image Directory**: Add images to `/images` folder
3. **Customization**: Modify CSS variables for theme changes
4. **Testing**: Test on multiple devices and browsers

## 🔧 Configuration

### Site Settings
Edit the following in `js/main.js`:
```javascript
// Site configuration
const SITE_CONFIG = {
    siteName: 'Rubica.com',
    tagline: 'Your Premium Adult Classified Portal',
    supportEmail: 'support@rubica.com',
    phoneNumber: '+91 9876543210'
};
```

### Package Pricing
Modify pricing in `post-ad.html`:
```javascript
const packages = {
    free: { price: 0, duration: 30, images: 3 },
    premium: { price: 499, duration: 60, images: 6 },
    vip: { price: 999, duration: 90, images: 10 }
};
```

## 📊 Features Overview

### User Management
- [x] Age verification modal
- [x] User registration
- [x] User login/logout
- [x] Profile management
- [x] Session persistence

### Ad Management
- [x] Ad posting form
- [x] Image upload (6 images max)
- [x] Package selection
- [x] Form validation
- [x] Character counting
- [x] Preview functionality

### Search & Browse
- [x] Category browsing
- [x] City-based filtering
- [x] Price range filtering
- [x] Search functionality
- [x] Pagination
- [x] Grid/List view toggle

### UI/UX
- [x] Responsive design
- [x] Loading states
- [x] Error handling
- [x] Success messages
- [x] Smooth animations
- [x] Accessibility features

## 🛡️ Security Features

### Frontend Security
- Input validation and sanitization
- XSS protection measures
- CSRF token simulation
- Content Security Policy headers (recommended)

### Content Moderation
- Age verification enforcement
- Terms of service acceptance
- Content guidelines enforcement
- Reporting mechanisms

### Privacy Protection
- User data encryption (simulated)
- Privacy policy compliance
- Cookie consent management
- Data retention policies

## 📈 Performance Optimization

### Loading Performance
- Minified CSS and JavaScript (recommended for production)
- Image optimization and lazy loading
- CDN usage for external libraries
- Gzip compression (server-side)

### User Experience
- Fast form validation
- Immediate feedback
- Progressive enhancement
- Offline functionality (basic)

## 🌐 Browser Support

### Minimum Requirements
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari 12+, Chrome Mobile 60+)

### Progressive Enhancement
- Core functionality works without JavaScript
- Enhanced features with JavaScript enabled
- Graceful degradation for older browsers

## 📝 Content Guidelines

### Allowed Content
- Adult services and companionship
- Massage and wellness services
- Entertainment services
- Legal adult content

### Prohibited Content
- Content involving minors
- Non-consensual activities
- Illegal services
- Fraudulent information
- Hate speech or discrimination

## 🚀 Deployment

### Production Checklist
- [ ] Enable HTTPS/SSL
- [ ] Configure proper headers
- [ ] Set up error pages
- [ ] Implement analytics
- [ ] Enable gzip compression
- [ ] Optimize images
- [ ] Set up monitoring

### Server Configuration
```apache
# .htaccess for Apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Security headers
Header always set X-Frame-Options DENY
Header always set X-Content-Type-Options nosniff
Header always set Strict-Transport-Security "max-age=31536000"
```

## 🤝 Contributing

### Development Guidelines
1. Follow existing code style
2. Test on multiple devices
3. Validate HTML and CSS
4. Optimize for performance
5. Document changes

### Code Style
- 2-space indentation
- Meaningful variable names
- Comment complex logic
- Use semantic HTML
- Follow BEM CSS methodology

## 📞 Support

### Contact Information
- **Email**: support@rubica.com
- **Phone**: +91 9876543210
- **Business Hours**: 24/7 Support

### Documentation
- Terms of Service: `/terms.html`
- Privacy Policy: `/privacy.html`
- Safety Guidelines: Contact page FAQ

## 📄 License

This project is for educational and demonstration purposes. Please ensure compliance with local laws and regulations when deploying adult content websites.

### Legal Compliance
- 18+ Age verification required
- Compliance with local adult content laws
- Privacy policy implementation
- Terms of service enforcement

## 🔄 Updates & Maintenance

### Regular Updates
- Security patches
- Browser compatibility updates
- Feature enhancements
- Bug fixes

### Monitoring
- Website uptime
- Performance metrics
- User feedback
- Security assessments

---

**Disclaimer**: This website template is designed for educational purposes. Users are responsible for ensuring compliance with local laws and regulations regarding adult content and classified advertisements.

**Version**: 1.0.0 | **Last Updated**: December 2024