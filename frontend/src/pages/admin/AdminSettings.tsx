import React, { useEffect, useState } from 'react';
import { fetchSettings, updateSettings } from '../../services/api';

const SECTIONS = ['General', 'Security', 'Storage', 'Notification', 'Model', 'Appearance'];

export const AdminSettings: React.FC = () => {
  const [section, setSection] = useState('General');
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [theme, setTheme] = useState('forest');

  useEffect(() => {
    fetchSettings().then(s => { setSettings(s); setTheme(s.theme || 'forest'); }).catch(() => {});
  }, []);

  const update = async (key: string, val: any) => {
    const updated = { ...settings, [key]: val };
    setSettings(updated);
    await updateSettings(updated).catch(() => {});
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Settings</h1>
        <p className="admin-page-sub">System configuration & preferences</p>
      </div>
      <div className="settings-layout">
        <div><div className="settings-nav">
          {SECTIONS.map(s => (
            <div key={s} className={`settings-nav-item ${section === s ? 'active' : ''}`} onClick={() => setSection(s)}>{s}</div>
          ))}
        </div></div>
        <div className="settings-card">
          <div className="settings-title">{section}</div>
          {section === 'General' && (
            <>
              <div className="settings-row"><div><div className="settings-label">System Name</div><div className="settings-desc">Display name in header</div></div><span style={{ color: 'var(--ink-primary)', fontWeight: 500, fontSize: 14 }}>{settings.systemName || '—'}</span></div>
              <div className="settings-row"><div><div className="settings-label">Language</div><div className="settings-desc">Default translation language</div></div><span style={{ color: 'var(--accent)', fontWeight: 500, fontSize: 14 }}>{settings.language || '—'}</span></div>
              <div className="settings-row"><div><div className="settings-label">Time Zone</div><div className="settings-desc">System timezone</div></div><span style={{ color: 'var(--ink-primary)', fontWeight: 500, fontSize: 14 }}>{settings.timeZone || '—'}</span></div>
            </>
          )}
          {section === 'Appearance' && (
            <div style={{ marginBottom: 20 }}>
              <div className="settings-label" style={{ marginBottom: 10 }}>Theme</div>
              <div className="theme-grid">
                {[{ id: 'dark', color: 'var(--c-bg)', label: 'Dark' }, { id: 'forest', color: '#0d2413', label: 'Forest' }, { id: 'aurora', color: '#0a1a1a', label: 'Aurora' }, { id: 'ocean', color: '#0c1822', label: 'Ocean' }].map(t => (
                  <div key={t.id} className={`theme-chip ${t.id} ${theme === t.id ? 'active' : ''}`}
                    onClick={() => { setTheme(t.id); update('theme', t.id); }}
                    title={t.label} style={{ background: t.color }} />
                ))}
              </div>
            </div>
          )}
          {section !== 'General' && section !== 'Appearance' && (
            <div style={{ color: 'var(--ink-secondary)', fontSize: 13 }}>{settings[section.toLowerCase()] ? JSON.stringify(settings) : 'No data from API'}</div>
          )}
        </div>
      </div>
    </div>
  );
};
