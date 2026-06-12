'use client';

import React, { useState, useEffect } from 'react';

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
interface AppSettings {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  analyticsEnabled: boolean;
  commentModerationRequired: boolean;
  maxUploadSizeMB: number;
  allowedImageTypes: string[];
  smtpEnabled: boolean;
  cacheEnabled: boolean;
  cacheDurationMinutes: number;
}

// ──────────────────────────────────────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────────────────────────────────────
export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AppSettings>({
    siteName: 'La Yucateca',
    siteDescription: 'Connecting Yucatán through culture, innovation & community.',
    maintenanceMode: false,
    analyticsEnabled: true,
    commentModerationRequired: true,
    maxUploadSizeMB: 50,
    allowedImageTypes: ['jpg', 'png', 'webp'],
    smtpEnabled: false,
    cacheEnabled: true,
    cacheDurationMinutes: 60,
  });

  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'content' | 'performance' | 'system'>('general');

  // ── Notifications ────────────────────────────────────────────────────────────
  const notify = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // ── Save settings ────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      // In a real app, this would call an API endpoint
      await new Promise((resolve) => setTimeout(resolve, 500));
      notify('✅ Settings saved successfully');
      localStorage.setItem('adminSettings', JSON.stringify(settings));
    } catch (err) {
      notify('Failed to save settings', 'error');
    }
    setSaving(false);
  };

  // ── Load settings ────────────────────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem('adminSettings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to parse saved settings');
      }
    }
  }, []);

  const tabs = [
    { id: 'general', label: '🏢 General', icon: 'ℹ️' },
    { id: 'content', label: '📝 Content', icon: '📄' },
    { id: 'performance', label: '⚡ Performance', icon: '🚀' },
    { id: 'system', label: '⚙️ System', icon: '🔧' },
  ] as const;

  return (
    <div style={{ padding: '40px', maxWidth: 1000 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p className='section-label'>Configuration</p>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Settings</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>Manage app configuration, preferences & system settings</p>
      </div>

      {/* Notification toast */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 9999,
            padding: '14px 20px',
            borderRadius: 12,
            background: notification.type === 'success' ? '#0f5132' : '#5c1515',
            border: `1px solid ${notification.type === 'success' ? '#22c55e33' : '#ef444433'}`,
            color: notification.type === 'success' ? '#86efac' : '#fca5a5',
            fontWeight: 600,
            fontSize: '0.9rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            animation: 'fadeInUp 0.3s ease',
          }}
        >
          {notification.msg}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 28, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 0 }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '10px 18px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #d4a853' : '2px solid transparent',
              color: activeTab === tab.id ? '#d4a853' : 'var(--text-secondary)',
              fontWeight: activeTab === tab.id ? 700 : 500,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              borderRadius: '8px 8px 0 0',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className='card' style={{ padding: 32 }}>
        {/* General Settings */}
        {activeTab === 'general' && (
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 24 }}>🏢 General Settings</h2>

            <div style={{ display: 'grid', gap: 20 }}>
              {/* Site Name */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: '0.9rem' }}>Site Name</label>
                <input
                  type='text'
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  style={{
                    width: '100%',
                    maxWidth: 400,
                    padding: '10px 14px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 8,
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                  }}
                />
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: 6 }}>The main title of your platform</p>
              </div>

              {/* Site Description */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: '0.9rem' }}>Site Description</label>
                <textarea
                  value={settings.siteDescription}
                  onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                  style={{
                    width: '100%',
                    minHeight: 80,
                    padding: '12px 14px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 8,
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                />
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: 6 }}>
                  Meta description for SEO and social sharing
                </p>
              </div>

              {/* Maintenance Mode */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
                <div>
                  <p style={{ fontWeight: 700, marginBottom: 2 }}>🚧 Maintenance Mode</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Temporarily disable site for maintenance</p>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input
                    type='checkbox'
                    checked={settings.maintenanceMode}
                    onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                    style={{ width: 20, height: 20, cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.85rem', color: settings.maintenanceMode ? '#f59e0b' : 'var(--text-secondary)' }}>
                    {settings.maintenanceMode ? 'ON' : 'OFF'}
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Content Settings */}
        {activeTab === 'content' && (
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 24 }}>📝 Content Settings</h2>

            <div style={{ display: 'grid', gap: 20 }}>
              {/* Comment Moderation */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
                <div>
                  <p style={{ fontWeight: 700, marginBottom: 2 }}>💬 Comment Moderation</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Require approval before publishing comments</p>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input
                    type='checkbox'
                    checked={settings.commentModerationRequired}
                    onChange={(e) => setSettings({ ...settings, commentModerationRequired: e.target.checked })}
                    style={{ width: 20, height: 20, cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.85rem' }}>
                    {settings.commentModerationRequired ? 'REQUIRED' : 'AUTO-PUBLISH'}
                  </span>
                </label>
              </div>

              {/* Max Upload Size */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: '0.9rem' }}>Max Upload Size (MB)</label>
                <input
                  type='number'
                  value={settings.maxUploadSizeMB}
                  onChange={(e) => setSettings({ ...settings, maxUploadSizeMB: parseInt(e.target.value) })}
                  min={1}
                  max={500}
                  style={{
                    width: '100%',
                    maxWidth: 200,
                    padding: '10px 14px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 8,
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                  }}
                />
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: 6 }}>Maximum file size for media uploads</p>
              </div>

              {/* Allowed Image Types */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: '0.9rem' }}>Allowed Image Types</label>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  {['jpg', 'png', 'webp', 'gif'].map((type) => (
                    <label key={type} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input
                        type='checkbox'
                        checked={settings.allowedImageTypes.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSettings({ ...settings, allowedImageTypes: [...settings.allowedImageTypes, type] });
                          } else {
                            setSettings({ ...settings, allowedImageTypes: settings.allowedImageTypes.filter((t) => t !== type) });
                          }
                        }}
                        style={{ width: 18, height: 18, cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '0.9rem' }}>.{type.toUpperCase()}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Settings */}
        {activeTab === 'performance' && (
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 24 }}>⚡ Performance Settings</h2>

            <div style={{ display: 'grid', gap: 20 }}>
              {/* Analytics */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
                <div>
                  <p style={{ fontWeight: 700, marginBottom: 2 }}>📊 Analytics</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Track page views and user behavior</p>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input
                    type='checkbox'
                    checked={settings.analyticsEnabled}
                    onChange={(e) => setSettings({ ...settings, analyticsEnabled: e.target.checked })}
                    style={{ width: 20, height: 20, cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.85rem' }}>{settings.analyticsEnabled ? 'ENABLED' : 'DISABLED'}</span>
                </label>
              </div>

              {/* Cache */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
                <div>
                  <p style={{ fontWeight: 700, marginBottom: 2 }}>💾 Cache</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Enable caching for faster performance</p>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input
                    type='checkbox'
                    checked={settings.cacheEnabled}
                    onChange={(e) => setSettings({ ...settings, cacheEnabled: e.target.checked })}
                    style={{ width: 20, height: 20, cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.85rem' }}>{settings.cacheEnabled ? 'ENABLED' : 'DISABLED'}</span>
                </label>
              </div>

              {settings.cacheEnabled && (
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: '0.9rem' }}>Cache Duration (minutes)</label>
                  <input
                    type='number'
                    value={settings.cacheDurationMinutes}
                    onChange={(e) => setSettings({ ...settings, cacheDurationMinutes: parseInt(e.target.value) })}
                    min={1}
                    max={1440}
                    style={{
                      width: '100%',
                      maxWidth: 200,
                      padding: '10px 14px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 8,
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                    }}
                  />
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: 6 }}>How long to keep cached content (1-1440 min)</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* System Settings */}
        {activeTab === 'system' && (
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 24 }}>⚙️ System Settings</h2>

            <div style={{ display: 'grid', gap: 20 }}>
              {/* SMTP */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
                <div>
                  <p style={{ fontWeight: 700, marginBottom: 2 }}>📧 Email (SMTP)</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Enable email notifications and alerts</p>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input
                    type='checkbox'
                    checked={settings.smtpEnabled}
                    onChange={(e) => setSettings({ ...settings, smtpEnabled: e.target.checked })}
                    style={{ width: 20, height: 20, cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.85rem' }}>{settings.smtpEnabled ? 'CONFIGURED' : 'NOT SET'}</span>
                </label>
              </div>

              {/* System Info Card */}
              <div style={{ padding: '20px', background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                <h3 style={{ fontWeight: 700, marginBottom: 16 }}>ℹ️ System Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Database</p>
                    <p style={{ fontWeight: 600 }}>PostgreSQL</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Framework</p>
                    <p style={{ fontWeight: 600 }}>Next.js 16</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Storage</p>
                    <p style={{ fontWeight: 600 }}>Supabase</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Authentication</p>
                    <p style={{ fontWeight: 600 }}>Firebase</p>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div style={{ padding: '20px', background: 'rgba(239,68,68,0.05)', borderRadius: 12, border: '1px solid rgba(239,68,68,0.2)' }}>
                <h3 style={{ fontWeight: 700, marginBottom: 16, color: '#fca5a5' }}>⚠️ Danger Zone</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 12, fontSize: '0.9rem' }}>
                  These actions cannot be undone. Proceed with caution.
                </p>
                <button
                  style={{
                    padding: '10px 20px',
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: 8,
                    color: '#fca5a5',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
                >
                  🗑️ Clear All Cache
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '12px 32px',
            background: 'linear-gradient(135deg, #d4a853, #b8892a)',
            border: 'none',
            borderRadius: 8,
            color: '#0a0a0f',
            fontWeight: 700,
            cursor: saving ? 'not-allowed' : 'pointer',
            fontSize: '0.9rem',
            opacity: saving ? 0.6 : 1,
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => !saving && (e.currentTarget.style.transform = 'scale(1.04)')}
          onMouseLeave={(e) => !saving && (e.currentTarget.style.transform = 'scale(1)')}
        >
          {saving ? '💾 Saving…' : '✅ Save Settings'}
        </button>
      </div>
    </div>
  );
}
