// Backend API URL
const API_URL = 'http://localhost:8001/api';

// Firebase Configuration
const firebaseConfig = {
  apiKey: 'AIzaSyAUfUtuejZs4r_MeyyIPxJtRijy4j6aO58',
  authDomain: 'web-apps-b38b9.firebaseapp.com',
  projectId: 'web-apps-b38b9',
  appId: '1:929796983183:web:79f30cada090c2732ca3fa'
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Check if already logged in
if (localStorage.getItem('authToken')) {
  window.location.href = '/dashboard.html';
}

// Tab switching
const tabButtons = document.querySelectorAll('.tab-btn');
const tabLinks = document.querySelectorAll('.tab-link');
const authViews = document.querySelectorAll('.auth-view');

function switchTab(viewName) {
  // Hide all views
  authViews.forEach(view => view.classList.remove('active'));
  tabButtons.forEach(btn => btn.classList.remove('active'));
  
  // Show selected view
  const activeView = document.getElementById(`${viewName}Form`) || document.getElementById(`${viewName}AuthView`);
  if (activeView) {
    activeView.classList.add('active');
  }
  
  // Activate button
  const activeBtn = document.querySelector(`.tab-btn[data-view="${viewName}"]`);
  if (activeBtn) {
    activeBtn.classList.add('active');
  }
  
  // Clear all inputs and messages
  clearAllForms();
}

function clearAllForms() {
  // Clear login form
  document.getElementById('loginEmail').value = '';
  document.getElementById('loginPassword').value = '';
  document.getElementById('loginError').style.display = 'none';
  
  // Clear register form
  document.getElementById('registerEmail').value = '';
  document.getElementById('registerPassword').value = '';
  document.getElementById('registerError').style.display = 'none';
  document.getElementById('registerSuccess').style.display = 'none';
  
  // Clear phone form
  document.getElementById('phoneNumber').value = '';
  document.getElementById('otpCode').value = '';
  document.getElementById('phoneError').style.display = 'none';
  document.getElementById('phoneNumberStep').style.display = 'block';
  document.getElementById('otpVerifyStep').style.display = 'none';
}

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    switchTab(btn.dataset.view);
  });
});

tabLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    switchTab(link.dataset.view);
  });
});

// Helper functions
function showError(elementId, message) {
  const errorEl = document.getElementById(elementId);
  errorEl.textContent = message;
  errorEl.style.display = 'block';
}

function hideError(elementId) {
  const errorEl = document.getElementById(elementId);
  errorEl.style.display = 'none';
}

function showSuccess(elementId, message) {
  const successEl = document.getElementById(elementId);
  successEl.textContent = message;
  successEl.style.display = 'block';
}

// LOGIN
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError('loginError');
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      showError('loginError', data.error || 'Login failed');
      return;
    }
    
    // Store token and user
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Redirect to dashboard
    window.location.href = '/dashboard.html';
  } catch (error) {
    console.error('Login error:', error);
    showError('loginError', 'Network error. Please try again.');
  }
});

// REGISTER
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError('registerError');
  document.getElementById('registerSuccess').style.display = 'none';
  
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  
  if (password.length < 6) {
    showError('registerError', 'Password must be at least 6 characters');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      showError('registerError', data.error || 'Registration failed');
      return;
    }
    
    // Show success message
    showSuccess('registerSuccess', 'Registration successful! Switching to login...');
    
    // Clear inputs
    document.getElementById('registerEmail').value = '';
    document.getElementById('registerPassword').value = '';
    
    // Switch to login after 1.5 seconds
    setTimeout(() => {
      switchTab('login');
    }, 1500);
  } catch (error) {
    console.error('Register error:', error);
    showError('registerError', 'Network error. Please try again.');
  }
});

// PHONE OTP
let confirmationResult = null;

function setupRecaptcha() {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
      size: 'normal',
      callback: () => {
        // reCAPTCHA solved
      }
    });
  }
}

document.getElementById('sendOtpBtn').addEventListener('click', async () => {
  hideError('phoneError');
  
  const phoneNumber = document.getElementById('phoneNumber').value.trim();
  
  if (!phoneNumber.startsWith('+')) {
    showError('phoneError', 'Phone number must include country code (e.g., +1234567890)');
    return;
  }
  
  try {
    const sendBtn = document.getElementById('sendOtpBtn');
    sendBtn.textContent = 'Sending...';
    sendBtn.disabled = true;
    
    setupRecaptcha();
    const appVerifier = window.recaptchaVerifier;
    
    confirmationResult = await auth.signInWithPhoneNumber(phoneNumber, appVerifier);
    
    // Show OTP input step
    document.getElementById('phoneNumberStep').style.display = 'none';
    document.getElementById('otpVerifyStep').style.display = 'block';
    
    sendBtn.textContent = 'Send OTP';
    sendBtn.disabled = false;
  } catch (error) {
    console.error('Send OTP error:', error);
    showError('phoneError', 'Failed to send OTP. Please check the phone number format.');
    
    const sendBtn = document.getElementById('sendOtpBtn');
    sendBtn.textContent = 'Send OTP';
    sendBtn.disabled = false;
    
    // Reset reCAPTCHA
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
  }
});

document.getElementById('verifyOtpBtn').addEventListener('click', async () => {
  hideError('phoneError');
  
  const otpCode = document.getElementById('otpCode').value.trim();
  
  if (otpCode.length !== 6) {
    showError('phoneError', 'Please enter a valid 6-digit OTP');
    return;
  }
  
  try {
    const verifyBtn = document.getElementById('verifyOtpBtn');
    verifyBtn.textContent = 'Verifying...';
    verifyBtn.disabled = true;
    
    // Verify OTP with Firebase
    const result = await confirmationResult.confirm(otpCode);
    const idToken = await result.user.getIdToken();
    const phoneNumber = document.getElementById('phoneNumber').value;
    
    // Send to backend
    const response = await fetch(`${API_URL}/auth/phone-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ idToken, phoneNumber })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      showError('phoneError', data.error || 'Phone login failed');
      verifyBtn.textContent = 'Verify OTP';
      verifyBtn.disabled = false;
      return;
    }
    
    // Store token and user
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Redirect to dashboard
    window.location.href = '/dashboard.html';
  } catch (error) {
    console.error('Verify OTP error:', error);
    showError('phoneError', 'Invalid OTP. Please try again.');
    
    const verifyBtn = document.getElementById('verifyOtpBtn');
    verifyBtn.textContent = 'Verify OTP';
    verifyBtn.disabled = false;
  }
});

document.getElementById('changeNumberBtn').addEventListener('click', () => {
  document.getElementById('phoneNumberStep').style.display = 'block';
  document.getElementById('otpVerifyStep').style.display = 'none';
  document.getElementById('phoneNumber').value = '';
  document.getElementById('otpCode').value = '';
  hideError('phoneError');
  
  // Reset reCAPTCHA
  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
    window.recaptchaVerifier = null;
  }
});