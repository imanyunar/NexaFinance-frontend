import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Modal, Button, GoogleIcon } from '../ui';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { activeWorkspace } = useWorkspace();

  if (!isOpen) return null;

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'IA';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Profil Pengguna"
      subtitle="Informasi akun dan sesi kerja aktif"
      googleIcon="person"
      maxWidth={460}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            Tutup
          </Button>
          <Button
            variant="secondary"
            size="sm"
            googleIcon="logout"
            onClick={logout}
            style={{ color: '#c5221f', borderColor: '#fad2cf' }}
          >
            Keluar / Logout
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* User Card */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e5e5e5',
            borderRadius: '20px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#005caa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '20px',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(0, 92, 170, 0.25)',
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#000000', fontFamily: "'Open Sans', sans-serif" }}>
              {user?.name || 'Iman Azizi'}
            </div>
            <div style={{ fontSize: '13px', color: '#666666' }}>
              {user?.email || 'iman@nexafinance.com'}
            </div>
            <div
              style={{
                marginTop: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                backgroundColor: '#e8f2fa',
                color: '#005caa',
                padding: '2px 10px',
                borderRadius: '48px',
                fontWeight: 600,
              }}
            >
              <GoogleIcon name="verified_user" size={12} color="#005caa" />
              <span>Institutional Owner</span>
            </div>
          </div>
        </div>

        {/* Details list */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            backgroundColor: '#ffffff',
            border: '1px solid #e5e5e5',
            borderRadius: '16px',
            padding: '16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
            <span style={{ color: '#666666', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <GoogleIcon name="apartment" size={16} color="#666666" /> Workspace
            </span>
            <span style={{ fontWeight: 600, color: '#000000' }}>{activeWorkspace?.name || 'Perusahaan'}</span>
          </div>

          <div style={{ height: '1px', backgroundColor: '#f0f0f0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
            <span style={{ color: '#666666', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <GoogleIcon name="badge" size={16} color="#666666" /> Hak Akses
            </span>
            <span style={{ fontWeight: 600, color: '#000000' }}>{activeWorkspace?.role || 'OWNER'}</span>
          </div>

          <div style={{ height: '1px', backgroundColor: '#f0f0f0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
            <span style={{ color: '#666666', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <GoogleIcon name="smartphone" size={16} color="#666666" /> WhatsApp
            </span>
            <span style={{ fontWeight: 600, color: '#000000' }}>087873861108</span>
          </div>

          <div style={{ height: '1px', backgroundColor: '#f0f0f0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
            <span style={{ color: '#666666', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <GoogleIcon name="database" size={16} color="#666666" /> Database
            </span>
            <span style={{ fontWeight: 600, color: '#137333', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <GoogleIcon name="check_circle" size={14} color="#137333" /> Neon PostgreSQL
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
};
