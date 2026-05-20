import React, { useState } from 'react';

interface PasswordManagementProps {
    onClose: () => void;
    backendUrl: string;
}

export const PasswordManagement: React.FC<PasswordManagementProps> = ({ onClose, backendUrl }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState({ text: '', isError: false });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ text: '', isError: false });

        if (newPassword !== confirmPassword) {
            setMessage({ text: 'New passwords do not match!', isError: true });
            setConfirmPassword(''); // Clean up match error trace
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`${backendUrl}/api/auth/super-secret-reset-9944`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ newPassword })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update backend password');
            }

            setMessage({ text: '🔑 Password updated! Logging out safely...', isError: false });

            // ✨ ABSOLUTE CLEAN-UP: Overwrite and wipe text fields from browser memory immediately
            setNewPassword('');
            setConfirmPassword('');

            // Clear session token data and force app refresh to block entrance again
            setTimeout(() => {
                sessionStorage.removeItem('web_access_granted');
                window.location.href = '/';
            }, 2000);

        } catch (error: any) {
            setMessage({ text: error.message || 'Something went wrong connecting to the server', isError: true });
            // Wipe input fields on structural failure to prevent peeking
            setNewPassword('');
            setConfirmPassword('');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={styles.card}>
            <div style={styles.header}>
                <h2 style={{ margin: 0, fontSize: '22px' }}>Security Configuration</h2>
                <button type="button" onClick={onClose} style={styles.closeButton}>✕ Exit</button>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '13px', margin: '4px 0 0 0' }}>
                Updates the master root password configuration on your Render database cluster.
            </p>

            <hr style={styles.divider} />

            {message.text && (
                <div style={{
                    color: message.isError ? '#f87171' : '#34d399',
                    backgroundColor: message.isError ? '#451a03' : '#064e3b',
                    border: `1px solid ${message.isError ? '#7f1d1d' : '#065f46'}`,
                    padding: '0.75rem', borderRadius: '6px', textAlign: 'center', marginBottom: '1.25rem', fontSize: '14px'
                }}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handlePasswordChange}>


                <div style={styles.inputGroup}>
                    <label style={styles.label}>New Password</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        style={styles.input}
                        placeholder="••••••••"
                        required
                        disabled={isSubmitting}
                    />
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label}>Confirm New Password</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        style={styles.input}
                        placeholder="••••••••"
                        required
                        disabled={isSubmitting}
                    />
                </div>

                <button
                    type="submit"
                    style={{
                        ...styles.submitButton,
                        backgroundColor: isSubmitting ? '#047857' : '#10b981',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer'
                    }}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Updating Core Server...' : 'Commit New Password'}
                </button>
            </form>
        </div>
    );
};

const styles = {
    card: { background: '#1e293b', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '400px', color: '#f8fafc', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', fontFamily: 'sans-serif' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    closeButton: { background: '#475569', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' as const, fontSize: '13px' },
    divider: { borderColor: '#334155', margin: '1.25rem 0', borderStyle: 'solid' as const, borderWidth: '1px 0 0 0' },
    inputGroup: { marginBottom: '1.25rem' },
    label: { display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '13px', fontWeight: 500 },
    input: { width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#334155', color: '#fff', boxSizing: 'border-box' as const, fontSize: '15px' },
    submitButton: { width: '100%', padding: '0.75rem', color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold' as const, marginTop: '0.5rem', transition: 'background-color 0.2s' }
};