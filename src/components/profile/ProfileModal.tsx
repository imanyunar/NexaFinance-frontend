import React from 'react';
import { 
  User, 
  Mail, 
  Smartphone, 
  Building2, 
  ShieldCheck, 
  LogOut, 
  X,
  Server
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';

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
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '440px', padding: '28px' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Profil Pengguna</h3>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Profile Avatar Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #002244 0%, #003366 100%)',
            borderRadius: '14px',
            padding: '20px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: '#187aba',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '22px',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700 }}>{user?.name || 'Iman Azizi'}</div>
            <div style={{ fontSize: '12.5px', color: '#94a3b8' }}>{user?.email || 'iman@nexafinance.com'}</div>
            <div 
              style={{ 
                marginTop: '6px', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '4px',
                fontSize: '11px', 
                background: 'rgba(56, 189, 248, 0.15)', 
                color: '#38bdf8', 
                padding: '2px 8px', 
                borderRadius: '6px',
                fontWeight: 600,
              }}
            >
              <ShieldCheck size={12} /> {activeWorkspace?.role || 'OWNER'}
            </div>
          </div>
        </div>

        {/* Details List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13.5px' }}>
            <Mail size={16} style={{ color: '#64748b' }} />
            <div style={{ flex: 1 }}>
              <div style={{ color: '#64748b', fontSize: '11.5px' }}>Email Resmi</div>
              <div style={{ fontWeight: 600, color: '#0f172a' }}>{user?.email || 'iman@nexafinance.com'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13.5px' }}>
            <Smartphone size={16} style={{ color: '#10874e' }} />
            <div style={{ flex: 1 }}>
              <div style={{ color: '#64748b', fontSize: '11.5px' }}>Nomor WhatsApp Terhubung</div>
              <div style={{ fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{user?.whatsappNumber || '087873861108'}</span>
                <span style={{ fontSize: '10.5px', color: '#10874e', background: 'rgba(16,135,78,0.1)', padding: '1px 6px', borderRadius: '4px' }}>
                  Bot Aktif
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13.5px' }}>
            <Building2 size={16} style={{ color: '#187aba' }} />
            <div style={{ flex: 1 }}>
              <div style={{ color: '#64748b', fontSize: '11.5px' }}>Workspace Aktif</div>
              <div style={{ fontWeight: 600, color: '#0f172a' }}>{activeWorkspace?.name || 'Keuangan Iman Azizi'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13.5px' }}>
            <Server size={16} style={{ color: '#64748b' }} />
            <div style={{ flex: 1 }}>
              <div style={{ color: '#64748b', fontSize: '11.5px' }}>Server Cloud</div>
              <div style={{ fontWeight: 500, color: '#475569', fontSize: '12.5px' }}>
                <code>nexafinance-alpha.vercel.app</code>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '18px' }}>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onClose}
          >
            Tutup
          </button>

          <button
            type="button"
            onClick={logout}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: '8px',
              border: '1px solid #fecaca',
              background: '#fef2f2',
              color: '#dc2626',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <LogOut size={15} />
            <span>Keluar / Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};
