import React, { useState } from 'react';
import axios from 'axios';
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
  const [forgotForm, setForgotForm] = useState({ email: '' });
  const [lostAuthForm, setLostAuthForm] = useState({ email: '' });
  const [errors, setErrors] = useState({});

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
    return newErrors;
  };

  const validateLostAuth = () => {
    const newErrors = {};
    if (!lostAuthForm.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(lostAuthForm.email)) newErrors.email = 'Email is invalid';
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
    setLostAuthForm({ ...lostAuthForm, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateLogin();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    // Map frontend field names to backend expected names
    const payload = {
      email: loginForm.email,
      password: loginForm.password,
      otp: loginForm.googleOtp
    };
    try {
      const response = await axios.post('http://localhost:8000/login', payload);
      console.log('Login successful:', response.data);
      setLoginForm({ email: '', password: '', googleOtp: '' }); // Reset form
    } catch (error) {
      console.error('Login error:', error.response);
      const errorDetail = error.response?.data?.detail;
      if (Array.isArray(errorDetail)) {
        const errorMessages = errorDetail.map(err => err.msg).join(', ');
        setErrors({ server: errorMessages || 'Login failed' });
      } else {
        setErrors({ server: error.response?.data?.detail || 'Login failed' });
      }
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
      const response = await axios.post('http://localhost:8000/add_user', payload);
      console.log('Registration successful:', response.data);
      setRegisterForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      setActiveForm('login');
    } catch (error) {
      console.error('Registration error:', error.response);
      const errorDetail = error.response?.data?.detail;
      if (Array.isArray(errorDetail)) {
        const errorMessages = errorDetail.map(err => err.msg).join(', ');
        setErrors({ server: errorMessages || 'Registration failed' });
      } else {
        setErrors({ server: error.response?.data?.detail || 'Registration failed' });
      }
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForgot();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    try {
      const response = await axios.post('http://localhost:8000/api/forgot-password', forgotForm);
      console.log('OTP sent:', response.data);
      alert('OTP has been sent to your email. Please check your inbox.');
      setActiveForm('login');
    } catch (error) {
      setErrors({ server: error.response?.data?.message || 'Failed to send OTP' });
    }
  };

  const handleLostAuthSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateLostAuth();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    try {
      const response = await axios.post('http://localhost:8000/api/lost-authenticator', lostAuthForm);
      console.log('Recovery email sent:', response.data);
      alert('A recovery email has been sent. Please check your inbox.');
      setActiveForm('login');
    } catch (error) {
      setErrors({ server: error.response?.data?.message || 'Failed to send recovery email' });
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
  };

  const handleLostAuthenticator = () => {
    setActiveForm('lost-auth');
    setIsLogin(true);
    setErrors({});
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
          <div className={`forms-slider ${activeForm === 'login' ? 'slide-login' : activeForm === 'register' ? 'slide-register' : activeForm === 'forgot' ? 'slide-forgot' : 'slide-lost-auth'}`}>
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
                  {errors.email && <span className="error">{errors.email}</span>}
                </div>
                <div className="input-group">
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={loginForm.password}
                    onChange={handleLoginChange}
                  />
                  {errors.password && <span className="error">{errors.password}</span>}
                </div>
                <div className="input-group">
                  <input
                    type="text"
                    name="googleOtp"
                    placeholder="Google Authenticator OTP"
                    value={loginForm.googleOtp}
                    onChange={handleLoginChange}
                  />
                  {errors.googleOtp && <span className="error">{errors.googleOtp}</span>}
                </div>
                {errors.server && <div className="error server-error">{errors.server}</div>}
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
                  {errors.firstName && <span className="error">{errors.firstName}</span>}
                </div>
                <div className= "input-group">
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={registerForm.lastName}
                    onChange={handleRegisterChange}
                  />
                  {errors.lastName && <span className="error">{errors.lastName}</span>}
                </div>
                <div className="input-group">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={registerForm.email}
                    onChange={handleRegisterChange}
                  />
                  {errors.email && <span className="error">{errors.email}</span>}
                </div>
                <div className="input-group">
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={registerForm.password}
                    onChange={handleRegisterChange}
                  />
                  {errors.password && <span className="error">{errors.password}</span>}
                </div>
                <div className="input-group">
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={registerForm.confirmPassword}
                    onChange={handleRegisterChange}
                  />
                  {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
                </div>
                {errors.server && <div className="error server-error">{errors.server}</div>}
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
                  />
                  {errors.email && <span className="error">{errors.email}</span>}
                </div>
                {errors.server && <div className="error server-error">{errors.server}</div>}
                <button type="submit" className="auth-button">Send OTP</button>
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
                  />
                  {errors.email && <span className="error">{errors.email}</span>}
                </div>
                {errors.server && <div className="error server-error">{errors.server}</div>}
                <button type="submit" className="auth-button">Send Recovery Email</button>
                <p className="back-link">
                  <span onClick={() => setActiveForm('login')}>Back to Login</span>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;