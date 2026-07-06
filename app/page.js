'use client';
import { useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc, setDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD3Yl0BR4o6qEX6MeXYjX6Qjlr5BCid5C8",
  authDomain: "my-website-242fc.firebaseapp.com",
  projectId: "my-website-242fc",
  storageBucket: "my-website-242fc.firebasestorage.app",
  messagingSenderId: "78108710064",
  appId: "1:78108710064:web:7b5e79f33721fbc7f71775"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function ClickToEarnUltimate() {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [longUrl, setLongUrl] = useState('');
  const [userLinks, setUserLinks] = useState([]);
  const [allSystemLinks, setAllSystemLinks] = useState([]);
  const [globalNetworkStats, setGlobalNetworkStats] = useState({ clicks: 0, earnings: 0, cpm: 9 });

  const [adminCpm, setAdminCpm] = useState(9);
  const [adminAdDomain, setAdminAdDomain] = useState("rightyrely.com");
  const [adminBannerKey, setAdminBannerKey] = useState("23591d15e448b5bf1900c3bf28352b68");
  const [adminNativeKey, setAdminNativeKey] = useState("cf611de77a66f7b9cc6ae3b4ca404da7");
  const [adminSmartLink, setAdminSmartLink] = useState("https://rightyrely.com/zf7xraia?key=41a44697420ad362de39e8934daee4f3");

  const [isRoutingActive, setIsRoutingActive] = useState(false);
  const [currentStage, setCurrentStage] = useState(1);
  const [stageTimer, setStageTimer] = useState(10);
  const [lockedDestinationUrl, setLockedDestinationUrl] = useState('');

  useEffect(() => {
    const fetchAdminSettings = async () => {
      try {
        const settingsSnap = await getDoc(doc(db, "system", "settings"));
        if (settingsSnap.exists()) {
          const s = settingsSnap.data();
          setAdminCpm(Number(s.cpm || 9));
          setAdminAdDomain(s.adDomain || "rightyrely.com");
          setAdminBannerKey(s.bannerKey || "23591d15e448b5bf1900c3bf28352b68");
          setAdminNativeKey(s.nativeKey || "cf611de77a66f7b9cc6ae3b4ca404da7");
          setAdminSmartLink(s.smartLink || "https://rightyrely.com/zf7xraia?key=41a44697420ad362de39e8934daee4f3");
        }
      } catch (e) {}
    };
    fetchAdminSettings();
  }, [isRoutingActive, activeTab]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const goToken = new URLSearchParams(window.location.search).get('go');
      if (goToken) {
        getDocs(query(collection(db, "links"), where("alias", "==", goToken))).then((snap) => {
          if (!snap.empty) {
            const docNode = snap.docs[0];
            setLockedDestinationUrl(docNode.data().originalUrl);
            setIsRoutingActive(true);
            setCurrentStage(1);
            setStageTimer(10);
            updateDoc(doc(db, "links", docNode.id), { clicks: (docNode.data().clicks || 0) + 1 });
          }
        });
      }
    }
  }, []);

  useEffect(() => {
    if (isRoutingActive && stageTimer > 0) {
      const runCount = setTimeout(() => setStageTimer(stageTimer - 1), 1000);
      return () => clearTimeout(runCount);
    }
  }, [isRoutingActive, stageTimer]);

  useEffect(() => {
    if (isRoutingActive) {
      if (currentStage !== 4 && !document.getElementById('ad-popunder-node')) {
        const pop = document.createElement('script'); pop.id = 'ad-popunder-node';
        pop.src = `https://${adminAdDomain}/f0/02/71/f002719497291bd1aae6841c87eba4bf.js`;
        document.body.appendChild(pop);
      } else if (currentStage === 4) { document.getElementById('ad-popunder-node')?.remove(); }
      if (!document.getElementById('ad-social-node')) {
        const soc = document.createElement('script'); soc.id = 'ad-social-node';
        soc.src = `https://${adminAdDomain}/95/ae/46/95ae4674af57a43a33c9600843babfe3.js`;
        document.body.appendChild(soc);
      }
    }
  }, [isRoutingActive, currentStage, adminAdDomain]);

  useEffect(() => {
    return onAuthStateChanged(auth, (curr) => {
      if (curr) {
        setUser(curr);
        if (curr.email.includes("admin")) { setIsAdmin(true); getDocs(collection(db, "links")).then(s => setAllSystemLinks(s.docs.map(d => ({id:d.id, ...d.data()})))); }
        getDocs(query(collection(db, "links"), where("userId", "==", curr.uid))).then(snap => {
          let c = 0; const logs = []; snap.forEach(d => { logs.push({id:d.id, ...d.data()}); c += (d.data().clicks || 0); });
          setUserLinks(logs); setGlobalNetworkStats({ clicks: c, cpm: adminCpm, earnings: (c / 1000) * adminCpm });
        });
      } else { setUser(null); setIsAdmin(false); }
    });
  }, [adminCpm]);

  const handleAuth = async () => {
    if (!email || !password) return alert("Fields missing!");
    try { if (isSignUp) { await createUserWithEmailAndPassword(auth, email, password); setIsSignUp(false); } else { await signInWithEmailAndPassword(auth, email, password); } } catch (err) { alert(err.message); }
  };

  const handleShorten = async () => {
    if (!longUrl) return alert("Link missing!");
    const tok = Math.random().toString(36).substring(2, 7);
    await addDoc(collection(db, "links"), { userId: user ? user.uid : "guest", originalUrl: longUrl, shortUrl: `${window.location.origin}?go=${tok}`, alias: tok, clicks: 0 });
    setLongUrl(''); alert("Encrypted successfully!"); setActiveTab('manage');
  };

  const AdPlacementBlockGroup = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '15px 0', width: '100%', maxWidth: '468px' }}>
      {[...Array(3)].map((_, i) => (
        <div key={i} style={{ background: '#111928', padding: '10px', borderRadius: '8px', border: '1px solid #1f2a37', display: 'flex', justifyContent: 'center' }}>
          <iframe src={`//${adminAdDomain}/watch.html?key=${adminBannerKey}`} width="468" height="60" frameBorder="0" scrolling="no" style={{ maxWidth: '100%', border: 'none' }}></iframe>
        </div>
      ))}
      <button onClick={() => window.open(adminSmartLink, '_blank')} style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: '#fff', padding: '14px', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)', letterSpacing: '0.5px' }}>⚡ INSTANT CLOUD ACCESS SYSTEM</button>
    </div>
  );

  if (isRoutingActive) {
    return (
      <div style={{ background: '#0b1329', color: '#f3f4f6', minHeight: '100vh', padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ padding: '8px 16px', borderRadius: '30px', background: '#1e293b', color: '#38bdf8', fontSize: '12px', fontWeight: '600', border: '1px solid #334155', marginBottom: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>🔒 Secure Verification Tunnel • Step {currentStage}/4</div>
        
        {currentStage !== 4 && <AdPlacementBlockGroup />}
        
        <div style={{ background: 'linear-gradient(145deg, #111c44, #0b1329)', padding: '30px 20px', borderRadius: '16px', border: '1px solid #1e293b', width: '100%', maxWidth: '450px', textAlign: 'center', margin: '20px 0', boxShadow: '0 10px 25px rgba(0,0,0,0.4)' }}>
          {stageTimer > 0 ? ( 
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#f1f5f9' }}>
              🔄 Anti-Bot Scanning... <span style={{ color: '#f59e0b', fontSize: '22px' }}>{stageTimer}s</span>
            </div> 
          ) : (
            currentStage === 4 ? (
              <div>
                <div style={{ background: 'linear-gradient(90deg, #0284c7, #0369a1)', padding: '14px', borderRadius: '8px', color: '#fff', marginBottom: '16px', fontWeight: '600', fontSize: '14px', boxShadow: '0 4px 10px rgba(2, 132, 199, 0.2)' }}>
                  <a href="https://t.me/YOUR_CHANNEL" target="_blank" style={{ color: '#fff', textDecoration: 'none', display: 'block' }}>💬 Join Our Official Telegram Updates Portal</a>
                </div>
                <button onClick={() => window.location.replace(lockedDestinationUrl.trim().startsWith('http') ? lockedDestinationUrl.trim() : 'https://' + lockedDestinationUrl.trim())} style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '16px', cursor: 'pointer', boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)' }}>🚀 UNLOCK TARGET DESTINATION</button>
              </div>
            ) : ( 
              <button onClick={() => { setCurrentStage(currentStage + 1); setStageTimer(currentStage + 1 === 4 ? 5 : 8); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg, #38bdf8, #0284c7)', color: '#030712', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(56, 189, 248, 0.3)' }}>CONTINUE TO NEXT PAGE ➡️</button> 
            )
          )}
        </div>
        
        {currentStage !== 4 && <AdPlacementBlockGroup />}
        <footer style={{ fontSize: '12px', color: '#4b5563', marginTop: '30px', letterSpacing: '0.5px' }}>Copyright © Click To Earn 2026</footer>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#060b18', color: '#f1f5f9', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Premium Glassmorphic Header */}
      <div style={{ background: '#0b1329', padding: '18px 24px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
        <span style={{ fontWeight: '900', color: '#38bdf8', fontSize: '20px', letterSpacing: '1px', textShadow: '0 0 10px rgba(56,189,248,0.2)' }}>CLICK TO EARN</span>
        <div style={{ display: 'flex', gap: '8px', background: '#111928', padding: '4px', borderRadius: '8px', border: '1px solid #1f2a37' }}>
          <button onClick={() => setActiveTab('home')} style={{ background: activeTab === 'home' ? '#1e293b' : 'none', border: 'none', color: activeTab === 'home' ? '#38bdf8' : '#94a3b8', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s' }}>Dashboard</button>
          <button onClick={() => setActiveTab('manage')} style={{ background: activeTab === 'manage' ? '#1e293b' : 'none', border: 'none', color: activeTab === 'manage' ? '#38bdf8' : '#94a3b8', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s' }}>Links</button>
          <button onClick={() => setActiveTab('profile')} style={{ background: activeTab === 'profile' ? '#1e293b' : 'none', border: 'none', color: activeTab === 'profile' ? '#38bdf8' : '#94a3b8', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s' }}>Account</button>
          {isAdmin && <button onClick={() => setActiveTab('admin')} style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#000', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>👑 Control</button>}
        </div>
      </div>

      {/* DASHBOARD TAB CONTROLS */}
      {activeTab === 'home' && (
        <div style={{ padding: '24px 16px', maxWidth: '600px', margin: '0 auto' }}>
          
          {/* Neon Statistics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '24px' }}>
            <div style={{ background: 'linear-gradient(145deg, #0f172a, #0b1329)', padding: '16px', borderRadius: '12px', border: '1px solid #1e293b', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.15)' }}>
              <small style={{color:'#64748b', fontSize:'11px', fontWeight:'600', textTransform:'uppercase'}}>Total Clicks</small>
              <h2 style={{ margin: '6px 0 0 0', color: '#fff', fontSize: '24px', fontWeight: '800' }}>{globalNetworkStats.clicks}</h2>
            </div>
            <div style={{ background: 'linear-gradient(145deg, #0f172a, #0b1329)', padding: '16px', borderRadius: '12px', border: '1px solid #1e293b', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.15)' }}>
              <small style={{color:'#64748b', fontSize:'11px', fontWeight:'600', textTransform:'uppercase'}}>Dynamic CPM</small>
              <h2 style={{ margin: '6px 0 0 0', color: '#38bdf8', fontSize: '24px', fontWeight: '800' }}>${globalNetworkStats.cpm}</h2>
            </div>
            <div style={{ background: 'linear-gradient(145deg, #0f172a, #0b1329)', padding: '16px', borderRadius: '12px', border: '1px solid #1e293b', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.15)' }}>
              <small style={{color:'#64748b', fontSize:'11px', fontWeight:'600', textTransform:'uppercase'}}>Wallet Balance</small>
              <h2 style={{ margin: '6px 0 0 0', color: '#10b981', fontSize: '24px', fontWeight: '800' }}>${globalNetworkStats.earnings.toFixed(3)}</h2>
            </div>
          </div>

          {/* Premium Form Design */}
          <div style={{ background: 'linear-gradient(145deg, #0f172a, #0b1329)', padding: '26px', borderRadius: '16px', border: '1px solid #1e293b', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#94a3b8', fontWeight: '600' }}>🔗 Create Short Encrypted Link URL</h4>
            <input type="url" placeholder="Paste your long destination path here..." style={{ width: '100%', padding: '14px', background: '#060b18', border: '1px solid #334155', borderRadius: '8px', color: '#fff', marginBottom: '14px', boxSizing: 'border-box', outline: 'none', fontSize: '14px', transition: 'border 0.2s' }} value={longUrl} onChange={(e) => setLongUrl(e.target.value)} />
            <button onClick={handleShorten} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #38bdf8, #0284c7)', color: '#030712', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(56, 189, 248, 0.2)', transition: 'all 0.2s' }}>Shorten Link Node</button>
          </div>
        </div>
      )}

      {/* LINKS LOGS MANAGEMENT LIST */}
      {activeTab === 'manage' && (
        <div style={{ padding: '24px 16px', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ background: '#0f172a', padding: '20px', borderRadius: '16px', border: '1px solid #1e293b', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#38bdf8', fontWeight: '700' }}>📋 Active Encrypted Network History Logs</h3>
            {userLinks.length === 0 && <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center' }}>No links generated on this core instance layer.</p>}
            {userLinks.map((l, i) => (
              <div key={i} style={{ background: '#060b18', padding: '14px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '75%', fontWeight: '500' }}>{l.shortUrl}</span>
                <button onClick={() => { navigator.clipboard.writeText(l.shortUrl); alert("Copied!"); }} style={{ background: '#38bdf8', border: 'none', color: '#000', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>Copy</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ACCOUNT AUTHORIZATION PROFILE */}
      {activeTab === 'profile' && (
        <div style={{ padding: '24px 16px', maxWidth: '450px', margin: '0 auto' }}>
          {!user ? (
            <div style={{ background: '#0f172a', padding: '26px', borderRadius: '16px', border: '1px solid #1e293b', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}>
              <h3 style={{ textAlign: 'center', marginBottom: '18px', fontSize: '16px', color: '#38bdf8' }}>{isSignUp ? "Create Secure Account" : "Identity Portal Access"}</h3>
              <input type="email" placeholder="Database Email Address" style={{ width: '100%', padding: '12px', background: '#060b18', border: '1px solid #334155', borderRadius: '8px', color: '#fff', marginBottom: '12px', boxSizing: 'border-box', outline: 'none' }} value={email} onChange={(e) => setEmail(e.target.value)} />
              <input type="password" placeholder="System Auth Password" style={{ width: '100%', padding: '12px', background: '#060b18', border: '1px solid #334155', borderRadius: '8px', color: '#fff', marginBottom: '16px', boxSizing: 'border-box', outline: 'none' }} value={password} onChange={(e) => setPassword(e.target.value)} />
              <button onClick={handleAuth} style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #38bdf8, #0284c7)', color: '#030712', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>{isSignUp ? "Deploy Node Signature" : "Access Console Dashboard"}</button>
              <button onClick={() => setIsSignUp(!isSignUp)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '12px', width: '100%', marginTop: '12px', cursor: 'pointer' }}>{isSignUp ? "Already registered? Login Node" : "Request New Profile Framework"}</button>
            </div>
          ) : (
            <div style={{ background: '#0f172a', padding: '24px', borderRadius: '16px', border: '1px solid #1e293b', textAlign: 'center' }}>
              <div style={{ width: '50px', height: '50px', background: '#1e293b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto', border: '2px solid #38bdf8', color: '#38bdf8', fontWeight: 'bold' }}>U</div>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9', marginBottom: '20px' }}>{user.email}</p>
              <button onClick={() => signOut(auth)} style={{ padding: '10px 22px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)' }}>Revoke Database Connection</button>
            </div>
          )}
        </div>
      )}

      {/* ADMIN LEVEL SUPREME CORE OVERVIEW */}
      {activeTab === 'admin' && isAdmin && (
        <div style={{ padding: '24px 16px', maxWidth: '650px', margin: '0 auto' }}>
          <div style={{ background: 'linear-gradient(145deg, #1e1b4b, #0f172a)', padding: '24px', borderRadius: '16px', border: '1px solid #4338ca', marginBottom: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#f59e0b', fontSize: '16px', fontWeight: '800' }}>👑 Supreme Matrix Configuration Panel</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>Global Traffic CPM ($)</label>
                <input type="number" style={{ width: '100%', padding: '10px', background: '#060b18', border: '1px solid #334155', borderRadius: '8px', color: '#fff', marginTop: '4px', 
