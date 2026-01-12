// Password Visibility Toggle
function setupPasswordToggle() {
    const toggleButtons = document.querySelectorAll('.password-toggle');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = button.dataset.target;
            const input = document.getElementById(targetId);
            const icon = button.querySelector('img');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.src = '../assets/icons/login/eye-open.svg';
            } else {
                input.type = 'password';
                icon.src = '../assets/icons/login/eye-closed.svg';
            }
        });
    });
}

// Form Submit Handler
function setupFormSubmit() {
    const form = document.querySelector('.resetpass-form');
    
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            // Validation
            if (!currentPassword || !newPassword || !confirmPassword) {
                alert('Please fill in all fields');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                alert('New password and confirm password do not match');
                return;
            }
            
            if (newPassword.length < 8) {
                alert('Password must be at least 8 characters long');
                return;
            }
            
            console.log('Password changed successfully');
            // Here you would send the password change request to the server
            alert('Password changed successfully');
            form.reset();
        });
    }
}

// Reset My Password Link
function setupResetLink() {
    const resetLink = document.querySelector('.resetpass-link');
    
    if (resetLink) {
        resetLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Reset password link clicked');
            // This would typically navigate to a forgot password flow
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    setupPasswordToggle();
    setupFormSubmit();
    setupResetLink();
});
