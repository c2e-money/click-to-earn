'use client';
import { useState, useEffect, useCallback } from 'react';
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc, increment } from 'firebase/firestore';

// Configuration Config Guard
const cfg = {
  apiKey: "AIzaSyD3Yl0BR4o6qEX6MeXYjX6Qjlr5BCid5C8",
  authDomain: "my-website-242fc.firebaseapp.com",
  projectId: "my-website-242fc",
  storageBucket: "my-website-242fc.firebasestorage.app",
  messagingSenderId: "78108710064",
  appId: "1:78108710064:web:7b5e79f33721fbc7f71775"
};
const app = getApps().length > 0 ? getApp() : initializeApp(cfg);
const auth = getAuth(app), db = getFirestore(app);

// Configurable Constants (Easily modifiable)
const OFFICIAL_TELEGRAM_LINK = "https://t.me/YOUR_CHANNEL";
const FIXED_CPM = 3.0;

export default function ClickToEarnUltimate() {
  const [tab, setTab] = useState('home');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [isUp, setIsUp] = useState(false);
  
  // Link Generation States
  const [url, setUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [expiry, setExpiry] = useState('');
  const [shortened, setShortened] = useState('');
  const [links, setLinks] = useState([]);
  const [side, setSide] = useState(false);
  const [uiError, setUiError] = useState('');
  const [uiSuccess, setUiSuccess] = useState('');

  // Dashboard Stats State
  const [stats, setStats] = useState({ 
    clk: 0, 
    earn: 0, 
    cpm: FIXED_CPM,
    totalLinks: 0,
    activeLinks: 0,
    expiredLinks: 0
  });

  // Routing and Traffic Engine Verification States
  const [rt, setRt] = useState(false);
  const [stage, setStage] = useState(1);
  const [tmr, setTmr] = useState(10);
  const [dest, setDest] = useState('');
  const [isTokenFound, setIsTokenFound] = useState(false);
  const [isLinkExpiredPage, setIsLinkExpiredPage] = useState(false);

  // Helper: Secure Random Alias Generator
  const generateSecureAlias = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Helper: Check if link is expired
  const isLinkExpired = (expiryDateString) => {
    if (!expiryDateString) return false;
    const expiryDate = new Date(expiryDateString);
    if (isNaN(expiryDate.getTime())) return false;
    return new Date() > expiryDate;
  };

  // Helper: Reliable Clipboard Copy Fallback
  const handleCopyToClipboard = async (textToCopy) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
        alert("Copied successfully!");
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        textArea.style.position = "fixed"; 
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert("Copied successfully!");
      }
    } catch (err) {
      alert("Failed to copy link. Please select and copy manually.");
    }
  };

  // Traffic Engine Token Check Instance Router
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const tok = new URLSearchParams(window.location.search).get('go');
      if (tok) {
        setIsTokenFound(true);
        getDocs(query(collection(db, "links"), where("alias", "==", tok)))
          .then(snap => {
            if (!snap.empty) {
              const d = snap.docs[0];
              const linkData = d.data();

              // 1. Expiry Check Architecture
              if (isLinkExpired(linkData.expiry)) {
                setIsLinkExpiredPage(true);
                setIsTokenFound(false);
                return;
              }

              setDest(linkData.originalUrl); 
              setRt(true); 
              setStage(1); 
              setTmr(10);
              
              // 2. Atomic Performance Tracking Fix (No Loss Data Entry)
              updateDoc(doc(db, "links", d.id), { clicks: increment(1) });
            } else { 
              alert("Invalid Short URL Instance."); 
              window.location.replace(window.location.origin); 
            }
          })
          .catch((err) => {
            console.error(err);
            setIsTokenFound(false);
          });
      }
    }
  }, []);

  // Countdown Interval Controller
  useEffect(() => {
    if (rt && tmr > 0) { 
      const r = setTimeout(() => setTmr(tmr - 1), 1000); 
      return () => clearTimeout(r); 
    }
  }, [rt, tmr]);

  // Dynamic Multi-Channel Scripts Allocation Engine (Anti-Leak Matrix)
  useEffect(() => {
    if (rt) {
      const activeScripts = [];

      if (stage !== 4 && !document.getElementById('ad-popunder-node')) {
        const pop = document.createElement('script'); 
        pop.id = 'ad-popunder-node';
        pop.src = "https://rightyrely.com/b9/4d/11/b94d112da7a9eca56020cdc86de372e4.js"; 
        document.body.appendChild(pop);
        activeScripts.push(pop);
      } else if (stage === 4) {
        document.getElementById('ad-popunder-node')?.remove();
      }

      if (!document.getElementById('ad-social-node')) {
        const soc = document.createElement('script'); 
        soc.id = 'ad-social-node';
        soc.src = "https://rightyrely.com/25/35/24/253524e061c1d53e48e5610b6dfa52e6.js"; 
        document.body.appendChild(soc);
        activeScripts.push(soc);
      }

      if (!document.getElementById('ad-native-node')) {
        const nat = document.createElement('script'); 
        nat.id = 'ad-native-node';
        nat.async = true; 
        nat.setAttribute("data-cfasync", "false");
        nat.src = "https://rightyrely.com/9a3ee810f662f820251422648340bfa6/invoke.js"; 
        document.body.appendChild(nat);
        activeScripts.push(nat);
      }

      // Cleanup Hook Matrix to entirely destroy leaks on Unmount / Changes
      return () => {
        activeScripts.forEach(script => {
          if (script && document.body.contains(script)) {
            document.body.removeChild(script);
          }
        });
      };
    }
  }, [rt, stage]);

  // Load Realtime Synchronized Dashboard Logs Engine
  const loadLogs = useCallback((uid) => {
    getDocs(query(collection(db, "links"), where("userId", "==", uid))).then(snap => {
      let totalClicks = 0; 
      let activeCount = 0;
      let expiredCount = 0;
      const parsedLinks = [];
      
      snap.forEach(d => {
        const data = d.data();
        parsedLinks.push({ id: d.id, ...data });
        totalClicks += (data.clicks || 0);
        
        if (isLinkExpired(data.expiry)) {
          expiredCount++;
        } else {
          activeCount++;
        }
      });

      // Sort logs by created date if available
      parsedLinks.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

      setLinks(parsedLinks); 
      setStats({ 
        clk: totalClicks, 
        cpm: FIXED_CPM, 
        earn: (totalClicks / 1000) * FIXED_CPM,
        totalLinks: parsedLinks.length,
        activeLinks: activeCount,
        expiredLinks: expiredCount
      });
    }).catch(err => {
      console.error("Error updating metric dashboards: ", err);
    });
  }, []);

  // Session Watcher Auth Pipeline
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) { 
        setUser(u); 
        loadLogs(u.uid); 
      } else { 
        setUser(null); 
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [loadLogs]);

  // Authorization Middleware Engine 
  const handleAuth = async () => {
    if (!email || !pass) return alert("Please fill all required fields!");
    setUiError('');
    setActionLoading(true);
    try { 
      if (isUp) { 
        await createUserWithEmailAndPassword(auth, email, pass); 
        setIsUp(false); 
        alert("Account workspace registered successfully! Please Login.");
      } else { 
        await signInWithEmailAndPassword(auth, email, pass); 
      } 
    } catch (e) { 
      setUiError(e.message);
      alert(e.message); 
    } finally {
      setActionLoading(false);
    }
  };

  // Production URL Parser Verification Engine
  const validateAndFixUrl = (inputUrl) => {
    let trimmed = inputUrl.trim();
    if (!trimmed) return null;
    
    // Regular expression matching structural domain components
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?.*$/;
    if (!urlPattern.test(trimmed)) {
      return null;
    }
    
    if (!/^https?:\/\//i.test(trimmed)) {
      trimmed = "https://" + trimmed;
    }
    return trimmed;
  };

  // Secure Shorten Stream Execution Engine
  const handleShorten = async () => {
    setUiError('');
    setUiSuccess('');
    
    const validatedUrl = validateAndFixUrl(url);
    if (!validatedUrl) {
      alert("Invalid Target URL format. Please supply a valid web link.");
      return;
    }

    const targetAlias = alias.trim().replace(/[^a-zA-Z0-9-_]/g, '');
    const finalAlias = targetAlias || generateSecureAlias();
    
    setActionLoading(true);

    try {
      // 3. Duplicate Protection Instance Verification Routing
      const aliasCheck = await getDocs(query(collection(db, "links"), where("alias", "==", finalAlias)));
      if (!aliasCheck.empty) {
        alert("This custom alias path is already taken. Please customize another alternative.");
        setActionLoading(false);
        return;
      }

      const generatedLinkPath = `${window.location.origin}?go=${finalAlias}`;
      const linkObject = { 
        userId: user.uid, 
        originalUrl: validatedUrl, 
        shortUrl: generatedLinkPath, 
        alias: finalAlias, 
        expiry: expiry || null, 
        clicks: 0,
        createdAt: new Date().toISOString()
      };

      // 6. Direct Database Reliability Check Guard
      await addDoc(collection(db, "links"), linkObject);
      
      setShortened(generatedLinkPath); 
      setUrl(''); 
      setAlias(''); 
      setExpiry('');
      setUiSuccess("Link shorten routing complete!");
      
      // Sync real-time updates safely
      loadLogs(user.uid);
    } catch (e) {
      console.error(e);
      alert("Database Synchronization Failure: " + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Native Ads Placement Matrix Array View Engine Component
  const SupremeAdPlacementMatrix = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '14px 0', width: '100%', maxWidth: '468px' }}>
      {[...Array(4)].map((_, i) => (
        <div key={`ban-${i}`} style={{ background: '#0a0915', padding: '8px', borderRadius: '8px', border: '1px solid #1c1a30', display: 'flex', justifyContent: 'center' }}>
          <iframe src="//rightyrely.com/watch.html?key=25e100bfe34eb21a597efa6547c53a2a" width="300" height="250" frameBorder="0" scrolling="no" style={{ maxWidth: '100%', border: 'none' }}></iframe>
        </div>
      ))}
      {[...Array(4)].map((_, i) => (
        <div key={`nat-${i}`} style={{ background: '#0a0915', padding: '12px', borderRadius: '8px', border: '1px solid #1c1a30', textAlign: 'center' }}>
          <div id="container-9a3ee810f662f820251422648340bfa6"></div>
          <span style={{ fontSize: '10px', color: '#4b5563' }}>Native Unit #{i+1}</span>
        </div>
      ))}
      {[...Array(4)].map((_, i) => (
        <button key={`smart-${i}`} onClick={() => window.open("https://rightyrely.com/t423kum4w?key=c6cfb7985a15d264407b4d6d80a97a0a", '_blank')} style={{ background: 'linear-gradient(90deg, #1e1b4b, #311042)', color: '#38bdf8', padding: '14px', border: '1px solid #4f46e5', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>⚡ MEDIA ACCESS CORE NODE SERVER #00{i+1}</button>
      ))}
    </div>
  );

  // 1. Professional Expired Error Page Interface Component
  if (isLinkExpiredPage) return (
    <div className="main-bg font flex-col center p-20" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#04030a', color: '#fff', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#0e0b20', padding: '40px 30px', borderRadius: '16px', border: '1px solid #ef4444', maxWidth: '440px', width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '50px', marginBottom: '16px' }}>⚠️</div>
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#ef4444', margin: '0 0 10px 0' }}>This Link Has Expired</h2>
        <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.5', margin: '0 0 24px 0' }}>The owner configuration parameters set for this instance tracking route parameter lifespan has reached its security validation deadline threshold.</p>
        <button onClick={() => window.location.replace(window.location.origin)} style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #4f46e5, #6366f1)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Go Back To Safety Hub</button>
      </div>
    </div>
  );

  // Traffic Gateway Landing View Engine Router Return Block
  if (rt) return (
    <div className="main-bg font flex-col center p-20">
      <style>{`.main-bg{background:#04030a;min-height:100vh;color:#fff;}.font{font-family:sans-serif;}.flex-col{display:flex;flex-direction:column;}.center{align-items:center;justify-content:center;}.p-20{padding:20px;}.card{background:#0e0b20;padding:25px;border-radius:16px;border:1px solid #1c1736;width:100%;max-width:420px;text-align:center;}.btn{width:100%;padding:14px;background:linear-gradient(135deg,#4f46e5,#6366f1);color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer;}.inp{width:100%;padding:12px;background:#04030a;border:1px solid #231c4f;border-radius:8px;color:#fff;box-sizing:border-box;margin-bottom:12px;outline:none;}`}</style>
      <div style={{padding:'6px 12px',borderRadius:'20px',background:'#0e0b20',color:'#a78bfa',fontSize:'12px',border:'1px solid #1f1938',marginBottom:'15px'}}>🔒 Security Verification Tunnel • Step {stage}/4</div>
      {stage !== 4 && <SupremeAdPlacementMatrix />}
      <div className="card">
        {tmr > 0 ? ( <div>🔄 Processing Traffic Metrics... <b style={{color:'#fbbf24'}}>{tmr}s</b></div> ) : (
          stage === 4 ? (
            <div>
              <div style={{background:'#1e40af',padding:'12px',borderRadius:'6px',marginBottom:'12px',fontSize:'13px'}}><a href={OFFICIAL_TELEGRAM_LINK} target="_blank" rel="noopener noreferrer" style={{color:'#fff',textDecoration:'none'}}>💬 Join Our Official Telegram Channel</a></div>
              <button className="btn" style={{background:'#10b981',boxShadow:'0 0 15px #10b981'}} onClick={() => window.location.replace(dest.trim())}>🚀 UNLOCK FINAL TARGET LINK</button>
            </div>
          ) : ( <button className="btn" onClick={() => { setStage(stage + 1); setTmr(stage + 1 === 4 ? 5 : 10); window.scrollTo({top:0,behavior:'smooth'}); }}>CONTINUE TO NEXT STEP ➡️</button> )
        )}
      </div>
      {stage !== 4 && <SupremeAdPlacementMatrix />}
    </div>
  );

  // Global Action Loading Experience Overlay Components
  if (isTokenFound) return <div style={{background:'#04030a',color:'#a78bfa',minHeight:'100vh',display:'flex',justifyContent:'center',alignItems:'center',fontFamily:'sans-serif'}}>🔒 Directing to Traffic Core Verification Instance...</div>;
  if (loading) return <div style={{background:'#04030a',color:'#6366f1',minHeight:'100vh',display:'flex',justifyContent:'center',alignItems:'center',fontFamily:'sans-serif'}}>🔄 Connecting Click To Earn Hub...</div>;

  // Sign In / Identity Authorization Components Form Layout View
  if (!user) return (
    <div className="main-bg font flex-col center p-20">
      <style>{`.main-bg{background:#04030a;min-height:100vh;color:#fff;}.font{font-family:sans-serif;}.flex-col{display:flex;flex-direction:column;}.center{align-items:center;justify-content:center;}.card{background:#09081d;padding:30px;border-radius:20px;border:1px solid #1a153a;width:100%;max-width:380px;box-sizing:border-box;}.btn{width:100%;padding:12px;background:#4f46e5;color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer;}.inp{width:100%;padding:12px;background:#04030a;border:1px solid #231c4f;border-radius:8px;color:#fff;box-sizing:border-box;margin-bottom:12px;outline:none;}.btn:disabled{opacity:0.6;cursor:not-allowed;}`}</style>
      <h1 style={{fontWeight:'900',fontSize:'26px',marginBottom:'20px',letterSpacing:'1px',textAlign:'center'}}>💸 CLICK TO EARN</h1>
      <div className="card">
        <h2 style={{textAlign:'center',color:'#a78bfa',margin:'0 0 20px 0',fontSize:'18px'}}>{isUp ? "Register Account" : "Identity Authorization Login"}</h2>
        
        {uiError && <p style={{color: '#ef4444', fontSize: '12px', textAlign: 'center', marginBottom: '10px'}}>{uiError}</p>}
        
        <input className="inp" type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} disabled={actionLoading} />
        <input className="inp" type="password" placeholder="Password" value={pass} onChange={e => setPass(e.target.value)} disabled={actionLoading} />
        
        <button className="btn" onClick={handleAuth} disabled={actionLoading}>
          {actionLoading ? "Processing Authorization..." : (isUp ? "Sign Up" : "Sign In")}
        </button>
        
        <p onClick={() => { if(!actionLoading) setIsUp(!isUp); }} style={{color:'#64748b',fontSize:'12px',textAlign:'center',marginTop:'15px',cursor:'pointer'}}>{isUp ? "Switch to Login" : "Create New Workspace Account"}</p>
      </div>
    </div>
  );

  // Main Authenticated Admin Workspace Interface Components 
  return (
    <div style={{backgroundColor:'#04030a',color:'#f1f5f9',minHeight:'100vh',fontFamily:'sans-serif'}}>
      <style>{`.box{background:#0a081d;padding:12px;border-radius:10px;border:1px solid #141130;text-align:center;}.inp{width:100%;padding:10px;background:#050311;border:1px solid #191438;border-radius:8px;color:#fff;box-sizing:border-box;margin-bottom:10px;outline:none;}.btn{width:100%;padding:12px;background:linear-gradient(90deg,#38bdf8,#a855f7);color:#fff;border:none;border-radius:8px;font-weight:800;cursor:pointer;}.btn:disabled{opacity:0.6;cursor:not-allowed;}`}</style>
      
      {/* Navbar Block Header Component */}
      <div style={{background:'#090818',padding:'14px 20px',borderBottom:'1px solid #14122d',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <button onClick={() => setSide(true)} style={{background:'#100e2b',border:'none',color:'#fff',padding:'8px 12px',borderRadius:'6px',cursor:'pointer'}}>☰</button>
          <span style={{fontWeight:'800',fontSize:'16px',letterSpacing:'0.5px'}}>💸 CLICK TO EARN</span>
        </div>
      </div>

      {/* Responsive Overlay Sidebar Component Drawer Block */}
      <div style={{position:'fixed',top:0,left:side?0:'-280px',width:'250px',height:'100vh',background:'#09081a',borderRight:'1px solid #14122d',transition:'0.3s ease',zIndex:999,padding:'20px',boxSizing:'border-box',display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
        <div>
          <h3 style={{color:'#818cf8',margin:'0 0 20px 0',fontSize:'16px'}}>CLICK TO EARN</h3>
          <div style={{dis
