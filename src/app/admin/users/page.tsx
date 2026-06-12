'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UserFormData {
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
}

// ──────────────────────────────────────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────────────────────────────────────
export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<'ALL' | 'USER' | 'ADMIN' | 'MODERATOR'>('ALL');
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const [form, setForm] = useState<UserFormData>({
    email: '',
    name: '',
    role: 'USER',
  });

  // ── Fetch users ──────────────────────────────────────────────────────────────
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        setUsers(await res.json());
      }
    } catch (err) {
      notify('Failed to load users', 'error');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ── Notifications ────────────────────────────────────────────────────────────
  const notify = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // ── Form handlers ────────────────────────────────────────────────────────────
  const resetForm = () => {
    setForm({ email: '', name: '', role: 'USER' });
    setEditing(null);
    setShowForm(false);
  };

  const startEdit = (user: User) => {
    setEditing(user);
    setForm({
      email: user.email,
      name: user.name || '',
      role: (user.role as 'USER' | 'ADMIN' | 'MODERATOR') || 'USER',
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.email || !form.name) {
      notify('Email and name are required', 'error');
      return;
    }

    const method = editing ? 'PUT' : 'POST';
    const body = editing ? { ...form, id: editing.id } : form;

    try {
      const res = await fetch('/api/admin/users', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        notify(editing ? '✅ User updated' : '✅ User created');
        resetForm();
        fetchUsers();
      } else {
        const error = await res.json();
        notify(error.error || 'Failed to save user', 'error');
      }
    } catch (err) {
      notify('Error saving user', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user? This action cannot be undone.')) return;

    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        notify('🗑️ User deleted');
        fetchUsers();
      } else {
        notify('Failed to delete user', 'error');
      }
    } catch (err) {
      notify('Error deleting user', 'error');
    }
  };

  const handleToggleRole = async (user: User, newRole: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          email: user.email,
          name: user.name,
          role: newRole,
        }),
      });
      if (res.ok) {
        notify(`✅ User role changed to ${newRole}`);
        fetchUsers();
      }
    } catch (err) {
      notify('Error updating role', 'error');
    }
  };

  // ── Filtered users ───────────────────────────────────────────────────────────
  const filtered = users.filter((u) => {
    const matchSearch = !search || u.email.toLowerCase().includes(search.toLowerCase()) || u.name?.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'ALL' || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const stats = [
    { label: 'Total Users', value: users.length, icon: '👥', color: '#25d366' },
    { label: 'Admins', value: users.filter((u) => u.role === 'ADMIN').length, icon: '👑', color: '#f59e0b' },
    { label: 'Moderators', value: users.filter((u) => u.role === 'MODERATOR').length, icon: '🛡️', color: '#3b82f6' },
    { label: 'Users', value: users.filter((u) => u.role === 'USER').length, icon: '👤', color: '#8b5cf6' },
  ];

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      ADMIN: '#f59e0b',
      MODERATOR: '#3b82f6',
      USER: '#8b5cf6',
    };
    return colors[role] || '#64748b';
  };

  const getRoleBadgeStyle = (role: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      ADMIN: { bg: 'rgba(245,158,11,0.1)', text: '#fbbf24' },
      MODERATOR: { bg: 'rgba(59,130,246,0.1)', text: '#60a5fa' },
      USER: { bg: 'rgba(139,92,246,0.1)', text: '#c4b5fd' },
    };
    return colors[role] || { bg: 'var(--bg-tertiary)', text: 'var(--text-secondary)' };
  };

  return (
    <div style={{ padding: '40px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p className='section-label'>Management</p>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Users</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>{users.length} users total • Manage roles and permissions</p>
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

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
        {stats.map((stat) => (
          <div key={stat.label} className='card' style={{ padding: '20px 24px', borderLeft: `3px solid ${stat.color}` }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '1.8rem', fontWeight: 800, lineHeight: 1, color: stat.color }}>{stat.value}</p>
                <p style={{ fontWeight: 600, fontSize: '0.85rem', marginTop: '6px' }}>{stat.label}</p>
              </div>
              <span style={{ fontSize: '1.5rem', opacity: 0.6 }}>{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='🔍 Search by email or name…'
          style={{
            flex: 1,
            minWidth: 200,
            padding: '10px 16px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 8,
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
          }}
        />

        <div style={{ display: 'flex', gap: 4 }}>
          {(['ALL', 'ADMIN', 'MODERATOR', 'USER'] as const).map((role) => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              style={{
                padding: '9px 14px',
                borderRadius: 8,
                border: `1px solid ${filterRole === role ? '#25d366' : 'var(--border-subtle)'}`,
                background: filterRole === role ? '#25d36620' : 'transparent',
                color: filterRole === role ? '#25d366' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {role}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          style={{
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #d4a853, #b8892a)',
            border: 'none',
            borderRadius: 8,
            color: '#0a0a0f',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.9rem',
            whiteSpace: 'nowrap',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          + New User
        </button>
      </div>

      {/* User Form Modal */}
      {showForm && (
        <div className='card' style={{ padding: 32, marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 20 }}>{editing ? '✏️ Edit User' : '➕ New User'}</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: '0.85rem' }}>Email *</label>
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder='user@example.com'
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 8,
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                }}
                disabled={!!editing}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: '0.85rem' }}>Full Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder='John Doe'
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 8,
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: '0.85rem' }}>Role *</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as 'USER' | 'ADMIN' | 'MODERATOR' })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 8,
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                }}
              >
                <option value='USER'>User</option>
                <option value='MODERATOR'>Moderator</option>
                <option value='ADMIN'>Admin</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={handleSave}
              style={{
                padding: '10px 24px',
                background: 'linear-gradient(135deg, #25d366, #128c7e)',
                border: 'none',
                borderRadius: 8,
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {editing ? '💾 Update' : '✅ Create'}
            </button>
            <button
              onClick={resetForm}
              style={{
                padding: '10px 24px',
                background: 'transparent',
                border: '1px solid var(--border-subtle)',
                borderRadius: 8,
                color: 'var(--text-secondary)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className='card' style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-secondary)' }}>Loading users…</div>
        ) : users.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p style={{ fontSize: '2.5rem', marginBottom: 12 }}>👥</p>
            <p>No users yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  {['Email', 'Name', 'Role', 'Joined', 'Actions'].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '12px 20px',
                        textAlign: 'left',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: 'var(--text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr
                    key={user.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-secondary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '14px 20px', fontWeight: 600 }}>{user.email}</td>
                    <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>{user.name || '—'}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <select
                        value={user.role}
                        onChange={(e) => handleToggleRole(user, e.target.value)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: 6,
                          border: `1px solid ${getRoleColor(user.role)}33`,
                          background: getRoleBadgeStyle(user.role).bg,
                          color: getRoleBadgeStyle(user.role).text,
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        <option value='USER'>User</option>
                        <option value='MODERATOR'>Moderator</option>
                        <option value='ADMIN'>Admin</option>
                      </select>
                    </td>
                    <td style={{ padding: '14px 20px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => startEdit(user)}
                          style={{
                            padding: '6px 12px',
                            background: 'transparent',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 6,
                            color: 'var(--text-secondary)',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          style={{
                            padding: '6px 12px',
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.2)',
                            borderRadius: 6,
                            color: '#fca5a5',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
