import React, { useState, useEffect } from 'react';
import { Sparkles, Key, Cpu, AlertTriangle, CheckCircle2, RefreshCw, ShieldCheck, Terminal, HelpCircle } from 'lucide-react';

export default function AICopilot({ addLog, activeVmList, activeIamPermissions, lockdownActive }) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('vcs_gemini_api_key') || '');
  const [saveKey, setSaveKey] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState(null);
  const [isRealApi, setIsRealApi] = useState(false);

  // Save key helper
  const handleSaveKey = (val) => {
    setApiKey(val);
    localStorage.setItem('vcs_gemini_api_key', val);
  };

  // Run the AI Audit
  const handleRunAudit = async () => {
    setIsAuditing(true);
    setAuditResult(null);
    addLog(`AI Copilot: Compiling system state and dispatching audit request...`, 'info');

    const prompt = `Perform a Cloud Security Audit on the following system configuration and provide 3 actionable, professional recommendations:
    
    1. Active IAM Permissions: ${JSON.stringify(activeIamPermissions)}
    2. Virtual Machines: ${JSON.stringify(activeVmList.map(v => ({ name: v.name, status: v.status, isolation: v.isolation, sandboxed: v.sandboxed })))}
    3. Global Lockdown Switch: ${lockdownActive ? 'ACTIVE / ISOLATED' : 'INACTIVE / NORMAL ROUTING'}
    
    Format the response with:
    - **System Rating** (e.g., 85/100)
    - **Vulnerabilities Found** (bulleted)
    - **Actionable Remediation Steps** (bulleted)`;

    if (apiKey) {
      // Real API Call to Gemini
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }]
            })
          }
        );

        if (!response.ok) {
          throw new Error(`Gemini API Error: Status ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No audit response text returned.';
        
        setIsRealApi(true);
        setAuditResult(text);
        addLog(`AI Copilot: Received live Gemini security suggestions successfully.`, 'success');
      } catch (err) {
        console.error(err);
        addLog(`AI Copilot: Real API call failed (${err.message}). Falling back to local heuristic scan.`, 'warning');
        runLocalHeuristics();
      } finally {
        setIsAuditing(false);
      }
    } else {
      // Local Heuristic Fallback
      await new Promise(r => setTimeout(r, 2000));
      runLocalHeuristics();
      setIsAuditing(false);
    }
  };

  // Heuristic engine to simulate AI audit locally
  const runLocalHeuristics = () => {
    setIsRealApi(false);
    
    let rating = 98;
    const vulnerabilities = [];
    const recommendations = [];

    // Analyze IAM permissions
    if (activeIamPermissions.includes('iam:PutUserPolicy') || activeIamPermissions.includes('iam:CreateUser')) {
      rating -= 15;
      vulnerabilities.push("Privilege Escalation Risk: The active credentials possess administrative IAM modification capabilities (`iam:PutUserPolicy`). A compromised key could alter policy boundaries.");
      recommendations.push("Implement strict MFA boundary restrictions on all API operations targeting `iam:*` actions, and migrate control to single-sign-on (SSO) roles.");
    }

    if (activeIamPermissions.includes('s3:DeleteObject')) {
      rating -= 10;
      vulnerabilities.push("Data Loss Threat: The active IAM policy allows explicit object deletion (`s3:DeleteObject`). This overrides WORM (Write Once Read Many) immutability bounds.");
      recommendations.push("Create a explicit `Deny` statement for `s3:DeleteObject` inside the backup bucket policy to enforce strict compliance and ransomware defense.");
    }

    if (activeIamPermissions.includes('kms:Decrypt') && !activeIamPermissions.includes('kms:Encrypt')) {
      rating -= 5;
      vulnerabilities.push("Least Privilege Violation: Credentials hold decrypt permissions without corresponding encrypt rights. Unusual profile configuration.");
      recommendations.push("Audit credential scopes and ensure only specific service principals hold decrypt capabilities.");
    }

    // Analyze VM sandbox state
    const runningVms = activeVmList.filter(v => v.status === 'running');
    const unsandboxedRunning = runningVms.filter(v => !v.sandboxed);
    
    if (unsandboxedRunning.length > 0) {
      vulnerabilities.push(`Exposed Compute Boundaries: ${unsandboxedRunning.length} virtual machines are running with active network VPC routing without sandboxing isolation.`);
      recommendations.push("Ensure Sandbox mode is activated on nodes performing file analysis to prevent potential malware egress into adjacent virtual subnets.");
    }

    if (lockdownActive) {
      rating = 100;
      vulnerabilities.push("None: Emergency Lockdown engaged. Subnets isolated.");
      recommendations.push("Emergency state is active. Key replication is halted. Re-verify access control keys before re-establishing normal routing paths.");
    }

    if (vulnerabilities.length === 0) {
      vulnerabilities.push("No immediate high-severity vectors found in active configuration profile.");
      recommendations.push("Maintain standard key rotation cycles and periodic port knock check-ups.");
    }

    // Format local output
    const localReport = `### System Security Rating: **${rating}/100**

#### Identified Vulnerability Vectors:
${vulnerabilities.map(v => `- ⚠️ ${v}`).join('\n')}

#### Recommended Remediation Steps:
${recommendations.map(r => `- 🛡️ ${r}`).join('\n')}

---
*Note: This report was generated using the local security heuristics scanning engine. Enter a Gemini API Key to fetch dynamic, model-driven security advice.*`;

    setAuditResult(localReport);
    addLog(`AI Copilot: Completed local security heuristic check-up. Rating: ${rating}/100`, 'success');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
      
      <div className="glass-panel" style={{ position: 'relative', overflow: 'hidden' }}>
        {isAuditing && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(11, 7, 30, 0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
            <svg width="120" height="120" viewBox="0 0 100 100">
              <defs>
                <radialGradient id="radarSweep" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="var(--neon-cyan)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="var(--neon-cyan)" stopOpacity="0.0" />
                </radialGradient>
              </defs>
              
              {/* Concentric radar rings */}
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(103, 232, 249, 0.15)" strokeWidth="1" />
              <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(103, 232, 249, 0.1)" strokeWidth="1" />
              <circle cx="50" cy="50" r="15" fill="none" stroke="rgba(103, 232, 249, 0.05)" strokeWidth="1" />
              
              {/* Sweep angle */}
              <path d="M 50 50 L 50 5 A 45 45 0 0 1 95 50 Z" fill="url(#radarSweep)" className="rotate-cw" style={{ transformOrigin: '50px 50px', animationDuration: '2s' }} />
              
              {/* Pulse dot */}
              <circle cx="50" cy="50" r="3" fill="var(--neon-cyan)" style={{ filter: 'drop-shadow(0 0 4px var(--neon-cyan))' }} />
            </svg>
            <div style={{ marginTop: '1.25rem', color: 'var(--neon-cyan)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.15em' }} className="blink">
              SCANNING COMPLIANCE VECTORS...
            </div>
          </div>
        )}

        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
          <Sparkles className="status-dot cyan" style={{ width: '20px', height: '20px', background: 'none', boxShadow: 'none' }} />
          AI Security Copilot & Audit Advisor
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '2rem' }}>
          
          {/* Controls & API Key Setup */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              The AI Security Copilot scans your active IAM JSON policy configurations, VM virtualization parameters, and network statuses to formulate compliance suggestions.
            </p>

            {/* API Key inputs */}
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 'bold' }}>
                  <Key style={{ width: '12px', height: '12px', color: 'var(--neon-gold)' }} /> Gemini API Authentication
                </span>
                <span className="cyber-badge gold" style={{ fontSize: '0.65rem' }}>Optional</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input 
                  type="password" 
                  className="cyber-input" 
                  style={{ width: '100%', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }} 
                  placeholder="Paste your Gemini API Key..."
                  value={apiKey}
                  onChange={(e) => handleSaveKey(e.target.value)}
                />
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                  <HelpCircle style={{ width: '12px', height: '12px' }} />
                  <span>Stored locally in your browser. Leaving it blank defaults to the local heuristic scanner.</span>
                </div>
              </div>
            </div>

            {/* Run button */}
            <button 
              className="cyber-btn btn-green" 
              style={{ width: '100%', justifyContent: 'center' }} 
              onClick={handleRunAudit}
              disabled={isAuditing}
            >
              {isAuditing ? (
                <>
                  <RefreshCw style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> Processing Security Audits...
                </>
              ) : (
                <>
                  <Cpu style={{ width: '16px', height: '16px' }} /> Run AI Security Audit
                </>
              )}
            </button>

            {/* System Context Data Collected */}
            <div style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem' }}>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>Context Data Transmitted</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                <div>• IAM permissions monitored: <span style={{ color: 'var(--neon-green)' }}>{activeIamPermissions.length} actions</span></div>
                <div>• Virtual nodes active: <span style={{ color: 'var(--neon-green)' }}>{activeVmList.filter(v => v.status === 'running').length} nodes</span></div>
                <div>• Network Quarantine status: <span style={{ color: lockdownActive ? 'var(--neon-red)' : 'var(--neon-green)' }}>{lockdownActive ? 'ACTIVE ISOLATION' : 'CONNECTED'}</span></div>
              </div>
            </div>
          </div>

          {/* Audit Results Terminal */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Terminal style={{ width: '12px', height: '12px' }} /> AI Advisor Report Output
            </span>
            
            <div style={{ flex: 1, minHeight: '260px', background: '#020408', border: '1px solid #1a243a', borderRadius: '8px', padding: '1.25rem', fontFamily: 'var(--font-sans)', fontSize: '0.85rem', overflowY: 'auto', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              {!auditResult ? (
                <div style={{ color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '0.5rem', textAlign: 'center' }}>
                  <ShieldCheck style={{ width: '36px', height: '36px', color: 'rgba(255,255,255,0.05)' }} />
                  <div>Audit report queue is empty. Click 'Run AI Security Audit' to generate recommendations.</div>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontWeight: 'bold', color: 'var(--neon-cyan)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Sparkles style={{ width: '14px', height: '14px' }} /> Security Posture Report
                    </span>
                    <span className={`cyber-badge ${isRealApi ? 'green' : 'cyan'}`}>
                      {isRealApi ? 'Gemini AI Model' : 'Local Heuristic Scanner'}
                    </span>
                  </div>
                  
                  {/* Render markdown style line by line */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {auditResult.split('\n').map((line, idx) => {
                      if (line.startsWith('###')) {
                        return <h3 key={idx} style={{ color: 'var(--text-primary)', marginTop: '0.5rem', fontSize: '1.05rem', fontWeight: 'bold' }}>{line.replace('###', '').trim()}</h3>;
                      }
                      if (line.startsWith('####')) {
                        return <h4 key={idx} style={{ color: 'var(--neon-cyan)', marginTop: '0.4rem', fontSize: '0.9rem', fontWeight: 'bold' }}>{line.replace('####', '').trim()}</h4>;
                      }
                      if (line.startsWith('-')) {
                        return <div key={idx} style={{ paddingLeft: '1rem', position: 'relative' }}>
                          <span style={{ position: 'absolute', left: 0, color: 'var(--neon-cyan)' }}>•</span>
                          {line.replace('-', '').trim()}
                        </div>;
                      }
                      if (line.trim() === '---') {
                        return <hr key={idx} style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '0.5rem 0' }} />;
                      }
                      return <p key={idx} style={{ margin: 0 }}>{line}</p>;
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
