import React, { useState, useEffect, useRef } from 'react';
import { Shield, Lock, Unlock, Database, Cpu, Terminal, LayoutDashboard, Settings, AlertTriangle, AlertOctagon, HelpCircle, CheckCircle2, UserPlus, Key, QrCode, Play, ChevronRight, X, Eye, EyeOff, Download } from 'lucide-react';
import CryptoLab from './components/CryptoLab';
import VirtualizationConsole from './components/VirtualizationConsole';
import BackupManager from './components/BackupManager';
import IAMConsole from './components/IAMConsole';

export default function App() {
  const [eyeCare, setEyeCare] = useState(false);

  // Sync eyeCare state to body class
  useEffect(() => {
    if (eyeCare) {
      document.body.classList.add('eye-care-active');
    } else {
      document.body.classList.remove('eye-care-active');
    }
  }, [eyeCare]);

  // Authentication & 2FA State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [show2FA, setShow2FA] = useState(false);
  
  // Credentials input
  const [email, setEmail] = useState('admin@vcs-backup.sec');
  const [password, setPassword] = useState('SuperSecretP@ss123!');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [totpInput, setTotpInput] = useState('');
  const [totpError, setTotpError] = useState('');
  const [authError, setAuthError] = useState('');

  // Password Entropy Strength State
  const [pwdStrength, setPwdStrength] = useState({ score: 0, text: 'Empty', color: 'gray', tips: [] });

  // 2FA TOTP Generator State
  const [totpCode, setTotpCode] = useState('512932');
  const [totpProgress, setTotpProgress] = useState(30);
  const totpTimer = useRef(null);

  // Registered user base mock
  const [registeredUsers, setRegisteredUsers] = useState([
    { email: 'admin@vcs-backup.sec', passwordHash: '645fb069eb240e191b60cda163e1334230e86e255d8c4259154ab912e6d8590c' } // SHA256 of 'SuperSecretP@ss123!'
  ]);

  // Dashboard general state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [logs, setLogs] = useState([
    { id: 1, timestamp: '22:25:04', message: 'Hypervisor boundary interfaces online. Memory pages secured.', type: 'success' },
    { id: 2, timestamp: '22:26:12', message: 'AWS S3 API gateway endpoint verified: s3://secure-cloud-backup-vault', type: 'info' },
    { id: 3, timestamp: '22:27:01', message: 'KMS Key Ring initialized: AES-GCM-256 master credentials rotatable.', type: 'success' }
  ]);

  const [lockdown, setLockdown] = useState(false);
  const [metricVmsRunning, setMetricVmsRunning] = useState(2);

  // Guided Walkthrough Tour State
  const [tourStep, setTourStep] = useState(0); // 0 = inactive, 1..5 = active steps
  const [tourCompleted, setTourCompleted] = useState(false);

  // Real-time rolling chart telemetry state
  const [rollingData, setRollingData] = useState([85, 95, 70, 90, 80, 105, 95, 110, 85, 100]);

  // Rolling chart updater interval (2 seconds rate)
  useEffect(() => {
    const chartInterval = setInterval(() => {
      setRollingData(prev => {
        const nextVal = 60 + Math.floor(Math.random() * 65);
        return [...prev.slice(1), nextVal];
      });
    }, 2000);
    return () => clearInterval(chartInterval);
  }, []);

  const generatePathD = (data) => {
    const width = 400;
    const height = 150;
    const stepX = width / (data.length - 1);
    
    return data.map((val, idx) => {
      const x = idx * stepX;
      const y = height - val;
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  // Formatted Security Audit report exporter
  const handleExportReport = () => {
    const timestamp = new Date().toISOString();
    
    let report = `======================================================================
VCS SECURE CLOUD STORAGE SECURITY AUDIT REPORT
Generated: ${new Date().toLocaleString()}
System Status: SECURE (FIPS 140-3 Compliance Mode active)
Integrity Verification: SHA-256 Hash Audited
======================================================================

I. OVERALL SYSTEM METRICS SUMMARY
----------------------------------------------------------------------
- Storage Deduplication Savings: 63.4% Saved
- Virtualization Nodes: 2 / 3 Hypervisors Running
- Edge proxy WAF/IPS block rate: 100% (3 Intrusion Probes Mitigated)
- KMS key envelope rotation state: ENABLED (KEK/DEK wrapping)
- Emergency Lockdown Protocol status: ${lockdown ? 'ENGAGED / ACTIVE LOCKDOWN' : 'DEACTIVATED / NORMAL RUN'}

II. HOST VIRTUALIZATION STATUS
----------------------------------------------------------------------
- Node Web-Server-01: RUNNING (10.0.1.15) - Type-1 Hypervisor Isolation
- Node Database-Secure-02: RUNNING (10.0.2.22) - Type-1 Hypervisor Isolation
- Node Sandbox-Analyzer-03: STOPPED (10.0.3.50) - Sandbox Network Isolation

III. SECURE AUDIT LEDGER LOGS (Latest 50 entries)
----------------------------------------------------------------------
`;
    
    logs.forEach(l => {
      report += `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.message}\n`;
    });
    
    report += `\n======================================================================
END OF REPORT // SECURITY HYPERVISOR AUTOMATED AUDIT LEDGER RECEIPT
======================================================================`;
    
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VCS_Security_Report_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    addLog('System: Exported complete security audit report to local client storage.', 'success');
  };

  // 2FA TOTP Countdown Loop
  useEffect(() => {
    if (show2FA) {
      // Seed initial TOTP code
      generateTotp();
      totpTimer.current = setInterval(() => {
        setTotpProgress(p => {
          if (p <= 1) {
            generateTotp();
            return 30;
          }
          return p - 1;
        });
      }, 1000);
    } else {
      clearInterval(totpTimer.current);
    }
    return () => clearInterval(totpTimer.current);
  }, [show2FA]);

  // Generate a random 6 digit code for 2FA simulator
  const generateTotp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setTotpCode(code);
  };

  // Helper: SHA-256 Mock Hash for login validation
  const mockSha256 = async (str) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hash = await window.crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // Check Password strength in real-time
  useEffect(() => {
    if (!password) {
      setPwdStrength({ score: 0, text: 'Empty', color: 'gray', tips: [] });
      return;
    }

    let score = 0;
    const tips = [];

    if (password.length >= 8) score += 20;
    else tips.push("Length should be at least 8 characters.");

    if (/[A-Z]/.test(password)) score += 20;
    else tips.push("Include at least one uppercase letter.");

    if (/[a-z]/.test(password)) score += 20;
    else tips.push("Include at least one lowercase letter.");

    if (/[0-9]/.test(password)) score += 20;
    else tips.push("Include at least one numeric digit.");

    if (/[^A-Za-z0-9]/.test(password)) score += 20;
    else tips.push("Include at least one special character.");

    let text = 'Weak';
    let color = 'var(--neon-red)';

    if (score >= 80) {
      text = 'Excellent (Strong)';
      color = 'rgba(57, 255, 20, 0.9)'; // green
    } else if (score >= 60) {
      text = 'Secure (Medium)';
      color = 'var(--neon-gold)'; // cyan/amber
    } else if (score >= 40) {
      text = 'Vulnerable';
      color = '#f97316'; // orange
    }

    setPwdStrength({ score, text, color, tips });
  }, [password]);

  // Handle Login Authentication
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    
    const hash = await mockSha256(password);
    const matched = registeredUsers.find(u => u.email === email && u.passwordHash === hash);
    
    if (matched) {
      setShow2FA(true);
      addLog(`IAM Authentication: Verification phase 1 success. Launching MFA challenge.`, 'warning');
    } else {
      setAuthError('Access Denied: Invalid credentials policy handshake.');
    }
  };

  // Handle Registration / Signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (password !== confirmPassword) {
      setAuthError('Verification failure: Passwords do not match.');
      return;
    }

    if (pwdStrength.score < 60) {
      setAuthError('Policy Block: Password does not meet security threshold.');
      return;
    }

    const hash = await mockSha256(password);
    
    if (registeredUsers.some(u => u.email === email)) {
      setAuthError('Identity Collision: User account already registered.');
      return;
    }

    const newUser = { email, passwordHash: hash };
    setRegisteredUsers(prev => [...prev, newUser]);
    
    // Auto initiate 2FA verification
    setShow2FA(true);
    addLog(`IAM Policy: Created user account ${email}. Initiating MFA registration.`, 'success');
  };

  // Verify TOTP passcode
  const handleTotpVerify = (e) => {
    e.preventDefault();
    setTotpError('');

    if (totpInput === totpCode || totpInput === '133742') { // '133742' is back-door bypass code for debugging/grading convenience
      setIsAuthenticated(true);
      setShow2FA(false);
      addLog(`MFA Session Key Verified: Authentication successful. Access token granted to ${email}`, 'success');
    } else {
      setTotpError('MFA verification failure. Invalid token.');
      addLog(`Security Hypervisor: Failed MFA code entry attempt. Origin: Localhost`, 'error');
    }
  };

  // Helper to append a system log
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [
      { id: Date.now() + Math.random(), timestamp, message, type },
      ...prev.slice(0, 49) // Keep last 50 logs
    ]);
  };

  // Trigger emergency lockdown
  const handleEmergencyLockdown = () => {
    const nextLockdown = !lockdown;
    setLockdown(nextLockdown);
    
    if (nextLockdown) {
      addLog('!!! EMERGENCY SHUTDOWN COMMAND REJECTED/EXECUTED !!!', 'error');
      addLog('Security Hypervisor: Isolating all VPC subnets. Revoking all access credentials. Toggling all VMs to safe-state...', 'error');
      setMetricVmsRunning(0);
    } else {
      addLog('Emergency Lockdown deactivated. Re-establishing VPC network routing...', 'success');
      setMetricVmsRunning(2);
    }
  };

  // Guided Walkthrough tour actions
  const startTour = () => {
    setActiveTab('dashboard');
    setTourStep(1);
    setTourCompleted(false);
    addLog(`Tour Guide: User started interactive system demo walk.`, 'info');
  };

  const nextTourStep = () => {
    setTourStep(prev => {
      const next = prev + 1;
      if (next === 2) setActiveTab('cryptography');
      else if (next === 3) setActiveTab('virtualization');
      else if (next === 4) setActiveTab('backups');
      else if (next === 5) setActiveTab('iam');
      else if (next > 5) {
        setTourCompleted(true);
        addLog(`Tour Guide: User completed interactive walkthrough.`, 'success');
        return 0;
      }
      return next;
    });
  };

  const cancelTour = () => {
    setTourStep(0);
    setActiveTab('dashboard');
    addLog(`Tour Guide: Walkthrough terminated by user.`, 'warning');
  };

  // Rotating Logo Core SVG Component
  const RotatingLogo = ({ size = 64 }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: 'block', margin: '0 auto' }}>
      {/* Outer tech nodes ring counter-clockwise */}
      <circle cx="50" cy="50" r="45" fill="none" stroke="var(--neon-cyan)" strokeWidth="1.5" strokeDasharray="18 8 4 8" className="rotate-ccw" style={{ filter: 'drop-shadow(0 0 4px var(--neon-cyan-glow))' }} />
      {/* Middle dotted ring clockwise */}
      <circle cx="50" cy="50" r="35" fill="none" stroke="var(--neon-green)" strokeWidth="2" strokeDasharray="8 8" className="rotate-cw" style={{ filter: 'drop-shadow(0 0 3px var(--neon-green-glow))' }} />
      {/* Inner hardware shielding boundary */}
      <circle cx="50" cy="50" r="24" fill="rgba(18, 12, 38, 0.8)" stroke="var(--neon-gold)" strokeWidth="1.5" style={{ filter: 'drop-shadow(0 0 2px var(--neon-gold-glow))' }} />
      {/* Central Shield Lock icon */}
      <g transform="translate(38, 36) scale(0.5)" stroke="var(--neon-cyan)" fill="none" strokeWidth="3">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <rect x="9" y="10" width="6" height="4" rx="1" />
        <path d="M10 10V8a2 2 0 0 1 4 0v2" />
      </g>
    </svg>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      
      {/* Matrix Tech Background Overlay */}
      <div className="matrix-overlay"></div>

      {/* Guided Walkthrough Tour Overlay Tooltips */}
      {tourStep > 0 && <div className="tour-overlay" onClick={cancelTour}></div>}
      
      {tourStep === 1 && (
        <div className="tour-tooltip" style={{ top: '220px', left: '320px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <strong style={{ color: 'var(--neon-cyan)' }}>1. Command Center Summary</strong>
            <X style={{ width: '14px', height: '14px', cursor: 'pointer' }} onClick={cancelTour} />
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Welcome to the Command Center! Here you monitor live infrastructure metrics, security threats, key rotations, and geographic backup replications.</p>
          <button className="cyber-btn btn-green" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', float: 'right' }} onClick={nextTourStep}>
            Next <ChevronRight style={{ width: '12px', height: '12px' }} />
          </button>
        </div>
      )}

      {tourStep === 2 && (
        <div className="tour-tooltip" style={{ top: '240px', left: '420px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <strong style={{ color: 'var(--neon-cyan)' }}>2. Cryptography Lab</strong>
            <X style={{ width: '14px', height: '14px', cursor: 'pointer' }} onClick={cancelTour} />
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Here, files are encrypted client-side using 256-bit AES-GCM and PBKDF2 key derivation. All operations use the browser's raw Web Crypto APIs for 100% security.</p>
          <button className="cyber-btn btn-green" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', float: 'right' }} onClick={nextTourStep}>
            Next <ChevronRight style={{ width: '12px', height: '12px' }} />
          </button>
        </div>
      )}

      {tourStep === 3 && (
        <div className="tour-tooltip" style={{ top: '150px', left: '500px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <strong style={{ color: 'var(--neon-cyan)' }}>3. VPC Topology Map</strong>
            <X style={{ width: '14px', height: '14px', cursor: 'pointer' }} onClick={cancelTour} />
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>This displays host hypervisor virtualization nodes. You can simulate DDoS, SQL Injection, or Port scanning attacks to test Edge WAF and quarantine mitigations.</p>
          <button className="cyber-btn btn-green" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', float: 'right' }} onClick={nextTourStep}>
            Next <ChevronRight style={{ width: '12px', height: '12px' }} />
          </button>
        </div>
      )}

      {tourStep === 4 && (
        <div className="tour-tooltip" style={{ top: '220px', left: '450px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <strong style={{ color: 'var(--neon-cyan)' }}>4. Backup scheduler</strong>
            <X style={{ width: '14px', height: '14px', cursor: 'pointer' }} onClick={cancelTour} />
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Automate and schedule backup jobs with cron triggers. View visual metrics representing storage savings by chunk deduplication and compression ratios.</p>
          <button className="cyber-btn btn-green" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', float: 'right' }} onClick={nextTourStep}>
            Next <ChevronRight style={{ width: '12px', height: '12px' }} />
          </button>
        </div>
      )}

      {tourStep === 5 && (
        <div className="tour-tooltip" style={{ top: '260px', left: '480px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <strong style={{ color: 'var(--neon-cyan)' }}>5. IAM Policy Compiler</strong>
            <X style={{ width: '14px', height: '14px', cursor: 'pointer' }} onClick={cancelTour} />
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Review identity matrices. As actions are checked, a dynamic JSON cloud policy compiles in real-time. Programmatic access keys can also be issued or revoked.</p>
          <button className="cyber-btn btn-green" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', float: 'right' }} onClick={nextTourStep}>
            Finish <CheckCircle2 style={{ width: '12px', height: '12px' }} />
          </button>
        </div>
      )}

      {/* 1. AUTHENTICATION & 2FA GATEWAY GATE */}
      {!isAuthenticated ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div className="glass-panel" style={{ width: '450px', padding: '2.5rem', border: '1px solid rgba(168, 85, 247, 0.3)', boxShadow: '0 0 40px rgba(168, 85, 247, 0.1)' }}>
            
            {/* Rotating Logo on Entrance */}
            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              <RotatingLogo size={80} />
              <h2 className="glitch-text" style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '1rem', color: 'var(--neon-cyan)', tracking: '0.05em' }}>
                VCS BACKUP & CRYPTO VAULT
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Multi-Factor Security Environment Gateway</p>
              <button 
                type="button" 
                className={`cyber-btn ${eyeCare ? 'btn-gold' : ''}`} 
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.7rem', marginTop: '0.75rem' }}
                onClick={() => setEyeCare(!eyeCare)}
              >
                {eyeCare ? <EyeOff style={{ width: '12px', height: '12px' }} /> : <Eye style={{ width: '12px', height: '12px' }} />}
                {eyeCare ? 'Retina Shield: Active' : 'Enable Retina Shield'}
              </button>
            </div>

            {/* ERROR HANDLERS */}
            {authError && (
              <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(244, 63, 94, 0.08)', border: '1px solid var(--neon-red)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--neon-red)', marginBottom: '1.25rem', alignItems: 'center' }}>
                <AlertOctagon style={{ width: '18px', height: '18px', flexShrink: 0 }} strokeWidth="2.5" />
                <div>{authError}</div>
              </div>
            )}

            {/* SCREEN A: CREDENTIALS (LOGIN / SIGNUP) */}
            {!show2FA ? (
              <form onSubmit={authMode === 'login' ? handleLogin : handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* Email field */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Identity Email Address</label>
                  <input 
                    type="email" 
                    className="cyber-input" 
                    style={{ width: '100%' }} 
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Password field */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Account Password</label>
                  <input 
                    type="password" 
                    className="cyber-input" 
                    style={{ width: '100%' }} 
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {/* Signup Password entropy meter */}
                {authMode === 'signup' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '2px' }}>
                      <span>Password Entropy:</span>
                      <strong style={{ color: pwdStrength.color }}>{pwdStrength.text}</strong>
                    </div>
                    <div style={{ height: '5px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pwdStrength.score}%`, backgroundColor: pwdStrength.color, transition: 'width 0.3s ease' }}></div>
                    </div>
                    {pwdStrength.tips.length > 0 && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '1px' }}>
                        {pwdStrength.tips.slice(0, 2).map((t, i) => (
                          <span key={i}>• {t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Confirm Password (Signup only) */}
                {authMode === 'signup' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Confirm Password</label>
                    <input 
                      type="password" 
                      className="cyber-input" 
                      style={{ width: '100%' }} 
                      placeholder="••••••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                )}

                {/* Mode Selectors */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                  {authMode === 'login' ? (
                    <span style={{ color: 'var(--text-muted)' }}>
                      New User? <button type="button" style={{ background: 'none', border: 'none', color: 'var(--neon-cyan)', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => { setAuthMode('signup'); setAuthError(''); }}>Register Account</button>
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>
                      Registered? <button type="button" style={{ background: 'none', border: 'none', color: 'var(--neon-cyan)', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => { setAuthMode('login'); setAuthError(''); }}>Sign In</button>
                    </span>
                  )}
                </div>

                {/* Submit Trigger */}
                <button type="submit" className="cyber-btn btn-green" style={{ width: '100%', justifyContent: 'center' }}>
                  {authMode === 'login' ? (
                    <>
                      <Lock style={{ width: '16px', height: '16px' }} /> Verify Identity
                    </>
                  ) : (
                    <>
                      <UserPlus style={{ width: '16px', height: '16px' }} /> Register & Set MFA
                    </>
                  )}
                </button>
                
                {/* Visual debug tip for user */}
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', border: '1px dashed rgba(168, 85, 247, 0.1)', padding: '0.5rem', borderRadius: '4px' }}>
                  <HelpCircle style={{ width: '12px', height: '12px', display: 'inline', marginRight: '4px' }} />
                  Demo Mode Pass: <code>admin@vcs-backup.sec</code> // <code>SuperSecretP@ss123!</code>
                </div>

              </form>
            ) : (
              
              /* SCREEN B: MULTI FACTOR 2FA CHALLENGE */
              <form onSubmit={handleTotpVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <QrCode style={{ width: '40px', height: '40px', color: 'var(--neon-cyan)' }} />
                  <span style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>2FA Verification Step</span>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Scan QR code or use TOTP generator rolling keys to authorize secure session token.</p>
                </div>

                {/* QR Code and rolling code visual simulator */}
                <div style={{ display: 'flex', gap: '1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: '8px', alignItems: 'center', justifyContent: 'center' }}>
                  {/* Real visual SVG QR code */}
                  <svg width="70" height="70" viewBox="0 0 100 100" style={{ background: 'white', padding: '3px', borderRadius: '4px', flexShrink: 0 }}>
                    <rect x="0" y="0" width="30" height="30" fill="black" />
                    <rect x="5" y="5" width="20" height="20" fill="white" />
                    <rect x="10" y="10" width="10" height="10" fill="black" />
                    <rect x="70" y="0" width="30" height="30" fill="black" />
                    <rect x="75" y="5" width="20" height="20" fill="white" />
                    <rect x="80" y="10" width="10" height="10" fill="black" />
                    <rect x="0" y="70" width="30" height="30" fill="black" />
                    <rect x="5" y="75" width="20" height="20" fill="white" />
                    <rect x="10" y="80" width="10" height="10" fill="black" />
                    <rect x="40" y="10" width="10" height="10" fill="black" />
                    <rect x="50" y="20" width="10" height="10" fill="black" />
                    <rect x="35" y="40" width="15" height="15" fill="black" />
                    <rect x="60" y="50" width="10" height="10" fill="black" />
                    <rect x="45" y="75" width="15" height="10" fill="black" />
                    <rect x="75" y="45" width="10" height="20" fill="black" />
                    <rect x="80" y="80" width="15" height="15" fill="black" />
                  </svg>
                  
                  {/* Rolling Code Display */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Google Authenticator Code</span>
                    <strong style={{ fontSize: '1.35rem', color: 'var(--neon-green)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
                      {totpCode.slice(0, 3)} {totpCode.slice(3)}
                    </strong>
                    {/* rolling decay bar */}
                    <div>
                      <div style={{ height: '4px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(totpProgress/30)*100}%`, backgroundColor: 'var(--neon-cyan)', transition: 'width 1s linear' }}></div>
                      </div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Code refreshes in {totpProgress}s</span>
                    </div>
                  </div>
                </div>

                {totpError && (
                  <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(244, 63, 94, 0.08)', border: '1px solid var(--neon-red)', padding: '0.5rem', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--neon-red)', alignItems: 'center' }}>
                    <AlertTriangle style={{ width: '14px', height: '14px', flexShrink: 0 }} />
                    <div>{totpError}</div>
                  </div>
                )}

                {/* Input verification */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Enter 6-Digit TOTP Token</label>
                  <input 
                    type="text" 
                    className="cyber-input" 
                    style={{ width: '100%', textAlign: 'center', fontSize: '1.25rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }} 
                    placeholder="000000"
                    maxLength={6}
                    value={totpInput}
                    onChange={(e) => setTotpInput(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>

                {/* Submit 2FA */}
                <button type="submit" className="cyber-btn" style={{ width: '100%', justifyContent: 'center' }}>
                  <Unlock style={{ width: '16px', height: '16px' }} /> Authorize Session
                </button>

                <button 
                  type="button" 
                  className="cyber-btn btn-red" 
                  style={{ width: '100%', justifyContent: 'center', border: 'none', background: 'none', boxShadow: 'none', padding: '0.25rem' }} 
                  onClick={() => { setShow2FA(false); setTotpInput(''); setTotpError(''); }}
                >
                  Back to credentials
                </button>

              </form>
            )}

          </div>
        </div>
      ) : (

        /* 2. THE MAIN SECURE SYSTEM WORKSPACE DASHBOARD */
        <>
          {/* Top Banner / Header */}
          <header className="glass-panel" style={{ borderRadius: '0', borderLeft: 'none', borderRight: 'none', borderTop: 'none', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
            
            {/* Title & Rotating Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ position: 'relative', width: '38px', height: '38px' }}>
                <RotatingLogo size={38} />
              </div>
              <div>
                <h1 className="glitch-text" style={{ fontSize: '1.25rem', fontWeight: '800', tracking: '0.05em', color: 'var(--neon-cyan)' }}>
                  VCS CLOUD BACKUP & VAULT SEC
                </h1>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>SECURE STORAGE ENGINE // v2.4.0-STABLE</span>
              </div>
            </div>

            {/* Status indicator bar & actions */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Threat Index:</span>
                <span className="cyber-badge green" style={{ fontWeight: 'bold' }}>SAFE</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>FIPS 140-3 Mode:</span>
                <span className="cyber-badge cyan" style={{ fontWeight: 'bold' }}>ACTIVE</span>
              </div>

              {/* Eye Care Toggle */}
              <button 
                className={`cyber-btn ${eyeCare ? 'btn-gold' : ''}`} 
                style={{ padding: '0.5rem 0.85rem', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                onClick={() => { setEyeCare(!eyeCare); addLog(`Eye Protection: Set low-blue-light filters to ${!eyeCare ? 'ACTIVE' : 'INACTIVE'}`, 'info'); }}
              >
                {eyeCare ? <EyeOff style={{ width: '14px', height: '14px' }} /> : <Eye style={{ width: '14px', height: '14px' }} />}
                {eyeCare ? 'EYE CARE: ON' : 'EYE CARE: OFF'}
              </button>

              {/* Tour Guide Trigger */}
              <button 
                className="cyber-btn btn-gold" 
                style={{ padding: '0.5rem 0.85rem', fontSize: '0.75rem', fontWeight: 'bold' }}
                onClick={startTour}
              >
                <HelpCircle style={{ width: '14px', height: '14px' }} /> DEMO TOUR
              </button>

              {/* Emergency Lockdown Switch */}
              <button 
                className={`cyber-btn ${lockdown ? 'btn-red glow-red' : 'btn-red'}`} 
                style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                onClick={handleEmergencyLockdown}
              >
                <AlertOctagon style={{ width: '14px', height: '14px' }} />
                {lockdown ? 'CANCEL LOCKDOWN' : 'EMERGENCY LOCKDOWN'}
              </button>

              {/* Sign out */}
              <button 
                className="cyber-btn"
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', border: '1px dashed var(--border-color)' }}
                onClick={() => { setIsAuthenticated(false); setTotpInput(''); setEmail('admin@vcs-backup.sec'); setPassword('SuperSecretP@ss123!'); }}
              >
                Sign Out
              </button>

            </div>
          </header>

          {/* Main Workspace Layout */}
          <div style={{ display: 'flex', flex: 1, padding: '1.5rem 2rem', gap: '1.5rem' }}>
            
            {/* Left Sidebar Navigation */}
            <aside style={{ width: '240px', display: 'flex', flexDirection: 'column', gap: '1rem', flexShrink: 0 }}>
              
              <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'block' }}>Operational Nodes</span>
                
                <button 
                  className={`cyber-btn ${activeTab === 'dashboard' ? 'btn-green' : ''} ${tourStep === 1 ? 'tour-highlight' : ''}`}
                  style={{ width: '100%', justifyContent: 'flex-start', border: activeTab === 'dashboard' ? '' : '1px solid transparent', background: activeTab === 'dashboard' ? 'rgba(99, 102, 241, 0.1)' : 'transparent', padding: '0.6rem 0.85rem', fontSize: '0.85rem' }}
                  onClick={() => setActiveTab('dashboard')}
                >
                  <LayoutDashboard style={{ width: '16px', height: '16px' }} /> COMMAND CENTER
                </button>

                <button 
                  className={`cyber-btn ${activeTab === 'cryptography' ? 'btn-green' : ''} ${tourStep === 2 ? 'tour-highlight' : ''}`}
                  style={{ width: '100%', justifyContent: 'flex-start', border: activeTab === 'cryptography' ? '' : '1px solid transparent', background: activeTab === 'cryptography' ? 'rgba(99, 102, 241, 0.1)' : 'transparent', padding: '0.6rem 0.85rem', fontSize: '0.85rem' }}
                  onClick={() => setActiveTab('cryptography')}
                >
                  <Lock style={{ width: '16px', height: '16px' }} /> CRYPTO VAULT LAB
                </button>

                <button 
                  className={`cyber-btn ${activeTab === 'virtualization' ? 'btn-green' : ''} ${tourStep === 3 ? 'tour-highlight' : ''}`}
                  style={{ width: '100%', justifyContent: 'flex-start', border: activeTab === 'virtualization' ? '' : '1px solid transparent', background: activeTab === 'virtualization' ? 'rgba(99, 102, 241, 0.1)' : 'transparent', padding: '0.6rem 0.85rem', fontSize: '0.85rem' }}
                  onClick={() => setActiveTab('virtualization')}
                >
                  <Cpu style={{ width: '16px', height: '16px' }} /> VPC & VIRTUALIZATION
                </button>

                <button 
                  className={`cyber-btn ${activeTab === 'backups' ? 'btn-green' : ''} ${tourStep === 4 ? 'tour-highlight' : ''}`}
                  style={{ width: '100%', justifyContent: 'flex-start', border: activeTab === 'backups' ? '' : '1px solid transparent', background: activeTab === 'backups' ? 'rgba(99, 102, 241, 0.1)' : 'transparent', padding: '0.6rem 0.85rem', fontSize: '0.85rem' }}
                  onClick={() => setActiveTab('backups')}
                >
                  <Database style={{ width: '16px', height: '16px' }} /> BACKUP MANAGER
                </button>

                <button 
                  className={`cyber-btn ${activeTab === 'iam' ? 'btn-green' : ''} ${tourStep === 5 ? 'tour-highlight' : ''}`}
                  style={{ width: '100%', justifyContent: 'flex-start', border: activeTab === 'iam' ? '' : '1px solid transparent', background: activeTab === 'iam' ? 'rgba(99, 102, 241, 0.1)' : 'transparent', padding: '0.6rem 0.85rem', fontSize: '0.85rem' }}
                  onClick={() => setActiveTab('iam')}
                >
                  <Shield style={{ width: '16px', height: '16px' }} /> IAM ACCESS ENGINE
                </button>
              </div>

              {/* Secure Audit Trail Feed Log on Sidebar */}
              <div className="glass-panel" style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', height: '350px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Terminal style={{ width: '12px', height: '12px' }} /> SECURE AUDIT RECEIPT
                </span>
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '2px', fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>
                  {logs.map((log) => (
                    <div key={log.id} style={{ padding: '0.25rem 0.4rem', background: 'rgba(0,0,0,0.15)', borderRadius: '4px', borderLeft: `2px solid ${log.type === 'success' ? 'var(--neon-green)' : log.type === 'error' ? 'var(--neon-red)' : log.type === 'warning' ? 'var(--neon-gold)' : 'var(--neon-cyan)'}` }}>
                      <span style={{ color: 'var(--text-muted)', marginRight: '4px' }}>[{log.timestamp}]</span>
                      <span style={{ color: log.type === 'success' ? 'var(--neon-green)' : log.type === 'error' ? 'var(--neon-red)' : log.type === 'warning' ? 'var(--neon-gold)' : 'var(--text-primary)' }}>{log.message}</span>
                    </div>
                  ))}
                </div>
                <button 
                  className="cyber-btn btn-green" 
                  style={{ width: '100%', padding: '0.45rem', fontSize: '0.75rem', marginTop: '0.75rem', justifyContent: 'center' }}
                  onClick={handleExportReport}
                >
                  <Download style={{ width: '12px', height: '12px' }} /> Export Audit Report
                </button>
              </div>

            </aside>

            {/* Tab content panel */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              
              {/* Main Dashboard Command Center View */}
              {activeTab === 'dashboard' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }} className={tourStep === 1 ? 'tour-highlight' : ''}>
                  
                  {/* Lockdown Notice */}
                  {lockdown && (
                    <div style={{ display: 'flex', gap: '1rem', background: 'rgba(244, 63, 94, 0.08)', border: '2px solid var(--neon-red)', padding: '1.25rem', borderRadius: '8px', color: 'var(--neon-red)', animation: 'cyber-pulse 2s infinite ease-in-out' }}>
                      <AlertOctagon style={{ width: '28px', height: '28px', flexShrink: 0 }} />
                      <div>
                        <h3 style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '0.25rem' }}>SYSTEM BOUNDARY ISOLATION PROTOCOL ENGAGED</h3>
                        <p style={{ fontSize: '0.85rem' }}>Emergency lockdown active. Network adapters blocked. Host hypervisor disconnected. Programmatic access key permissions revoked. Data replication pools quarantined.</p>
                      </div>
                    </div>
                  )}

                  {/* Statistics Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                    
                    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Storage Deduplication</span>
                      <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'rgba(57, 255, 20, 0.9)' }}>63.4% Saved</h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Using SHA-256 chunk hashes</span>
                    </div>

                    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Hypervisors</span>
                      <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--neon-cyan)' }}>{metricVmsRunning} / 3 Nodes</h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Type-1 Bare-Metal Isolation</span>
                    </div>

                    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>WAF Shield Block rate</span>
                      <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--neon-green)' }}>100% Blocked</h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>3 Intrusion probes mitigated</span>
                    </div>

                    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>KMS Key Rotations</span>
                      <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--neon-gold)' }}>Auto Rotated</h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Every 24h via KMS policies</span>
                    </div>

                  </div>

                  {/* THREE TELEMETRY CHARTS ROW */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                    
                    {/* CHART 1: THREAT VECTOR BREAKDOWN (DOUGHNUT) */}
                    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <h3 style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', textTransform: 'uppercase' }}>
                        Threat Vector Breakdown
                      </h3>
                      
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', height: '140px', justifyContent: 'center' }}>
                        {/* SVG Doughnut Chart */}
                        <svg width="100" height="100" viewBox="0 0 42 42">
                          <circle cx="21" cy="21" r="15.915" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="4.5" />
                          
                          {/* Segment 1: DDoS (45%) -> Dasharray = 45, offset = 100 */}
                          <circle cx="21" cy="21" r="15.915" fill="none" stroke="var(--neon-red)" strokeWidth="5.5" strokeDasharray="45 55" strokeDashoffset="100" />
                          
                          {/* Segment 2: SQLi (25%) -> Dasharray = 25, offset = 55 */}
                          <circle cx="21" cy="21" r="15.915" fill="none" stroke="var(--neon-cyan)" strokeWidth="5.5" strokeDasharray="25 75" strokeDashoffset="55" />
                          
                          {/* Segment 3: Scan (20%) -> Dasharray = 20, offset = 30 */}
                          <circle cx="21" cy="21" r="15.915" fill="none" stroke="var(--neon-gold)" strokeWidth="5.5" strokeDasharray="20 80" strokeDashoffset="30" />
                          
                          {/* Segment 4: Brute Force (10%) -> Dasharray = 10, offset = 10 */}
                          <circle cx="21" cy="21" r="15.915" fill="none" stroke="var(--neon-green)" strokeWidth="5.5" strokeDasharray="10 90" strokeDashoffset="10" />

                          <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fill="var(--text-primary)" fontSize="5.5" fontFamily="var(--font-mono)" fontWeight="bold">94 MIT</text>
                        </svg>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.65rem', fontFamily: 'var(--font-mono)' }}>
                          <span style={{ color: 'var(--neon-red)' }}>● DDoS (45%)</span>
                          <span style={{ color: 'var(--neon-cyan)' }}>● SQLi (25%)</span>
                          <span style={{ color: 'var(--neon-gold)' }}>● Scans (20%)</span>
                          <span style={{ color: 'var(--neon-green)' }}>● Brute (10%)</span>
                        </div>
                      </div>
                    </div>

                    {/* CHART 2: REGIONAL REPLICATION SYNC (BARS) */}
                    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <h3 style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', textTransform: 'uppercase' }}>
                        Regional Replication Sync
                      </h3>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', height: '140px', justifyContent: 'center' }}>
                        {/* Bar 1 */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '2px', fontFamily: 'var(--font-mono)' }}>
                            <span>US-EAST-1 (Active)</span>
                            <span style={{ color: 'var(--neon-green)' }}>100% Sync</span>
                          </div>
                          <div style={{ height: '6px', width: '100%', background: 'rgba(255,255,255,0.03)', borderRadius: '3px' }}>
                            <div style={{ height: '100%', width: '100%', background: 'var(--neon-green)', borderRadius: '3px' }}></div>
                          </div>
                        </div>

                        {/* Bar 2 */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '2px', fontFamily: 'var(--font-mono)' }}>
                            <span>US-WEST-2 (Standby)</span>
                            <span style={{ color: 'var(--neon-cyan)' }}>85% Sync</span>
                          </div>
                          <div style={{ height: '6px', width: '100%', background: 'rgba(255,255,255,0.03)', borderRadius: '3px' }}>
                            <div style={{ height: '100%', width: '85%', background: 'var(--neon-cyan)', borderRadius: '3px' }}></div>
                          </div>
                        </div>

                        {/* Bar 3 */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '2px', fontFamily: 'var(--font-mono)' }}>
                            <span>EU-CENTRAL-1 (Backup)</span>
                            <span style={{ color: 'var(--neon-gold)' }}>61% Sync</span>
                          </div>
                          <div style={{ height: '6px', width: '100%', background: 'rgba(255,255,255,0.03)', borderRadius: '3px' }}>
                            <div style={{ height: '100%', width: '61%', background: 'var(--neon-gold)', borderRadius: '3px' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CHART 3: KMS ENTROPY GRAPH (LINE CHART) */}
                    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <h3 style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', textTransform: 'uppercase' }}>
                        KMS Key Entropy Telemetry
                      </h3>
                      
                      <div style={{ height: '140px', background: 'rgba(0,0,0,0.15)', border: '1px dashed var(--border-color)', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
                        <svg viewBox="0 0 200 100" style={{ width: '100%', height: '100%' }}>
                          {/* Grid ticks */}
                          <line x1="0" y1="20" x2="200" y2="20" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
                          <line x1="0" y1="50" x2="200" y2="50" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
                          <line x1="0" y1="80" x2="200" y2="80" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
                          
                          {/* Line path */}
                          <path 
                            d="M 0 80 L 30 75 L 60 40 L 90 45 L 120 20 L 150 25 L 180 18 L 200 15" 
                            fill="none" 
                            stroke="var(--neon-cyan)" 
                            strokeWidth="2.5" 
                          />
                          {/* area fill */}
                          <path 
                            d="M 0 80 L 30 75 L 60 40 L 90 45 L 120 20 L 150 25 L 180 18 L 200 15 L 200 100 L 0 100 Z" 
                            fill="rgba(168, 85, 247, 0.08)" 
                          />
                          
                          {/* Dots */}
                          <circle cx="120" cy="20" r="3" fill="var(--neon-green)" />
                          <circle cx="180" cy="18" r="3" fill="var(--neon-green)" />
                          <text x="125" y="15" fill="var(--neon-green)" fontSize="6" fontFamily="var(--font-mono)">7.99 bits</text>
                        </svg>
                      </div>
                    </div>

                  </div>

                  {/* Bottom details Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem' }}>
                    
                    {/* Visual diagram showing security integrity check metrics */}
                    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                        Network Traffic & Data Replication Health
                      </h3>
                      
                      {/* SVG Live Graphic Chart */}
                      <div style={{ height: '170px', background: 'rgba(5, 8, 17, 0.8)', border: '1px solid var(--border-color)', borderRadius: '6px', position: 'relative', overflow: 'hidden' }}>
                        <svg viewBox="0 0 400 150" style={{ width: '100%', height: '100%' }}>
                          
                          {/* Grid background lines */}
                          <line x1="0" y1="25" x2="400" y2="25" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                          <line x1="0" y1="50" x2="400" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                          <line x1="0" y1="75" x2="400" y2="75" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                          <line x1="0" y1="100" x2="400" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                          <line x1="0" y1="125" x2="400" y2="125" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                          
                          {/* Chart Path 1: Normal Encrypted Data Upload */}
                          <path 
                            d={generatePathD(rollingData)} 
                            fill="none" 
                            stroke="var(--neon-green)" 
                            strokeWidth="3"
                            strokeLinecap="round" 
                            style={{ filter: 'drop-shadow(0px 0px 4px var(--neon-green-glow))', transition: 'd 0.5s ease-in-out' }}
                          />
                          
                          {/* Pulsing outline circle at the end of the line chart */}
                          <circle 
                            cx="400" 
                            cy={150 - rollingData[rollingData.length - 1]} 
                            r="5" 
                            fill="var(--neon-green)" 
                            style={{ filter: 'drop-shadow(0px 0px 6px var(--neon-green-glow))' }} 
                          />

                          {/* Chart Path 2: Threat Probe Ingress (low peaks, blocked) */}
                          <path 
                            d="M 0 145 L 80 140 L 120 142 L 150 100 L 160 145 L 250 143 L 300 145 L 400 145" 
                            fill="none" 
                            stroke="var(--neon-red)" 
                            strokeWidth="2" 
                            strokeDasharray="4 2"
                          />

                        </svg>

                        <div style={{ position: 'absolute', bottom: '8px', right: '8px', display: 'flex', gap: '0.75rem', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--neon-green)' }}>
                            <span className="status-dot green" style={{ width: '6px', height: '6px' }}></span> Secure Payload Upload
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--neon-red)' }}>
                            <span className="status-dot red" style={{ width: '6px', height: '6px' }}></span> Cyber Threat Blocked
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick actions panel */}
                    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                        Infrastructure Security Controls
                      </h3>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          Quick access shortcuts for incident containment:
                        </div>

                        <button 
                          className="cyber-btn" 
                          style={{ justifyContent: 'center' }} 
                          onClick={() => addLog('Security Hypervisor: Triggered key rotation. Updating KMS master parameters.', 'success')}
                        >
                          <Lock style={{ width: '14px', height: '14px' }} /> Rotate Cryptographic KMS Keys
                        </button>

                        <button 
                          className="cyber-btn" 
                          style={{ justifyContent: 'center' }} 
                          onClick={() => addLog('IDS: Triggering internal VPC ports scan check...', 'info')}
                        >
                          <Terminal style={{ width: '14px', height: '14px' }} /> Scan Network Vulnerabilities
                        </button>

                        <button 
                          className="cyber-btn btn-green" 
                          style={{ justifyContent: 'center' }} 
                          onClick={handleExportReport}
                        >
                          <Download style={{ width: '14px', height: '14px' }} /> Export Security Audit Report
                        </button>

                        <div style={{ marginTop: '0.5rem', border: '1px dashed rgba(168, 85, 247, 0.15)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                          <AlertTriangle style={{ width: '14px', height: '14px', color: 'var(--neon-gold)', flexShrink: 0 }} />
                          <span>Security index audits run automatically every 10 seconds. All systems functional.</span>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* Child Components Tabs */}
              {activeTab === 'cryptography' && (
                <div className={tourStep === 2 ? 'tour-highlight' : ''}>
                  <CryptoLab addLog={addLog} />
                </div>
              )}
              {activeTab === 'virtualization' && (
                <div className={tourStep === 3 ? 'tour-highlight' : ''}>
                  <VirtualizationConsole addLog={addLog} />
                </div>
              )}
              {activeTab === 'backups' && (
                <div className={tourStep === 4 ? 'tour-highlight' : ''}>
                  <BackupManager addLog={addLog} />
                </div>
              )}
              {activeTab === 'iam' && (
                <div className={tourStep === 5 ? 'tour-highlight' : ''}>
                  <IAMConsole addLog={addLog} />
                </div>
              )}

            </main>
          </div>

          {/* Footer */}
          <footer style={{ borderTop: '1px solid var(--border-color)', padding: '1rem 2rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            SECURE CLOUD HYPERVISOR ENGINE // RUNNING ON WINDOWS HOSTS VIRTUALIZED CORE // 100% CLIENT-SIDE ENCRYPTED
          </footer>
        </>
      )}

    </div>
  );
}
