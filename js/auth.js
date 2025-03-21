// Constants
const USERS_KEY = 'shubhlabh_users';
const CURRENT_USER_KEY = 'shubhlabh_current_user';
const RESET_EMAIL_KEY = 'shubhlabh_reset_email';
const OTP_KEY = 'shubhlabh_otp_data';
const AUTH_TOKEN_KEY = 'shubhlabh_auth_token';
const SESSION_TIMESTAMP_KEY = 'shubhlabh_session_timestamp';

// Session timeout in milliseconds (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;

// Email verification constants
const EMAIL_VERIFICATION_KEY = 'shubhlabh_verified_emails';
const VERIFICATION_TIMEOUT = 60000; // 1 minute timeout for verification process

// Add these constants for OTP
const OTP_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds

// Helper Functions
function showMessage(message, isError = false, isLoading = false) {
    const messageElement = document.getElementById('message');
    if (!messageElement) return;
    
    messageElement.textContent = message;
    
    if (isLoading) {
        messageElement.className = 'message loading';
    } else {
    messageElement.className = isError ? 'message error' : 'message success';
    }
    
    messageElement.style.display = 'block';
    
    // Only auto-hide if not loading
    if (!isLoading) {
    // Hide message after 3 seconds
    setTimeout(() => {
        messageElement.textContent = '';
        messageElement.style.display = 'none';
    }, 3000);
    }
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
    // Basic format validation
    const basicFormatRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!basicFormatRegex.test(email)) {
        return { valid: false, reason: 'Invalid email format' };
    }
    
    // Check for common typos in popular domains
    const domain = email.split('@')[1];
    const typos = {
        'gmial.com': 'gmail.com',
        'gmal.com': 'gmail.com',
        'gamil.com': 'gmail.com',
        'gnail.com': 'gmail.com',
        'gmail.co': 'gmail.com',
        'gmail.cm': 'gmail.com',
        'yaho.com': 'yahoo.com',
        'yhaoo.com': 'yahoo.com',
        'hotmial.com': 'hotmail.com',
        'hotmal.com': 'hotmail.com',
        'outloo.com': 'outlook.com',
        'outlok.com': 'outlook.com'
    };
    
    if (typos[domain]) {
        const suggestion = email.split('@')[0] + '@' + typos[domain];
        return { valid: false, reason: `Did you mean ${suggestion}?` };
    }
    
    return { valid: true };
}

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function redirectToPage(page) {
    window.location.href = page;
}

function generateAuthToken() {
    // Generate a random token
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
}

// Session Management
function createSession(email) {
    const token = generateAuthToken();
    localStorage.setItem(CURRENT_USER_KEY, email);
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(SESSION_TIMESTAMP_KEY, Date.now().toString());
    return token;
}

function validateSession() {
    const currentUser = localStorage.getItem(CURRENT_USER_KEY);
    const authToken = localStorage.getItem(AUTH_TOKEN_KEY);
    const timestamp = localStorage.getItem(SESSION_TIMESTAMP_KEY);
    
    if (!currentUser || !authToken || !timestamp) {
        return false;
    }
    
    // Check if session has expired
    const currentTime = Date.now();
    const sessionTime = parseInt(timestamp);
    
    if (currentTime - sessionTime > SESSION_TIMEOUT) {
        clearSession();
        return false;
    }
    
    // Update timestamp to extend session
    localStorage.setItem(SESSION_TIMESTAMP_KEY, currentTime.toString());
    return true;
}

function clearSession() {
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(SESSION_TIMESTAMP_KEY);
}

// Check if user is logged in and handle page access
function checkAuth() {
    const currentPage = window.location.pathname.split('/').pop();
    const isLoggedIn = validateSession();
    
    // Pages that require authentication
    const securePages = ['dashboard.html'];
    
    // Pages that should not be accessible if logged in
    const authPages = ['index.html', 'signup.html', 'forgot-password.html', 
                       'verify-otp.html', 'reset-password.html', ''];
    
    // If on a secure page and not logged in, redirect to login
    if (securePages.includes(currentPage) && !isLoggedIn) {
        showMessage('Session expired. Please login again.', true);
        redirectToPage('index.html');
        return;
    }
    
    // If on an auth page and already logged in, redirect to dashboard
    if (authPages.includes(currentPage) && isLoggedIn) {
        redirectToPage('dashboard.html');
        return;
    }
    
    // Special case for password reset flow
    if ((currentPage === 'verify-otp.html' || currentPage === 'reset-password.html') && 
        !localStorage.getItem(RESET_EMAIL_KEY)) {
        showMessage('Password reset session expired. Please try again.', true);
        redirectToPage('forgot-password.html');
        return;
    }
}

// Prevent back navigation after logout
function preventBackNavigation() {
    window.history.pushState(null, null, window.location.href);
    window.onpopstate = function() {
        window.history.pushState(null, null, window.location.href);
    };
}

// Update the clearFormFields function to respect "Remember me"
function clearFormFields() {
    // Check if we should remember the user
    const rememberedUser = localStorage.getItem('rememberedUser');
    
    // Find all form elements
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.reset(); // Reset all form fields
    });
    
    // Clear all password fields for security
    const passwordFields = document.querySelectorAll('input[type="password"]');
    passwordFields.forEach(field => field.value = '');
    
    // Only clear email fields if "Remember me" is not set
    if (!rememberedUser) {
        const emailFields = document.querySelectorAll('input[type="email"]');
        emailFields.forEach(field => field.value = '');
    } else {
        // If we have a remembered user, set the email field and checkbox
        const emailField = document.getElementById('email');
        const rememberMeCheckbox = document.getElementById('rememberMe');
        
        if (emailField) emailField.value = rememberedUser;
        if (rememberMeCheckbox) rememberMeCheckbox.checked = true;
    }
}

// Update the document ready function
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication status first
    checkAuth();
    
    // Then clear form fields (but respect "Remember me")
    clearFormFields();
    
    // Get the current page and initialize appropriate event listeners
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
            preventBackNavigation(); // Prevent back navigation
            break;
        case 'reset-password.html':
            initResetPasswordPage();
            preventBackNavigation(); // Prevent back navigation
            break;
        case 'dashboard.html':
            initDashboardPage();
            preventBackNavigation(); // Prevent back navigation
            break;
    }
});

// Add event listener for page visibility changes (handles back button)
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
        // Page is now visible (user might have returned using back button)
        clearFormFields();
    }
});

// Add event listener for page show event (another way to catch back button)
window.addEventListener('pageshow', function(event) {
    // If the page is loaded from cache (back/forward navigation)
    if (event.persisted) {
        clearFormFields();
    }
});

// Page initializers
function initLoginPage() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
    
    // Clear any existing session when on login page
    clearSession();
    
    // Check for remembered user
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        document.getElementById('email').value = rememberedUser;
        document.getElementById('rememberMe').checked = true;
    }
    
    // Add email verification on blur
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            const email = this.value.trim();
            if (!email) return;
            
            // Only verify if not already verified
            if (!isEmailVerified(email)) {
                verifyEmailExists(email);
            }
        });
    }
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        if (!email || !password) {
            showMessage('Please fill in all fields', true);
            return;
        }
        
        // Verify email if not already verified
        if (!isEmailVerified(email)) {
            const isValid = await verifyEmailExists(email);
            if (!isValid) {
                return; // Stop form submission if email is invalid
            }
        }
        
        const user = findUserByEmail(email);
        
        if (user && user.password === password) {
            showMessage('Login successful! Redirecting...');
            
            // Create user session
            createSession(email);
            
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
    
    console.log("Signup page initialized"); // Debug log
    
    // Clear any existing session when on signup page
    clearSession();
    
    let otpTimerInterval;
    let otpVerified = false;
    
    // Add email verification and OTP sending on blur
    const emailInput = document.getElementById('email');
    const otpSection = document.getElementById('otpSection');
    
    if (emailInput && otpSection) {
        console.log("Email input and OTP section found"); // Debug log
        
        // Add a button to trigger OTP verification explicitly
        const emailContainer = emailInput.parentElement;
        const verifyButton = document.createElement('button');
        verifyButton.type = 'button';
        verifyButton.className = 'verify-email-btn';
        verifyButton.textContent = 'Verify Email';
        verifyButton.style.marginTop = '10px';
        verifyButton.style.padding = '8px 16px';
        verifyButton.style.backgroundColor = '#53A318';
        verifyButton.style.color = 'white';
        verifyButton.style.border = 'none';
        verifyButton.style.borderRadius = '4px';
        verifyButton.style.cursor = 'pointer';
        emailContainer.appendChild(verifyButton);
        
        // Handle verify button click
        verifyButton.addEventListener('click', async function() {
            const email = emailInput.value.trim();
            if (!email) {
                showMessage('Please enter your email address', true);
                return;
            }
            
            console.log("Verify button clicked for email:", email); // Debug log
            
            // Basic email validation
            if (!email.includes('@') || !email.includes('.')) {
                showMessage('Please enter a valid email address', true);
                return;
            }
            
            // Generate and send OTP
            const otp = generateOTP();
            console.log("Generated OTP:", otp); // Debug log
            saveOTPData(email, otp);
            
            try {
                // Show loading message
                showMessage('Sending verification code...', false, true);
                
                // Log the OTP to console for testing
                console.log(`[TEST MODE] Email: ${email}, OTP: ${otp}`);
                
                // Make OTP section visible immediately
                otpSection.style.display = 'block';
                otpSection.style.opacity = '1';
                
                // Start OTP timer
                if (otpTimerInterval) clearInterval(otpTimerInterval);
                otpTimerInterval = startOTPTimer();
                
                showMessage('Verification code sent! Check console for the code (test mode)', false);
            } catch (error) {
                console.error("Error in OTP process:", error);
                showMessage('Error sending verification code. Please try again.', true);
            }
        });
        
        // Keep the original blur event for compatibility
        emailInput.addEventListener('blur', async function() {
            const email = this.value.trim();
            if (!email) return;
            
            console.log("Email blur event for:", email); // Debug log
            
            // Simple validation for testing
            if (!email.includes('@') || !email.includes('.')) {
                return; // Don't show error on blur, let the button handle it
            }
        });
        
        // Add resend OTP functionality
        const resendOtpButton = document.getElementById('resendOtp');
        if (resendOtpButton) {
            resendOtpButton.addEventListener('click', async function() {
                const email = emailInput.value.trim();
                if (!email) {
                    showMessage('Please enter your email address first', true);
                    return;
                }
                
                // Disable the button temporarily to prevent spam
                this.disabled = true;
                this.textContent = 'Sending...';
                
                // Generate new OTP
                const otp = generateOTP();
                console.log(`New OTP for ${email}: ${otp}`); // For testing
                
                // Save OTP data
                saveOTPData(email, otp);
                
                // Send actual email with OTP
                const emailSent = await sendEmailOTP(email, otp);
                
                if (emailSent) {
                    // Reset OTP input if it exists
                    const otpInput = document.getElementById('otp');
                    if (otpInput) {
                        otpInput.value = '';
                        otpInput.disabled = false;
                        
                        // Reset any verification status
                        const otpStatusIcon = document.getElementById('otpStatusIcon');
                        if (otpStatusIcon) {
                            otpStatusIcon.className = '';
                            otpStatusIcon.textContent = '';
                            otpStatusIcon.style.opacity = '';
                        }
                        
                        const wrapper = otpInput.closest('.otp-input-wrapper');
                        if (wrapper) {
                            wrapper.classList.remove('filling-success', 'filling-error');
                        }
                    }
                    
                    // Reset OTP verification status
                    otpVerified = false;
                    
                    // Restart OTP timer
                    if (otpTimerInterval) clearInterval(otpTimerInterval);
                    otpTimerInterval = startOTPTimer();
                    
                    // Re-enable the button after a delay
                    setTimeout(() => {
                        this.disabled = false;
                        this.textContent = 'Resend';
                    }, 30000); // 30 seconds cooldown
                    
                    showMessage('New verification code sent!', false);
                } else {
                    // Re-enable the button if sending failed
                    this.disabled = false;
                    this.textContent = 'Resend';
                }
            });
        }
    } else {
        console.error("Could not find email input or OTP section"); // Debug log
    }
    
    // Handle OTP verification
    const otpInput = document.getElementById('otp');
    const otpStatusIcon = document.getElementById('otpStatusIcon');
    let otpAttempts = 0; // Track number of attempts
    
    if (otpInput && otpStatusIcon) {
        otpInput.addEventListener('input', function() {
            // Auto-verify when 6 digits are entered
            if (this.value.length === 6) {
                const email = emailInput.value.trim();
                const userOTP = this.value.trim();
                
                console.log("Verifying OTP:", userOTP, "for email:", email);
                
                // Get the stored OTP data
                const otpDataStr = localStorage.getItem(OTP_KEY);
                if (!otpDataStr) {
                    showVerificationError(otpInput, otpStatusIcon);
                    return;
                }
                
                // Verify after a short delay to allow user to see what they typed
                setTimeout(() => {
                    if (verifyOTP(email, userOTP)) {
                        // OTP is correct - show success animation
                        showVerificationSuccess(otpInput, otpStatusIcon);
                        otpVerified = true;
                        
                        // Hide OTP section after animation completes
                        setTimeout(() => {
                            otpSection.style.opacity = '0';
                            setTimeout(() => {
                                otpSection.style.display = 'none';
                            }, 500);
                        }, 3000);
                    } else {
                        // OTP is incorrect - show error animation
                        showVerificationError(otpInput, otpStatusIcon);
                        otpAttempts++;
                        
                        // If too many attempts, offer to resend
                        if (otpAttempts >= 3) {
                            setTimeout(() => {
                                showMessage('Too many incorrect attempts. Try resending the code.', true);
                            }, 2000);
                        }
                    }
                }, 300);
            }
        });
    }
    
    // Update form submission to check OTP verification
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const countryCode = document.getElementById('selectedCountryCode').value;
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (!name || !email || !phone || !password || !confirmPassword) {
            showMessage('Please fill in all fields', true);
            return;
        }
        
        // Check if OTP section is visible but not verified
        if (otpSection.style.display === 'block' && !otpVerified) {
            showMessage('Please verify your email with the OTP sent', true);
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
        users.push({ 
            name, 
            email, 
            phone: countryCode + phone, 
            countryCode,
            password,
            emailVerified: true
        });
        saveUsers(users);
        
        showMessage('Account created successfully! Redirecting to login...');
        
        // Clean up
        if (otpTimerInterval) clearInterval(otpTimerInterval);
        localStorage.removeItem(OTP_KEY);
        
        // Redirect to login page after a short delay
        setTimeout(() => {
            redirectToPage('index.html');
        }, 1500);
    });
    
    // Fix login link
    const loginLink = document.getElementById('loginLink');
    if (loginLink) {
        loginLink.addEventListener('click', function(e) {
            e.preventDefault();
            clearSession();
            redirectToPage('index.html');
        });
    }
}

function initForgotPasswordPage() {
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    if (!forgotPasswordForm) return;
    
    // Clear any existing session
    clearSession();
    
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
    
    // Fix login link
    const loginLink = document.querySelector('.link[href="index.html"]');
    if (loginLink) {
        loginLink.addEventListener('click', function(e) {
            e.preventDefault();
            clearSession(); // Ensure no active session
            redirectToPage('index.html');
        });
    }
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
    // Verify session is valid
    if (!validateSession()) {
        showMessage('Session expired. Please login again.', true);
        clearSession();
        redirectToPage('index.html');
        return;
    }
    
    const currentUserEmail = localStorage.getItem(CURRENT_USER_KEY);
    const user = findUserByEmail(currentUserEmail);
    
    // Display current user's name
    const userNameElement = document.getElementById('userEmail');
    if (userNameElement && user) {
        // Use name if available, otherwise use email
        userNameElement.textContent = user.name || currentUserEmail;
    }
    
    // Handle logout
    const logoutButton = document.getElementById('logoutBtn');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            clearSession();
            redirectToPage('index.html');
        });
    }
}

// Simplified email verification functions
function isEmailVerified(email) {
    const verifiedEmails = getVerifiedEmails();
    return verifiedEmails.includes(email.toLowerCase());
}

function getVerifiedEmails() {
    const verifiedEmails = localStorage.getItem(EMAIL_VERIFICATION_KEY);
    return verifiedEmails ? JSON.parse(verifiedEmails) : [];
}

function addVerifiedEmail(email) {
    const verifiedEmails = getVerifiedEmails();
    if (!verifiedEmails.includes(email.toLowerCase())) {
        verifiedEmails.push(email.toLowerCase());
        localStorage.setItem(EMAIL_VERIFICATION_KEY, JSON.stringify(verifiedEmails));
    }
}

// Simpler email verification API
function verifyEmailExists(email) {
    return new Promise((resolve) => {
        // Show loading message
        showMessage('Verifying email address...', false, true);
        
        setTimeout(() => {
            // Check basic validation first
            const validation = validateEmail(email);
            if (!validation.valid) {
                showMessage(validation.reason, true);
                resolve(false);
                return;
            }
            
            // List of non-existent emails for demo
            const nonExistentEmails = [
                'nonexistent@gmail.com',
                'fake.user@yahoo.com',
                'notreal@hotmail.com',
                'invalid@outlook.com'
            ];
            
            if (nonExistentEmails.includes(email.toLowerCase())) {
                showMessage('This email address does not exist', true);
                resolve(false);
                return;
            }
            
            // Email is valid and exists
            showMessage('Email verified successfully!');
            addVerifiedEmail(email);
            resolve(true);
        }, 1000);
    });
}

// Function to save OTP data
function saveOTPData(email, otp) {
    const otpData = {
        email: email,
        otp: otp,
        timestamp: Date.now(),
        expires: Date.now() + OTP_EXPIRY
    };
    localStorage.setItem(OTP_KEY, JSON.stringify(otpData));
    return otpData;
}

// Function to verify OTP
function verifyOTP(email, userOTP) {
    const otpDataStr = localStorage.getItem(OTP_KEY);
    if (!otpDataStr) {
        console.log("No OTP data found in localStorage");
        return false;
    }
    
    const otpData = JSON.parse(otpDataStr);
    console.log("Stored OTP data:", otpData);
    console.log("User entered OTP:", userOTP);
    console.log("Correct OTP:", otpData.otp);
    
    // Check if OTP is for the same email
    if (otpData.email.toLowerCase() !== email.toLowerCase()) {
        console.log("Email mismatch");
        return false;
    }
    
    // Check if OTP has expired
    if (Date.now() > otpData.expires) {
        console.log("OTP expired");
        return false;
    }
    
    // Check if OTP matches
    return otpData.otp === userOTP;
}

// Replace the simulateSendEmail function with a real implementation
function sendEmailOTP(email, otp) {
    showMessage(`Sending verification code to ${email}...`, false, true);
    
    // Prepare template parameters
    const templateParams = {
        to_email: email,
        otp_code: otp,
        user_email: email,
        expiry_time: '5 minutes'
    };
    
    // Send email using EmailJS
    return emailjs.send('default_service', 'otp_template', templateParams)
        .then(function(response) {
            console.log('Email sent successfully:', response);
            showMessage(`Verification code sent to ${email}`, false);
            return true;
        })
        .catch(function(error) {
            console.error('Email sending failed:', error);
            showMessage('Failed to send verification code. Please try again.', true);
            return false;
        });
}

// Function to start OTP timer
function startOTPTimer() {
    const timerElement = document.getElementById('otpTimer');
    if (!timerElement) return;
    
    const otpDataStr = localStorage.getItem(OTP_KEY);
    if (!otpDataStr) return;
    
    const otpData = JSON.parse(otpDataStr);
    const expiryTime = otpData.expires;
    
    // Update timer every second
    const timerInterval = setInterval(() => {
        const now = Date.now();
        const timeLeft = Math.max(0, expiryTime - now);
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerElement.textContent = "00:00";
            timerElement.style.color = "#dc3545";
            return;
        }
        
        const minutes = Math.floor(timeLeft / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);
        
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
    
    return timerInterval;
}

// Update the OTP verification functions
function showVerificationSuccess(inputElement, iconElement) {
    // Store the wrapper element
    const wrapper = inputElement.closest('.otp-input-wrapper');
    
    // Add the filling animation class
    wrapper.classList.add('filling-success');
    
    // Show checkmark icon
    iconElement.textContent = '✓';
    iconElement.className = 'otp-status-icon success';
    
    // Disable the input but keep it visible
    inputElement.disabled = true;
    
    // Show success message
    showMessage('Email verified successfully!', false);
}

function showVerificationError(inputElement, iconElement) {
    // Store the wrapper element
    const wrapper = inputElement.closest('.otp-input-wrapper');
    
    // Reset the icon element completely first
    iconElement.className = '';
    iconElement.textContent = '';
    iconElement.style.opacity = '';
    
    // Force a reflow to ensure the reset takes effect
    void iconElement.offsetWidth;
    
    // Add the filling animation class
    wrapper.classList.add('filling-error');
    
    // Show X icon - explicitly set opacity to 1
    iconElement.textContent = '✗';
    iconElement.className = 'otp-status-icon failure';
    iconElement.style.opacity = '1';
    
    // Show error message
    showMessage('Incorrect verification code. Please try again.', true);
    
    // Hide the error icon after 1 second
    setTimeout(() => {
        iconElement.style.opacity = '0';
    }, 1000);
    
    // Reset after animation completes
    setTimeout(() => {
        wrapper.classList.remove('filling-error');
        inputElement.value = '';
        inputElement.focus();
        
        // Reset the icon element completely
        iconElement.className = '';
        iconElement.textContent = '';
        iconElement.style.opacity = '';
    }, 2000);
} 