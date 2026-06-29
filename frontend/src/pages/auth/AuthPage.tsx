import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserOutlined, KeyOutlined, GoogleOutlined, AppleOutlined, GithubOutlined } from '@ant-design/icons';
import './AuthPage.css';

export const AuthPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  return (
    <div className="auth-container">
      <div className="glass-card aura-auth-card fade-in-up">
        <div className="aura-header">
          <div className="aura-wave-logo">
            <span className="bar bar-1"></span><span className="bar bar-2"></span>
            <span className="bar bar-3"></span><span className="bar bar-4"></span><span className="bar bar-5"></span>
          </div>
          <h2 className="aura-title" style={{ fontFamily: "'Amigate', serif", fontSize: 36, letterSpacing: '3px', textShadow: '0 0 20px rgba(74,222,128,0.6)' }}>Whisper</h2>
        </div>
        <form className="aura-form" onSubmit={(e) => { e.preventDefault(); setIsLoading(true); setTimeout(() => navigate('/app'), 1000); }}>
          <div className="input-wrapper">
            <label>Email</label>
            <div className="aura-input-group"><UserOutlined className="input-icon" /><input type="email" required placeholder="Email Address" /></div>
          </div>
          <div className="input-wrapper">
            <label>Password</label>
            <div className="aura-input-group"><KeyOutlined className="input-icon" /><input type="password" required placeholder="••••••••" /></div>
          </div>
          <button type="submit" className="aura-login-btn" disabled={isLoading}>{isLoading ? 'Connecting...' : 'Log In'}</button>
        </form>
        <div className="aura-divider"><span>Or continue with</span></div>
        <div className="social-login">
          <button className="social-btn"><GoogleOutlined /></button>
          <button className="social-btn"><AppleOutlined /></button>
          <button className="social-btn"><GithubOutlined /></button>
        </div>
        <div className="aura-footer">Don't have an account? <span className="signup-link">Sign Up</span></div>
      </div>
    </div>
  );
};
