// Toggle Password Visibility
function setupPasswordToggle() {
    const eyeButtons = document.querySelectorAll('.eye-icon');
    
    eyeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const isPassword = input.type === 'password';
            
            input.type = isPassword ? 'text' : 'password';
            
            // Change icon
            this.innerHTML = isPassword 
                ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>'
                : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';
        });
    });
}

// Form Submission
function setupFormSubmit() {
    const form = document.querySelector('form');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submitted');
            // Add your form submission logic here
        });
    }
}

// Google Sign In
function setupGoogleSignIn() {
    const googleBtn = document.querySelector('.google-login-btn');
    
    if (googleBtn) {
        googleBtn.addEventListener('click', function() {
            console.log('Google Sign In clicked');
            // Add your Google Sign In logic here
        });
    }
}

// Navigation to Register
function setupNavigation() {
    const registerLink = document.getElementById('register-link');
    
    if (registerLink) {
        registerLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Add slide-out animation
            document.querySelector('.form-section').classList.add('slide-out');
            document.querySelector('.banner-section').classList.add('slide-out');
            
            // Navigate after animation
            setTimeout(() => {
                window.location.href = 'register.html';
            }, 600);
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    setupPasswordToggle();
    setupFormSubmit();
    setupGoogleSignIn();
    setupNavigation();
});
