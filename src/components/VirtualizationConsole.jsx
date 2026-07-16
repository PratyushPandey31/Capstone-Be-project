import React, { useState, useEffect } from 'react';
import { Server, Shield, Activity, Radio, AlertOctagon, Terminal, Play, Square, WifiOff, HardDrive, RefreshCw } from 'lucide-react';

export default function VirtualizationConsole({ addLog, vms, setVms }) {

  const [activeAttack, setActiveAttack] = useState(null); // 'ddos', 'sqli', 'portscan'
  const [firewallStatus, setFirewallStatus] = useState('active'); // 'active', 'blocking', 'ddos-mitigation'
  const [attackLogs, setAttackLogs] = useState([]);
  const [packetCount, setPacketCount] = useState(0);

  // Simulate VM CPU and RAM fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setVms(prevVms => prevVms.map(vm => {
        if (vm.status !== 'running') {
          return { ...vm, cpuUsage: 0, ramUsage: 0 };
        }
        
        let targetCpu = 5 + Math.floor(Math.random() * 15);
        let targetRam = vm.ramUsage + (Math.random() * 4 - 2);

        if (activeAttack === 'ddos' && vm.id === 'vm-1') {
          // DDoS targets the web server
          targetCpu = firewallStatus === 'ddos-mitigation' ? 25 + Math.floor(Math.random() * 10) : 95 + Math.floor(Math.random() * 5);
        } else if (activeAttack === 'sqli' && vm.id === 'vm-2') {
          // SQLi hits db
          targetCpu = firewallStatus === 'blocking' ? 10 + Math.floor(Math.random() * 10) : 80 + Math.floor(Math.random() * 15);
        }

        // Clamp values
        targetRam = Math.min(Math.max(targetRam, 10), 95);

        return {
          ...vm,
          cpuUsage: Math.min(Math.max(targetCpu, 0), 100),
          ramUsage: Math.round(targetRam)
        };
      }));
      
      // Increment network packets
      if (activeAttack === 'ddos') {
        setPacketCount(p => p + 250);
      } else if (activeAttack === 'sqli' || activeAttack === 'portscan') {
        setPacketCount(p => p + 15);
      } else {
        setPacketCount(p => p + Math.floor(Math.random() * 3) + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeAttack, firewallStatus]);

  // Handle attack simulation lifecycle
  const runAttack = (type) => {
    if (activeAttack) return;
    setActiveAttack(type);
    setPacketCount(0);
    
    const timestamp = new Date().toLocaleTimeString();

    if (type === 'ddos') {
      addLog(`CRITICAL CRASH ALERT: Large scale Distributed Denial of Service (DDoS) packet flood detected! Origin: 192.168.100.x`, 'error');
      setAttackLogs(prev => [`[${timestamp}] [ALERT] DDoS Flood Ingress: 50,000 req/sec hitting Web-Server-01`, ...prev]);
      
      // Mitigation steps
      setTimeout(() => {
        setFirewallStatus('ddos-mitigation');
        const resolveTime = new Date().toLocaleTimeString();
        addLog(`WAF Shield: Activating Cloud DDoS scrubbing & rate-limiting policies at edge proxy.`, 'info');
        setAttackLogs(prev => [
          `[${resolveTime}] [WAF] Rate-Limiting rules applied. Scrubbing 99.8% malicious traffic.`,
          `[${resolveTime}] [FIREWALL] Blacklisted 142 zombie attacker IPs.`,
          ...prev
        ]);
        
        setTimeout(() => {
          setActiveAttack(null);
          setFirewallStatus('active');
          addLog(`Threat mitigation complete. System status returned to normal.`, 'success');
          setAttackLogs(prev => [`[${new Date().toLocaleTimeString()}] [SYSTEM] DDoS attack mitigated. Port 80/443 stabilized.`, ...prev]);
        }, 5000);

      }, 4000);

    } else if (type === 'sqli') {
      addLog(`WARNING: Suspicious database payload pattern detected on Web-Server-01 routing to Database-Secure-02.`, 'error');
      setAttackLogs(prev => [`[${timestamp}] [IDS] SQL Injection Attempt: 'UNION SELECT username, password_hash FROM admin_users--' on URI: /api/v1/auth`, ...prev]);

      setTimeout(() => {
        setFirewallStatus('blocking');
        const resolveTime = new Date().toLocaleTimeString();
        addLog(`WAF block: Intercepted SQL Injection payload. Threat rating: High. Dropping SQL query context.`, 'success');
        setAttackLogs(prev => [
          `[${resolveTime}] [WAF] Blocked connection from IP: 45.89.230.12. SQLi query isolated.`,
          `[${resolveTime}] [IPS] Created custom web application firewall rule for payload matching 'UNION SELECT'.`,
          ...prev
        ]);

        setTimeout(() => {
          setActiveAttack(null);
          setFirewallStatus('active');
          setAttackLogs(prev => [`[${new Date().toLocaleTimeString()}] [SYSTEM] SQL Injection threat completely neutralized.`, ...prev]);
        }, 3000);
      }, 3000);

    } else if (type === 'portscan') {
      addLog(`ALERT: Active port-probing / network scan identified. Attacker scanning ports [21, 22, 23, 80, 443, 3306]`, 'error');
      setAttackLogs(prev => [`[${timestamp}] [FIREWALL] Port Scan Scan Detected: IP 185.220.101.4 scanning subnet 10.0.1.0/24`, ...prev]);

      setTimeout(() => {
        setFirewallStatus('blocking');
        const resolveTime = new Date().toLocaleTimeString();
        addLog(`Firewall mitigation: Active defense. Port knocking failed. Source IP quarantined.`, 'success');
        setAttackLogs(prev => [
          `[${resolveTime}] [IPS] Attacker IP 185.220.101.4 blocked on all protocols.`,
          `[${resolveTime}] [SYS] Disabling unused ports (FTP 21, Telnet 23) globally.`,
          ...prev
        ]);

        setTimeout(() => {
          setActiveAttack(null);
          setFirewallStatus('active');
          setAttackLogs(prev => [`[${new Date().toLocaleTimeString()}] [SYSTEM] Network boundary scan threat mitigated.`, ...prev]);
        }, 3000);
      }, 2500);
    }
  };

  // Toggle VM state
  const toggleVm = (id) => {
    setVms(prev => prev.map(vm => {
      if (vm.id === id) {
        const nextStatus = vm.status === 'running' ? 'stopped' : 'running';
        addLog(`Hypervisor command: State change for ${vm.name} -> ${nextStatus.toUpperCase()}`, 'info');
        return {
          ...vm,
          status: nextStatus,
          cpuUsage: 0,
          ramUsage: 0
        };
      }
      return vm;
    }));
  };

  // Toggle Sandbox Mode
  const toggleSandbox = (id) => {
    setVms(prev => prev.map(vm => {
      if (vm.id === id) {
        const nextSandbox = !vm.sandboxed;
        addLog(`Security Hypervisor: ${vm.name} network isolation set to: ${nextSandbox ? 'FULLY ISOLATED (SANDBOXED)' : 'VPC CONNECTED'}`, nextSandbox ? 'error' : 'success');
        return {
          ...vm,
          sandboxed: nextSandbox
        };
      }
      return vm;
    }));
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }}>
      
      {/* Network Topology Graphic and Control */}
      <div className="glass-panel" style={{ position: 'relative' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
          <Activity className="status-dot cyan" style={{ width: '20px', height: '20px', background: 'none', boxShadow: 'none' }} />
          Secure VPC Topology & Attack Simulator
        </h2>

        {/* Attack Simulator Controls */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <button 
            className="cyber-btn btn-red" 
            disabled={activeAttack !== null}
            onClick={() => runAttack('ddos')}
          >
            <AlertOctagon style={{ width: '16px', height: '16px' }} /> Simulate DDoS Attack
          </button>
          <button 
            className="cyber-btn btn-red" 
            disabled={activeAttack !== null}
            onClick={() => runAttack('sqli')}
          >
            <AlertOctagon style={{ width: '16px', height: '16px' }} /> SQL Injection Payload
          </button>
          <button 
            className="cyber-btn btn-red" 
            disabled={activeAttack !== null}
            onClick={() => runAttack('portscan')}
          >
            <AlertOctagon style={{ width: '16px', height: '16px' }} /> Recon Port Scan
          </button>
        </div>

        {/* Network Diagram */}
        <div style={{ position: 'relative', width: '100%', height: '320px', background: 'rgba(5, 8, 17, 0.8)', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
          
          {/* Dashboard overlay showing traffic status */}
          <div style={{ position: 'absolute', top: '10px', left: '10px', pointerEvents: 'none', display: 'flex', gap: '0.5rem', flexDirection: 'column', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
            <div>PACKET INGRESS: <span style={{ color: activeAttack === 'ddos' ? 'var(--neon-red)' : 'var(--neon-cyan)' }}>{packetCount.toLocaleString()} p/s</span></div>
            <div>SHIELD LEVEL: <span style={{ color: firewallStatus !== 'active' ? 'var(--neon-green)' : 'var(--neon-cyan)' }}>{firewallStatus === 'active' ? 'WAF: ARMED' : firewallStatus === 'blocking' ? 'WAF: BLOCKING THREAT' : 'WAF: RATE-LIMITING FLOOD'}</span></div>
          </div>

          {/* SVG Topology Nodes and Animated Packets */}
          <svg viewBox="0 0 600 300" style={{ width: '100%', height: '100%' }}>
            
            {/* Connection Lines (VPC Subnets) */}
            {/* Attacker / Internet -> WAF */}
            <path d="M 50 150 L 150 150" stroke={activeAttack ? 'var(--neon-red)' : 'var(--text-muted)'} strokeWidth="2" fill="none" />
            
            {/* WAF -> API Gateway */}
            <path d="M 210 150 L 290 150" stroke={firewallStatus === 'blocking' ? 'var(--neon-red)' : 'var(--neon-cyan)'} strokeWidth="2" fill="none" />

            {/* API Gateway -> Web VM 1 */}
            <path d="M 330 150 C 370 150, 360 80, 420 80" stroke="var(--neon-cyan)" strokeWidth="2" strokeOpacity={vms[0].sandboxed ? "0.1" : "1"} fill="none" />
            
            {/* Web VM 1 -> DB VM 2 */}
            <path d="M 460 80 C 510 80, 470 180, 440 220" stroke="var(--neon-cyan)" strokeWidth="1.5" strokeOpacity={vms[1].sandboxed ? "0.1" : "0.7"} strokeDasharray="4 4" fill="none" />
            
            {/* API Gateway -> Sandbox VM 3 */}
            <path d="M 330 150 C 370 150, 360 220, 420 220" stroke="var(--neon-cyan)" strokeWidth="2" strokeOpacity={vms[2].sandboxed ? "0.1" : "1"} fill="none" />

            {/* DB VM 2 -> Encrypted Storage (Key Vault) */}
            <path d="M 460 220 L 530 150" stroke="var(--neon-green)" strokeWidth="2" strokeDasharray="4 2" fill="none" />

            {/* Animated Traffic Particles */}
            {/* Normal Packet Flow (WAF -> Gateway) */}
            {activeAttack === null && (
              <circle r="4" fill="var(--neon-cyan)">
                <animateMotion dur="3s" repeatCount="indefinite" path="M 210 150 L 290 150" />
              </circle>
            )}

            {/* Normal flow Gateway -> Web Server */}
            {activeAttack === null && vms[0].status === 'running' && !vms[0].sandboxed && (
              <circle r="3" fill="var(--neon-cyan)">
                <animateMotion dur="2.5s" repeatCount="indefinite" path="M 330 150 C 370 150, 360 80, 420 80" />
              </circle>
            )}

            {/* Normal Backup flow Web -> DB */}
            {activeAttack === null && vms[1].status === 'running' && !vms[1].sandboxed && (
              <circle r="3.5" fill="var(--neon-green)">
                <animateMotion dur="4s" repeatCount="indefinite" path="M 460 80 C 510 80, 470 180, 440 220" />
              </circle>
            )}

            {/* DDoS Attack Packet Flood */}
            {activeAttack === 'ddos' && firewallStatus !== 'ddos-mitigation' && (
              <>
                {[...Array(8)].map((_, i) => (
                  <circle key={i} r="4" fill="var(--neon-red)">
                    <animateMotion dur={`${0.5 + i * 0.1}s`} repeatCount="indefinite" path="M 50 150 L 150 150" />
                  </circle>
                ))}
                {[...Array(6)].map((_, i) => (
                  <circle key={i} r="4" fill="var(--neon-red)">
                    <animateMotion dur={`${0.6 + i * 0.12}s`} repeatCount="indefinite" path="M 210 150 L 290 150" />
                  </circle>
                ))}
                {[...Array(5)].map((_, i) => (
                  <circle key={i} r="4" fill="var(--neon-red)">
                    <animateMotion dur={`${0.7 + i * 0.15}s`} repeatCount="indefinite" path="M 330 150 C 370 150, 360 80, 420 80" />
                  </circle>
                ))}
              </>
            )}

            {/* DDoS Mitigated Packet Flow */}
            {activeAttack === 'ddos' && firewallStatus === 'ddos-mitigation' && (
              <>
                {/* Attacker still sending but blocked at WAF */}
                {[...Array(6)].map((_, i) => (
                  <circle key={i} r="4.5" fill="var(--neon-red)">
                    <animateMotion dur={`${0.5 + i * 0.15}s`} repeatCount="indefinite" path="M 50 150 L 150 150" />
                  </circle>
                ))}
                {/* Micro clean packets passing through WAF */}
                <circle r="3.5" fill="var(--neon-cyan)">
                  <animateMotion dur="4s" repeatCount="indefinite" path="M 210 150 L 290 150" />
                </circle>
              </>
            )}

            {/* SQL Injection Attack Packet */}
            {activeAttack === 'sqli' && (
              <circle r="6" fill="var(--neon-red)" stroke="#ffffff" strokeWidth="1.5">
                <animateMotion 
                  dur="2.5s" 
                  repeatCount="indefinite" 
                  path={firewallStatus === 'blocking' ? "M 50 150 L 150 150" : "M 50 150 L 150 150 M 210 150 L 290 150 M 330 150 C 370 150, 360 80, 420 80"} 
                />
              </circle>
            )}

            {/* Port Scan Scan probes */}
            {activeAttack === 'portscan' && (
              <>
                <circle r="3" fill="var(--neon-gold)">
                  <animateMotion dur="1s" repeatCount="indefinite" path="M 50 150 L 150 150" />
                </circle>
                {firewallStatus !== 'blocking' && (
                  <>
                    <circle r="3" fill="var(--neon-gold)">
                      <animateMotion dur="1.2s" repeatCount="indefinite" path="M 210 150 L 290 150" />
                    </circle>
                    <circle r="3" fill="var(--neon-gold)">
                      <animateMotion dur="1.5s" repeatCount="indefinite" path="M 330 150 C 370 150, 360 80, 420 80" />
                    </circle>
                    <circle r="3" fill="var(--neon-gold)">
                      <animateMotion dur="1.5s" repeatCount="indefinite" path="M 330 150 C 370 150, 360 220, 420 220" />
                    </circle>
                  </>
                )}
              </>
            )}

            {/* NODES GRAPHICS */}
            {/* Internet Attacker Node */}
            <circle cx="50" cy="150" r="16" fill="rgba(10, 15, 30, 0.9)" stroke={activeAttack ? "var(--neon-red)" : "var(--border-color)"} strokeWidth="2" />
            <text x="50" y="154" textAnchor="middle" fill={activeAttack ? "var(--neon-red)" : "var(--text-primary)"} fontSize="10" fontFamily="var(--font-mono)" fontWeight="bold">EXT</text>
            <text x="50" y="180" textAnchor="middle" fill="var(--text-muted)" fontSize="9">Attacker/Web</text>

            {/* WAF Shield Node */}
            <polygon points="170,125 210,135 210,165 170,175 170,140" fill={firewallStatus === 'blocking' ? "rgba(255, 0, 85, 0.2)" : firewallStatus === 'ddos-mitigation' ? "rgba(57, 255, 20, 0.2)" : "rgba(0, 240, 255, 0.1)"} stroke={firewallStatus === 'blocking' ? "var(--neon-red)" : firewallStatus === 'ddos-mitigation' ? "var(--neon-green)" : "var(--neon-cyan)"} strokeWidth="2" />
            <text x="188" y="154" textAnchor="middle" fill="var(--text-primary)" fontSize="10" fontFamily="var(--font-mono)" fontWeight="bold">WAF</text>
            <text x="188" y="195" textAnchor="middle" fill="var(--text-muted)" fontSize="9">Edge IPS</text>

            {/* API Gateway Load Balancer */}
            <rect x="290" y="125" width="40" height="50" rx="4" fill="rgba(10, 15, 30, 0.9)" stroke="var(--neon-cyan)" strokeWidth="2" />
            <text x="310" y="148" textAnchor="middle" fill="var(--neon-cyan)" fontSize="9" fontFamily="var(--font-mono)" fontWeight="bold">LOAD</text>
            <text x="310" y="162" textAnchor="middle" fill="var(--neon-cyan)" fontSize="9" fontFamily="var(--font-mono)" fontWeight="bold">BAL</text>
            <text x="310" y="195" textAnchor="middle" fill="var(--text-muted)" fontSize="9">API Gateway</text>

            {/* VM 1 (Web Server) */}
            <circle cx="440" cy="80" r="20" fill="rgba(10, 15, 30, 0.9)" stroke={vms[0].sandboxed ? "var(--neon-red)" : vms[0].cpuUsage > 90 ? "var(--neon-red)" : "var(--neon-cyan)"} strokeWidth="2" />
            <text x="440" y="83" textAnchor="middle" fill="var(--text-primary)" fontSize="10" fontFamily="var(--font-mono)">VM1</text>
            <text x="440" y="112" textAnchor="middle" fill="var(--text-muted)" fontSize="9">Web Server</text>

            {/* VM 2 (Database Server) */}
            <circle cx="440" cy="220" r="20" fill="rgba(10, 15, 30, 0.9)" stroke={vms[1].sandboxed ? "var(--neon-red)" : vms[1].cpuUsage > 75 ? "var(--neon-gold)" : "var(--neon-cyan)"} strokeWidth="2" />
            <text x="440" y="223" textAnchor="middle" fill="var(--text-primary)" fontSize="10" fontFamily="var(--font-mono)">VM2</text>
            <text x="440" y="252" textAnchor="middle" fill="var(--text-muted)" fontSize="9">Secure DB</text>

            {/* Secure Encrypted Storage */}
            <polygon points="530,150 560,130 590,150 560,170" fill="rgba(57, 255, 20, 0.15)" stroke="var(--neon-green)" strokeWidth="2" />
            <text x="560" y="154" textAnchor="middle" fill="var(--neon-green)" fontSize="10" fontFamily="var(--font-mono)" fontWeight="bold">VAULT</text>
            <text x="560" y="188" textAnchor="middle" fill="var(--text-muted)" fontSize="9">Encrypted S3</text>
          </svg>

        </div>

        {/* Live Attack Logs Terminal */}
        <div style={{ marginTop: '1rem', background: '#020408', border: '1px solid #1a243a', borderRadius: '6px', padding: '0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', height: '110px', overflowY: 'auto' }}>
          <div style={{ color: 'var(--neon-red)', fontWeight: 'bold', borderBottom: '1px solid #1a243a', paddingBottom: '0.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Terminal style={{ width: '12px', height: '12px' }} /> IDS/IPS SECURITY ALERT CONSOLE
          </div>
          {attackLogs.length === 0 ? (
            <div style={{ color: 'var(--text-muted)' }}>[OK] No intrusion alerts detected. Subnet network interfaces are nominal.</div>
          ) : (
            attackLogs.map((log, i) => (
              <div key={i} style={{ color: log.includes('[ALERT]') ? 'var(--neon-red)' : log.includes('[WAF]') ? 'var(--neon-green)' : 'var(--neon-cyan)', margin: '2px 0' }}>{log}</div>
            ))
          )}
        </div>
      </div>

      {/* VM List and Virtualization isolation policy config */}
      <div className="glass-panel">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
          <Server className="status-dot cyan" style={{ width: '20px', height: '20px', background: 'none', boxShadow: 'none' }} />
          Hypervisor Virtualization Console
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {vms.map((vm) => (
            <div key={vm.id} style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', background: vm.status === 'running' ? 'rgba(0, 240, 255, 0.02)' : 'rgba(0,0,0,0.2)', transition: 'all var(--transition-normal)', position: 'relative' }}>
              
              {/* Sandbox Flag Overlay */}
              {vm.sandboxed && (
                <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                  <span className="cyber-badge red" style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                    <WifiOff style={{ width: '10px', height: '10px' }} /> Isolated Sandbox
                  </span>
                </div>
              )}

              {/* VM Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <HardDrive style={{ width: '16px', height: '16px', color: vm.status === 'running' ? 'var(--neon-cyan)' : 'var(--text-muted)' }} />
                    {vm.name}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>IP: {vm.ip}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span className={`status-dot ${vm.status === 'running' ? 'green' : 'red'}`}></span>
                  <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 'bold' }}>{vm.status}</span>
                </div>
              </div>

              {/* Isolation Config / Specs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                <div>ISOLATION: <strong style={{ color: 'var(--text-primary)' }}>{vm.isolation}</strong></div>
                <div>CORES/RAM: <strong style={{ color: 'var(--text-primary)' }}>{vm.cpu} Cores / {vm.ram} GB</strong></div>
                <div>FIREWALL: <strong style={{ color: vm.firewall === 'Isolated' ? 'var(--neon-red)' : 'var(--neon-green)' }}>{vm.firewall}</strong></div>
              </div>

              {/* Hardware utilization bars */}
              {vm.status === 'running' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '2px' }}>
                      <span>CPU Load:</span>
                      <span style={{ color: vm.cpuUsage > 80 ? 'var(--neon-red)' : 'var(--text-primary)' }}>{vm.cpuUsage}%</span>
                    </div>
                    <div style={{ height: '4px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${vm.cpuUsage}%`, background: vm.cpuUsage > 80 ? 'var(--neon-red)' : 'var(--neon-cyan)', transition: 'width 0.5s ease', boxShadow: vm.cpuUsage > 80 ? '0 0 10px var(--neon-red)' : 'none' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '2px' }}>
                      <span>RAM Allocation:</span>
                      <span>{vm.ramUsage}% ({((vm.ram * vm.ramUsage)/100).toFixed(1)} GB)</span>
                    </div>
                    <div style={{ height: '4px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${vm.ramUsage}%`, background: 'var(--neon-green)', transition: 'width 0.5s ease' }}></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                <button 
                  className={`cyber-btn ${vm.status === 'running' ? 'btn-red' : 'btn-green'}`} 
                  style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem' }}
                  onClick={() => toggleVm(vm.id)}
                >
                  {vm.status === 'running' ? (
                    <><Square style={{ width: '12px', height: '12px' }} /> Stop VM</>
                  ) : (
                    <><Play style={{ width: '12px', height: '12px' }} /> Start VM</>
                  )}
                </button>
                <button 
                  className="cyber-btn" 
                  style={{ flex: 1.2, padding: '0.4rem', fontSize: '0.75rem', borderColor: vm.sandboxed ? 'var(--neon-green)' : 'var(--neon-red)', color: vm.sandboxed ? 'var(--neon-green)' : 'var(--neon-red)' }}
                  onClick={() => toggleSandbox(vm.id)}
                  disabled={vm.status !== 'running'}
                >
                  <Shield style={{ width: '12px', height: '12px' }} /> {vm.sandboxed ? 'Reconnect Network' : 'Isolate Network'}
                </button>
              </div>

            </div>
          ))}

        </div>
      </div>

    </div>
  );
}
