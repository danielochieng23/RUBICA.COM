// Main JavaScript functionality for Rubica.com

// Global variables
let currentUser = null;
let adsData = [];
let currentCity = '';
let currentCategory = '';

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize the application
function initializeApp() {
    checkAgeVerification();
    setupEventListeners();
    loadSampleData();
    loadFeaturedAds();
    loadRecentAds();
    updateAdCounts();
}

// Age Verification
function checkAgeVerification() {
    const ageVerified = localStorage.getItem('ageVerified');
    if (!ageVerified) {
        showAgeVerificationModal();
    }
}

function showAgeVerificationModal() {
    const modal = document.getElementById('ageVerificationModal');
    modal.style.display = 'block';
}

function acceptAge() {
    localStorage.setItem('ageVerified', 'true');
    document.getElementById('ageVerificationModal').style.display = 'none';
}

function rejectAge() {
    window.location.href = 'https://www.google.com';
}

// Event Listeners Setup
function setupEventListeners() {
    // Mobile menu toggle
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.nav');
    
    if (mobileToggle) {
        mobileToggle.addEventListener('click', function() {
            nav.classList.toggle('active');
        });
    }

    // Modal controls
    setupModalEventListeners();
    
    // Category card clicks
    setupCategoryClickListeners();
    
    // Search functionality
    setupSearchListeners();
    
    // Form submissions
    setupFormListeners();
}

// Modal Event Listeners
function setupModalEventListeners() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const closeBtns = document.querySelectorAll('.close');
    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');

    // Open modals
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showModal('loginModal');
        });
    }

    if (registerBtn) {
        registerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showModal('registerModal');
        });
    }

    // Close modals
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            modal.style.display = 'none';
        });
    });

    // Switch between modals
    if (switchToRegister) {
        switchToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            hideModal('loginModal');
            showModal('registerModal');
        });
    }

    if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            hideModal('registerModal');
            showModal('loginModal');
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

// Category Click Listeners
function setupCategoryClickListeners() {
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            const category = this.dataset.category;
            navigateToCategory(category);
        });
    });
}

// Search Listeners
function setupSearchListeners() {
    const citySelect = document.getElementById('citySelect');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.querySelector('.search-btn');

    if (citySelect) {
        citySelect.addEventListener('change', function() {
            currentCity = this.value;
            filterAds();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', debounce(function() {
            filterAds();
        }, 300));

        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
}

// Form Listeners
function setupFormListeners() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
}

// Modal Functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Authentication Functions
function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    // Simulate login process
    showLoading();
    
    setTimeout(() => {
        hideLoading();
        currentUser = {
            id: 1,
            email: email,
            name: email.split('@')[0]
        };
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateUserInterface();
        hideModal('loginModal');
        showAlert('success', 'Login successful!');
    }, 1000);
}

function handleRegister(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    if (password !== confirmPassword) {
        showAlert('error', 'Passwords do not match!');
        return;
    }

    // Simulate registration process
    showLoading();
    
    setTimeout(() => {
        hideLoading();
        currentUser = {
            id: 1,
            email: email,
            name: name
        };
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateUserInterface();
        hideModal('registerModal');
        showAlert('success', 'Registration successful!');
    }, 1000);
}

function updateUserInterface() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    
    if (currentUser) {
        loginBtn.textContent = currentUser.name;
        loginBtn.onclick = logout;
        registerBtn.style.display = 'none';
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    
    loginBtn.textContent = 'Login';
    loginBtn.onclick = () => showModal('loginModal');
    registerBtn.style.display = 'block';
    
    showAlert('success', 'Logged out successfully!');
}

// Search Functions
function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.trim();
    
    if (!searchTerm) {
        showAlert('warning', 'Please enter a search term');
        return;
    }
    
    // Redirect to search results page (would be implemented)
    window.location.href = `search.html?q=${encodeURIComponent(searchTerm)}&city=${currentCity}`;
}

function filterAds() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    
    let filteredAds = adsData;
    
    if (currentCity) {
        filteredAds = filteredAds.filter(ad => 
            ad.city.toLowerCase() === currentCity.toLowerCase()
        );
    }
    
    if (searchTerm) {
        filteredAds = filteredAds.filter(ad => 
            ad.title.toLowerCase().includes(searchTerm) ||
            ad.description.toLowerCase().includes(searchTerm) ||
            ad.category.toLowerCase().includes(searchTerm)
        );
    }
    
    updateAdsDisplay(filteredAds);
}

// Navigation Functions
function navigateToCategory(category) {
    window.location.href = `category.html?cat=${category}`;
}

// Data Loading Functions
function loadSampleData() {
    adsData = [
        {
            id: 1,
            title: "Premium Escort Service - Mumbai",
            description: "Professional and discrete service available 24/7. Experienced and educated companions.",
            category: "call-girls",
            city: "mumbai",
            price: "₹5,000",
            image: "https://via.placeholder.com/300x200?text=Premium+Service",
            featured: true,
            verified: true,
            online: true,
            postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
            id: 2,
            title: "Relaxing Body Massage - Delhi",
            description: "Professional therapeutic massage services. Swedish, deep tissue, and aromatherapy available.",
            category: "massages",
            city: "delhi",
            price: "₹2,500",
            image: "https://via.placeholder.com/300x200?text=Massage+Therapy",
            featured: false,
            verified: true,
            online: false,
            postedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        },
        {
            id: 3,
            title: "Male Companion Services - Bangalore",
            description: "Professional male escort for social events, dinners, and companionship.",
            category: "male-escorts",
            city: "bangalore",
            price: "₹3,500",
            image: "https://via.placeholder.com/300x200?text=Male+Escort",
            featured: true,
            verified: false,
            online: true,
            postedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        },
        {
            id: 4,
            title: "Trans Escort - Chennai",
            description: "Beautiful and sophisticated transgender escort available for companionship.",
            category: "transsexual",
            city: "chennai",
            price: "₹4,000",
            image: "https://via.placeholder.com/300x200?text=Trans+Escort",
            featured: false,
            verified: true,
            online: true,
            postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        {
            id: 5,
            title: "Adult Meetings - Goa",
            description: "Looking for casual encounters and adult fun. Discrete and no strings attached.",
            category: "adult-meetings",
            city: "goa",
            price: "₹1,500",
            image: "https://via.placeholder.com/300x200?text=Adult+Meeting",
            featured: false,
            verified: false,
            online: false,
            postedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        },
        {
            id: 6,
            title: "BDSM Services - Mumbai",
            description: "Professional dominatrix offering BDSM experiences. Safe, sane, and consensual.",
            category: "bdsm",
            city: "mumbai",
            price: "₹6,000",
            image: "https://via.placeholder.com/300x200?text=BDSM+Services",
            featured: true,
            verified: true,
            online: true,
            postedDate: new Date()
        }
    ];
}

function loadFeaturedAds() {
    const featuredAds = adsData.filter(ad => ad.featured);
    const container = document.getElementById('featuredAdsGrid');
    
    if (container) {
        container.innerHTML = featuredAds.map(ad => createAdCard(ad)).join('');
    }
}

function loadRecentAds() {
    const recentAds = adsData
        .sort((a, b) => b.postedDate - a.postedDate)
        .slice(0, 6);
    
    const container = document.getElementById('recentAdsGrid');
    
    if (container) {
        container.innerHTML = recentAds.map(ad => createAdCard(ad)).join('');
    }
}

function updateAdCounts() {
    const categories = ['call-girls', 'massages', 'male-escorts', 'transsexual', 'adult-meetings', 'bdsm'];
    
    categories.forEach(category => {
        const count = adsData.filter(ad => ad.category === category).length;
        const element = document.getElementById(getCategoryCountId(category));
        if (element) {
            element.textContent = `${count} ads`;
        }
    });
}

function getCategoryCountId(category) {
    const mapping = {
        'call-girls': 'callGirlsCount',
        'massages': 'massagesCount',
        'male-escorts': 'maleEscortsCount',
        'transsexual': 'transsexualCount',
        'adult-meetings': 'adultMeetingsCount',
        'bdsm': 'bdsmCount'
    };
    return mapping[category];
}

function createAdCard(ad) {
    const timeAgo = getTimeAgo(ad.postedDate);
    const premiumClass = ad.featured ? 'premium-ad' : '';
    const onlineStatus = ad.online ? '<span class="online-status"></span>' : '';
    const verifiedBadge = ad.verified ? '<span class="verified-badge"><i class="fas fa-check-circle"></i>Verified</span>' : '';
    const featuredBadge = ad.featured ? '<div class="featured-badge">Featured</div>' : '';
    
    return `
        <div class="ad-card ${premiumClass}" onclick="viewAd(${ad.id})">
            ${featuredBadge}
            <div class="ad-image">
                <img src="${ad.image}" alt="${ad.title}" loading="lazy">
            </div>
            <div class="ad-content">
                <h3 class="ad-title">${ad.title}</h3>
                <div class="ad-location">
                    <i class="fas fa-map-marker-alt"></i>
                    ${ad.city.charAt(0).toUpperCase() + ad.city.slice(1)}
                </div>
                <p class="ad-description">${ad.description}</p>
                <div class="ad-price">${ad.price}</div>
                <div class="ad-meta">
                    <span>${timeAgo}</span>
                    <span>${onlineStatus}${verifiedBadge}</span>
                </div>
            </div>
        </div>
    `;
}

function updateAdsDisplay(ads) {
    const featuredContainer = document.getElementById('featuredAdsGrid');
    const recentContainer = document.getElementById('recentAdsGrid');
    
    if (featuredContainer) {
        const featuredAds = ads.filter(ad => ad.featured);
        featuredContainer.innerHTML = featuredAds.map(ad => createAdCard(ad)).join('');
    }
    
    if (recentContainer) {
        const recentAds = ads.slice(0, 6);
        recentContainer.innerHTML = recentAds.map(ad => createAdCard(ad)).join('');
    }
}

// Utility Functions
function viewAd(adId) {
    window.location.href = `ad-details.html?id=${adId}`;
}

function loadMoreAds() {
    // Simulate loading more ads
    showLoading();
    
    setTimeout(() => {
        hideLoading();
        showAlert('info', 'No more ads to load');
    }, 1000);
}

function getTimeAgo(date) {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showLoading() {
    // Create loading overlay
    const overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
    
    overlay.innerHTML = '<div class="loading"></div>';
    document.body.appendChild(overlay);
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.remove();
    }
}

function showAlert(type, message) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10001;
        max-width: 300px;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => alert.remove(), 300);
    }, 3000);
}

// Initialize user session on page load
function initializeUserSession() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUserInterface();
    }
}

// Call initialization
initializeUserSession();

// Add slide animations for alerts
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Lazy loading for images
function setupLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
}

// Initialize lazy loading
setupLazyLoading();

// Service Worker Registration (for PWA capabilities)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Add keyboard navigation support
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        // Close any open modals
        const openModals = document.querySelectorAll('.modal[style*="display: block"]');
        openModals.forEach(modal => {
            modal.style.display = 'none';
        });
    }
});

// Analytics tracking (placeholder)
function trackEvent(category, action, label) {
    // Google Analytics or other tracking service would go here
    console.log('Event tracked:', { category, action, label });
}

// Track category clicks
document.addEventListener('click', function(e) {
    if (e.target.closest('.category-card')) {
        const category = e.target.closest('.category-card').dataset.category;
        trackEvent('Category', 'Click', category);
    }
    
    if (e.target.closest('.ad-card')) {
        const adTitle = e.target.closest('.ad-card').querySelector('.ad-title').textContent;
        trackEvent('Ad', 'View', adTitle);
    }
});

// Performance monitoring
window.addEventListener('load', function() {
    const loadTime = window.performance.timing.domContentLoadedEventEnd - window.performance.timing.navigationStart;
    console.log('Page load time:', loadTime, 'ms');
    
    // Track performance metrics
    trackEvent('Performance', 'Load Time', Math.round(loadTime / 1000) + 's');
});

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    // Could send to error tracking service
});

// Unhandled promise rejection handling
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    // Could send to error tracking service
});