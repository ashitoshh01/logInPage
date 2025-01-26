document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const messageDiv = document.getElementById('message');
    const signupBox = document.getElementById('signup-box');
    const signupLink = document.querySelector('.signup-link');
    const loginLink = document.querySelector('.login-link');
    const welcomeText = document.getElementById('welcomeText');

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const rememberMe = document.getElementById('rememberMe').checked;

        // Validate inputs
        if (!username || !password) {
            showMessage('Please fill in all fields', 'error');
            return;
        }

        // Simulate login (replace with actual API call)
        simulateLogin(username, password, rememberMe);
    });

    signupLink.addEventListener('click', function(e) {
        e.preventDefault();
        loginForm.style.display = 'none';
        signupBox.style.display = 'block';
        welcomeText.style.display = 'none'; // Hide the "Welcome Back" text
    });

    loginLink.addEventListener('click', function(e) {
        e.preventDefault();
        signupBox.style.display = 'none';
        loginForm.style.display = 'block';
        welcomeText.style.display = 'block'; // Show the "Welcome Back" text
    });

    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get signup form values
        const signupUsername = document.getElementById('signupUsername').value.trim();
        const signupPassword = document.getElementById('signupPassword').value.trim();
        const confirmPassword = document.getElementById('confirmPassword').value.trim();

        // Validate inputs
        if (!signupUsername || !signupPassword || !confirmPassword) {
            showMessage('Please fill in all fields', 'error');
            return;
        }

        if (signupPassword !== confirmPassword) {
            showMessage('Passwords do not match', 'error');
            return;
        }

        // Simulate signup (replace with actual API call)
        simulateSignup(signupUsername, signupPassword);
    });

    function simulateLogin(username, password, rememberMe) {
        // Show loading state
        const loginButton = loginForm.querySelector('button');
        loginButton.disabled = true;
        loginButton.textContent = 'Logging in...';

        // Simulate API call
        setTimeout(() => {
            // Success scenario
            showMessage('Login successful! Redirecting...', 'success');
            
            // Store remember me preference if checked
            if (rememberMe) {
                localStorage.setItem('rememberedUser', username);
            } else {
                localStorage.removeItem('rememberedUser');
            }

            // Reset form and button
            loginButton.disabled = false;
            loginButton.textContent = 'Login';
            
            // Simulate redirect after successful login
            setTimeout(() => {
                // Replace with actual redirect
                console.log('Redirect to dashboard');
            }, 1500);
        }, 1000);
    }

    function simulateSignup(username, password) {
        // Show loading state
        const signupButton = signupForm.querySelector('button');
        signupButton.disabled = true;
        signupButton.textContent = 'Signing up...';

        // Simulate API call
        setTimeout(() => {
            // Success scenario
            showMessage('Signup successful! You can now log in.', 'success');
            
            // Reset form and button
            signupButton.disabled = false;
            signupButton.textContent = 'Sign Up';
            signupForm.reset();
            signupBox.style.display = 'none';
            loginForm.style.display = 'block';
            welcomeText.style.display = 'block'; // Show the "Welcome Back" text again
        }, 1000);
    }

    function showMessage(text, type) {
        if (type === 'error') {
            alert(text); // Show error as alert
        } else {
            messageDiv.textContent = text;
            messageDiv.className = `message ${type}`;
        }
        
        // Auto hide error messages after 5 seconds
        if (type === 'error') {
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        }
    }

    // Check for remembered user
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        document.getElementById('username').value = rememberedUser;
        document.getElementById('rememberMe').checked = true;
    }
});
