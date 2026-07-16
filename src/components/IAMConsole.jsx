import React, { useState, useEffect } from 'react';
import { Shield, Key, Eye, EyeOff, Plus, Ban, CheckCircle2, ShieldAlert, Terminal, Copy, RefreshCw } from 'lucide-react';

const PRESETS = {
  Admin: {
    name: 'Administrator',
    permissions: ['s3:CreateBucket', 's3:PutObject', 's3:GetObject', 's3:DeleteObject', 'kms:Encrypt', 'kms:Decrypt', 'kms:GenerateKey', 'iam:CreateUser', 'iam:PutUserPolicy', 'ec2:StartInstances', 'ec2:StopInstances'],
    description: 'Full administrative access to all cloud resources, encryption keys, and identity management policies.'
  },
  BackupOperator: {
    name: 'Backup Operator',
    permissions: ['s3:PutObject', 's3:GetObject', 'kms:Encrypt', 'kms:GenerateKey', 'ec2:StartInstances'],
    description: 'Write snapshots to secure buckets and encrypt data. Restrictive delete and administrative rights.'
  },
  Auditor: {
    name: 'Security Auditor',
    permissions: ['s3:GetObject', 'kms:Decrypt'],
    description: 'Read-only compliance checks. Audits encrypted contents. WARNING: Should not possess modification rights.'
  },
  Guest: {
    name: 'Guest / Viewer',
    permissions: ['s3:GetObject'],
    description: 'Minimal read access to public static assets only.'
  }
};

const ALL_PERMISSIONS = [
  { action: 's3:CreateBucket', service: 'Storage (S3)', desc: 'Create new backup cloud vaults' },
  { action: 's3:PutObject', service: 'Storage (S3)', desc: 'Upload file chunks to vaults' },
  { action: 's3:GetObject', service: 'Storage (S3)', desc: 'Retrieve file chunks for restore' },
  { action: 's3:DeleteObject', service: 'Storage (S3)', desc: 'Permanently purge backups' },
  { action: 'kms:Encrypt', service: 'Key Management (KMS)', desc: 'Encrypt files with vault keys' },
  { action: 'kms:Decrypt', service: 'Key Management (KMS)', desc: 'Decrypt vault files' },
  { action: 'kms:GenerateKey', service: 'Key Management (KMS)', desc: 'Generate master key pairs' },
  { action: 'iam:CreateUser', service: 'Identity Access (IAM)', desc: 'Create new API credentials' },
  { action: 'iam:PutUserPolicy', service: 'Identity Access (IAM)', desc: 'Attach json policies to users' },
  { action: 'ec2:StartInstances', service: 'Compute (EC2)', desc: 'Spin up virtualization nodes' },
  { action: 'ec2:StopInstances', service: 'Compute (EC2)', desc: 'Power down virtualization nodes' },
];

export default function IAMConsole({ addLog }) {
  const [selectedRole, setSelectedRole] = useState('BackupOperator');
  const [customPerms, setCustomPerms] = useState([...PRESETS.BackupOperator.permissions]);
  const [policyJson, setPolicyJson] = useState('');
  
  // Credentials simulator
  const [credentials, setCredentials] = useState([
    { accessKey: 'AKIAUX27B1C88910AB1F', secretKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYzEXAMPLEKEY', role: 'BackupOperator', status: 'Active', created: '2026-07-16 20:30:10', showSecret: false },
    { accessKey: 'AKIAUX55F8A123049F8C', secretKey: '8d2aF919xHj20La9M18zPq01Bxl0A9EXAMPLEKEY', role: 'Admin', status: 'Active', created: '2026-07-16 21:10:00', showSecret: false }
  ]);

  // KMS Master Key Rotation states
  const [kmsKeyId, setKmsKeyId] = useState('mrk-a8f9-231a-bc01-9f20e4b85');
  const [rotateCount, setRotateCount] = useState(1);
  const [isRotating, setIsRotating] = useState(false);

  const triggerKmsRotation = async () => {
    setIsRotating(true);
    addLog(`KMS Engine: Triggering manual rotation of Multi-Region Key (MRK) ${kmsKeyId.substring(0, 10)}...`, 'warning');
    await new Promise(r => setTimeout(r, 1500));
    const randomHex = Array.from(window.crypto.getRandomValues(new Uint8Array(8))).map(b => b.toString(16).padStart(2, '0')).join('');
    const newKeyId = `mrk-${randomHex.substring(0,4)}-${randomHex.substring(4,8)}-bc01-9f20e4b85`;
    setKmsKeyId(newKeyId);
    setRotateCount(c => c + 1);
    setIsRotating(false);
    addLog(`KMS Engine: Master Key Rotated successfully. New ARN: arn:aws:kms:us-east-1:123456789012:key/${newKeyId}`, 'success');
    addLog(`Envelope Encryption: Re-encrypting Data Encryption Keys (DEKs) with new Master Key.`, 'info');
  };

  // Sync preset to custom permissions
  const handleRolePresetChange = (role) => {
    setSelectedRole(role);
    setCustomPerms([...PRESETS[role].permissions]);
    addLog(`IAM Policy: Loaded preset permissions for role '${PRESETS[role].name}'`, 'info');
  };

  // Toggle single permission
  const togglePermission = (action) => {
    setCustomPerms(prev => {
      let updated;
      if (prev.includes(action)) {
        updated = prev.filter(p => p !== action);
        addLog(`IAM Policy: Removed action ${action} from custom configuration`, 'info');
      } else {
        updated = [...prev, action];
        addLog(`IAM Policy: Appended action ${action} to custom configuration`, 'info');
      }
      return updated;
    });
    setSelectedRole('Custom');
  };

  // Compile JSON policy
  useEffect(() => {
    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Sid: "VisualizedCloudBackupPolicy",
          Effect: "Allow",
          Action: customPerms,
          Resource: [
            "arn:aws:s3:::secure-cloud-backup-vault/*",
            "arn:aws:kms:us-east-1:123456789012:key/*"
          ]
        }
      ]
    };
    
    // Add custom deny rule if delete is missing
    if (!customPerms.includes('s3:DeleteObject')) {
      policy.Statement.push({
        Sid: "EnforceWORMProtection",
        Effect: "Deny",
        Action: ["s3:DeleteObject"],
        Resource: "arn:aws:s3:::secure-cloud-backup-vault/*"
      });
    }

    setPolicyJson(JSON.stringify(policy, null, 2));
  }, [customPerms]);

  // Generate Access Key Pair
  const generateKeys = () => {
    const randomHex = (len) => Array.from(window.crypto.getRandomValues(new Uint8Array(len))).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    const accessKey = `AKIAUX${randomHex(6)}`;
    const secretKey = Array.from(window.crypto.getRandomValues(new Uint8Array(20))).map(b => b.toString(36)).join('').substring(0, 40);
    
    const newCred = {
      accessKey,
      secretKey,
      role: selectedRole === 'Custom' ? 'Custom' : PRESETS[selectedRole].name,
      status: 'Active',
      created: new Date().toISOString().replace('T', ' ').substring(0, 19),
      showSecret: false
    };

    setCredentials(prev => [...prev, newCred]);
    addLog(`IAM Security: Issued new programmatic API access key: ${accessKey}`, 'success');
  };

  // Toggle Secret Key Visibility
  const toggleSecretVisibility = (idx) => {
    setCredentials(prev => prev.map((cred, cIdx) => {
      if (cIdx === idx) {
        return { ...cred, showSecret: !cred.showSecret };
      }
      return cred;
    }));
  };

  // Revoke Key
  const revokeKey = (accessKey) => {
    setCredentials(prev => prev.map(cred => {
      if (cred.accessKey === accessKey) {
        addLog(`IAM Incident Response: REVOKED credentials for AccessKey: ${accessKey}. Access blocked immediately.`, 'error');
        return { ...cred, status: 'Revoked' };
      }
      return cred;
    }));
  };

  // Copy JSON policy helper
  const copyPolicy = () => {
    navigator.clipboard.writeText(policyJson);
    addLog(`System: IAM JSON Policy document copied to clipboard.`, 'success');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }}>
      
      {/* Left Column containing Policy Generator & KMS Key Rotation */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Policy Generator Console */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '0.25rem' }}>
          <Shield className="status-dot cyan" style={{ width: '20px', height: '20px', background: 'none', boxShadow: 'none' }} />
          Identity and Access Management (IAM) Engine
        </h2>

        {/* Roles Presets */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Select Role Template (Predefined Permissions)</label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {Object.keys(PRESETS).map(key => (
              <button 
                key={key} 
                className={`cyber-btn ${selectedRole === key ? 'btn-green' : ''}`}
                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                onClick={() => handleRolePresetChange(key)}
              >
                {PRESETS[key].name}
              </button>
            ))}
            {selectedRole === 'Custom' && (
              <span className="cyber-badge gold" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>Custom Modified Policy</span>
            )}
          </div>
          {selectedRole !== 'Custom' && (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '4px', borderLeft: '3px solid var(--neon-cyan)' }}>
              {PRESETS[selectedRole].description}
            </div>
          )}
        </div>

        {/* Audit Warning */}
        {customPerms.includes('kms:Decrypt') && selectedRole === 'Auditor' && (
          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255, 204, 0, 0.05)', border: '1px solid rgba(255, 204, 0, 0.2)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--neon-gold)' }}>
            <ShieldAlert style={{ width: '18px', height: '18px', flexShrink: 0 }} />
            <div>
              <strong>Compliance Alert:</strong> Role 'Auditor' contains <code>kms:Decrypt</code> permissions. Standard read-only audits do not require plaintext decryption keys. Verify least privilege principles.
            </div>
          </div>
        )}

        {/* Permissions Checklist Matrix */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}> Granular Policy Matrix (Select Actions to Authorize)</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', maxHeight: '220px', overflowY: 'auto', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.03)' }}>
            {ALL_PERMISSIONS.map(item => {
              const isChecked = customPerms.includes(item.action);
              return (
                <label key={item.action} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer', padding: '0.25rem', borderRadius: '4px', transition: 'background var(--transition-fast)' }} className="permission-item-hover">
                  <input 
                    type="checkbox" 
                    checked={isChecked}
                    onChange={() => togglePermission(item.action)}
                    style={{ accentColor: 'var(--neon-cyan)' }}
                  />
                  <div>
                    <code style={{ color: isChecked ? 'var(--neon-green)' : 'var(--text-muted)' }}>{item.action}</code>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{item.desc}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

      </div>

      {/* KMS Key Management & Envelope Encryption */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', overflow: 'hidden' }}>
          {isRotating && <div className="laser-scanner"></div>}
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '0.25rem' }}>
            <RefreshCw className={`status-dot cyan ${isRotating ? 'rotate-cw' : ''}`} style={{ width: '16px', height: '16px', background: 'none', boxShadow: 'none' }} />
            KMS Key Management & Envelope Encryption (Key Rotation)
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem', alignItems: 'center' }}>
            
            {/* Left side details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Active KMS Master Key (KEK):</span>
                <div className="key-value-label" style={{ marginTop: '2px', color: 'var(--neon-gold)', fontSize: '0.75rem' }}>
                  arn:aws:kms:us-east-1:1234:key/{kmsKeyId}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>KEY STATUS: <span className="cyber-badge green">ENABLED</span></div>
                <div>ROTATIONS: <span className="cyber-badge cyan">{rotateCount} times</span></div>
              </div>

              <button 
                type="button" 
                className="cyber-btn btn-gold" 
                style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', justifyContent: 'center' }} 
                onClick={triggerKmsRotation} 
                disabled={isRotating}
              >
                <RefreshCw style={{ width: '14px', height: '14px', animation: isRotating ? 'spin 1s linear infinite' : 'none' }} /> Rotate Key Ring (KEK)
              </button>
            </div>

            {/* Right side Envelope Encryption visual diagram */}
            <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.5rem', textAlign: 'center', position: 'relative', height: '130px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block', fontFamily: 'var(--font-mono)' }}>Envelope Wrapping</span>
              
              <svg width="80" height="80" viewBox="0 0 100 100" style={{ display: 'block', margin: '0 auto' }}>
                {/* Rotating KEK Ring */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--neon-cyan)" strokeWidth="1.5" strokeDasharray="10 5" className="rotate-cw" style={{ animationDuration: isRotating ? '1s' : '15s' }} />
                {/* Dotted KEK protection */}
                <circle cx="50" cy="50" r="30" fill="none" stroke="var(--neon-gold)" strokeWidth="1" strokeDasharray="4 4" className="rotate-ccw" />
                
                {/* KEK Key center (Master Key) */}
                <rect x="42" y="15" width="16" height="12" rx="2" fill="#120c24" stroke="var(--neon-cyan)" strokeWidth="1.5" />
                <text x="50" y="23" textAnchor="middle" fill="var(--neon-cyan)" fontSize="6" fontFamily="var(--font-mono)" fontWeight="bold">KEK</text>
                
                {/* Inner Data Key (DEK) */}
                <rect x="42" y="44" width="16" height="12" rx="2" fill="#120c24" stroke="var(--neon-gold)" strokeWidth="1.5" />
                <text x="50" y="52" textAnchor="middle" fill="var(--neon-gold)" fontSize="6" fontFamily="var(--font-mono)" fontWeight="bold">DEK</text>

                {/* Arrow KEK wraps DEK */}
                <path d="M 50 27 L 50 43" stroke="var(--neon-cyan)" strokeWidth="1.5" fill="none" strokeDasharray="2 2" />

                {/* Cloud storage block at bottom */}
                <rect x="35" y="70" width="30" height="12" rx="2" fill="#120c24" stroke="var(--neon-green)" strokeWidth="1.5" />
                <text x="50" y="78" textAnchor="middle" fill="var(--neon-green)" fontSize="6" fontFamily="var(--font-mono)" fontWeight="bold">PAYLOAD</text>

                {/* Arrow DEK encrypts data payload */}
                <path d="M 50 56 L 50 69" stroke="var(--neon-gold)" strokeWidth="1.5" fill="none" />
              </svg>
            </div>

          </div>
        </div>

      </div>

      {/* JSON Policy Visualizer & Credentials Console */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* JSON Display */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '240px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', textTransform: 'uppercase' }}>
              <Terminal style={{ width: '14px', height: '14px' }} /> Compiled IAM JSON Policy
            </h3>
            <button className="cyber-btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }} onClick={copyPolicy}>
              <Copy style={{ width: '12px', height: '12px' }} /> Copy JSON
            </button>
          </div>
          <pre style={{ flex: 1, overflow: 'auto', background: '#020408', padding: '0.75rem', borderRadius: '4px', border: '1px solid #1a243a', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--neon-cyan)' }}>
            {policyJson}
          </pre>
        </div>

        {/* Credentials manager */}
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', textTransform: 'uppercase' }}>
              <Key style={{ width: '14px', height: '14px' }} /> Programmatic Access Keys
            </h3>
            <button className="cyber-btn btn-green" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={generateKeys}>
              <Plus style={{ width: '12px', height: '12px' }} /> Issue Key
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '180px', overflowY: 'auto' }}>
            {credentials.map((cred, idx) => (
              <div key={cred.accessKey} style={{ border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', padding: '0.6rem', background: 'rgba(0,0,0,0.15)', fontSize: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Role: {cred.role}</span>
                  <span className={`cyber-badge ${cred.status === 'Active' ? 'green' : 'red'}`} style={{ fontSize: '0.65rem' }}>{cred.status}</span>
                </div>
                
                <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '0.35rem' }}>
                  <div>ID: <span style={{ color: 'var(--neon-cyan)' }}>{cred.accessKey}</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>Secret: </span>
                    <span style={{ color: 'var(--neon-gold)', flex: 1 }}>{cred.showSecret ? cred.secretKey : '••••••••••••••••••••••••••••••••'}</span>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => toggleSecretVisibility(idx)}>
                      {cred.showSecret ? <EyeOff style={{ width: '12px', height: '12px' }} /> : <Eye style={{ width: '12px', height: '12px' }} />}
                    </button>
                  </div>
                </div>

                {cred.status === 'Active' && (
                  <button className="cyber-btn btn-red" style={{ padding: '0.2rem 0.4rem', fontSize: '0.65rem', width: '100%', justifyContent: 'center' }} onClick={() => revokeKey(cred.accessKey)}>
                    <Ban style={{ width: '10px', height: '10px' }} /> Revoke Access Key
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
