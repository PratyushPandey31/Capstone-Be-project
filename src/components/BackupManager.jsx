import React, { useState } from 'react';
import { Calendar, Clock, Database, Play, CheckCircle2, Trash2, ArrowRight, ShieldAlert, Cpu, Percent } from 'lucide-react';

export default function BackupManager({ addLog }) {
  const [jobs, setJobs] = useState([
    { id: 'job-1', name: 'Database Hourly Snapshots', frequency: 'Hourly (0 * * * *)', target: 'Database-Secure-02', encryption: 'AES-256-GCM', retention: 'Last 24 versions', status: 'active' },
    { id: 'job-2', name: 'Web Server Configs & Assets', frequency: 'Daily (0 2 * * *)', target: 'Web-Server-01', encryption: 'AES-256-GCM', retention: 'Last 7 versions', status: 'active' }
  ]);

  const [history, setHistory] = useState([
    { id: 'hist-1', name: 'Web Server Configs & Assets', timestamp: '2026-07-16 21:00:15', size: '22.4 MB', dedupSize: '7.8 MB', ratio: '65%', hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', status: 'SUCCESS' },
    { id: 'hist-2', name: 'Database Hourly Snapshots', timestamp: '2026-07-16 22:00:00', size: '105.8 MB', dedupSize: '41.2 MB', ratio: '61%', hash: '8f43aa029f6b92f3d179612c222ff411a3b8364ca98263ca09214ca9826312a0', status: 'SUCCESS' }
  ]);

  // Form State
  const [jobName, setJobName] = useState('');
  const [frequency, setFrequency] = useState('Hourly');
  const [customCron, setCustomCron] = useState('*/30 * * * *');
  const [target, setTarget] = useState('Web-Server-01');
  const [encryption, setEncryption] = useState('AES-256-GCM');
  
  // Backup Runner state
  const [isRunning, setIsRunning] = useState(false);
  const [runProgress, setRunProgress] = useState(0);
  const [runDetails, setRunDetails] = useState('');
  const [runStats, setRunStats] = useState(null);

  // Trigger manual backup simulation
  const handleTriggerBackup = async (job) => {
    setIsRunning(true);
    setRunProgress(0);
    setRunStats(null);
    addLog(`Scheduler: Initiating manual backup job '${job.name}'...`, 'info');

    try {
      // Chunking simulation
      setRunDetails('Scanning filesystem and partitioning blocks into chunks...');
      for (let p = 0; p <= 25; p += 5) {
        setRunProgress(p);
        await new Promise(r => setTimeout(r, 250));
      }

      // Deduplication check
      setRunDetails('Comparing SHA-256 block hashes against cloud vault storage...');
      for (let p = 25; p <= 50; p += 5) {
        setRunProgress(p);
        await new Promise(r => setTimeout(r, 250));
      }

      // Encryption
      setRunDetails('Applying GCM padding and scrambling blocks with derived session keys...');
      for (let p = 50; p <= 85; p += 5) {
        setRunProgress(p);
        await new Promise(r => setTimeout(r, 250));
      }

      // Finalizing Upload
      setRunDetails('Streaming payload metadata and generating audit ledger receipts...');
      for (let p = 85; p <= 100; p += 5) {
        setRunProgress(p);
        await new Promise(r => setTimeout(r, 200));
      }

      const rawBytes = Math.floor(Math.random() * 60) + 10; // MBs
      const dedupRatio = 40 + Math.floor(Math.random() * 30); // % savings
      const dedupBytes = ((rawBytes * (100 - dedupRatio)) / 100).toFixed(1);
      
      const newHistoryItem = {
        id: `hist-${Date.now()}`,
        name: job.name,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        size: `${rawBytes.toFixed(1)} MB`,
        dedupSize: `${dedupBytes} MB`,
        ratio: `${dedupRatio}%`,
        hash: Array.from(window.crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join(''),
        status: 'SUCCESS'
      };

      setRunStats({
        name: job.name,
        originalSize: newHistoryItem.size,
        encryptedSize: newHistoryItem.dedupSize,
        savings: newHistoryItem.ratio,
        hash: newHistoryItem.hash
      });

      setHistory(prev => [newHistoryItem, ...prev]);
      addLog(`Backup success: Vault receipt registered for '${job.name}'. Integrity hash: ${newHistoryItem.hash.substring(0, 12)}`, 'success');
    } catch (e) {
      addLog(`Backup failed: ${e.message}`, 'error');
    } finally {
      setIsRunning(false);
    }
  };

  // Handle Add Job
  const handleAddJob = (e) => {
    e.preventDefault();
    if (!jobName) return;

    const freqText = frequency === 'Custom Cron' ? `Cron (${customCron})` : frequency;
    const newJob = {
      id: `job-${Date.now()}`,
      name: jobName,
      frequency: freqText,
      target: target,
      encryption: encryption,
      retention: 'Last 30 versions',
      status: 'active'
    };

    setJobs(prev => [...prev, newJob]);
    setJobName('');
    addLog(`Policy manager: Added automated backup schedule policy for '${jobName}'`, 'success');
  };

  // Delete Job
  const handleDeleteJob = (id, name) => {
    setJobs(prev => prev.filter(j => j.id !== id));
    addLog(`Policy manager: Deleted backup job '${name}'`, 'info');
  };

  // Delete History
  const handleDeleteHistory = (id) => {
    setHistory(prev => prev.filter(h => h.id !== id));
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '2rem' }}>
      
      {/* Scheduler Dashboard & Backup Policies */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Active Policies */}
        <div className="glass-panel">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
            <Calendar className="status-dot cyan" style={{ width: '20px', height: '20px', background: 'none', boxShadow: 'none' }} />
            Active Automated Backup Policies
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            {jobs.map(job => (
              <div key={job.id} style={{ border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.85rem', background: 'rgba(0, 240, 255, 0.01)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)' }}>{job.name}</h3>
                  <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem', fontFamily: 'var(--font-mono)' }}>
                    <span>Freq: {job.frequency}</span>
                    <span>Target: {job.target}</span>
                    <span>Encrypt: {job.encryption}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button className="cyber-btn btn-green" style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }} onClick={() => handleTriggerBackup(job)} disabled={isRunning}>
                    <Play style={{ width: '12px', height: '12px' }} /> Run
                  </button>
                  <button className="cyber-btn btn-red" style={{ padding: '0.4rem', fontSize: '0.75rem' }} onClick={() => handleDeleteJob(job.id, job.name)} disabled={isRunning}>
                    <Trash2 style={{ width: '12px', height: '12px' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Create new Policy Form */}
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Create New Automated Policy</h3>
          <form onSubmit={handleAddJob} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>Job Policy Name</label>
              <input type="text" className="cyber-input" style={{ width: '100%', padding: '0.5rem' }} placeholder="e.g. Daily Incremental DB Backup" value={jobName} onChange={(e) => setJobName(e.target.value)} required />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>Backup Target Node</label>
              <select className="cyber-select" style={{ width: '100%', padding: '0.5rem' }} value={target} onChange={(e) => setTarget(e.target.value)}>
                <option value="Web-Server-01">Web-Server-01 (10.0.1.15)</option>
                <option value="Database-Secure-02">Database-Secure-02 (10.0.2.22)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>Encryption Standard</label>
              <select className="cyber-select" style={{ width: '100%', padding: '0.5rem' }} value={encryption} onChange={(e) => setEncryption(e.target.value)}>
                <option value="AES-256-GCM">AES-256-GCM (Recommended)</option>
                <option value="AES-192-GCM">AES-192-GCM</option>
                <option value="ChaCha20-Poly1305">ChaCha20-Poly1305</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>Frequency</label>
              <select className="cyber-select" style={{ width: '100%', padding: '0.5rem' }} value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                <option value="Hourly">Hourly</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Custom Cron">Custom Cron</option>
              </select>
            </div>

            <div>
              {frequency === 'Custom Cron' ? (
                <>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>Cron Expression</label>
                  <input type="text" className="cyber-input" style={{ width: '100%', padding: '0.5rem', fontFamily: 'var(--font-mono)' }} value={customCron} onChange={(e) => setCustomCron(e.target.value)} />
                </>
              ) : (
                <>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>Action</label>
                  <button type="submit" className="cyber-btn" style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', justifyContent: 'center' }}>Save Policy</button>
                </>
              )}
            </div>

            {frequency === 'Custom Cron' && (
              <div style={{ gridColumn: 'span 2' }}>
                <button type="submit" className="cyber-btn" style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', justifyContent: 'center' }}>Save Policy</button>
              </div>
            )}
          </form>
        </div>

      </div>

      {/* Manual Backup Runner and Vault logs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Active manual run panel */}
        <div className="glass-panel" style={{ minHeight: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '0.5rem' }}>
            <Clock className="status-dot cyan" style={{ width: '20px', height: '20px', background: 'none', boxShadow: 'none' }} />
            Backup Engine Processor
          </h2>

          {!isRunning && !runStats ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-muted)', gap: '0.5rem', padding: '1.5rem 0' }}>
              <Database style={{ width: '40px', height: '40px', color: 'rgba(255,255,255,0.05)' }} />
              <div style={{ fontSize: '0.85rem' }}>Backup engine is idle. Click 'Run' next to any policy above to start encrypting and backing up data blocks.</div>
            </div>
          ) : isRunning ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, justifyContent: 'center' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--neon-cyan)', fontWeight: 'bold' }}>{runDetails}</span>
                  <span>{runProgress}%</span>
                </div>
                
                {/* Progress bar */}
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${runProgress}%`, background: 'linear-gradient(90deg, var(--neon-cyan), var(--neon-green))', transition: 'width 0.15s linear', boxShadow: '0 0 10px var(--neon-cyan)' }}></div>
                </div>
              </div>

              {/* Status Ring / Visual chunk blocks */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '4px', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '4px' }}>
                {[...Array(24)].map((_, i) => {
                  let color = 'rgba(255,255,255,0.05)';
                  if (runProgress >= 100) color = 'var(--neon-green)';
                  else if (runProgress > i * 4) {
                    if (runProgress < 50) color = 'var(--neon-cyan)';
                    else color = 'var(--neon-green)';
                  }
                  return (
                    <div key={i} style={{ height: '10px', background: color, borderRadius: '2px', transition: 'background-color 0.2s ease', border: '1px solid rgba(255,255,255,0.02)' }}></div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.5rem 0' }}>
              <div style={{ color: 'var(--neon-green)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                <CheckCircle2 style={{ width: '18px', height: '18px' }} /> Backup Vault Snapshot Created
              </div>
              <div style={{ fontSize: '0.8rem', background: 'rgba(57, 255, 20, 0.03)', border: '1px solid rgba(57, 255, 20, 0.1)', padding: '0.75rem', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Policy Executed:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{runStats.name}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Raw Directory Size:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{runStats.originalSize}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Deduplicated Cloud Payload:</span>
                  <strong style={{ color: 'var(--neon-green)' }}>{runStats.encryptedSize}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Compression & Dedup Savings:</span>
                  <span className="cyber-badge green"><Percent style={{ width: '10px', height: '10px' }} /> {runStats.savings} saved</span>
                </div>
                <div>
                  <span style={{ display: 'block', marginBottom: '2px' }}>Snapshot Receipt SHA-256:</span>
                  <div className="key-value-label">{runStats.hash}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* History Archives list */}
        <div className="glass-panel" style={{ flex: 1 }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
            <Database className="status-dot cyan" style={{ width: '20px', height: '20px', background: 'none', boxShadow: 'none' }} />
            Cloud Storage Vault Archives
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '0.25rem' }}>
            {history.map(item => (
              <div key={item.id} style={{ border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', padding: '0.75rem', background: 'rgba(0,0,0,0.15)', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>{item.name}</strong>
                  <span style={{ color: 'var(--neon-green)', fontWeight: 'bold' }}>{item.status}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', marginBottom: '0.25rem' }}>
                  <span>{item.timestamp}</span>
                  <span>Size: {item.size} (Dedup: {item.dedupSize})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="key-value-label" style={{ fontSize: '0.7rem', padding: '0.15rem 0.3rem', maxWidth: '75%', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {item.hash}
                  </div>
                  <button className="cyber-btn btn-red" style={{ padding: '0.25rem', fontSize: '0.7rem' }} onClick={() => handleDeleteHistory(item.id)}>
                    <Trash2 style={{ width: '10px', height: '10px' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
