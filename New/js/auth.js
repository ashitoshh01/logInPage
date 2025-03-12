// Constants
const USERS_KEY = 'shubhlabh_users';
const CURRENT_USER_KEY = 'shubhlabh_current_user';
const RESET_EMAIL_KEY = 'shubhlabh_reset_email';
const OTP_KEY = 'shubhlabh_otp';

// Helper Functions
function showMessage(message, isError = false) {
    const messageElement = document.getElementById('message');
    if (!messageElement) return;
    
    messageElement.textContent = message;
    messageElement.className = isError ? 'message error' : 'message success';
    messageElement.style.display = 'block';
    
    // Hide message after 3 seconds
    setTimeout(() => {
        messageElement.textContent = '';
        messageElement.style.display = 'none';
    }, 3000);
}

function getUsers() {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function findUserByEmail(email) {
    const users = getUsers();
    return users.find(user => user.email.toLowerCase() === email.toLowerCase());
}

function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function generateOTP() {
    // Generate a 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function redirectToPage(page) {
    window.location.href = page;
}

// Check if user is logged in
function checkAuth() {
    const currentUser = localStorage.getItem(CURRENT_USER_KEY);
    
    // If on dashboard page and not logged in, redirect to login
    if (window.location.pathname.includes('dashboard') && !currentUser) {
        redirectToPage('index.html');
    }
    
    // If on login page and already logged in, redirect to dashboard
    if (window.location.pathname.includes('index.html') && currentUser) {
        redirectToPage('dashboard.html');
    }
}

// Initialize event listeners based on current page
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication status
    checkAuth();
    
    // Get the current page
    const currentPage = window.location.pathname.split('/').pop();
    
    // Initialize appropriate event listeners based on the current page
    switch(currentPage) {
        case 'index.html':
        case '':
            initLoginPage();
            break;
        case 'signup.html':
            initSignupPage();
            break;
        case 'forgot-password.html':
            initForgotPasswordPage();
            break;
        case 'verify-otp.html':
            initVerifyOTPPage();
            break;
        case 'reset-password.html':
            initResetPasswordPage();
            break;
        case 'dashboard.html':
            initDashboardPage();
            break;
    }
});

// Page initializers
function initLoginPage() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
    
    // Check for remembered user
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        document.getElementById('email').value = rememberedUser;
        document.getElementById('rememberMe').checked = true;
    }
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        if (!email || !password) {
            showMessage('Please fill in all fields', true);
            return;
        }
        
        const user = findUserByEmail(email);
        
        if (user && user.password === password) {
            showMessage('Login successful! Redirecting...');
            
            // Save user session
            localStorage.setItem(CURRENT_USER_KEY, email);
            
            // Remember user if option is checked
            if (rememberMe) {
                localStorage.setItem('rememberedUser', email);
            } else {
                localStorage.removeItem('rememberedUser');
            }
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
                redirectToPage('dashboard.html');
            }, 1500);
        } else {
            showMessage('Invalid email or password', true);
        }
    });
}

function initSignupPage() {
    const signupForm = document.getElementById('signupForm');
    if (!signupForm) return;
    
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (!email || !password || !confirmPassword) {
            showMessage('Please fill in all fields', true);
            return;
        }
        
        if (!validateEmail(email)) {
            showMessage('Please enter a valid email address', true);
            return;
        }
        
        if (password !== confirmPassword) {
            showMessage('Passwords do not match', true);
            return;
        }
        
        if (findUserByEmail(email)) {
            showMessage('Email already registered', true);
            return;
        }
        
        // Add new user
        const users = getUsers();
        users.push({ email, password });
        saveUsers(users);
        
        showMessage('Account created successfully! Redirecting to login...');
        
        // Redirect to login page after a short delay
        setTimeout(() => {
            redirectToPage('index.html');
        }, 1500);
    });
}

function initForgotPasswordPage() {
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    if (!forgotPasswordForm) return;
    
    forgotPasswordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        
        if (!email) {
            showMessage('Please enter your email address', true);
            return;
        }
        
        const user = findUserByEmail(email);
        
        if (!user) {
            showMessage('Email not registered', true);
            return;
        }
        
        // Generate and save OTP
        const otp = generateOTP();
        localStorage.setItem(RESET_EMAIL_KEY, email);
        localStorage.setItem(OTP_KEY, otp);
        
        // In a real application, send this OTP via email
        // For demo, we'll show it in an alert
        alert(`For demo purposes: Your OTP is ${otp}`);
        
        showMessage('OTP sent to your email! Redirecting...');
        
        // Redirect to OTP verification page
        setTimeout(() => {
            redirectToPage('verify-otp.html');
        }, 1500);
    });
}

function initVerifyOTPPage() {
    const verifyOTPForm = document.getElementById('verifyOTPForm');
    if (!verifyOTPForm) return;
    
    const savedEmail = localStorage.getItem(RESET_EMAIL_KEY);
    if (!savedEmail) {
        showMessage('Session expired. Please try again.', true);
        setTimeout(() => {
            redirectToPage('forgot-password.html');
        }, 1500);
        return;
    }
    
    // Show the email being verified
    const emailSpan = document.getElementById('userEmail');
    if (emailSpan) {
        emailSpan.textContent = savedEmail;
    }
    
    verifyOTPForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const enteredOTP = document.getElementById('otp').value;
        const savedOTP = localStorage.getItem(OTP_KEY);
        
        if (!enteredOTP) {
            showMessage('Please enter the OTP', true);
            return;
        }
        
        if (enteredOTP === savedOTP) {
            showMessage('OTP verified successfully! Redirecting...');
            
            // Redirect to reset password page
            setTimeout(() => {
                redirectToPage('reset-password.html');
            }, 1500);
        } else {
            showMessage('Invalid OTP. Please try again.', true);
        }
    });
    
    // Handle resend OTP
    const resendButton = document.getElementById('resendOTP');
    if (resendButton) {
        resendButton.addEventListener('click', function() {
            // Generate a new OTP
            const newOTP = generateOTP();
            localStorage.setItem(OTP_KEY, newOTP);
            
            // In a real application, send this OTP via email
            // For demo, we'll show it in an alert
            alert(`For demo purposes: Your new OTP is ${newOTP}`);
            
            showMessage('New OTP sent to your email!');
        });
    }
}

function initResetPasswordPage() {
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    if (!resetPasswordForm) return;
    
    const savedEmail = localStorage.getItem(RESET_EMAIL_KEY);
    if (!savedEmail) {
        showMessage('Session expired. Please try again.', true);
        setTimeout(() => {
            redirectToPage('forgot-password.html');
        }, 1500);
        return;
    }
    
    resetPasswordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (!newPassword || !confirmPassword) {
            showMessage('Please fill in all fields', true);
            return;
        }
        
        if (newPassword !== confirmPassword) {
            showMessage('Passwords do not match', true);
            return;
        }
        
        // Update user's password
        const users = getUsers();
        const userIndex = users.findIndex(user => user.email.toLowerCase() === savedEmail.toLowerCase());
        
        if (userIndex !== -1) {
            users[userIndex].password = newPassword;
            saveUsers(users);
            
            // Clear reset data
            localStorage.removeItem(RESET_EMAIL_KEY);
            localStorage.removeItem(OTP_KEY);
            
            showMessage('Password reset successfully! Redirecting to login...');
            
            // Redirect to login page
            setTimeout(() => {
                redirectToPage('index.html');
            }, 1500);
        } else {
            showMessage('An error occurred. Please try again.', true);
        }
    });
}

function initDashboardPage() {
    const currentUser = localStorage.getItem(CURRENT_USER_KEY);
    
    // Display current user's email
    const userEmailElement = document.getElementById('userEmail');
    if (userEmailElement && currentUser) {
        userEmailElement.textContent = currentUser;
    }
    
    // Handle logout
    const logoutButton = document.getElementById('logoutBtn');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            localStorage.removeItem(CURRENT_USER_KEY);
            redirectToPage('index.html');
        });
    }
} 