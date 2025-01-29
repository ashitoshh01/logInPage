document.addEventListener('DOMContentLoaded', function () {
    const emailSection = document.getElementById('emailSection');
    const otpSection = document.getElementById('otpSection');
    const resetPasswordSection = document.getElementById('resetPasswordSection');
    const sendOtpButton = document.getElementById('sendOtpButton');
    const verifyOtpButton = document.getElementById('verifyOtpButton');
    const resetPasswordButton = document.getElementById('resetPasswordButton');
    const messageDiv = document.getElementById('message');

    let generatedOtp = null;

    // Simulate sending OTP
    sendOtpButton.addEventListener('click', function (e) {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();

        if (!email) {
            showMessage('Please enter your email address.', 'error');
            return;
        }

        // Simulate API call to check if email exists
        setTimeout(() => {
            // Replace this with actual API call to check if email exists
            const validEmails = ['user@example.com', 'test@example.com']; // Add valid emails here
            if (validEmails.includes(email)) { // Check if email exists in the list
                generatedOtp = Math.floor(1000 + Math.random() * 9000); // Generate a 4-digit OTP
                showMessage(`OTP sent to ${email}.`, 'success');

                // Hide email section and show OTP section
                emailSection.style.display = 'none';
                otpSection.style.display = 'block';
                otpSection.classList.add('slide-down');
            } else {
                showMessage('Email does not exist.', 'error');
            }
        }, 1000);
    });

    // Simulate OTP verification
    verifyOtpButton.addEventListener('click', function (e) {
        e.preventDefault();
        const otp = document.getElementById('otp').value.trim();

        if (!otp) {
            showMessage('Please enter the OTP.', 'error');
            return;
        }

        if (otp == generatedOtp) { // Replace with actual OTP verification logic
            showMessage('OTP verified successfully.', 'success');

            // Hide OTP section and show reset password section
            otpSection.style.display = 'none';
            resetPasswordSection.style.display = 'block';
            resetPasswordSection.classList.add('slide-down');
        } else {
            showMessage('Invalid OTP.', 'error');
        }
    });

    // Simulate password reset
    resetPasswordButton.addEventListener('click', function (e) {
        e.preventDefault();
        const newPassword = document.getElementById('newPassword').value.trim();
        const confirmNewPassword = document.getElementById('confirmNewPassword').value.trim();

        if (!newPassword || !confirmNewPassword) {
            showMessage('Please fill in all fields.', 'error');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            showMessage('Passwords do not match.', 'error');
            return;
        }

        // Simulate API call to reset password
        setTimeout(() => {
            showMessage('Password reset successfully. Redirecting to login page...', 'success');
            setTimeout(() => {
                window.location.href = 'index.html'; // Redirect to login page
            }, 2000);
        }, 1000);
    });

    function showMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';

        // Auto-hide message after 5 seconds
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
});