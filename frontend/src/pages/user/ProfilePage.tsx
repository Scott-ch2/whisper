import React, { useState, useRef, useEffect } from 'react';
import { message } from 'antd';
import {
  UserOutlined, CameraOutlined, LockOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { clearToken, getToken, fetchProfile, updateProfile, updatePassword, type ProfileData } from '../../services/api';
import './ProfilePage.css';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [user, setUser] = useState<ProfileData | null>(null);
  const [form, setForm] = useState({ username: '', email: '', avatar: '' });
  const [dirtyAvatar, setDirtyAvatar] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Password modal ──
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    fetchProfile()
      .then(data => {
        setUser(data);
        setForm({ username: data.username, email: data.email, avatar: data.avatar });
      })
      .catch(() => {});
  }, []);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      message.error('Please select an image file');
      return;
    }

    // Upload file → get URL → store URL only (never base64 in DB)
    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = getToken();
      const res = await fetch('/api/upload/avatar', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const json = await res.json();
      // Support both { code:200, data:"url" } and { code:200, data:{url:"..."} } formats
      const body = json.data || json;
      const url = typeof body === 'string' ? body : (body.url || body);
      if (!url) throw new Error('No URL in response: ' + JSON.stringify(json));
      setDirtyAvatar(url);
      message.success('Avatar uploaded');
    } catch (err: any) {
      message.error('Avatar upload failed: ' + (err.message || 'unknown error'));
    }
  };

  const enterEdit = () => {
    setForm({ username: user?.username || '', email: user?.email || '', avatar: user?.avatar || '' });
    setDirtyAvatar(null);
    setEditMode(true);
  };

  const cancelEdit = () => {
    setDirtyAvatar(null);
    setEditMode(false);
  };

  const handleSave = async () => {
    if (!form.username.trim()) { message.error('Username is required'); return; }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      message.error('Please enter a valid email');
      return;
    }

    setSaving(true);

    const newData: ProfileData = {
      id: user?.id || 0,
      username: form.username.trim(),
      email: form.email.trim(),
      avatar: dirtyAvatar || form.avatar,
    };

    try {
      // 🔥 Call API — persist to backend
      const updated = await updateProfile({
        username: newData.username,
        email: newData.email,
        avatar: newData.avatar,
      });
      // Use server response (source of truth)
      setUser(updated);
      setForm({ username: updated.username, email: updated.email, avatar: updated.avatar });
      message.success('Profile updated successfully');
    } catch (err: any) {
      message.error(err.message || 'Failed to update profile');
    } finally {
      setDirtyAvatar(null);
      setSaving(false);
      setEditMode(false);
    }
  };

  const handleLogout = () => {
    clearToken();
    navigate('/login');
  };

  // ── Password change ──
  const openPasswordModal = () => {
    setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setShowPasswordModal(true);
  };

  const handleChangePassword = async () => {
    if (!passwordForm.oldPassword) { message.error('Please enter your current password'); return; }
    if (passwordForm.newPassword.length < 6) { message.error('New password must be at least 6 characters'); return; }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { message.error('Passwords do not match'); return; }

    setPasswordSaving(true);
    try {
      await updatePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      message.success('Password updated successfully');
      setShowPasswordModal(false);
    } catch (err: any) {
      message.error(err.message || 'Failed to update password');
    } finally {
      setPasswordSaving(false);
    }
  };

  const currentAvatar = dirtyAvatar || form.avatar;

  return (
    <div className="profile-page">
      <div className="profile-card">
        {/* ── Header: Profile title + Edit/View indicator ── */}
        <div className="profile-header">
          <h2 className="profile-heading">Profile</h2>
          <span className={`profile-mode-tag ${editMode ? 'editing' : ''}`}>
            {editMode ? 'Editing' : 'View'}
          </span>
        </div>

        {/* ── Avatar ── */}
        <div className="profile-avatar-section">
          <div className="profile-avatar-ring" onClick={editMode ? handleAvatarClick : undefined}>
            <div className="profile-avatar">
              {currentAvatar ? (
                <img src={currentAvatar} alt="Avatar" className="profile-avatar-img" />
              ) : (
                <UserOutlined />
              )}
              {editMode && (
                <div className="profile-avatar-overlay">
                  <CameraOutlined />
                </div>
              )}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          {/* ── View Mode ── */}
          {!editMode && (
            <>
              <h1 className="profile-name">{user?.username || '—'}</h1>
              <p className="profile-email">{user?.email || '—'}</p>
              <button type="button" className="profile-edit-btn" onClick={enterEdit}>
                Edit Profile
              </button>
            </>
          )}

          {/* ── Edit Mode ── */}
          {editMode && (
            <div className="profile-edit-fields">
              <div className="edit-field">
                <label>Username</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  placeholder="Your username"
                />
              </div>
              <div className="edit-field">
                <label>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="Your email"
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Security ── */}
        {editMode && (
          <div className="profile-edit-actions">
            <button type="button" className="edit-cancel-btn" onClick={cancelEdit}>
              Cancel
            </button>
            <button
              type="button"
              className="edit-save-btn"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        )}

        {/* ── Security ── */}
        {!editMode && (
          <div className="profile-security">
            <button type="button" className="security-btn" onClick={openPasswordModal}>
              <LockOutlined /> Change Password
            </button>
          </div>
        )}

        {/* ── Logout ── */}
        <button type="button" className="profile-logout-btn" onClick={handleLogout}>
          <LogoutOutlined /> Log Out
        </button>
      </div>

      {/* ── Password Modal ── */}
      {showPasswordModal && (
        <div className="password-modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="password-modal" onClick={e => e.stopPropagation()}>
            <h3 className="password-modal-title">Change Password</h3>

            <div className="password-field">
              <label>Current Password</label>
              <input
                type="password"
                placeholder="Enter current password"
                value={passwordForm.oldPassword}
                onChange={e => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
              />
            </div>

            <div className="password-field">
              <label>New Password</label>
              <input
                type="password"
                placeholder="At least 6 characters"
                value={passwordForm.newPassword}
                onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              />
            </div>

            <div className="password-field">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Re-enter new password"
                value={passwordForm.confirmPassword}
                onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              />
            </div>

            <div className="password-actions">
              <button type="button" className="password-cancel-btn" onClick={() => setShowPasswordModal(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="password-save-btn"
                onClick={handleChangePassword}
                disabled={passwordSaving}
              >
                {passwordSaving ? 'Updating…' : 'Update Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
