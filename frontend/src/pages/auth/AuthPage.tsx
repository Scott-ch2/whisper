import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserOutlined, KeyOutlined, MailOutlined, GoogleOutlined, AppleOutlined, GithubOutlined } from '@ant-design/icons';
import { login, register } from '../../services/api';
import './AuthPage.css';

export const AuthPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      if (isRegister) {
        await register(username, password, email);
        setSuccess('注册成功！请登录');
        setIsRegister(false);
        setPassword('');
      } else {
        const data = await login(username, password);
        navigate(data.role === 'ADMIN' ? '/admin' : '/app');
      }
    } catch (err: any) {
      setError(err.message || (isRegister ? '注册失败' : '登录失败'));
    } finally {
      setIsLoading(false);
    }
  };

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

        <form className="aura-form" onSubmit={handleSubmit}>
          <div className="input-wrapper">
            <label>Username</label>
            <div className="aura-input-group">
              <UserOutlined className="input-icon" />
              <input type="text" required placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
            </div>
          </div>

          {isRegister && (
            <div className="input-wrapper">
              <label>Email</label>
              <div className="aura-input-group">
                <MailOutlined className="input-icon" />
                <input type="email" required placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>
          )}

          <div className="input-wrapper">
            <label>Password</label>
            <div className="aura-input-group">
              <KeyOutlined className="input-icon" />
              <input type="password" required placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
          </div>

          {error && <div style={{ color: '#ff5c5c', fontSize: 12, marginBottom: 12 }}>{error}</div>}
          {success && <div style={{ color: 'var(--c-green-400)', fontSize: 12, marginBottom: 12 }}>{success}</div>}

          <button type="submit" className="aura-login-btn" disabled={isLoading}>
            {isLoading ? 'Processing...' : isRegister ? 'Create Account' : 'Log In'}
          </button>
        </form>

        <div className="aura-divider"><span>Or continue with</span></div>
        <div className="social-login">
          <button className="social-btn" type="button"><GoogleOutlined /></button>
          <button className="social-btn" type="button"><AppleOutlined /></button>
          <button className="social-btn" type="button"><GithubOutlined /></button>
        </div>

        <div className="aura-footer">
          {isRegister ? (
            <>Already have an account? <span className="signup-link" onClick={() => { setIsRegister(false); setError(''); setSuccess(''); }}>Log In</span></>
          ) : (
            <>Don't have an account? <span className="signup-link" onClick={() => { setIsRegister(true); setError(''); }}>Sign Up</span></>
          )}
        </div>
      </div>
    </div>
  );
};
