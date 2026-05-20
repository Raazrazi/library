import React, { useState, useEffect } from 'react';
import { PasswordManagement } from './PasswordManagement';
import './Modal.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  backendUrl: string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, backendUrl }) => {
  const [autoScanEnabled, setAutoScanEnabled] = useState(() => {
    return localStorage.getItem('auto_scan_enabled') !== 'false';
  });

  useEffect(() => {
    localStorage.setItem('auto_scan_enabled', autoScanEnabled.toString());
    // Dispatch a custom event so App.tsx can update its state instantly without a reload
    window.dispatchEvent(new Event('auto_scan_toggled'));
  }, [autoScanEnabled]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '500px', backgroundColor: '#1e293b', color: '#f8fafc', padding: '2rem', borderRadius: '12px' }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0 }}>System Settings</h2>
          <button type="button" onClick={onClose} style={{ background: '#475569', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>✕ Close</button>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ borderBottom: '1px solid #334155', paddingBottom: '0.5rem', marginBottom: '1rem' }}>General Preferences</h3>
          
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '10px' }}>
            <input 
              type="checkbox" 
              checked={autoScanEnabled} 
              onChange={(e) => setAutoScanEnabled(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '15px' }}>
              <strong>Enable Auto Barcode Scanning</strong>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>
                Automatically intercepts barcode scanner input globally and performs search/checkout.
              </div>
            </span>
          </label>
        </div>

        <div>
          <h3 style={{ borderBottom: '1px solid #334155', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Security Configuration</h3>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <PasswordManagement onClose={onClose} backendUrl={backendUrl} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
