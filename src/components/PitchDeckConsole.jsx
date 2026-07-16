import React, { useState, useEffect } from 'react';
import { Presentation, ChevronLeft, ChevronRight, Download, ShieldCheck, CheckCircle2, AlertTriangle, Play, Pause } from 'lucide-react';

export default function PitchDeckConsole({ addLog }) {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [autoRotate, setAutoRotate] = useState(true);
  
  // Real-time telemetry state for Slide 7 bar chart fluctuations
  const [barHeights, setBarHeights] = useState({ raw: 40, zip: 28, dedup: 14 });

  const handleNext = () => {
    setCurrentSlide(prev => (prev < totalSlides ? prev + 1 : 1));
  };

  const handlePrev = () => {
    setCurrentSlide(prev => (prev > 1 ? prev - 1 : totalSlides));
  };

  const totalSlides = 10;

  // Slide auto-rotation timer
  useEffect(() => {
    if (!autoRotate) return;
    const timer = setInterval(() => {
      handleNext();
    }, 4000);
    return () => clearInterval(timer);
  }, [autoRotate, currentSlide]);

  // Bar chart dynamic fluctuations
  useEffect(() => {
    const chartInterval = setInterval(() => {
      setBarHeights({
        raw: Math.round(38 + Math.random() * 4),
        zip: Math.round(26 + Math.random() * 4),
        dedup: Math.round(12 + Math.random() * 4),
      });
    }, 1500);
    return () => clearInterval(chartInterval);
  }, []);

  // Re-trigger .ppt downloader
  const downloadPpt = () => {
    const downloadBtn = document.getElementById('ppt-download-trigger');
    if (downloadBtn) {
      downloadBtn.click();
    } else {
      addLog('System: Triggering slideshow download...', 'info');
    }
  };

  // Localized animations to prevent global CSS clashes
  const slideStyles = `
    @keyframes spin-local {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes spin-back-local {
      from { transform: rotate(0deg); }
      to { transform: rotate(-360deg); }
    }
    .rotate-slide-cw {
      animation: spin-local 12s linear infinite;
    }
    .rotate-slide-ccw {
      animation: spin-back-local 10s linear infinite;
    }
    .blink {
      animation: blink-anim 1.5s infinite;
    }
    @keyframes blink-anim {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
  `;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <style>{slideStyles}</style>
      
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
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1.5rem 0' }}>
              {/* Spinning Logo Rings */}
              <div style={{ position: 'relative', width: '80px', height: '80px' }}>
                <svg width="80" height="80" viewBox="0 0 100 100" style={{ display: 'block' }}>
                  <g className="rotate-slide-cw" style={{ transformOrigin: '50px 50px' }}>
                    <circle cx="50" cy="50" r="42" fill="none" stroke="var(--neon-cyan)" strokeWidth="2" strokeDasharray="10 5" />
                  </g>
                  <g className="rotate-slide-ccw" style={{ transformOrigin: '50px 50px' }}>
                    <circle cx="50" cy="50" r="30" fill="none" stroke="var(--neon-gold)" strokeWidth="1.5" strokeDasharray="6 4" />
                  </g>
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
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--neon-purple)' }}>// ARCHITECTURAL COMPARISON</span>
            <h2 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', margin: '0.25rem 0 1rem 0' }}>Zero-Knowledge vs Standard Backups</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.04)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.15)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h4 style={{ margin: 0, color: 'var(--neon-red)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <AlertTriangle style={{ width: '14px', height: '14px' }} /> Standard Cloud Backup
                </h4>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <li>Data uploaded in plaintext to servers.</li>
                  <li>Decryption keys stored in server databases.</li>
                  <li>Keys exposed in server RAM during operations.</li>
                </ul>
              </div>
              <div style={{ background: 'rgba(52, 211, 153, 0.04)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(52, 211, 153, 0.15)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h4 style={{ margin: 0, color: 'var(--neon-green)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <CheckCircle2 style={{ width: '14px', height: '14px' }} /> VCS Zero-Knowledge Vault
                </h4>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <li>Files encrypted locally in browser memory.</li>
                  <li>Encryption keys never traverse the network.</li>
                  <li>Server only stores scrambled ciphertext chunks.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 3: CRYPTOGRAPHIC PIPELINE (WITH LASER PULSE DOTS) */}
        {currentSlide === 3 && (
          <div>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--neon-purple)' }}>// SUB-SYSTEM I: CLIENT CRYPTOGRAPHY</span>
            <h2 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', margin: '0.25rem 0 1rem 0' }}>Web Crypto subtle API Pipeline</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '1.5rem' }}>
              <div>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--neon-cyan)', fontWeight: 'bold' }}>PBKDF2 Key Stretching</span>: Derives 256-bit keys using password salt stretching with 100,000 hashing iterations.
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--neon-cyan)', fontWeight: 'bold' }}>AES-256-GCM Blocks</span>: Hardware-accelerated local block cipher encrypts chunks natively in browser memory.
                  </li>
                </ul>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center', position: 'relative' }}>
                <svg width="100%" height="80" viewBox="0 0 100 60">
                  <rect x="5" y="20" width="25" height="15" rx="3" fill="#120c24" stroke="var(--neon-gold)" strokeWidth="1"/>
                  <text x="17.5" y="29" textAnchor="middle" fill="var(--neon-gold)" fontSize="4.5">Password</text>
                  <path d="M 30 27 L 40 27" stroke="var(--neon-gold)" strokeWidth="0.75" />
                  
                  <rect x="40" y="10" width="25" height="35" rx="3" fill="#120c24" stroke="var(--neon-green)" strokeWidth="1"/>
                  <text x="52.5" y="22" textAnchor="middle" fill="var(--neon-green)" fontSize="4.5">PBKDF2</text>
                  <text x="52.5" y="30" text-anchor="middle" fill="var(--neon-green)" fontSize="3">100k Iter</text>
                  <path d="M 65 27 L 75 27" stroke="var(--neon-green)" strokeWidth="0.75" />
                  
                  <rect x="75" y="20" width="22" height="15" rx="3" fill="#120c24" stroke="var(--neon-cyan)" strokeWidth="1"/>
                  <text x="86" y="29" text-anchor="middle" fill="var(--neon-cyan)" fontSize="4.5">AES Key</text>

                  {/* Flowing Laser Dot */}
                  <circle cx="0" cy="0" r="1.5" fill="var(--neon-green)">
                    <animateMotion dur="3s" repeatCount="indefinite" path="M 17.5 27 L 52.5 27 L 86 27" />
                  </circle>
                </svg>
                <div style={{ position: 'absolute', top: '5px', right: '5px', fontSize: '0.6rem', color: 'var(--neon-green)', fontFamily: 'var(--font-mono)' }} className="blink">
                  ● PIPELINE ACTIVE
                </div>
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
                </ul>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.2rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
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
                      <td style={{ color: 'var(--neon-green)' }}>● Active</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td>Secure DB</td>
                      <td>Type-1</td>
                      <td style={{ color: 'var(--neon-green)' }}>● Active</td>
                    </tr>
                    <tr>
                      <td>Sandbox-03</td>
                      <td>Sandbox</td>
                      <td style={{ color: 'var(--neon-red)' }} className="blink">● Isolated</td>
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

        {/* SLIDE 7: BACKUP RETENTION (WITH ROTATING/FLUCTUATING BAR CHART) */}
        {currentSlide === 7 && (
          <div>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--neon-purple)' }}>// SUB-SYSTEM V: STORAGE OPTIMIZATION</span>
            <h2 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', margin: '0.25rem 0 1rem 0' }}>Scheduled Backup & Deduplication</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '1.5rem' }}>
              <div>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--neon-green)', fontWeight: 'bold' }}>De-duplication</span>: Hashes file byte segments using SHA-256 to skip uploading identical file blocks.
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--neon-green)', fontWeight: 'bold' }}>Compression</span>: Yields an average <strong>63.4%</strong> space reduction.
                  </li>
                </ul>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {/* Fluctuation SVG Bar Chart */}
                <svg width="180" height="100" viewBox="0 0 120 70" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '5px' }}>
                  <line x1="20" y1="10" x2="110" y2="10" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                  <line x1="20" y1="30" x2="110" y2="30" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                  <line x1="20" y1="50" x2="110" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                  
                  {/* Fluctuation bars */}
                  <rect x="30" y={55 - barHeights.raw} width="12" height={barHeights.raw} rx="1" fill="var(--neon-red)" opacity="0.85" style={{ transition: 'height 0.8s ease, y 0.8s ease', filter: 'drop-shadow(0 0 3px var(--neon-red-glow))' }} />
                  <text x="36" y={50 - barHeights.raw / 2} textAnchor="middle" fill="#fff" fontSize="5" fontWeight="bold">100%</text>
                  
                  <rect x="60" y={55 - barHeights.zip} width="12" height={barHeights.zip} rx="1" fill="var(--neon-purple)" opacity="0.85" style={{ transition: 'height 0.8s ease, y 0.8s ease', filter: 'drop-shadow(0 0 3px rgba(168, 85, 247, 0.4))' }} />
                  <text x="66" y={50 - barHeights.zip / 2} textAnchor="middle" fill="#fff" fontSize="5" fontWeight="bold">70%</text>
                  
                  <rect x="90" y={55 - barHeights.dedup} width="12" height={barHeights.dedup} rx="1" fill="var(--neon-green)" opacity="0.85" style={{ transition: 'height 0.8s ease, y 0.8s ease', filter: 'drop-shadow(0 0 3px var(--neon-green-glow))' }} />
                  <text x="96" y={50 - barHeights.dedup / 2} textAnchor="middle" fill="#fff" fontSize="5" fontWeight="bold">36%</text>
                  
                  <text x="36" y="62" textAnchor="middle" fill="var(--text-muted)" fontSize="4.5">Raw</text>
                  <text x="66" y="62" textAnchor="middle" fill="var(--text-muted)" fontSize="4.5">Zip</text>
                  <text x="96" y="62" textAnchor="middle" fill="var(--text-muted)" fontSize="4.5">Dedup</text>
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 8: KMS KEY ROTATION (WITH AUTO ROTATING RING) */}
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
                </ul>
              </div>
              <div>
                <svg width="100%" height="90" viewBox="0 0 100 100" style={{ display: 'block', margin: '0 auto' }}>
                  <g className="rotate-slide-cw" style={{ transformOrigin: '50px 50px' }}>
                    <circle cx="50" cy="50" r="42" fill="none" stroke="var(--neon-cyan)" strokeWidth="1" strokeDasharray="5 2" />
                  </g>
                  <rect x="35" y="15" width="30" height="12" rx="2" fill="#120c24" stroke="var(--neon-cyan)" strokeWidth="1" />
                  <text x="50" y="23" textAnchor="middle" fill="var(--neon-cyan)" fontSize="5" fontWeight="bold">KEK (Master)</text>
                  <rect x="35" y="44" width="30" height="12" rx="2" fill="#120c24" stroke="var(--neon-gold)" strokeWidth="1" />
                  <text x="50" y="52" text-anchor="middle" fill="var(--neon-gold)" fontSize="5" fontWeight="bold">DEK (Local)</text>
                  <rect x="30" y="72" width="40" height="12" rx="2" fill="#120c24" stroke="var(--neon-green)" strokeWidth="1" />
                  <text x="50" y="80" text-anchor="middle" fill="var(--neon-green)" fontSize="5" fontWeight="bold">Payload Block</text>
                  <path d="M 50 27 L 50 43" stroke="var(--neon-cyan)" strokeWidth="1" strokeDasharray="2 2" />
                  <path d="M 50 56 L 50 71" stroke="var(--neon-gold)" strokeWidth="1" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 9: AI COILOT SCANNER (WITH ROTATING NEURAL NODE MAP) */}
        {currentSlide === 9 && (
          <div>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--neon-purple)' }}>// SUB-SYSTEM VII: AI AUDITING</span>
            <h2 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', margin: '0.25rem 0 1rem 0' }}>AI Security Copilot & Heuristics</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '1.5rem' }}>
              <div>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--neon-purple)', fontWeight: 'bold' }}>Gemini Audit Connector</span>: Passes active policy parameters to Gemini models to generate code recommendation reviews.
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--neon-purple)', fontWeight: 'bold' }}>Local Heuristics Engine</span>: Checks for security vulnerabilities (e.g. wildcard permissions, missing quarantines).
                  </li>
                </ul>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {/* Rotating Neural network connection map */}
                <svg width="180" height="100" viewBox="0 0 120 70" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                  <circle cx="60" cy="35" r="25" fill="none" stroke="rgba(168, 85, 247, 0.15)" strokeWidth="0.75" />
                  <circle cx="60" cy="35" r="15" fill="none" stroke="rgba(168, 85, 247, 0.1)" strokeWidth="0.75" />
                  <circle cx="60" cy="35" r="4" fill="var(--neon-purple)" style={{ filter: 'drop-shadow(0 0 4px rgba(168, 85, 247, 0.8))' }} />
                  
                  {/* Orbiting group */}
                  <g className="rotate-slide-cw" style={{ transformOrigin: '60px 35px' }}>
                    <circle cx="35" cy="20" r="3" fill="var(--neon-cyan)" />
                    <circle cx="85" cy="20" r="3" fill="var(--neon-cyan)" />
                    <circle cx="35" cy="50" r="3" fill="var(--neon-green)" />
                    <circle cx="85" cy="50" r="3" fill="var(--neon-red)" />
                    <line x1="60" y1="35" x2="35" y2="20" stroke="var(--neon-purple)" strokeWidth="0.5" strokeOpacity="0.6" />
                    <line x1="60" y1="35" x2="85" y2="20" stroke="var(--neon-purple)" strokeWidth="0.5" strokeOpacity="0.6" />
                    <line x1="60" y1="35" x2="35" y2="50" stroke="var(--neon-purple)" strokeWidth="0.5" strokeOpacity="0.6" />
                    <line x1="60" y1="35" x2="85" y2="50" stroke="var(--neon-purple)" strokeWidth="0.5" strokeOpacity="0.6" />
                  </g>
                </svg>
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
                THANK YOU FOR YOUR MENTORSHIP & SUPPORT
              </span>
            </div>
          </div>
        )}

        {/* Navigation Dots and Slide Numbers */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '1rem' }}>
          {/* Navigation Controls */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button className="cyber-btn" onClick={handlePrev} style={{ padding: '0.4rem 0.8rem', gap: '0.25rem' }}>
              <ChevronLeft style={{ width: '16px', height: '16px' }} /> Prev
            </button>
            <button className="cyber-btn" onClick={handleNext} style={{ padding: '0.4rem 0.8rem', gap: '0.25rem' }}>
              Next <ChevronRight style={{ width: '16px', height: '16px' }} />
            </button>
            <button 
              className={`cyber-btn ${autoRotate ? 'btn-green' : ''}`}
              onClick={() => setAutoRotate(!autoRotate)}
              style={{ padding: '0.4rem 0.8rem', gap: '0.35rem', marginLeft: '0.5rem' }}
            >
              {autoRotate ? (
                <>
                  <Pause style={{ width: '12px', height: '12px', fill: 'currentColor' }} /> Pause Rotation
                </>
              ) : (
                <>
                  <Play style={{ width: '12px', height: '12px', fill: 'currentColor' }} /> Auto-Rotate
                </>
              )}
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
