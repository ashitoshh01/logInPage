document.addEventListener('DOMContentLoaded', function () {
    const emailSection = document.getElementById('emailSection');
    const otpSection = document.getElementById('otpSection');
    const resetPasswordSection = document.getElementById('resetPasswordSection');
    const sendOtpButton = document.getElementById('sendOtpButton');
    const verifyOtpButton = document.getElementById('verifyOtpButton');
    const resetPasswordButton = document.getElementById('resetPasswordButton');
    const messageDiv = document.getElementById('message');

    let generatedOtp = null;
    let userEmail = null;

    // Simulate sending OTP
    sendOtpButton.addEventListener('click', function (e) {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();

        if (!email) {
            showMessage('Please enter your email address.', 'error');
            return;
        }

        // Validate email format (basic check)
        if (!validateEmail(email)) {
            showMessage('Please enter a valid email address.', 'error');
            return;
        }

        // Simulate checking if email exists in localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userExists = users.some(user => user.email === email);

        if (!userExists) {
            showMessage('Email does not exist.', 'error');
            return;
        }

        // Simulate sending OTP
        generatedOtp = Math.floor(1000 + Math.random() * 9000); // Generate a 4-digit OTP
        userEmail = email; // Store the email for later use
        showMessage(`OTP sent to ${email}.`, 'success');

        // Hide email section and show OTP section
        emailSection.style.display = 'none';
        otpSection.style.display = 'block';
        otpSection.classList.add('slide-down');
    });

    // Simulate OTP verification
    verifyOtpButton.addEventListener('click', function (e) {
        e.preventDefault();
        const otp = document.getElementById('otp').value.trim();

        if (!otp) {
            showMessage('Please enter the OTP.', 'error');
            return;
        }

        if (otp == generatedOtp) { // Verify the OTP
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

        // Simulate updating password in localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(user => user.email === userEmail);

        if (userIndex !== -1) {
            users[userIndex].password = newPassword; // Update the password
            localStorage.setItem('users', JSON.stringify(users)); // Save to localStorage
            showMessage('Password reset successfully. Redirecting to login page...', 'success');
            setTimeout(() => {
                window.location.href = 'index.html'; // Redirect to login page
            }, 2000);
        } else {
            showMessage('User not found.', 'error');
        }
    });

    // Function to validate email format
    function validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    // Function to show messages
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