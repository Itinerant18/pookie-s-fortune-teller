import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Input } from '../components/ui';
import './Pages.css';

const ProfilePage = () => {
  const { user, profile, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    username: profile?.username || '',
    bio: profile?.bio || '',
    gender: profile?.gender || '',
  });

  const stats = [
    { label: 'Predictions', value: 42, icon: '🔮' },
    { label: 'Accuracy', value: '78%', icon: '🎯' },
    { label: 'Days Active', value: 120, icon: '📅' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateProfile(formData);
    setSaving(false);
    
    if (!error) {
      setEditing(false);
    } else {
      alert('Failed to update profile. Please try again.');
    }
  };

  const getUserInitials = () => {
    const name = profile?.full_name || user?.email || '';
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U';
  };

  return (
    <div className="page profile-page">
      <div className="page-header">
        <div className="page-header-content">
          <h1>Profile</h1>
          <p>Manage your account and preferences</p>
        </div>
      </div>

      {/* Profile Card */}
      <Card className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar-large">
            {profile?.profile_image_url ? (
              <img src={profile.profile_image_url} alt="Profile" />
            ) : (
              getUserInitials()
            )}
            <button className="avatar-edit-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </button>
          </div>
          
          <div className="profile-info">
            {editing ? (
              <Input
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Your name"
              />
            ) : (
              <>
                <h2>{profile?.full_name || 'User'}</h2>
                <p className="profile-email">{user?.email}</p>
                {profile?.username && (
                  <p className="profile-username">@{profile.username}</p>
                )}
              </>
            )}
          </div>
          
          <div className="profile-actions">
            {editing ? (
              <>
                <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleSave} loading={saving}>Save</Button>
              </>
            ) : (
              <Button variant="secondary" onClick={() => setEditing(true)}>Edit Profile</Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="profile-stats">
          {stats.map(stat => (
            <div key={stat.label} className="profile-stat">
              <span className="stat-icon">{stat.icon}</span>
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Bio */}
        <div className="profile-section">
          <h4>Bio</h4>
          {editing ? (
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself..."
              className="form-input bio-input"
              rows={3}
            />
          ) : (
            <p className="bio-text">{profile?.bio || 'No bio yet. Add one to personalize your profile!'}</p>
          )}
        </div>
      </Card>

      {/* Account Settings */}
      <Card className="settings-card">
        <h3>Account Settings</h3>
        
        <div className="settings-list">
          <div className="settings-item">
            <div className="settings-item-info">
              <span className="settings-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
              <div>
                <span className="settings-label">Email</span>
                <span className="settings-value">{user?.email}</span>
              </div>
            </div>
            <Button variant="ghost" size="sm">Change</Button>
          </div>

          <div className="settings-item">
            <div className="settings-item-info">
              <span className="settings-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              </span>
              <div>
                <span className="settings-label">Password</span>
                <span className="settings-value">••••••••</span>
              </div>
            </div>
            <Button variant="ghost" size="sm">Change</Button>
          </div>

          <div className="settings-item">
            <div className="settings-item-info">
              <span className="settings-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </span>
              <div>
                <span className="settings-label">Member Since</span>
                <span className="settings-value">
                  {new Date(user?.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="danger-card">
        <h3>Danger Zone</h3>
        <div className="danger-item">
          <div>
            <h4>Delete Account</h4>
            <p>Permanently delete your account and all associated data</p>
          </div>
          <Button variant="ghost" className="btn-danger">Delete Account</Button>
        </div>
      </Card>
    </div>
  );
};

export default ProfilePage;
