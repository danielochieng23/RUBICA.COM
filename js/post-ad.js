// Post Ad Page JavaScript Functionality

document.addEventListener('DOMContentLoaded', function() {
    initializePostAdPage();
});

function initializePostAdPage() {
    setupCharacterCounters();
    setupImageUpload();
    setupPricingCards();
    setupFormValidation();
    setupFormSubmission();
}

// Character counters for text fields
function setupCharacterCounters() {
    const fields = [
        { input: 'adTitle', counter: '.char-counter', max: 100 },
        { input: 'description', counter: '.char-counter', max: 1000 }
    ];

    fields.forEach(field => {
        const input = document.getElementById(field.input);
        if (input) {
            const counter = input.parentElement.querySelector(field.counter);
            
            input.addEventListener('input', function() {
                const currentLength = this.value.length;
                if (counter) {
                    counter.textContent = `${currentLength}/${field.max} characters`;
                    
                    // Change color based on usage
                    if (currentLength > field.max * 0.9) {
                        counter.style.color = '#e74c3c';
                    } else if (currentLength > field.max * 0.7) {
                        counter.style.color = '#f39c12';
                    } else {
                        counter.style.color = '#666';
                    }
                }
            });
        }
    });
}

// Image upload functionality
function setupImageUpload() {
    const uploadArea = document.getElementById('imageUploadArea');
    const imageInput = document.getElementById('imageInput');
    const imagePreview = document.getElementById('imagePreview');
    let uploadedImages = [];

    // Click to upload
    uploadArea.addEventListener('click', function() {
        imageInput.click();
    });

    // Drag and drop functionality
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
        
        const files = Array.from(e.dataTransfer.files);
        handleFileSelection(files);
    });

    // File input change
    imageInput.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        handleFileSelection(files);
    });

    function handleFileSelection(files) {
        const maxImages = 6;
        const maxFileSize = 5 * 1024 * 1024; // 5MB

        files.forEach(file => {
            if (uploadedImages.length >= maxImages) {
                showAlert('warning', 'Maximum 6 images allowed');
                return;
            }

            if (file.size > maxFileSize) {
                showAlert('error', `File ${file.name} is too large. Maximum 5MB allowed.`);
                return;
            }

            if (!file.type.startsWith('image/')) {
                showAlert('error', `File ${file.name} is not a valid image.`);
                return;
            }

            // Create preview
            const reader = new FileReader();
            reader.onload = function(e) {
                const imageData = {
                    file: file,
                    src: e.target.result,
                    id: Date.now() + Math.random()
                };

                uploadedImages.push(imageData);
                renderImagePreview();
            };
            reader.readAsDataURL(file);
        });
    }

    function renderImagePreview() {
        imagePreview.innerHTML = uploadedImages.map(image => `
            <div class="preview-item" data-id="${image.id}">
                <img src="${image.src}" alt="Preview">
                <button type="button" class="remove-image" onclick="removeImage('${image.id}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    // Global function to remove images
    window.removeImage = function(imageId) {
        uploadedImages = uploadedImages.filter(img => img.id !== imageId);
        renderImagePreview();
    };
}

// Pricing card selection
function setupPricingCards() {
    const pricingCards = document.querySelectorAll('.pricing-card');
    let selectedPackage = 'free'; // Default selection

    pricingCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remove selection from all cards
            pricingCards.forEach(c => c.classList.remove('selected'));
            
            // Add selection to clicked card
            this.classList.add('selected');
            selectedPackage = this.dataset.package;
            
            // Update image limit based on package
            updateImageLimit(selectedPackage);
        });
    });

    // Set default selection
    document.querySelector('[data-package="free"]').classList.add('selected');

    function updateImageLimit(packageType) {
        const limits = {
            'free': 3,
            'premium': 6,
            'vip': 10
        };

        const currentLimit = limits[packageType] || 3;
        const uploadArea = document.getElementById('imageUploadArea');
        const limitText = uploadArea.querySelector('p');
        
        if (limitText) {
            limitText.textContent = `PNG, JPG, GIF up to 5MB each (Max ${currentLimit} images)`;
        }
    }
}

// Form validation
function setupFormValidation() {
    const form = document.getElementById('postAdForm');
    const requiredFields = form.querySelectorAll('[required]');

    // Real-time validation
    requiredFields.forEach(field => {
        field.addEventListener('blur', function() {
            validateField(this);
        });

        field.addEventListener('input', function() {
            // Remove error styling on input
            this.classList.remove('error');
            const errorMsg = this.parentElement.querySelector('.error-message');
            if (errorMsg) {
                errorMsg.remove();
            }
        });
    });

    // Age validation
    const ageField = document.getElementById('age');
    if (ageField) {
        ageField.addEventListener('input', function() {
            const age = parseInt(this.value);
            if (age < 18) {
                showFieldError(this, 'You must be 18 or older to post an ad');
            } else if (age > 65) {
                showFieldError(this, 'Please enter a valid age');
            }
        });
    }

    // Phone number validation
    const phoneFields = ['phone', 'whatsapp'];
    phoneFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', function() {
                const phoneRegex = /^[\+]?[1-9][\d]{0,3}[\s]?[\d]{10}$/;
                if (this.value && !phoneRegex.test(this.value.replace(/\s/g, ''))) {
                    showFieldError(this, 'Please enter a valid phone number');
                }
            });
        }
    });

    // Price validation
    const priceField = document.getElementById('price');
    if (priceField) {
        priceField.addEventListener('input', function() {
            const price = parseInt(this.value);
            if (price < 500) {
                showFieldError(this, 'Minimum price is ₹500');
            }
        });
    }
}

function validateField(field) {
    const value = field.value.trim();
    
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'This field is required');
        return false;
    }

    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(field, 'Please enter a valid email address');
            return false;
        }
    }

    return true;
}

function showFieldError(field, message) {
    field.classList.add('error');
    
    // Remove existing error message
    const existingError = field.parentElement.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Add new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = 'color: #e74c3c; font-size: 0.8rem; margin-top: 0.25rem;';
    
    field.parentElement.appendChild(errorDiv);
}

// Form submission
function setupFormSubmission() {
    const form = document.getElementById('postAdForm');
    const submitBtn = document.getElementById('submitBtn');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            submitAd();
        }
    });

    function validateForm() {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');

        // Clear previous errors
        document.querySelectorAll('.error-message').forEach(msg => msg.remove());
        document.querySelectorAll('.error').forEach(field => field.classList.remove('error'));

        // Validate all required fields
        requiredFields.forEach(field => {
            if (!validateField(field)) {
                isValid = false;
            }
        });

        // Check age confirmation
        const ageConfirm = document.getElementById('ageConfirm');
        if (!ageConfirm.checked) {
            showAlert('error', 'You must confirm that you are 18 years or older');
            isValid = false;
        }

        // Check terms agreement
        const agreeTerms = document.getElementById('agreeTerms');
        if (!agreeTerms.checked) {
            showAlert('error', 'You must agree to the Terms and Conditions');
            isValid = false;
        }

        return isValid;
    }

    function submitAd() {
        const formData = new FormData();
        
        // Collect form data
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.type !== 'file' && input.type !== 'checkbox') {
                formData.append(input.name, input.value);
            } else if (input.type === 'checkbox') {
                formData.append(input.name, input.checked);
            }
        });

        // Add images
        const uploadedImages = window.uploadedImages || [];
        uploadedImages.forEach((image, index) => {
            formData.append(`image_${index}`, image.file);
        });

        // Add selected package
        const selectedPackage = document.querySelector('.pricing-card.selected');
        if (selectedPackage) {
            formData.append('package', selectedPackage.dataset.package);
        }

        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting...';

        // Simulate API call
        setTimeout(() => {
            // Reset button
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Post My Ad';

            // Show success message
            showSuccessModal();
            
            // Reset form
            form.reset();
            document.getElementById('imagePreview').innerHTML = '';
            document.querySelectorAll('.pricing-card').forEach(card => {
                card.classList.remove('selected');
            });
            document.querySelector('[data-package="free"]').classList.add('selected');
            
            // Reset character counters
            document.querySelectorAll('.char-counter').forEach(counter => {
                counter.textContent = counter.textContent.replace(/\d+/, '0');
                counter.style.color = '#666';
            });

        }, 2000);
    }
}

function showSuccessModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content" style="text-align: center; max-width: 400px;">
            <div style="color: #28a745; font-size: 4rem; margin-bottom: 1rem;">
                <i class="fas fa-check-circle"></i>
            </div>
            <h2>Ad Posted Successfully!</h2>
            <p>Your ad has been submitted for review. It will be published within 24 hours after approval.</p>
            <div style="margin-top: 2rem;">
                <button class="btn btn-primary" onclick="closeSuccessModal()">Continue</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Auto close after 5 seconds
    setTimeout(() => {
        closeSuccessModal();
    }, 5000);
}

function closeSuccessModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

// Utility function for alerts (if not already defined)
if (typeof showAlert === 'undefined') {
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
            padding: 1rem;
            border-radius: 6px;
            animation: slideInRight 0.3s ease;
        `;

        // Set background colors
        const colors = {
            success: { bg: '#d4edda', color: '#155724', border: '#c3e6cb' },
            error: { bg: '#f8d7da', color: '#721c24', border: '#f5c6cb' },
            warning: { bg: '#fff3cd', color: '#856404', border: '#ffeaa7' }
        };

        const colorSet = colors[type] || colors.error;
        alert.style.backgroundColor = colorSet.bg;
        alert.style.color = colorSet.color;
        alert.style.border = `1px solid ${colorSet.border}`;

        document.body.appendChild(alert);

        setTimeout(() => {
            alert.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => alert.remove(), 300);
        }, 3000);
    }
}

// Auto-fill form with sample data (for demonstration)
function fillSampleData() {
    if (confirm('Fill form with sample data for demonstration?')) {
        document.getElementById('adTitle').value = 'Premium Escort Service - Mumbai';
        document.getElementById('category').value = 'call-girls';
        document.getElementById('city').value = 'mumbai';
        document.getElementById('description').value = 'Professional and discrete escort service available 24/7. Experienced, educated, and beautiful companions for all occasions.';
        document.getElementById('name').value = 'Priya';
        document.getElementById('age').value = '25';
        document.getElementById('phone').value = '+91 9876543210';
        document.getElementById('price').value = '5000';
        
        // Trigger character counters
        document.getElementById('adTitle').dispatchEvent(new Event('input'));
        document.getElementById('description').dispatchEvent(new Event('input'));
    }
}

// Add a helper button for demo purposes
document.addEventListener('DOMContentLoaded', function() {
    const demoBtn = document.createElement('button');
    demoBtn.type = 'button';
    demoBtn.className = 'btn btn-outline';
    demoBtn.innerHTML = '<i class="fas fa-magic"></i> Fill Sample Data';
    demoBtn.onclick = fillSampleData;
    demoBtn.style.marginLeft = '1rem';
    
    const submitSection = document.querySelector('.submit-section');
    if (submitSection) {
        submitSection.appendChild(demoBtn);
    }
});

// Add custom CSS for error states
const style = document.createElement('style');
style.textContent = `
    .form-group input.error,
    .form-group select.error,
    .form-group textarea.error {
        border-color: #e74c3c !important;
        background-color: #fdf2f2 !important;
    }
    
    .error-message {
        color: #e74c3c;
        font-size: 0.8rem;
        margin-top: 0.25rem;
    }
`;
document.head.appendChild(style);