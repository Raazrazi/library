import React, { useState, useEffect } from 'react';
import { PasswordManagement } from './PasswordManagement';
import './Modal.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  backendUrl: string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [autoScanEnabled, setAutoScanEnabled] = useState(() => localStorage.getItem('auto_scan_enabled') !== 'false');
  const [autoViewResults, setAutoViewResults] = useState(() => localStorage.getItem('auto_view_results') !== 'false');
  const [autoCheckinCheckout, setAutoCheckinCheckout] = useState(() => localStorage.getItem('auto_checkin_checkout') !== 'false');

  useEffect(() => {
    localStorage.setItem('auto_scan_enabled', autoScanEnabled.toString());
    localStorage.setItem('auto_view_results', autoViewResults.toString());
    localStorage.setItem('auto_checkin_checkout', autoCheckinCheckout.toString());
    // Dispatch a custom event so App.tsx can update its state instantly without a reload
    window.dispatchEvent(new Event('auto_scan_toggled'));
  }, [autoScanEnabled, autoViewResults, autoCheckinCheckout]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '500px', backgroundColor: '#1e293b', color: '#f8fafc', padding: '2rem', borderRadius: '12px' }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0 }}>System Settings</h2>
          <button type="button" onClick={onClose} style={{ background: '#475569', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>✕ Close</button>
        </div>

        <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ borderBottom: '1px solid #334155', paddingBottom: '0.5rem', margin: 0 }}>General Preferences</h3>
          
          <label style={{ display: 'flex', alignItems: 'flex-start', cursor: 'pointer', gap: '10px' }}>
            <input 
              type="checkbox" 
              checked={autoScanEnabled} 
              onChange={(e) => setAutoScanEnabled(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer', marginTop: '4px' }}
            />
            <span style={{ fontSize: '15px' }}>
              <strong>1. Enable Auto Barcode Scanning</strong>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
                Globally captures barcode input without needing to click the search bar.
              </div>
            </span>
          </label>

          <label style={{ display: 'flex', alignItems: 'flex-start', cursor: 'pointer', gap: '10px' }}>
            <input 
              type="checkbox" 
              checked={autoViewResults} 
              onChange={(e) => setAutoViewResults(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer', marginTop: '4px' }}
            />
            <span style={{ fontSize: '15px' }}>
              <strong>2. Auto Result Viewing</strong>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
                Automatically displays the result directly without needing to click a "Search/Scan" button.
              </div>
            </span>
          </label>

          <label style={{ display: 'flex', alignItems: 'flex-start', cursor: 'pointer', gap: '10px' }}>
            <input 
              type="checkbox" 
              checked={autoCheckinCheckout} 
              onChange={(e) => setAutoCheckinCheckout(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer', marginTop: '4px' }}
            />
            <span style={{ fontSize: '15px' }}>
              <strong>3. Auto Check-in & Check-out</strong>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
                Automatically processes check-in or pop-ups the check-out flow instantly upon scan.
              </div>
            </span>
          </label>
        </div>

        <div style={{ padding: '1rem', background: '#334155', borderRadius: '8px', fontSize: '13px', color: '#cbd5e1' }}>
          <p style={{ margin: '0 0 8px 0' }}><strong>Note to Admins:</strong></p>
          <p style={{ margin: 0 }}>Password management has been moved to a secure hidden backdoor route for your convenience.</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
