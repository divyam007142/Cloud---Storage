import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Random background selector
const getRandomBackground = () => {
  const bgCount = 10;
  const randomNum = Math.floor(Math.random() * bgCount) + 1;
  return `/backgrounds/bg${randomNum}.jpg`;
};

const AuthPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [backgroundImage] = useState(getRandomBackground());

  // Active view state
  const [activeView, setActiveView] = useState('login'); // 'login' | 'register' | 'phone'

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register state
  const [registerMethod, setRegisterMethod] = useState('email'); // 'email' | 'phone'
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');

  // Phone OTP state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);

  // Load boxicons
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const response = await axios.post(`${API}/auth/login`, {
        email: loginEmail,
        password: loginPassword
      });

      login(response.data.token, response.data.user);
      navigate('/dashboard');
    } catch (error) {
      if (error.response) {
        // Backend returns specific errors - map them to our messages
        const errorMsg = error.response.data.detail || error.response.data.error;
        if (error.response.status === 404) {
          setLoginError('User not found. Please register first.');
        } else if (error.response.status === 401) {
          setLoginError('Invalid email or password');
        } else {
          setLoginError(errorMsg || 'Login failed');
        }
      } else {
        setLoginError('Network error. Please try again.');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle register
  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');
    setRegisterLoading(true);

    try {
      const requestData = registerMethod === 'email' 
        ? { email: registerEmail, password: registerPassword }
        : { email: registerPhone, password: registerPassword }; // Use phone as email for now

      const response = await axios.post(`${API}/auth/register`, requestData);

      setRegisterSuccess('Registration successful!');
      setRegisterEmail('');
      setRegisterPhone('');
      setRegisterPassword('');
      
      // Switch to login after 1.5 seconds
      setTimeout(() => {
        setActiveView('login');
        setRegisterSuccess('');
      }, 1500);
    } catch (error) {
      if (error.response) {
        const errorMsg = error.response.data.detail || error.response.data.error;
        if (error.response.status === 400 && errorMsg.includes('already registered')) {
          setRegisterError('User already registered. Please log in.');
        } else {
          setRegisterError(errorMsg || 'Registration failed');
        }
      } else {
        setRegisterError('Network error. Please try again.');
      }
    } finally {
      setRegisterLoading(false);
    }
  };

  // Setup reCAPTCHA
  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {}
      });
    }
  };

  // Handle send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setPhoneError('');
    setPhoneLoading(true);

    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
    } catch (error) {
      console.error('OTP send error:', error);
      setPhoneError('Failed to send OTP. Please check phone number format (e.g., +1234567890)');
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setPhoneLoading(false);
    }
  };

  // Handle verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setPhoneError('');
    setPhoneLoading(true);

    try {
      const result = await confirmationResult.confirm(otp);
      const idToken = await result.user.getIdToken();

      const response = await axios.post(`${API}/auth/phone-login`, {
        idToken: idToken,
        phoneNumber: phoneNumber
      });

      login(response.data.token, response.data.user);
      navigate('/dashboard');
    } catch (error) {
      console.error('OTP verification error:', error);
      setPhoneError('Invalid OTP. Please try again.');
    } finally {
      setPhoneLoading(false);
    }
  };

  // Handle view change - clear all inputs and errors
  const handleViewChange = (view) => {
    setActiveView(view);
    
    // Clear all errors
    setLoginError('');
    setRegisterError('');
    setRegisterSuccess('');
    setPhoneError('');
    
    // Clear all inputs
    setLoginEmail('');
    setLoginPassword('');
    setRegisterEmail('');
    setRegisterPhone('');
    setRegisterPassword('');
    setPhoneNumber('');
    setOtp('');
    setOtpSent(false);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <style jsx="true">{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@200;300;400;500;600;700;800;900&display=swap');
        
        * {
          font-family: "Nunito", sans-serif;
        }
        
        .glass-wrapper {
          width: 100%;
          max-width: 420px;
          background: transparent;
          border: 2px solid rgba(255, 255, 255, 0.447);
          backdrop-filter: blur(11px);
          color: #fff;
          border-radius: 12px;
          padding: 30px 40px;
        }
        
        .glass-wrapper h1 {
          font-size: 36px;
          text-align: center;
          margin-bottom: 20px;
        }
        
        .input-box {
          position: relative;
          width: 100%;
          height: 50px;
          margin: 25px 0;
        }
        
        .input-box input {
          width: 100%;
          height: 100%;
          background: transparent;
          border: none;
          outline: none;
          border: 2px solid rgba(255, 255, 255, .2);
          border-radius: 40px;
          font-size: 16px;
          color: #fff;
          padding: 20px 45px 20px 20px;
        }
        
        .input-box input::placeholder {
          color: rgba(255, 255, 255, 0.7);
        }
        
        .input-box i {
          position: absolute;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 20px;
          color: #fff;
        }
        
        .remember-forgot {
          display: flex;
          justify-content: space-between;
          font-size: 14.5px;
          margin: -15px 0 15px;
        }
        
        .remember-forgot label {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .remember-forgot label input {
          accent-color: #fff;
          width: auto;
          height: auto;
          margin: 0;
        }
        
        .remember-forgot a {
          color: #fff;
          text-decoration: none;
        }
        
        .remember-forgot a:hover {
          text-decoration: underline;
        }
        
        .btn {
          width: 100%;
          height: 45px;
          background: #fff;
          border: none;
          outline: none;
          border-radius: 40px;
          box-shadow: 0 0 10px rgba(0, 0, 0, .1);
          cursor: pointer;
          font-size: 16px;
          color: #333;
          font-weight: 600;
          margin-top: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .btn:hover {
          background: rgba(255, 255, 255, 0.9);
        }
        
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .register-link {
          font-size: 14.5px;
          text-align: center;
          margin: 20px 0 15px;
        }
        
        .register-link a,
        .register-link button {
          color: #fff;
          text-decoration: none;
          font-weight: 600;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
        }
        
        .register-link a:hover,
        .register-link button:hover {
          text-decoration: underline;
        }
        
        .error-msg {
          background: rgba(239, 68, 68, 0.9);
          color: white;
          padding: 10px 15px;
          border-radius: 8px;
          font-size: 14px;
          margin: 15px 0;
          text-align: center;
        }
        
        .success-msg {
          background: rgba(34, 197, 94, 0.9);
          color: white;
          padding: 10px 15px;
          border-radius: 8px;
          font-size: 14px;
          margin: 15px 0;
          text-align: center;
        }
        
        .tab-group {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }
        
        .tab-btn {
          flex: 1;
          padding: 10px;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 25px;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .tab-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .tab-btn.active {
          background: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.5);
        }
      `}</style>

      <div className="glass-wrapper">
        {activeView === 'login' && (
          <form onSubmit={handleLogin}>
            <h1>Login</h1>
            
            <div className="input-box">
              <input
                type="email"
                placeholder="Email"
                value={loginEmail}
                onChange={(e) => {
                  setLoginEmail(e.target.value);
                  setLoginError(''); // Clear error on input change
                }}
                required
              />
              <i className='bx bxs-user'></i>
            </div>
            
            <div className="input-box">
              <input
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => {
                  setLoginPassword(e.target.value);
                  setLoginError(''); // Clear error on input change
                }}
                required
              />
              <i className='bx bxs-lock-alt'></i>
            </div>

            {loginError && <div className="error-msg">{loginError}</div>}
            
            <button type="submit" className="btn" disabled={loginLoading}>
              {loginLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                'Login'
              )}
            </button>
            
            <div className="register-link">
              <p>
                Don't have an account?{' '}
                <button type="button" onClick={() => handleViewChange('register')}>
                  Register
                </button>
              </p>
              <p style={{ marginTop: '10px' }}>
                Or{' '}
                <button type="button" onClick={() => handleViewChange('phone')}>
                  login with phone
                </button>
              </p>
            </div>
          </form>
        )}

        {activeView === 'register' && (
          <form onSubmit={handleRegister}>
            <h1>Register</h1>
            
            <div className="tab-group">
              <button
                type="button"
                className={`tab-btn ${registerMethod === 'email' ? 'active' : ''}`}
                onClick={() => setRegisterMethod('email')}
              >
                Email
              </button>
              <button
                type="button"
                className={`tab-btn ${registerMethod === 'phone' ? 'active' : ''}`}
                onClick={() => setRegisterMethod('phone')}
              >
                Phone Number
              </button>
            </div>

            {registerMethod === 'email' ? (
              <div className="input-box">
                <input
                  type="email"
                  placeholder="Email"
                  value={registerEmail}
                  onChange={(e) => {
                    setRegisterEmail(e.target.value);
                    setRegisterError('');
                  }}
                  required
                />
                <i className='bx bxs-envelope'></i>
              </div>
            ) : (
              <div className="input-box">
                <input
                  type="tel"
                  placeholder="Phone Number (+1234567890)"
                  value={registerPhone}
                  onChange={(e) => {
                    setRegisterPhone(e.target.value);
                    setRegisterError('');
                  }}
                  required
                />
                <i className='bx bxs-phone'></i>
              </div>
            )}
            
            <div className="input-box">
              <input
                type="password"
                placeholder="Password (min 6 characters)"
                value={registerPassword}
                onChange={(e) => {
                  setRegisterPassword(e.target.value);
                  setRegisterError('');
                }}
                required
                minLength={6}
              />
              <i className='bx bxs-lock-alt'></i>
            </div>

            {registerError && <div className="error-msg">{registerError}</div>}
            {registerSuccess && <div className="success-msg">{registerSuccess}</div>}
            
            <button type="submit" className="btn" disabled={registerLoading}>
              {registerLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                'Register'
              )}
            </button>
            
            <div className="register-link">
              <p>
                Already have an account?{' '}
                <button type="button" onClick={() => handleViewChange('login')}>
                  Login
                </button>
              </p>
            </div>
          </form>
        )}

        {activeView === 'phone' && (
          <div>
            <h1>Phone Login</h1>
            
            {!otpSent ? (
              <form onSubmit={handleSendOTP}>
                <div className="input-box">
                  <input
                    type="tel"
                    placeholder="Phone Number (+1234567890)"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      setPhoneError('');
                    }}
                    required
                  />
                  <i className='bx bxs-phone'></i>
                </div>
                <p style={{ fontSize: '13px', marginTop: '-15px', marginBottom: '15px', opacity: 0.9 }}>
                  Include country code (e.g., +1 for US)
                </p>

                {phoneError && <div className="error-msg">{phoneError}</div>}
                
                <button type="submit" className="btn" disabled={phoneLoading}>
                  {phoneLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    'Send OTP'
                  )}
                </button>
                
                <div className="register-link">
                  <p>
                    <button type="button" onClick={() => handleViewChange('login')}>
                      Back to Login
                    </button>
                  </p>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP}>
                <div className="input-box">
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value);
                      setPhoneError('');
                    }}
                    required
                    maxLength={6}
                  />
                  <i className='bx bxs-key'></i>
                </div>

                {phoneError && <div className="error-msg">{phoneError}</div>}
                
                <button type="submit" className="btn" disabled={phoneLoading}>
                  {phoneLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    'Verify OTP'
                  )}
                </button>
                
                <button
                  type="button"
                  className="btn"
                  style={{ background: 'rgba(255, 255, 255, 0.2)', marginTop: '10px' }}
                  onClick={() => {
                    setOtpSent(false);
                    setOtp('');
                    setPhoneError('');
                  }}
                >
                  Change Number
                </button>
              </form>
            )}
          </div>
        )}
      </div>
      
      <div id="recaptcha-container"></div>
    </div>
  );
};

export default AuthPage;
