document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const messageDiv = document.getElementById('message');
    const signupBox = document.getElementById('signup-box');
    const signupLink = document.querySelector('.signup-link');
    const loginLink = document.querySelector('.login-link');
    const welcomeText = document.getElementById('welcomeText');

    // Toggle between login and signup forms
    signupLink.addEventListener('click', function (e) {
        e.preventDefault();
        loginForm.style.display = 'none';
        signupBox.style.display = 'block';
        welcomeText.style.display = 'none';
    });

    loginLink.addEventListener('click', function (e) {
        e.preventDefault();
        signupBox.style.display = 'none';
        loginForm.style.display = 'block';
        welcomeText.style.display = 'block';
    });

    // Login Form Submission
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        
        const email = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const rememberMe = document.getElementById('rememberMe').checked;

        if (!email || !password) {
            showMessage('Please fill in all fields.', 'error');
            return;
        }

        // Check if user exists in localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(user => user.email === email && user.password === password);

        if (user) {
            showMessage('Login successful! Redirecting...', 'success');
            if (rememberMe) {
                localStorage.setItem('rememberedUser', email);
            } else {
                localStorage.removeItem('rememberedUser');
            }
            setTimeout(() => {
                window.location.href = 'dashboard.html'; // Redirect to dashboard
            }, 1500);
        } else {
            showMessage('Invalid email or password.', 'error');
        }
    });

    // Signup Form Submission
    signupForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value.trim();
        const confirmPassword = document.getElementById('confirmPassword').value.trim();

        if (!email || !password || !confirmPassword) {
            showMessage('Please fill in all fields.', 'error');
            return;
        }

        // Validate email format
        if (!validateEmail(email)) {
            showMessage('Please enter a valid email address.', 'error');
            return;
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            showMessage('Passwords do not match.', 'error');
            return;
        }

        // Check if email already exists
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userExists = users.some(user => user.email === email);

        if (userExists) {
            showMessage('Email already exists.', 'error');
            return;
        }

        // Save new user to localStorage
        users.push({ email, password });
        localStorage.setItem('users', JSON.stringify(users));

        showMessage('Signup successful! You can now log in.', 'success');
        signupForm.reset();
        signupBox.style.display = 'none';
        loginForm.style.display = 'block';
        welcomeText.style.display = 'block';
    });

    // Check for remembered user
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        document.getElementById('username').value = rememberedUser;
        document.getElementById('rememberMe').checked = true;
    }

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