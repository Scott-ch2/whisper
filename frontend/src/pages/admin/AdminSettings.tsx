import React, { useState } from 'react';

const SECTIONS = ['General', 'Security', 'Storage', 'Notification', 'Model', 'Appearance'];
const THEMES = [
  { id: 'dark',   color: 'var(--c-bg)',        label: 'Dark' },
  { id: 'forest', color: '#0d2413',             label: 'Forest' },
  { id: 'aurora', color: '#0a1a1a',             label: 'Aurora' },
  { id: 'ocean',  color: '#0c1822',             label: 'Ocean' },
];

export const AdminSettings: React.FC = () => {
  const [section, setSection] = useState('General');
  const [theme, setTheme] = useState('forest');

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Settings</h1>
        <p className="admin-page-sub">System configuration & preferences</p>
      </div>

      <div className="settings-layout">
        {/* Section nav */}
        <div>
          <div className="settings-nav">
            {SECTIONS.map(s => (
              <div key={s} className={`settings-nav-item ${section === s ? 'active' : ''}`} onClick={() => setSection(s)}>
                {s}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="settings-card">
          <div className="settings-title">{section}</div>

          {section === 'General' && (
            <>
              <div className="settings-row">
                <div>
                  <div className="settings-label">System Name</div>
                  <div className="settings-desc">Display name in header</div>
                </div>
                <span style={{ color: 'var(--ink-primary)', fontWeight: 500, fontSize: 14 }}>Whisper Control Center</span>
              </div>
              <div className="settings-row">
                <div>
                  <div className="settings-label">Language</div>
                  <div className="settings-desc">Default translation language</div>
                </div>
                <span style={{ color: 'var(--accent)', fontWeight: 500, fontSize: 14 }}>English</span>
              </div>
              <div className="settings-row">
                <div>
                  <div className="settings-label">Time Zone</div>
                  <div className="settings-desc">System timezone</div>
                </div>
                <span style={{ color: 'var(--ink-primary)', fontWeight: 500, fontSize: 14 }}>UTC+8 (Asia/Shanghai)</span>
              </div>
            </>
          )}

          {section === 'Security' && (
            <>
              <div className="settings-row">
                <div>
                  <div className="settings-label">2FA</div>
                  <div className="settings-desc">Two-factor authentication</div>
                </div>
                <span style={{ color: 'var(--accent)', fontWeight: 500, fontSize: 14 }}>Enabled</span>
              </div>
              <div className="settings-row">
                <div>
                  <div className="settings-label">Session Timeout</div>
                  <div className="settings-desc">Auto logout after inactivity</div>
                </div>
                <span style={{ color: 'var(--ink-primary)', fontWeight: 500, fontSize: 14 }}>30 min</span>
              </div>
              <div className="settings-row">
                <div>
                  <div className="settings-label">API Key</div>
                  <div className="settings-desc">Last rotated 3 days ago</div>
                </div>
                <span style={{ color: 'var(--ink-tertiary)', fontWeight: 500, fontSize: 14 }}>••••••••</span>
              </div>
            </>
          )}

          {section === 'Appearance' && (
            <>
              <div style={{ marginBottom: 20 }}>
                <div className="settings-label" style={{ marginBottom: 10 }}>Theme</div>
                <div className="theme-grid">
                  {THEMES.map(t => (
                    <div
                      key={t.id}
                      className={`theme-chip ${t.id} ${theme === t.id ? 'active' : ''}`}
                      onClick={() => setTheme(t.id)}
                      title={t.label}
                      style={{ background: t.color }}
                    />
                  ))}
                </div>
              </div>
              <div className="settings-row">
                <div>
                  <div className="settings-label">Glass Opacity</div>
                  <div className="settings-desc">Panel transparency</div>
                </div>
                <span style={{ color: 'var(--ink-primary)', fontWeight: 500, fontSize: 14 }}>Medium</span>
              </div>
              <div className="settings-row">
                <div>
                  <div className="settings-label">Density</div>
                  <div className="settings-desc">Element spacing</div>
                </div>
                <span style={{ color: 'var(--ink-primary)', fontWeight: 500, fontSize: 14 }}>Comfortable</span>
              </div>
            </>
          )}

          {section === 'Storage' && (
            <>
              <div className="settings-row">
                <div>
                  <div className="settings-label">Audio Storage</div>
                  <div className="settings-desc">45.2 GB used of 100 GB</div>
                </div>
                <span style={{ color: 'var(--accent)', fontWeight: 500, fontSize: 14 }}>45%</span>
              </div>
              <div className="settings-row">
                <div>
                  <div className="settings-label">Auto Cleanup</div>
                  <div className="settings-desc">Delete audio after 30 days</div>
                </div>
                <span style={{ color: 'var(--accent)', fontWeight: 500, fontSize: 14 }}>On</span>
              </div>
            </>
          )}

          {section === 'Model' && (
            <>
              <div className="settings-row">
                <div>
                  <div className="settings-label">Default Model</div>
                  <div className="settings-desc">Primary translation model</div>
                </div>
                <span style={{ color: 'var(--accent)', fontWeight: 500, fontSize: 14 }}>GPT-4 Turbo</span>
              </div>
              <div className="settings-row">
                <div>
                  <div className="settings-label">Temperature</div>
                  <div className="settings-desc">Creativity level</div>
                </div>
                <span style={{ color: 'var(--ink-primary)', fontWeight: 500, fontSize: 14 }}>0.7</span>
              </div>
              <div className="settings-row">
                <div>
                  <div className="settings-label">Rate Limit</div>
                  <div className="settings-desc">Requests per minute</div>
                </div>
                <span style={{ color: 'var(--ink-primary)', fontWeight: 500, fontSize: 14 }}>500 rpm</span>
              </div>
            </>
          )}

          {section === 'Notification' && (
            <>
              <div className="settings-row">
                <div>
                  <div className="settings-label">Error Alerts</div>
                  <div className="settings-desc">Notify on translation failures</div>
                </div>
                <span style={{ color: 'var(--accent)', fontWeight: 500, fontSize: 14 }}>On</span>
              </div>
              <div className="settings-row">
                <div>
                  <div className="settings-label">Daily Digest</div>
                  <div className="settings-desc">Summary email at 6pm</div>
                </div>
                <span style={{ color: 'var(--ink-tertiary)', fontWeight: 500, fontSize: 14 }}>Off</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
