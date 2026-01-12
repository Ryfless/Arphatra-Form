// OTP Input Handling
function setupOTPInputs() {
    const inputs = document.querySelectorAll('.otp-input');
    
    inputs.forEach((input, index) => {
        // Handle input
            input.addEventListener('input', (e) => {
            let value = e.target.value;

            // hanya angka
            value = value.replace(/\D/g, '');

            // ambil 1 digit terakhir saja
            e.target.value = value.slice(-1);

            // auto pindah ke kotak berikutnya
            if (e.target.value && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });

        
        // Handle backspace
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace') {
                e.preventDefault();
                e.target.value = '';
                
                // Move to previous input
                if (index > 0) {
                    inputs[index - 1].focus();
                }
            }
        });
        
        // Handle paste
        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const pastedData = e.clipboardData.getData('text');
            const digits = pastedData.replace(/\D/g, '').split('');
            
            digits.forEach((digit, i) => {
                if (index + i < inputs.length) {
                    inputs[index + i].value = digit;
                }
            });
            
            // Focus last filled input
            if (digits.length > 0) {
                const focusIndex = Math.min(index + digits.length - 1, inputs.length - 1);
                inputs[focusIndex].focus();
            }
        });
    });
}

// Form Submit Handler
function setupFormSubmit() {
    const form = document.querySelector('.otp-form');
    
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const inputs = document.querySelectorAll('.otp-input');
            const otp = Array.from(inputs).map(input => input.value).join('');
            
            // Validation
            if (otp.length !== 6) {
                alert('Please enter all 6 digits');
                return;
            }
            
            console.log('OTP submitted:', otp);
            alert('OTP verified successfully!');
            // Here you would send the OTP to the server for verification
        });
    }
}

// Resend Code Handler
function setupResendLink() {
    const resendLink = document.querySelector('.otp-resend');
    
    if (resendLink) {
        resendLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Resend code requested');
            
            // Clear all inputs
            const inputs = document.querySelectorAll('.otp-input');
            inputs.forEach(input => input.value = '');
            
            // Focus first input
            inputs[0].focus();
            
            alert('New OTP has been sent to your email/phone');
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    setupOTPInputs();
    setupFormSubmit();
    setupResendLink();
});
