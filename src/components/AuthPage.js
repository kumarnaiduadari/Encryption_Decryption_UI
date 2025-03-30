import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import './AuthPage.css';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [activeForm, setActiveForm] = useState('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '', googleOtp: '' });
  const [registerForm, setRegisterForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [forgotForm, setForgotForm] = useState({ 
    email: '', 
    otp: '', 
    newPassword: '', 
    confirmNewPassword: '' 
  });
  const [lostAuthForm, setLostAuthForm] = useState({ 
    email: '', 
    otp: '' 
  });
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [errors, setErrors] = useState({});
  const [otpTimer, setOtpTimer] = useState(120);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');
  const [referenceKey, setReferenceKey] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (isOtpSent && otpTimer > 0 && !isOtpVerified) {
      timer = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOtpSent, otpTimer, isOtpVerified]);

  useEffect(() => {
    if (otpTimer === 0 && !isOtpVerified) {
      setIsOtpSent(false);
      setErrors({ otp: 'OTP has expired. Please request a new one.' });
    }
  }, [otpTimer, isOtpVerified]);

  const validateLogin = () => {
    const newErrors = {};
    if (!loginForm.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(loginForm.email)) newErrors.email = 'Email is invalid';
    if (!loginForm.password) newErrors.password = 'Password is required';
    if (!loginForm.googleOtp) newErrors.googleOtp = 'Google Authenticator OTP is required';
    else if (!/^\d{6}$/.test(loginForm.googleOtp)) newErrors.googleOtp = 'OTP must be a 6-digit number';
    return newErrors;
  };

  const validateRegister = () => {
    const newErrors = {};
    if (!registerForm.firstName) newErrors.firstName = 'First name is required';
    if (!registerForm.lastName) newErrors.lastName = 'Last name is required';
    if (!registerForm.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(registerForm.email)) newErrors.email = 'Email is invalid';
    if (!registerForm.password) newErrors.password = 'Password is required';
    else if (registerForm.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (registerForm.password !== registerForm.confirmPassword) 
      newErrors.confirmPassword = 'Passwords do not match';
    return newErrors;
  };

  const validateForgot = () => {
    const newErrors = {};
    if (!forgotForm.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(forgotForm.email)) newErrors.email = 'Email is invalid';
    if (isOtpSent && !isOtpVerified) {
      if (!forgotForm.otp) newErrors.otp = 'OTP is required';
      else if (!/^\d{6}$/.test(forgotForm.otp)) newErrors.otp = 'OTP must be a 6-digit number';
    }
    if (isOtpVerified) {
      if (!forgotForm.newPassword) newErrors.newPassword = 'New password is required';
      else if (forgotForm.newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters';
      if (forgotForm.newPassword !== forgotForm.confirmNewPassword) 
        newErrors.confirmNewPassword = 'Passwords do not match';
    }
    return newErrors;
  };

  const validateLostAuth = () => {
    const newErrors = {};
    if (!lostAuthForm.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(lostAuthForm.email)) newErrors.email = 'Email is invalid';
    if (isOtpSent && !isOtpVerified) {
      if (!lostAuthForm.otp) newErrors.otp = 'OTP is required';
      else if (!/^\d{6}$/.test(lostAuthForm.otp)) newErrors.otp = 'OTP must be a 6-digit number';
    }
    return newErrors;
  };

  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleRegisterChange = (e) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleForgotChange = (e) => {
    setForgotForm({ ...forgotForm, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleLostAuthChange = (e) => {
    const { name, value } = e.target;
    setLostAuthForm({ ...lostAuthForm, [name]: value });
    
    if (name === 'email' && value && /\S+@\S+\.\S+/.test(value)) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
    if (name === 'otp' && value && /^\d{6}$/.test(value)) {
      setErrors(prev => ({ ...prev, otp: '' }));
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateLogin();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    const payload = {
      email: loginForm.email,
      password: loginForm.password,
      otp: loginForm.googleOtp
    };
    try {
      const response = await axios.post('http://localhost:8000/login', payload);
      console.log('Login successful:', response.data);
      localStorage.setItem("authenticated", "true");
      localStorage.setItem("email", loginForm.email)
      navigate('/home');
    } catch (error) {
      console.error('Login error:', error.response);
      setErrors({ server: error.response?.data?.detail || 'Login failed' });
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateRegister();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    const { confirmPassword, ...userData } = registerForm;
    const payload = {
      first_name: userData.firstName,
      last_name: userData.lastName,
      email: userData.email,
      password: userData.password
    };
    try {
      const registerResponse = await axios.post('http://localhost:8000/add_user', payload);
      console.log('Registration successful:', registerResponse.data);

      const qrResponse = await axios.post('http://localhost:8000/generate_qr', {
        email: userData.email
      });
      console.log('QR Response:', qrResponse.data);

      const qrUrl = qrResponse.data.qr_url;
      if (qrUrl) {
        setQrCodeUrl(qrUrl);
        setActiveForm('qr-scan');
        localStorage.setItem("authenticated", "false");
        setLoginForm({ ...loginForm, email: userData.email });
      } else {
        console.log('QR code URL not found in response:', qrResponse.data);
        setErrors({ server: 'QR code generation failed - No QR URL in response' });
        setActiveForm('login');
      }

      setRegisterForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error:', error.response);
      setErrors({ server: error.response?.data?.detail || 'Registration or QR code generation failed' });
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForgot();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!isOtpSent) {
      try {
        const response = await axios.post('http://localhost:8000/generate_otp', {
          email: forgotForm.email
        });
        console.log('OTP sent:', response.data);
        const refKey = response.data.reference_key;
        setReferenceKey(refKey);
        setIsOtpSent(true);
        setOtpTimer(120);
        setOtpMessage(`Enter OTP with this reference key: ${refKey}`);
      } catch (error) {
        setErrors({ server: error.response?.data?.message || 'Failed to send OTP' });
      }
    } else if (isOtpSent && !isOtpVerified) {
      try {
        setIsVerifying(true);
        const response = await axios.post('http://localhost:8000/verify_otp_fp', {
          email: forgotForm.email,
          otp: forgotForm.otp,
          reference_key: referenceKey
        });
        console.log('OTP verified:', response.data);
        setIsOtpVerified(true);
        setOtpMessage('OTP verified successfully. Please enter your new password.');
        setErrors({});
      } catch (error) {
        setErrors({ server: error.response?.data?.message || 'Invalid OTP' });
      } finally {
        setIsVerifying(false);
      }
    } else if (isOtpVerified) {
      try {
        const response = await axios.post('http://localhost:8000/update_password', {
          email: forgotForm.email,
          new_password: forgotForm.newPassword
        });
        console.log('Password reset successful:', response.data);
        setOtpMessage('Password reset successfully. Please log in with your new password.');
        setActiveForm('login');
        setIsOtpSent(false);
        setIsOtpVerified(false);
        setForgotForm({ email: '', otp: '', newPassword: '', confirmNewPassword: '' });
        setReferenceKey('');
      } catch (error) {
        setErrors({ server: error.response?.data?.message || 'Failed to reset password' });
      }
    }
  };

  const handleLostAuthSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateLostAuth();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!isOtpSent) {
      try {
        const response = await axios.post('http://localhost:8000/generate_otp', {
          email: lostAuthForm.email
        });
        console.log('OTP sent:', response.data);
        const refKey = response.data.reference_key;
        setReferenceKey(refKey);
        setIsOtpSent(true);
        setOtpTimer(120);
        setOtpMessage(`Enter OTP with this reference key: ${refKey}`);
        setErrors({});
      } catch (error) {
        setErrors({ server: error.response?.data?.message || 'Failed to send OTP' });
      }
    } else if (isOtpSent && !isOtpVerified) {
      try {
        setIsVerifying(true);
        const response = await axios.post('http://localhost:8000/verify_otp_qr', {
          email: lostAuthForm.email,
          otp: lostAuthForm.otp,
          reference_key: referenceKey
        });
        console.log('OTP verified:', response.data);
        const qrUrl = response.data.qr_url;
        if (qrUrl) {
          setQrCodeUrl(qrUrl);
          setIsOtpVerified(true);
          setOtpMessage('Scan the QR code to reset your authenticator.');
          setErrors({});
        } else {
          setErrors({ server: 'QR code URL not found in response' });
        }
      } catch (error) {
        setErrors({ server: error.response?.data?.message || 'Invalid OTP' });
      } finally {
        setIsVerifying(false);
      }
    }
  };

  const handleSwitch = (login) => {
    setIsLogin(login);
    setActiveForm(login ? 'login' : 'register');
    setErrors({});
  };

  const handleForgotPassword = () => {
    setActiveForm('forgot');
    setIsLogin(true);
    setErrors({});
    setIsOtpSent(false);
    setIsOtpVerified(false);
    setOtpTimer(120);
    setOtpMessage('');
    setReferenceKey('');
  };

  const handleLostAuthenticator = () => {
    setActiveForm('lost-auth');
    setIsLogin(true);
    setErrors({});
    setIsOtpSent(false);
    setIsOtpVerified(false);
    setOtpTimer(120);
    setOtpMessage('');
    setReferenceKey('');
    setQrCodeUrl(null);
    setIsVerifying(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-tabs">
          <button
            className={`tab-button ${isLogin ? 'active' : ''}`}
            onClick={() => handleSwitch(true)}
          >
            Login
          </button>
          <button
            className={`tab-button ${!isLogin && activeForm === 'register' ? 'active' : ''}`}
            onClick={() => handleSwitch(false)}
          >
            Register
          </button>
        </div>

        <div className="forms-container">
          <div className={`forms-slider ${
            activeForm === 'login' ? 'slide-login' :
            activeForm === 'register' ? 'slide-register' :
            activeForm === 'forgot' ? 'slide-forgot' :
            activeForm === 'lost-auth' ? 'slide-lost-auth' :
            activeForm === 'qr-scan' ? 'slide-qr-scan' : ''
          }`}>
            <div className="form login-form">
              <form onSubmit={handleLoginSubmit}>
                <div className="input-group">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={loginForm.email}
                    onChange={handleLoginChange}
                  />
                </div>
                <div className="input-group">
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={loginForm.password}
                    onChange={handleLoginChange}
                  />
                </div>
                <div className="input-group">
                  <input
                    type="text"
                    name="googleOtp"
                    placeholder="Google Authenticator OTP"
                    value={loginForm.googleOtp}
                    onChange={handleLoginChange}
                  />
                </div>
                <button type="submit" className="auth-button">Login</button>
                <p className="forgot-link">
                  <span onClick={handleForgotPassword}>Forgot Password?</span>
                </p>
                <p className="lost-auth-link">
                  <span onClick={handleLostAuthenticator}>Lost Google Authenticator?</span>
                </p>
              </form>
            </div>

            <div className="form register-form">
              <form onSubmit={handleRegisterSubmit}>
                <div className="input-group">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={registerForm.firstName}
                    onChange={handleRegisterChange}
                  />
                </div>
                <div className="input-group">
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={registerForm.lastName}
                    onChange={handleRegisterChange}
                  />
                </div>
                <div className="input-group">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={registerForm.email}
                    onChange={handleRegisterChange}
                  />
                </div>
                <div className="input-group">
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={registerForm.password}
                    onChange={handleRegisterChange}
                  />
                </div>
                <div className="input-group">
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={registerForm.confirmPassword}
                    onChange={handleRegisterChange}
                  />
                </div>
                <button type="submit" className="auth-button">Register</button>
              </form>
            </div>

            <div className="form forgot-form">
              <form onSubmit={handleForgotSubmit}>
                <div className="input-group">
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={forgotForm.email}
                    onChange={handleForgotChange}
                    disabled={isOtpSent}
                  />
                </div>
                {isOtpSent && !isOtpVerified && (
                  <>
                    <div className="input-group">
                      <input
                        type="text"
                        name="otp"
                        placeholder="Enter OTP"
                        value={forgotForm.otp}
                        onChange={handleForgotChange}
                      />
                    </div>
                    <p className="timer">Time remaining: {otpTimer} seconds</p>
                  </>
                )}
                {isOtpVerified && (
                  <>
                    <div className="input-group">
                      <input
                        type="password"
                        name="newPassword"
                        placeholder="New Password"
                        value={forgotForm.newPassword}
                        onChange={handleForgotChange}
                      />
                    </div>
                    <div className="input-group">
                      <input
                        type="password"
                        name="confirmNewPassword"
                        placeholder="Confirm New Password"
                        value={forgotForm.confirmNewPassword}
                        onChange={handleForgotChange}
                      />
                    </div>
                  </>
                )}
                {otpMessage && <p className="otp-message">{otpMessage}</p>}
                {!isVerifying && (
                  <button 
                    type="submit" 
                    className="auth-button"
                    disabled={isOtpSent && !isOtpVerified && otpTimer === 0}
                  >
                    {!isOtpSent ? 'Send OTP' : !isOtpVerified ? 'Verify OTP' : 'Reset Password'}
                  </button>
                )}
                {isVerifying && <p className="verifying-message">Verifying OTP...</p>}
                <p className="back-link">
                  <span onClick={() => setActiveForm('login')}>Back to Login</span>
                </p>
              </form>
            </div>

            <div className="form lost-auth-form">
              <form onSubmit={handleLostAuthSubmit}>
                <div className="input-group">
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={lostAuthForm.email}
                    onChange={handleLostAuthChange}
                    disabled={isOtpSent}
                  />
                </div>
                {isOtpSent && !isOtpVerified && (
                  <>
                    <div className="input-group">
                      <input
                        type="text"
                        name="otp"
                        placeholder="Enter OTP"
                        value={lostAuthForm.otp}
                        onChange={handleLostAuthChange}
                      />
                    </div>
                    <p className="timer">Time remaining: {otpTimer} seconds</p>
                  </>
                )}
                {isOtpVerified && qrCodeUrl && (
                  <div className="qr-code-container">
                    <h3>Scan QR Code</h3>
                    <QRCodeSVG value={qrCodeUrl} size={200} />
                  </div>
                )}
                {otpMessage && <p className="otp-message">{otpMessage}</p>}
                {!isVerifying && !isOtpVerified && (
                  <button 
                    type="submit" 
                    className="auth-button"
                    disabled={isOtpSent && !isOtpVerified && otpTimer === 0}
                  >
                    {!isOtpSent ? 'Send OTP' : 'Verify OTP'}
                  </button>
                )}
                {isVerifying && <p className="verifying-message">Verifying OTP...</p>}
                <p className="back-link">
                  <span onClick={() => setActiveForm('login')}>Back to Login</span>
                </p>
              </form>
            </div>

            <div className="form qr-scan-form">
              <h3>Scan QR Code</h3>
              <p>Scan this QR code with Google Authenticator to set up 2FA.</p>
              {qrCodeUrl ? (
                <div className="qr-code-container">
                  <QRCodeSVG value={qrCodeUrl} size={200} />
                </div>
              ) : (
                <p>Loading QR code...</p>
              )}
              <button
                className="auth-button"
                onClick={() => setActiveForm('login')}
              >
                Proceed to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;