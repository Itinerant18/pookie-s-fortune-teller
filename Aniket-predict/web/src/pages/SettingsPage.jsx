import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Card, Button } from '../components/ui';
import './Pages.css';

const SettingsPage = () => {
  const { theme, setTheme } = useTheme();
  
  const [notifications, setNotifications] = useState({
    dailyHoroscope: true,
    newPredictions: true,
    healthReminders: false,
    incomeAlerts: true,
    marketingEmails: false,
    newFeatures: true,
  });

  const [quietHours, setQuietHours] = useState({
    enabled: false,
    from: '22:00',
    to: '08:00',
  });

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="page settings-page">
      <div className="page-header">
        <div className="page-header-content">
          <h1>Settings</h1>
          <p>Customize your app experience</p>
        </div>
      </div>

      {/* Appearance */}
      <Card className="settings-section">
        <h3>Appearance</h3>
        <div className="theme-selector">
          <button
            className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
            onClick={() => setTheme('dark')}
          >
            <div className="theme-preview dark-preview">
              <div className="preview-header" />
              <div className="preview-content" />
            </div>
            <span>Dark</span>
          </button>
          <button
            className={`theme-option ${theme === 'light' ? 'active' : ''}`}
            onClick={() => setTheme('light')}
          >
            <div className="theme-preview light-preview">
              <div className="preview-header" />
              <div className="preview-content" />
            </div>
            <span>Light</span>
          </button>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="settings-section">
        <h3>Notifications</h3>
        
        <div className="settings-group">
          <h4>Push Notifications</h4>
          <div className="toggle-list">
            <label className="toggle-item">
              <div className="toggle-info">
                <span className="toggle-label">Daily Horoscope</span>
                <span className="toggle-desc">Get your daily cosmic insights</span>
              </div>
              <input
                type="checkbox"
                className="toggle-input"
                checked={notifications.dailyHoroscope}
                onChange={() => handleNotificationChange('dailyHoroscope')}
              />
            </label>

            <label className="toggle-item">
              <div className="toggle-info">
                <span className="toggle-label">New Predictions</span>
                <span className="toggle-desc">Notify when predictions are ready</span>
              </div>
              <input
                type="checkbox"
                className="toggle-input"
                checked={notifications.newPredictions}
                onChange={() => handleNotificationChange('newPredictions')}
              />
            </label>

            <label className="toggle-item">
              <div className="toggle-info">
                <span className="toggle-label">Health Reminders</span>
                <span className="toggle-desc">Daily wellness check-in reminders</span>
              </div>
              <input
                type="checkbox"
                className="toggle-input"
                checked={notifications.healthReminders}
                onChange={() => handleNotificationChange('healthReminders')}
              />
            </label>

            <label className="toggle-item">
              <div className="toggle-info">
                <span className="toggle-label">Income Alerts</span>
                <span className="toggle-desc">Important financial predictions</span>
              </div>
              <input
                type="checkbox"
                className="toggle-input"
                checked={notifications.incomeAlerts}
                onChange={() => handleNotificationChange('incomeAlerts')}
              />
            </label>
          </div>
        </div>

        <div className="settings-group">
          <h4>Email Preferences</h4>
          <div className="toggle-list">
            <label className="toggle-item">
              <div className="toggle-info">
                <span className="toggle-label">Marketing Emails</span>
                <span className="toggle-desc">Promotional content and offers</span>
              </div>
              <input
                type="checkbox"
                className="toggle-input"
                checked={notifications.marketingEmails}
                onChange={() => handleNotificationChange('marketingEmails')}
              />
            </label>

            <label className="toggle-item">
              <div className="toggle-info">
                <span className="toggle-label">New Features</span>
                <span className="toggle-desc">Updates about new app features</span>
              </div>
              <input
                type="checkbox"
                className="toggle-input"
                checked={notifications.newFeatures}
                onChange={() => handleNotificationChange('newFeatures')}
              />
            </label>
          </div>
        </div>

        <div className="settings-group">
          <h4>Quiet Hours</h4>
          <label className="toggle-item">
            <div className="toggle-info">
              <span className="toggle-label">Enable Quiet Hours</span>
              <span className="toggle-desc">No notifications during these hours</span>
            </div>
            <input
              type="checkbox"
              className="toggle-input"
              checked={quietHours.enabled}
              onChange={() => setQuietHours(prev => ({ ...prev, enabled: !prev.enabled }))}
            />
          </label>
          
          {quietHours.enabled && (
            <div className="time-range">
              <div className="time-input">
                <label>From</label>
                <input
                  type="time"
                  value={quietHours.from}
                  onChange={(e) => setQuietHours(prev => ({ ...prev, from: e.target.value }))}
                  className="form-input"
                />
              </div>
              <div className="time-input">
                <label>To</label>
                <input
                  type="time"
                  value={quietHours.to}
                  onChange={(e) => setQuietHours(prev => ({ ...prev, to: e.target.value }))}
                  className="form-input"
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Privacy & Data */}
      <Card className="settings-section">
        <h3>Privacy & Data</h3>
        <div className="settings-links">
          <a href="/privacy" className="settings-link">
            <span>Privacy Policy</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
          <a href="/terms" className="settings-link">
            <span>Terms of Service</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
          <button className="settings-link">
            <span>Export My Data</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
        </div>
      </Card>

      {/* Support */}
      <Card className="settings-section">
        <h3>Support</h3>
        <div className="settings-links">
          <button className="settings-link">
            <span>Help Center</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </button>
          <button className="settings-link">
            <span>Contact Support</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </button>
          <button className="settings-link">
            <span>Report a Bug</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 8v4l3 3" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          </button>
        </div>
      </Card>

      {/* App Info */}
      <Card className="settings-section app-info">
        <div className="app-version">
          <span>Cosmic Predict</span>
          <span className="version-number">Version 1.0.0</span>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;
