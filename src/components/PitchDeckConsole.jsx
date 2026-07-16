import React, { useState } from 'react';
import { Presentation, ChevronLeft, ChevronRight, Download, ShieldCheck } from 'lucide-react';

export default function PitchDeckConsole({ addLog }) {
  const [currentSlide, setCurrentSlide] = useState(1);
  const totalSlides = 10;

  const handleNext = () => {
    setCurrentSlide(prev => (prev < totalSlides ? prev + 1 : 1));
  };

  const handlePrev = () => {
    setCurrentSlide(prev => (prev > 1 ? prev - 1 : totalSlides));
  };

  // Re-trigger .ppt downloader
  const downloadPpt = () => {
    const downloadBtn = document.getElementById('ppt-download-trigger');
    if (downloadBtn) {
      downloadBtn.click();
    } else {
      addLog('System: Triggering slideshow download...', 'info');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Header Row with Export Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Presentation className="status-dot purple" style={{ width: '20px', height: '20px', background: 'none', boxShadow: 'none' }} />
            Compliance Pitch Deck Presentation
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
            Interactive evaluation slides detailing Capstone sub-systems and FIPS 140-3 boundary scopes.
          </p>
        </div>
        <button className="cyber-btn btn-purple" onClick={downloadPpt} style={{ gap: '0.5rem' }}>
          <Download style={{ width: '14px', height: '14px' }} /> Download PowerPoint (.ppt)
        </button>
      </div>

      {/* Main Glassmorphic Slide View Container */}
      <div 
        className="glass-panel" 
        style={{ 
          minHeight: '420px', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between', 
          position: 'relative', 
          overflow: 'hidden',
          background: 'rgba(20, 10, 45, 0.45)',
          border: '1px solid rgba(168, 85, 247, 0.25)',
          boxShadow: '0 8px 32px 0 rgba(168, 85, 247, 0.15)',
          padding: '2.5rem'
        }}
      >
        
        {/* SLIDE 1: COVER */}
        {currentSlide === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--neon-purple)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                // Capstone Evaluation Slide Deck
              </span>
              <h1 style={{ fontSize: '2.4rem', color: 'var(--neon-purple)', margin: '0.5rem 0 0.25rem 0', fontWeight: 'bold' }}>
                VCS Secure Cloud Storage
              </h1>
              <h3 style={{ margin: 0, color: 'var(--neon-cyan)', fontSize: '1.1rem', fontWeight: '500' }}>
                Subject: Virtualization and Cloud Security
              </h3>
              <p style={{ marginTop: '1.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                An interactive security gateway showcasing FIPS 140-3 cryptographic boundaries, client-side PBKDF2/AES-GCM integrations, bare-metal hypervisor sandboxing, and automated KMS envelope key rotations.
              </p>
            </div>
            
            <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center', margin: '2rem 0' }}>
              {/* Spinning Logo Rings */}
              <div style={{ position: 'relative', width: '80px', height: '80px' }}>
                <svg width="80" height="80" viewBox="0 0 100 100" style={{ display: 'block' }}>
                  <circle cx="50" cy="50" r="42" fill="none" stroke="var(--neon-cyan)" strokeWidth="2" stroke-dasharray="10 5" className="rotate-cw" style={{ transformOrigin: '50px 50px' }} />
                  <circle cx="50" cy="50" r="30" fill="none" stroke="var(--neon-gold)" strokeWidth="1.5" stroke-dasharray="6 4" className="rotate-ccw" style={{ transformOrigin: '50px 50px' }} />
                  <path d="M 50 35 L 62 43 L 58 58 L 42 58 L 38 43 Z" fill="var(--neon-purple)" />
                </svg>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
                <p style={{ margin: 0, color: 'var(--text-primary)' }}>Prepared for: <span style={{ color: 'var(--neon-gold)', fontWeight: 'bold' }}>Academic Board</span></p>
                <p style={{ margin: '0.25rem 0 0 0', color: 'var(--neon-green)', fontFamily: 'var(--font-mono)' }}>pratyush-secure-backup.vercel.app</p>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 2: COMPONENT COMPARISON */}
        {currentSlide === 2 && (
          <div>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--neon-purple)' }}>// ARCHITECTURAL MATRIX</span>
            <h2 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', margin: '0.25rem 0 1rem 0' }}>Zero-Knowledge vs Standard Backups</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                <h4 style={{ margin: 0, color: 'var(--neon-red)' }}>Standard Cloud Architectures</h4>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  <li style={{ marginBottom: '0.35rem' }}>Files are uploaded in plaintext blocks to servers.</li>
                  <li style={{ marginBottom: '0.35rem' }}>Decryption keys reside in host databases.</li>
                  <li style={{ marginBottom: '0.35rem' }}>Keys leak inside server RAM buffers during execution.</li>
                </ul>
              </div>
              <div style={{ background: 'rgba(52, 211, 153, 0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(52, 211, 153, 0.15)' }}>
                <h4 style={{ margin: 0, color: 'var(--neon-green)' }}>VCS Zero-Knowledge Vault</h4>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  <li style={{ marginBottom: '0.35rem' }}>Files are encrypted locally before S3 transit.</li>
                  <li style={{ marginBottom: '0.35rem' }}>Decryption keys never traverse network sockets.</li>
                  <li style={{ marginBottom: '0.35rem' }}>Host administrators have zero visibility into content.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 3: CRYPTOGRAPHIC PIPELINE */}
        {currentSlide === 3 && (
          <div>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--neon-purple)' }}>// SUB-SYSTEM I: CLIENT CRYPTOGRAPHY</span>
            <h2 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', margin: '0.25rem 0 1rem 0' }}>Web Crypto subtle API Pipeline</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem' }}>
              <div>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--neon-cyan)', fontWeight: 'bold' }}>PBKDF2 Key Stretching</span>: Derives 256-bit keys using password salt stretching with 100,000 hashing iterations.
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--neon-cyan)', fontWeight: 'bold' }}>AES-256-GCM Blocks</span>: Hardware-accelerated local block cipher encrypts chunks natively in browser memory.
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--neon-cyan)', fontWeight: 'bold' }}>SHA-256 Integrity Digests</span>: Computes unique checksums to verify tamper-detection states.
                  </li>
                </ul>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <svg width="100%" height="80" viewBox="0 0 100 60">
                  <rect x="5" y="20" width="25" height="15" rx="3" fill="#120c24" stroke="var(--neon-gold)" strokeWidth="1"/>
                  <text x="17.5" y="29" textAnchor="middle" fill="var(--neon-gold)" fontSize="4">Input Pass</text>
                  <path d="M 30 27 L 40 27" stroke="var(--neon-gold)" strokeWidth="0.75" />
                  <rect x="40" y="10" width="25" height="35" rx="3" fill="#120c24" stroke="var(--neon-green)" strokeWidth="1"/>
                  <text x="52.5" y="22" textAnchor="middle" fill="var(--neon-green)" fontSize="4">PBKDF2</text>
                  <text x="52.5" y="30" text-anchor="middle" fill="var(--neon-green)" fontSize="3">100k Iter</text>
                  <path d="M 65 27 L 75 27" stroke="var(--neon-green)" strokeWidth="0.75" />
                  <rect x="75" y="20" width="22" height="15" rx="3" fill="#120c24" stroke="var(--neon-cyan)" strokeWidth="1"/>
                  <text x="86" y="29" text-anchor="middle" fill="var(--neon-cyan)" fontSize="4">AES Key</text>
                </svg>
                <p style={{ fontSize: '0.75rem', margin: '0.5rem 0 0 0', color: 'var(--text-muted)' }}>Local Crypto Pipeline</p>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 4: IDENTITY GATEWAY */}
        {currentSlide === 4 && (
          <div>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--neon-purple)' }}>// SUB-SYSTEM II: IDENTITY LAYER</span>
            <h2 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', margin: '0.25rem 0 1rem 0' }}>Multi-Factor Authentication Shield</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem' }}>
              <div>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--neon-gold)', fontWeight: 'bold' }}>Entropy Strength Audit</span>: Real-time entropy feedback detects password complexity issues before storage.
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--neon-gold)', fontWeight: 'bold' }}>TOTP 2FA Verification</span>: Google Authenticator TOTP token challenges are refreshed on 30-second cycles.</li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--neon-gold)', fontWeight: 'bold' }}>Salted Key Digests</span>: Passwords are encrypted as SHA-256 digests prior to gateway checks, shielding against credentials leakage.
                  </li>
                </ul>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck style={{ width: '40px', height: '40px', color: 'var(--neon-gold)', filter: 'drop-shadow(0 0 5px rgba(251, 191, 36, 0.4))' }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--neon-gold)', fontWeight: 'bold', marginTop: '0.5rem', fontFamily: 'var(--font-mono)' }}>MFA SECURED</span>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 5: TYPE-1 HYPERVISOR NODES */}
        {currentSlide === 5 && (
          <div>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--neon-purple)' }}>// SUB-SYSTEM III: COMPUTATION SECURITY</span>
            <h2 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', margin: '0.25rem 0 1rem 0' }}>Hypervisor Isolations & Quotas</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem' }}>
              <div>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--neon-green)', fontWeight: 'bold' }}>Bare-Metal Isolation</span>: Services partition computing structures into sandboxed guest environments.
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--neon-green)', fontWeight: 'bold' }}>Subnet Quarantines</span>: Toggling quarantine sandbox (VM-3) drops external routing access immediately.
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--neon-green)', fontWeight: 'bold' }}>Real-time Resource Monitors</span>: Tracks CPU/RAM logs to warn of potential host service exhaustion vectors.
                  </li>
                </ul>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--neon-gold)' }}>
                      <th>VM Name</th>
                      <th>Hypervisor</th>
                      <th>Subnet</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td>Web-Server</td>
                      <td>Type-1</td>
                      <td style={{ color: 'var(--neon-green)' }}>Standard</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td>Secure DB</td>
                      <td>Type-1</td>
                      <td style={{ color: 'var(--neon-green)' }}>Standard</td>
                    </tr>
                    <tr>
                      <td>Sandbox-03</td>
                      <td>Sandbox</td>
                      <td style={{ color: 'var(--neon-red)' }}>Quarantine</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 6: WAF SIMULATOR */}
        {currentSlide === 6 && (
          <div>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--neon-purple)' }}>// SUB-SYSTEM IV: EDGE DEFENSES</span>
            <h2 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', margin: '0.25rem 0 1rem 0' }}>Intrusion WAF & Subnet Routing</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--neon-cyan)', fontWeight: 'bold' }}>Scrubbing proxies</span>: Filters incoming packets and drops malicious payloads at edge routers.
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--neon-cyan)', fontWeight: 'bold' }}>DDoS Rate-Limits</span>: Edge controls scrub volumetric DDoS flooding.
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--neon-cyan)', fontWeight: 'bold' }}>Port Scan Knocking Block</span>: Quarantines IPs attempting Recon port scans.
                  </li>
                </ul>
              </div>
              <div>
                <svg width="100%" height="90" viewBox="0 0 200 100" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                  <rect x="10" y="35" width="45" height="30" rx="4" fill="#120c24" stroke="var(--neon-cyan)" strokeWidth="1" />
                  <text x="32" y="52" textAnchor="middle" fill="var(--neon-cyan)" fontSize="5" fontFamily="var(--font-mono)">WAF Proxy</text>
                  <rect x="75" y="15" width="50" height="30" rx="4" fill="#120c24" stroke="var(--neon-gold)" strokeWidth="1" />
                  <text x="100" y="32" textAnchor="middle" fill="var(--neon-gold)" fontSize="5" fontFamily="var(--font-mono)">VM-Web-Node</text>
                  <rect x="75" y="55" width="50" height="30" rx="4" fill="#120c24" stroke="var(--neon-red)" strokeWidth="1" />
                  <text x="100" y="72" textAnchor="middle" fill="var(--neon-red)" fontSize="5" fontFamily="var(--font-mono)">VM-Sandbox</text>
                  <path d="M 55 50 L 75 30" stroke="var(--neon-gold)" strokeWidth="0.75" />
                  <path d="M 55 50 L 75 70" stroke="var(--neon-red)" strokeWidth="0.75" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 7: BACKUP RETENTION */}
        {currentSlide === 7 && (
          <div>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--neon-purple)' }}>// SUB-SYSTEM V: STORAGE OPTIMIZATION</span>
            <h2 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', margin: '0.25rem 0 1rem 0' }}>Scheduled Backup & Deduplication</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem' }}>
              <div>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--neon-green)', fontWeight: 'bold' }}>Automated Retention Cron</span>: Trigger scheduled checks locally without background socket delays.
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--neon-green)', fontWeight: 'bold' }}>Cryptographic Deduplication</span>: Hashes file byte segments using SHA-256 to skip uploading identical file blocks.
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--neon-green)', fontWeight: 'bold' }}>Payload Compression</span>: Encapsulates files inside local ZIP blocks, yielding an average <strong>63.4%</strong> space reduction.
                  </li>
                </ul>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '2.2rem', color: 'var(--neon-green)', fontWeight: 'bold' }}>63.4%</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '0.25rem' }}>DEDUPLICATION SAVINGS</span>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 8: KMS KEY ROTATION */}
        {currentSlide === 8 && (
          <div>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--neon-purple)' }}>// SUB-SYSTEM VI: KEY ROATION</span>
            <h2 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', margin: '0.25rem 0 1rem 0' }}>KMS Key Wrapping & Rotations</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '1.5rem' }}>
              <div>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--neon-cyan)', fontWeight: 'bold' }}>Envelope Encryption</span>: Multi-region master Key Encryption Keys (KEK) wrap and isolate local Data Keys (DEK).
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--neon-cyan)', fontWeight: 'bold' }}>Automated Key Rotation</span>: Shifts key rings, issuing new master ARNs and re-encrypting local DEK envelopes.
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--neon-cyan)', fontWeight: 'bold' }}>Telemetry Entropy Logs</span>: Tracks randomness levels of keys to verify cryptographic strength bounds.
                  </li>
                </ul>
              </div>
              <div>
                <svg width="100%" height="90" viewBox="0 0 100 100" style={{ display: 'block', margin: '0 auto' }}>
                  <circle cx="50" cy="50" r="42" fill="none" stroke="var(--neon-cyan)" strokeWidth="1" stroke-dasharray="5 2" className="rotate-cw" style={{ transformOrigin: '50px 50px' }} />
                  <rect x="35" y="15" width="30" height="12" rx="2" fill="#120c24" stroke="var(--neon-cyan)" strokeWidth="1" />
                  <text x="50" y="23" textAnchor="middle" fill="var(--neon-cyan)" fontSize="5" fontWeight="bold">KEK (Master)</text>
                  <rect x="35" y="44" width="30" height="12" rx="2" fill="#120c24" stroke="var(--neon-gold)" strokeWidth="1" />
                  <text x="50" y="52" textAnchor="middle" fill="var(--neon-gold)" fontSize="5" fontWeight="bold">DEK (Local)</text>
                  <rect x="30" y="72" width="40" height="12" rx="2" fill="#120c24" stroke="var(--neon-green)" strokeWidth="1" />
                  <text x="50" y="80" textAnchor="middle" fill="var(--neon-green)" fontSize="5" fontWeight="bold">Payload Block</text>
                  <path d="M 50 27 L 50 43" stroke="var(--neon-cyan)" strokeWidth="1" stroke-dasharray="2 2" />
                  <path d="M 50 56 L 50 71" stroke="var(--neon-gold)" strokeWidth="1" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 9: AI COILOT SCANNER */}
        {currentSlide === 9 && (
          <div>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--neon-purple)' }}>// SUB-SYSTEM VII: AI AUDITING</span>
            <h2 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', margin: '0.25rem 0 1rem 0' }}>AI Security Copilot & Heuristics</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem' }}>
              <div>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--neon-purple)', fontWeight: 'bold' }}>Gemini LLM Audit Connector</span>: Passes active policy parameters to Gemini models to generate code recommendation reviews.
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--neon-purple)', fontWeight: 'bold' }}>Local Heuristics Engine</span>: Checks for security vulnerabilities (e.g. wildcard permissions, missing quarantines).
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--neon-purple)', fontWeight: 'bold' }}>Dynamic Scanning Radar</span>: Provides glowing radar visual sweeps during active audit cycles.
                  </li>
                </ul>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck style={{ width: '40px', height: '40px', color: 'var(--neon-purple)', filter: 'drop-shadow(0 0 5px rgba(168, 85, 247, 0.4))' }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--neon-purple)', fontWeight: 'bold', marginTop: '0.5rem', fontFamily: 'var(--font-mono)' }}>AI SEC SCANNER</span>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 10: CONCLUSION & Dr. DITIXA MEHTA ACKNOWLEDGEMENT */}
        {currentSlide === 10 && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--neon-purple)' }}>
                // SUBJECT: VIRTUALIZATION AND CLOUD SECURITY
              </span>
              <h2 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', margin: '0.25rem 0 0.5rem 0' }}>
                Conclusion & Acknowledgements
              </h2>
              <p style={{ margin: '0.5rem 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                We express our sincere gratitude and thanks to our academic mentor, <strong style={{ color: 'var(--neon-cyan)' }}>Dr. Ditixa Mehta</strong>, for her invaluable guidance, support, help, and direction throughout the execution of this Capstone project.
              </p>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                <li><span style={{ color: 'var(--neon-gold)', fontWeight: 'bold' }}>FIPS 140-3 Validated</span>: Client subtle crypto boundaries verified.</li>
                <li><span style={{ color: 'var(--neon-gold)', fontWeight: 'bold' }}>Compute Isolation</span>: Hypervisor nodes successfully contain lateral network threats.</li>
              </ul>
            </div>
            
            <div style={{ background: 'rgba(52, 211, 153, 0.08)', border: '1px solid rgba(52, 211, 153, 0.2)', padding: '0.5rem 1rem', borderRadius: '6px', textAlign: 'center', marginTop: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--neon-green)', fontWeight: 'bold', letterSpacing: '0.1em' }}>
                THANK YOU FOR YOUR VALUABLE MENTORSHIP & SUPPORT
              </span>
            </div>
          </div>
        )}

        {/* Navigation Dots and Slide Numbers */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '1rem' }}>
          {/* Navigation Controls */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="cyber-btn" onClick={handlePrev} style={{ padding: '0.4rem 0.8rem', gap: '0.25rem' }}>
              <ChevronLeft style={{ width: '16px', height: '16px' }} /> Prev
            </button>
            <button className="cyber-btn" onClick={handleNext} style={{ padding: '0.4rem 0.8rem', gap: '0.25rem' }}>
              Next <ChevronRight style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
          
          {/* Indicators */}
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {Array.from({ length: totalSlides }).map((_, idx) => (
              <div 
                key={idx} 
                style={{ 
                  width: '6px', 
                  height: '6px', 
                  borderRadius: '50%', 
                  background: currentSlide === idx + 1 ? 'var(--neon-purple)' : 'rgba(255,255,255,0.15)',
                  transition: 'background 0.3s ease'
                }}
              />
            ))}
          </div>

          <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            Slide {currentSlide} of {totalSlides}
          </span>
        </div>

      </div>

    </div>
  );
}
