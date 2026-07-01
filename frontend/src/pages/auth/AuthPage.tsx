import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserOutlined, KeyOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { message } from 'antd';
import { login, register } from '../../services/api';
import './AuthPage.css';

type AuthMode = 'login' | 'register';

export const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const navigate = useNavigate();

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const validate = (): string | null => {
    if (!username.trim()) return 'Please enter your username';
    if (mode === 'register') {
      if (!email.trim()) return 'Please enter your email';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email format';
      if (password.length < 6) return 'Password must be at least 6 characters';
      if (password !== confirmPassword) return 'Passwords do not match';
    } else {
      if (!password) return 'Please enter your password';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      message.error(validationError);
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'register') {
        await register(username.trim(), password, email.trim());
        message.success('Registration successful! Please sign in');
        switchMode('login');
        setUsername(username.trim());
      } else {
        const data = await login(username.trim(), password);
        message.success(`Welcome back, ${data.username}`);
        navigate(data.role === 'ADMIN' ? '/admin' : '/app');
      }
    } catch (err: any) {
      message.error(err.message || (mode === 'register' ? 'Registration failed' : 'Login failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const isLogin = mode === 'login';

  return (
    <div className="auth-page">
      {/* Background — purely atmospheric */}
      <img className="fullscreen-bg-video auth-bg-img" src="/forest.png" alt="" />
      <div className="volumetric-overlay" />
      <div className="fog-layer" />
      <div className="dark-vignette" />

      {/* Heavy dark overlay — kills background to 20% attention */}
      <div className="auth-bg-overlay" />

      {/* Center focus glow — behind card only */}
      <div className="auth-center-glow" />

      {/* Card — the single focal point */}
      <div className="auth-card">
        {/* Brand — inside card header, demoted */}
        <div className="auth-card-header">
          <div className="auth-logo">
            <span className="bar bar-1" />
            <span className="bar bar-2" />
            <span className="bar bar-3" />
            <span className="bar bar-4" />
            <span className="bar bar-5" />
          </div>
          <h1 className="auth-title">Whisper</h1>
          <p className="auth-subtitle">Real-time Translator</p>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>Username</label>
            <div className="auth-input-wrap">
              <UserOutlined className="auth-input-icon" />
              <input
                type="text"
                required
                placeholder="Enter your username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
          </div>

          {!isLogin && (
            <div className="auth-field auth-field-extra">
              <label>Email</label>
              <div className="auth-input-wrap">
                <MailOutlined className="auth-input-icon" />
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>
          )}

          <div className="auth-field">
            <label>Password</label>
            <div className="auth-input-wrap">
              <KeyOutlined className="auth-input-icon" />
              <input
                type="password"
                required
                placeholder={isLogin ? 'Enter your password' : 'At least 6 characters'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
            </div>
          </div>

          {!isLogin && (
            <div className="auth-field auth-field-extra">
              <label>Confirm Password</label>
              <div className="auth-input-wrap">
                <LockOutlined className="auth-input-icon" />
                <input
                  type="password"
                  required
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
            </div>
          )}

          <button type="submit" className="auth-submit-btn" disabled={isLoading}>
            {isLoading ? (
              <span className="auth-btn-loading">
                <span className="auth-spinner" />
                {isLogin ? 'Signing in…' : 'Creating…'}
              </span>
            ) : (
              isLogin ? 'Log In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          {isLogin ? (
            <>
              Don&apos;t have an account?{' '}
              <button type="button" className="auth-footer-link" onClick={() => switchMode('register')}>
                Create Account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button type="button" className="auth-footer-link" onClick={() => switchMode('login')}>
                Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
