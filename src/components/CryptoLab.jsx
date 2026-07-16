import React, { useState, useRef, useEffect } from 'react';
import { Lock, Unlock, FileText, Download, Key, RefreshCw, CheckCircle2, AlertTriangle, Cpu, FileCheck } from 'lucide-react';

export default function CryptoLab({ addLog }) {
  const [file, setFile] = useState(null);
  const [passcode, setPasscode] = useState('SuperSecretPassword123!');
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [encryptionStep, setEncryptionStep] = useState(0);
  const [encResult, setEncResult] = useState(null);
  
  // Decryption state
  const [decFile, setDecFile] = useState(null);
  const [decPasscode, setDecPasscode] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptionStep, setDecryptionStep] = useState(0);
  const [decResult, setDecResult] = useState(null);
  const [decError, setDecError] = useState('');
  
  // Animation states
  const [scrambleBytes, setScrambleBytes] = useState([]);
  const animInterval = useRef(null);

  // Generate random bytes for block animation
  useEffect(() => {
    if (isEncrypting || isDecrypting) {
      animInterval.current = setInterval(() => {
        const bytes = [];
        for (let i = 0; i < 48; i++) {
          bytes.push(Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase());
        }
        setScrambleBytes(bytes);
      }, 80);
    } else {
      clearInterval(animInterval.current);
      setScrambleBytes([]);
    }
    return () => clearInterval(animInterval.current);
  }, [isEncrypting, isDecrypting]);

  // Helper: Convert ArrayBuffer to Base64
  const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  // Helper: Convert Base64 to ArrayBuffer
  const base64ToArrayBuffer = (base64) => {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  // Helper: Convert ArrayBuffer to Hex String
  const arrayBufferToHex = (buffer) => {
    const hashArray = Array.from(new Uint8Array(buffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // Handle Encryption
  const handleEncrypt = async () => {
    if (!file) return;
    setIsEncrypting(true);
    setEncryptionStep(1);
    setEncResult(null);
    addLog(`Initiating client-side encryption for file: ${file.name}`, 'info');

    try {
      // Step 1: Read plaintext
      await new Promise(r => setTimeout(r, 800));
      const reader = new FileReader();
      const fileDataPromise = new Promise((resolve) => {
        reader.onload = () => resolve(reader.result);
      });
      reader.readAsArrayBuffer(file);
      const plaintextBuffer = await fileDataPromise;
      
      setEncryptionStep(2);
      addLog(`Generating secure Salt and IV. Instantiating key derivation...`, 'info');

      // Step 2: Deriving Key
      await new Promise(r => setTimeout(r, 1000));
      const salt = window.crypto.getRandomValues(new Uint8Array(16));
      const iv = window.crypto.getRandomValues(new Uint8Array(12)); // AES-GCM standard IV size is 12 bytes
      
      const encoder = new TextEncoder();
      const baseKey = await window.crypto.subtle.importKey(
        "raw",
        encoder.encode(passcode),
        "PBKDF2",
        false,
        ["deriveKey"]
      );

      const derivedKey = await window.crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt: salt,
          iterations: 100000,
          hash: "SHA-256"
        },
        baseKey,
        { name: "AES-GCM", length: 256 },
        true, // exportable
        ["encrypt", "decrypt"]
      );

      // Export key for visual reference
      const exportedJWK = await window.crypto.subtle.exportKey("jwk", derivedKey);

      setEncryptionStep(3);
      addLog(`Hashing plaintext with SHA-256 for integrity verification...`, 'info');

      // Step 3: Integrity hashing
      await new Promise(r => setTimeout(r, 800));
      const integrityHashBuffer = await window.crypto.subtle.digest("SHA-256", plaintextBuffer);
      const integrityHashHex = arrayBufferToHex(integrityHashBuffer);

      setEncryptionStep(4);
      addLog(`Encrypting plaintext blocks with AES-256-GCM cipher...`, 'info');

      // Step 4: AES-GCM Encryption
      await new Promise(r => setTimeout(r, 1200));
      const ciphertextBuffer = await window.crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv: iv
        },
        derivedKey,
        plaintextBuffer
      );

      setEncryptionStep(5);
      addLog(`Assembling encrypted package metadata (.enc package)`, 'info');
      await new Promise(r => setTimeout(r, 600));

      const payload = {
        fileName: file.name,
        fileType: file.type || 'application/octet-stream',
        ciphertext: arrayBufferToBase64(ciphertextBuffer),
        salt: arrayBufferToBase64(salt),
        iv: arrayBufferToBase64(iv),
        integrityHash: integrityHashHex,
        encryptedAt: new Date().toISOString()
      };

      const encPackageString = JSON.stringify(payload, null, 2);
      
      setEncResult({
        encPackage: encPackageString,
        saltHex: arrayBufferToHex(salt),
        ivHex: arrayBufferToHex(iv),
        keyJwk: JSON.stringify(exportedJWK),
        integrityHash: integrityHashHex,
        originalSize: file.size,
        encryptedSize: encPackageString.length
      });

      setEncryptionStep(6);
      addLog(`Client-side encryption completed successfully for ${file.name}. Integrity hash: ${integrityHashHex.substring(0, 16)}...`, 'success');
    } catch (err) {
      console.error(err);
      addLog(`Encryption failed: ${err.message}`, 'error');
      setEncryptionStep(0);
    } finally {
      setIsEncrypting(false);
    }
  };

  // Handle Decryption
  const handleDecrypt = async () => {
    if (!decFile) return;
    setIsDecrypting(true);
    setDecryptionStep(1);
    setDecResult(null);
    setDecError('');
    addLog(`Reading encrypted package file...`, 'info');

    try {
      await new Promise(r => setTimeout(r, 800));
      const reader = new FileReader();
      const packageTextPromise = new Promise((resolve) => {
        reader.onload = () => resolve(reader.result);
      });
      reader.readAsText(decFile);
      const packageText = await packageTextPromise;

      let payload;
      try {
        payload = JSON.parse(packageText);
        if (!payload.ciphertext || !payload.salt || !payload.iv || !payload.integrityHash) {
          throw new Error("Missing required package parameters (ciphertext, salt, iv, or integrityHash)");
        }
      } catch (e) {
        throw new Error("Invalid encryption package format. Please load a valid .enc file.");
      }

      setDecryptionStep(2);
      addLog(`Importing credentials & deriving cryptographic key using PBKDF2...`, 'info');

      // Step 2: Derive Key
      await new Promise(r => setTimeout(r, 1000));
      const salt = base64ToArrayBuffer(payload.salt);
      const iv = base64ToArrayBuffer(payload.iv);
      const ciphertext = base64ToArrayBuffer(payload.ciphertext);

      const encoder = new TextEncoder();
      const baseKey = await window.crypto.subtle.importKey(
        "raw",
        encoder.encode(decPasscode),
        "PBKDF2",
        false,
        ["deriveKey"]
      );

      const derivedKey = await window.crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt: salt,
          iterations: 100000,
          hash: "SHA-256"
        },
        baseKey,
        { name: "AES-GCM", length: 256 },
        false,
        ["decrypt"]
      );

      setDecryptionStep(3);
      addLog(`Decrypting cipher blocks via AES-GCM...`, 'info');

      // Step 3: Decrypt
      await new Promise(r => setTimeout(r, 1200));
      let decryptedBuffer;
      try {
        decryptedBuffer = await window.crypto.subtle.decrypt(
          {
            name: "AES-GCM",
            iv: iv
          },
          derivedKey,
          ciphertext
        );
      } catch (e) {
        throw new Error("Decryption failed. Invalid passcode or corrupted package (Auth Tag validation failure).");
      }

      setDecryptionStep(4);
      addLog(`Calculating integrity verification hash (SHA-256)...`, 'info');

      // Step 4: Integrity check
      await new Promise(r => setTimeout(r, 800));
      const integrityHashBuffer = await window.crypto.subtle.digest("SHA-256", decryptedBuffer);
      const integrityHashHex = arrayBufferToHex(integrityHashBuffer);

      setDecryptionStep(5);
      await new Promise(r => setTimeout(r, 600));

      if (integrityHashHex !== payload.integrityHash) {
        throw new Error(`Integrity Hash Mismatch! Calculated: ${integrityHashHex.substring(0, 10)}, Expected: ${payload.integrityHash.substring(0, 10)}`);
      }

      setDecResult({
        fileName: payload.fileName,
        fileType: payload.fileType,
        buffer: decryptedBuffer,
        integrityHash: integrityHashHex
      });

      setDecryptionStep(6);
      addLog(`Integrity checks verified: SHA-256 hashes matched successfully!`, 'success');
      addLog(`File successfully decrypted: ${payload.fileName}`, 'success');
    } catch (err) {
      console.error(err);
      setDecError(err.message);
      addLog(`Decryption failure: ${err.message}`, 'error');
      setDecryptionStep(0);
    } finally {
      setIsDecrypting(false);
    }
  };

  const downloadEncFile = () => {
    if (!encResult) return;
    const blob = new Blob([encResult.encPackage], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file.name}.enc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadDecFile = () => {
    if (!decResult) return;
    const blob = new Blob([decResult.buffer], { type: decResult.fileType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = decResult.fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadKey = () => {
    if (!encResult) return;
    const blob = new Blob([encResult.keyJwk], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file.name}_aes_key.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      
      {/* Encryption Module */}
      <div className="glass-panel" style={{ position: 'relative', overflow: 'hidden' }}>
        {isEncrypting && <div className="laser-scanner"></div>}
        
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
          <Lock className="status-dot cyan" style={{ width: '20px', height: '20px', background: 'none', boxShadow: 'none' }} />
          Client-Side Encryption Vault
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* File Picker */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Select Local File to Encrypt</label>
            <div style={{ border: '2px dashed var(--border-color)', borderRadius: '6px', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', transition: 'border var(--transition-normal)' }} onClick={() => document.getElementById('encrypt-input').click()}>
              <input type="file" id="encrypt-input" style={{ display: 'none' }} onChange={(e) => setFile(e.target.files[0])} />
              <FileText style={{ width: '32px', height: '32px', color: 'var(--neon-cyan)', marginBottom: '0.5rem' }} />
              {file ? (
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{file.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{(file.size / 1024).toFixed(2)} KB</div>
                </div>
              ) : (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Drag files here or click to browse</div>
              )}
            </div>
          </div>

          {/* Passcode input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Encryption Passcode (Derives AES key via PBKDF2)</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                className="cyber-input" 
                style={{ flex: 1 }} 
                value={passcode} 
                onChange={(e) => setPasscode(e.target.value)} 
                disabled={isEncrypting}
                placeholder="Enter password..."
              />
              <button className="cyber-btn btn-gold" onClick={() => setPasscode(Math.random().toString(36).slice(-10) + '!')} disabled={isEncrypting}>
                <Key style={{ width: '16px', height: '16px' }} /> Auto Gen
              </button>
            </div>
          </div>

          {/* Encrypt Trigger */}
          <button 
            className="cyber-btn" 
            style={{ width: '100%', justifyContent: 'center' }} 
            onClick={handleEncrypt} 
            disabled={isEncrypting || !file}
          >
            {isEncrypting ? (
              <>
                <RefreshCw style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> Processing Cipher...
              </>
            ) : (
              <>
                <Lock style={{ width: '16px', height: '16px' }} /> Encrypt File
              </>
            )}
          </button>

          {/* Cryptography Steps Display */}
          {(isEncrypting || encryptionStep > 0) && (
            <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '1rem', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.85rem' }}>
              <div style={{ fontWeight: '600', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>AES-GCM Encryption Pipeline:</span>
                <span className="cyber-badge cyan">{encryptionStep * 16}%</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: encryptionStep >= 1 ? 'var(--neon-green)' : 'var(--text-muted)' }}>
                  <span className={`status-dot ${encryptionStep >= 1 ? 'green' : 'cyan'}`}></span>
                  Read File Buffer: {encryptionStep >= 1 ? 'LOADED' : 'PENDING'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: encryptionStep >= 2 ? 'var(--neon-green)' : 'var(--text-muted)' }}>
                  <span className={`status-dot ${encryptionStep >= 2 ? 'green' : 'cyan'}`}></span>
                  PBKDF2 Key Derivation (100k Iterations): {encryptionStep >= 2 ? 'COMPLETED' : 'PENDING'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: encryptionStep >= 3 ? 'var(--neon-green)' : 'var(--text-muted)' }}>
                  <span className={`status-dot ${encryptionStep >= 3 ? 'green' : 'cyan'}`}></span>
                  Plaintext SHA-256 Hashing: {encryptionStep >= 3 ? 'HASHED' : 'PENDING'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: encryptionStep >= 4 ? 'var(--neon-green)' : 'var(--text-muted)' }}>
                  <span className={`status-dot ${encryptionStep >= 4 ? 'green' : 'cyan'}`}></span>
                  AES-256-GCM Scrambling: {encryptionStep >= 4 ? 'ENCRYPTED' : 'PENDING'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: encryptionStep >= 5 ? 'var(--neon-green)' : 'var(--text-muted)' }}>
                  <span className={`status-dot ${encryptionStep >= 5 ? 'green' : 'cyan'}`}></span>
                  Metadata Package Assembly (.enc): {encryptionStep >= 5 ? 'ASSEMBLED' : 'PENDING'}
                </div>
              </div>

              {/* Scramble Bytes Matrix Animation */}
              {(isEncrypting || encryptionStep === 4) && scrambleBytes.length > 0 && (
                <div style={{ marginTop: '0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--neon-cyan)', opacity: 0.8, background: 'rgba(0, 240, 255, 0.05)', padding: '0.5rem', borderRadius: '4px', display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '2px', textAlign: 'center', border: '1px solid rgba(0, 240, 255, 0.1)' }}>
                  {scrambleBytes.map((byte, idx) => (
                    <span key={idx} style={{ color: Math.random() > 0.5 ? 'var(--neon-cyan)' : 'var(--neon-green)' }}>{byte}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Encryption Results & Download */}
          {encResult && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(57, 255, 20, 0.05)', border: '1px solid rgba(57, 255, 20, 0.2)', padding: '1rem', borderRadius: '6px' }}>
              <div style={{ color: 'var(--neon-green)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 style={{ width: '18px', height: '18px' }} />
                Secure Encrypted Package Formed
              </div>
              <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div><strong>Salt (Hex):</strong> <div className="key-value-label">{encResult.saltHex.substring(0, 32)}...</div></div>
                <div><strong>IV (Hex):</strong> <div className="key-value-label">{encResult.ivHex}</div></div>
                <div><strong>Integrity SHA-256:</strong> <div className="key-value-label">{encResult.integrityHash}</div></div>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button className="cyber-btn btn-green" style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem' }} onClick={downloadEncFile}>
                  <Download style={{ width: '14px', height: '14px' }} /> Download .enc
                </button>
                <button className="cyber-btn btn-gold" style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem' }} onClick={downloadKey}>
                  <Key style={{ width: '14px', height: '14px' }} /> Export Key (JWK)
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Decryption Module */}
      <div className="glass-panel" style={{ position: 'relative', overflow: 'hidden' }}>
        {isDecrypting && <div className="laser-scanner"></div>}

        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
          <Unlock className="status-dot red" style={{ width: '20px', height: '20px', background: 'none', boxShadow: 'none' }} />
          Decryption Console
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* File Picker */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Upload Encrypted .enc File</label>
            <div style={{ border: '2px dashed var(--border-color)', borderRadius: '6px', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', transition: 'border var(--transition-normal)' }} onClick={() => document.getElementById('decrypt-input').click()}>
              <input type="file" id="decrypt-input" style={{ display: 'none' }} onChange={(e) => setDecFile(e.target.files[0])} />
              <FileCheck style={{ width: '32px', height: '32px', color: 'var(--neon-red)', marginBottom: '0.5rem' }} />
              {decFile ? (
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{decFile.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{(decFile.size / 1024).toFixed(2)} KB</div>
                </div>
              ) : (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Drag encrypted files here or click to browse</div>
              )}
            </div>
          </div>

          {/* Passcode input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Decryption Passcode</label>
            <input 
              type="text" 
              className="cyber-input" 
              style={{ width: '100%' }} 
              value={decPasscode} 
              onChange={(e) => setDecPasscode(e.target.value)} 
              disabled={isDecrypting}
              placeholder="Enter encryption passcode..."
            />
          </div>

          {/* Decrypt Trigger */}
          <button 
            className="cyber-btn btn-red" 
            style={{ width: '100%', justifyContent: 'center' }} 
            onClick={handleDecrypt} 
            disabled={isDecrypting || !decFile || !decPasscode}
          >
            {isDecrypting ? (
              <>
                <RefreshCw style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> Unscrambling Blocks...
              </>
            ) : (
              <>
                <Unlock style={{ width: '16px', height: '16px' }} /> Decrypt & Verify
              </>
            )}
          </button>

          {/* Decrypt Error Message */}
          {decError && (
            <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255, 0, 85, 0.05)', border: '1px solid rgba(255, 0, 85, 0.2)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--neon-red)', alignItems: 'center' }}>
              <AlertTriangle style={{ width: '18px', height: '18px', flexShrink: 0 }} />
              <div>{decError}</div>
            </div>
          )}

          {/* Decryption steps */}
          {(isDecrypting || decryptionStep > 0) && (
            <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '1rem', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.85rem' }}>
              <div style={{ fontWeight: '600', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>AES-GCM Decryption Pipeline:</span>
                <span className="cyber-badge red">{decryptionStep * 16}%</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: decryptionStep >= 1 ? 'var(--neon-green)' : 'var(--text-muted)' }}>
                  <span className={`status-dot ${decryptionStep >= 1 ? 'green' : 'red'}`}></span>
                  Parse Metadata Package: {decryptionStep >= 1 ? 'PARSED' : 'PENDING'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: decryptionStep >= 2 ? 'var(--neon-green)' : 'var(--text-muted)' }}>
                  <span className={`status-dot ${decryptionStep >= 2 ? 'green' : 'red'}`}></span>
                  Reconstruct Key (PBKDF2): {decryptionStep >= 2 ? 'COMPLETED' : 'PENDING'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: decryptionStep >= 3 ? 'var(--neon-green)' : 'var(--text-muted)' }}>
                  <span className={`status-dot ${decryptionStep >= 3 ? 'green' : 'red'}`}></span>
                  AES-GCM Decipher (GCM Auth Tag Checked): {decryptionStep >= 3 ? 'DECRYPTED' : 'PENDING'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: decryptionStep >= 4 ? 'var(--neon-green)' : 'var(--text-muted)' }}>
                  <span className={`status-dot ${decryptionStep >= 4 ? 'green' : 'red'}`}></span>
                  Plaintext SHA-256 Verification: {decryptionStep >= 4 ? 'HASHED' : 'PENDING'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: decryptionStep >= 5 ? 'var(--neon-green)' : 'var(--text-muted)' }}>
                  <span className={`status-dot ${decryptionStep >= 5 ? 'green' : 'red'}`}></span>
                  Integrity Validation Match: {decryptionStep >= 5 ? 'VERIFIED' : 'PENDING'}
                </div>
              </div>

              {/* Scramble Bytes Matrix Animation */}
              {(isDecrypting || decryptionStep === 3) && scrambleBytes.length > 0 && (
                <div style={{ marginTop: '0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--neon-red)', opacity: 0.8, background: 'rgba(255, 0, 85, 0.05)', padding: '0.5rem', borderRadius: '4px', display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '2px', textAlign: 'center', border: '1px solid rgba(255, 0, 85, 0.1)' }}>
                  {scrambleBytes.map((byte, idx) => (
                    <span key={idx} style={{ color: Math.random() > 0.5 ? 'var(--neon-red)' : 'var(--neon-green)' }}>{byte}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Decryption Success result */}
          {decResult && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(57, 255, 20, 0.05)', border: '1px solid rgba(57, 255, 20, 0.2)', padding: '1rem', borderRadius: '6px' }}>
              <div style={{ color: 'var(--neon-green)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 style={{ width: '18px', height: '18px' }} />
                Plaintext Decrypted & Verified
              </div>
              <div style={{ fontSize: '0.85rem' }}>
                <div><strong>File Decrypted:</strong> {decResult.fileName}</div>
                <div><strong>File Type:</strong> {decResult.fileType}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                  <Cpu style={{ width: '14px', height: '14px', color: 'var(--neon-green)' }} />
                  <strong style={{ color: 'var(--neon-green)' }}>Integrity Verification Pass (SHA-256 matches)</strong>
                </div>
                <div className="key-value-label" style={{ marginTop: '0.5rem' }}>{decResult.integrityHash}</div>
              </div>
              
              <button className="cyber-btn btn-green" style={{ width: '100%', marginTop: '0.5rem' }} onClick={downloadDecFile}>
                <Download style={{ width: '16px', height: '16px' }} /> Save Decrypted File
              </button>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
