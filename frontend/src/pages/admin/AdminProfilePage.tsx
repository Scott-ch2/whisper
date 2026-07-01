import React, { useState, useRef, useEffect } from 'react';
import { message } from 'antd';
import { UserOutlined, CameraOutlined, LockOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { clearToken, getToken, fetchProfile, updateProfile, updatePassword, type ProfileData } from '../../services/api';

export const AdminProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [user, setUser] = useState<ProfileData | null>(null);
  const [form, setForm] = useState({ username: '', email: '', avatar: '' });
  const [dirtyAvatar, setDirtyAvatar] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile().then(data => { setUser(data); setForm({ username: data.username, email: data.email, avatar: data.avatar }); }).catch(() => {});
  }, []);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) { message.error('Please select an image file'); return; }
    try {
      const formData = new FormData(); formData.append('file', file);
      const res = await fetch('/api/upload/avatar', { method: 'POST', headers: { Authorization: `Bearer ${getToken()}` }, body: formData });
      const json = await res.json(); const body = json.data || json;
      const url = typeof body === 'string' ? body : (body.url || body);
      if (!url) throw new Error('No URL');
      setDirtyAvatar(url); message.success('Avatar uploaded');
    } catch (err: any) { message.error('Upload failed'); }
  };

  const enterEdit = () => { setForm({ username: user?.username || '', email: user?.email || '', avatar: user?.avatar || '' }); setDirtyAvatar(null); setEditMode(true); };
  const cancelEdit = () => { setDirtyAvatar(null); setEditMode(false); };

  const handleSave = async () => {
    if (!form.username.trim()) { message.error('Username is required'); return; }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { message.error('Please enter a valid email'); return; }
    setSaving(true);
    try {
      const updated = await updateProfile({ username: form.username.trim(), email: form.email.trim(), avatar: dirtyAvatar || form.avatar });
      setUser(updated); setForm({ username: updated.username, email: updated.email, avatar: updated.avatar });
      message.success('Profile updated');
    } catch (err: any) { message.error(err.message || 'Failed to update'); }
    finally { setDirtyAvatar(null); setSaving(false); setEditMode(false); }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.oldPassword) { message.error('Enter current password'); return; }
    if (passwordForm.newPassword.length < 6) { message.error('New password must be at least 6 characters'); return; }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { message.error('Passwords do not match'); return; }
    setPasswordSaving(true);
    try { await updatePassword({ oldPassword: passwordForm.oldPassword, newPassword: passwordForm.newPassword }); message.success('Password updated'); setShowPasswordModal(false); }
    catch (err: any) { message.error(err.message || 'Failed'); }
    finally { setPasswordSaving(false); }
  };

  const currentAvatar = dirtyAvatar || form.avatar;

  return (
    <div className="admin-page" style={{ maxWidth: 500, margin: '0 auto', paddingTop: 20 }}>
      <div style={{ padding: '32px 32px 28px', borderRadius: 24, background: 'rgba(7,12,9,0.5)', backdropFilter: 'blur(28px) saturate(180%)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div className="admin-page-header" style={{ marginBottom: 20 }}>
            <h1 className="admin-page-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              Profile
            </h1>
          </div>
          <div onClick={editMode ? handleAvatarClick : undefined} style={{ width: 80, height: 80, borderRadius: '50%', margin: '0 auto 14px', padding: 3, background: 'linear-gradient(135deg, rgba(74,222,128,0.35), rgba(74,222,128,0.08))', cursor: editMode ? 'pointer' : 'default', position: 'relative' }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'radial-gradient(circle at 40% 35%, rgba(18,32,24,0.9), rgba(8,14,11,0.95))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: 'var(--accent)', overflow: 'hidden', position: 'relative' }}>
              {currentAvatar ? <img src={currentAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : <UserOutlined />}
              {editMode && <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#fff', opacity: 0, transition: 'opacity 0.25s' }} className="avatar-overlay-show"><CameraOutlined /></div>}
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
          {!editMode && (
            <>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#fff' }}>{user?.username || '—'}</h2>
              <p style={{ margin: '4px 0 12px', fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>{user?.email || '—'}</p>
              <button type="button" onClick={enterEdit} style={{ padding: '8px 20px', borderRadius: 30, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 500, fontFamily: 'var(--font-sans)', cursor: 'pointer', transition: 'all 0.25s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(74,222,128,0.2)'; e.currentTarget.style.color = 'var(--accent)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}>Edit Profile</button>
            </>
          )}
          {editMode && (
            <div style={{ marginTop: 12, textAlign: 'left' }}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', marginBottom: 5, fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)' }}>Username</label>
                <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="Your username"
                  style={{ width: '100%', height: 44, padding: '0 14px', borderRadius: 11, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#fff', fontSize: 14, fontFamily: 'var(--font-sans)', outline: 'none' }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', marginBottom: 5, fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)' }}>Email</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Your email"
                  style={{ width: '100%', height: 44, padding: '0 14px', borderRadius: 11, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#fff', fontSize: 14, fontFamily: 'var(--font-sans)', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button type="button" onClick={cancelEdit} style={{ flex: 1, padding: '10px 0', borderRadius: 11, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-sans)', cursor: 'pointer' }}>Cancel</button>
                <button type="button" onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '10px 0', borderRadius: 11, border: 'none', background: 'var(--accent)', color: '#050a07', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-sans)', cursor: 'pointer' }}>{saving ? 'Saving…' : 'Save Changes'}</button>
              </div>
            </div>
          )}
        </div>

        {!editMode && (
          <>
            <div style={{ marginBottom: 16 }}>
              <button type="button" onClick={() => { setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' }); setShowPasswordModal(true); }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '12px 0', borderRadius: 12, border: '1px solid rgba(45,212,191,0.1)', background: 'rgba(45,212,191,0.03)', color: 'rgba(45,212,191,0.5)', fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-sans)', cursor: 'pointer', transition: 'all 0.25s' }}>
                <LockOutlined /> Change Password
              </button>
            </div>

            <button type="button" onClick={() => { clearToken(); navigate('/login'); }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '12px 0', borderRadius: 12, border: '1px solid rgba(255,80,80,0.12)', background: 'rgba(255,80,80,0.03)', color: 'rgba(255,80,80,0.5)', fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-sans)', cursor: 'pointer', transition: 'all 0.25s' }}>
              <LogoutOutlined /> Log Out
            </button>
          </>
        )}
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div onClick={() => setShowPasswordModal(false)} style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 380, padding: '28px 26px 24px', borderRadius: 24, background: 'rgba(7,12,9,0.7)', backdropFilter: 'blur(32px) saturate(200%)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 17, fontWeight: 600, color: '#fff' }}>Change Password</h3>
            {(['oldPassword', 'newPassword', 'confirmPassword'] as const).map(f => (
              <div key={f} style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', marginBottom: 5, fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)' }}>
                  {f === 'oldPassword' ? 'Current Password' : f === 'newPassword' ? 'New Password' : 'Confirm Password'}
                </label>
                <input type="password"
                  placeholder={f === 'newPassword' ? 'At least 6 characters' : 'Enter password'}
                  value={passwordForm[f]} onChange={e => setPasswordForm({ ...passwordForm, [f]: e.target.value })}
                  style={{ width: '100%', height: 44, padding: '0 14px', borderRadius: 11, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#fff', fontSize: 14, fontFamily: 'var(--font-sans)', outline: 'none' }} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button type="button" onClick={() => setShowPasswordModal(false)}
                style={{ flex: 1, padding: '11px 0', borderRadius: 11, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-sans)', cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={handleChangePassword} disabled={passwordSaving}
                style={{ flex: 1, padding: '11px 0', borderRadius: 11, border: 'none', background: 'var(--accent)', color: '#050a07', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-sans)', cursor: 'pointer' }}>{passwordSaving ? 'Updating…' : 'Update Password'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfilePage;
