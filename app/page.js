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
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [longUrl, setLongUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [justShortenedUrl, setJustShortenedUrl] = useState('');

  const [userLinks, setUserLinks] = useState([]);
  const [allSystemLinks, setAllSystemLinks] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [globalNetworkStats, setGlobalNetworkStats] = useState({ clicks: 0, earnings: 0, cpm: 3.00 });

  const [adminCpm, setAdminCpm] = useState(3.00);
  const [adminAdDomain, setAdminAdDomain] = useState("rightyrely.com");
  const [adminBannerKey, setAdminBannerKey] = useState("23591d15e448b5bf1900c3bf28352b68");
  const [adminSmartLink, setAdminSmartLink] = useState("https://rightyrely.com/zf7xraia?key=41a44697420ad362de39e8934daee4f3");

  const [isRoutingActive, setIsRoutingActive] = useState(false);
  const [currentStage, setCurrentStage] = useState(1);
  const [stageTimer, setStageTimer] = useState(10);
  const [lockedDestinationUrl, setLockedDestinationUrl] = useState('');

  useEffect(() => {
    getDoc(doc(db, "system", "settings")).then(s => {
      if (s.exists()) {
        const d = s.data(); setAdminCpm(Number(d.cpm || 3)); setAdminAdDomain(d.adDomain || "rightyrely.com");
        setAdminBannerKey(d.bannerKey || "23591d15e448b5bf1900c3bf28352b68"); setAdminSmartLink(d.smartLink || "");
      }
    });
  }, [isRoutingActive, activeTab]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = new URLSearchParams(window.location.search).get('go');
      if (token) {
        getDocs(query(collection(db, "links"), where("alias", "==", token))).then(snap => {
          if (!snap.empty) {
            const d = snap.docs[0]; setLockedDestinationUrl(d.data().originalUrl);
            setIsRoutingActive(true); setCurrentStage(1); setStageTimer(10);
            updateDoc(doc(db, "links", d.id), { clicks: (d.data().clicks || 0) + 1 });
          }
        });
      }
    }
  }, []);

  useEffect(() => {
    if (isRoutingActive && stageTimer > 0) {
      const run = setTimeout(() => setStageTimer(stageTimer - 1), 1000);
      return () => clearTimeout(run);
    }
  }, [isRoutingActive, stageTimer]);

  useEffect(() => {
    if (isRoutingActive) {
      if (currentStage !== 4 && !document.getElementById('ad-pop')) {
        const p = document.createElement('script'); p.id = 'ad-pop';
        p.src = `https://${adminAdDomain}/f0/02/71/f002719497291bd1aae6841c87eba4bf.js`; document.body.appendChild(p);
      } else if (currentStage === 4) document.getElementById('ad-pop')?.remove();
    }
  }, [isRoutingActive, currentStage, adminAdDomain]);

  useEffect(() => {
    return onAuthStateChanged(auth, (curr) => {
      if (curr) {
        setUser(curr); if (curr.email.includes("admin")) { setIsAdmin(true); getDocs(collection(db, "links")).then(s => setAllSystemLinks(s.docs.map(d => ({id:d.id, ...d.data()})))); }
        getDocs(query(collection(db, "links"), where("userId", "==", curr.uid))).then(snap => {
          let clk = 0; const tmp = []; snap.forEach(d => { tmp.push({id:d.id, ...d.data()}); clk += (d.data().clicks || 0); });
          setUserLinks(tmp); setGlobalNetworkStats({ clicks: clk, cpm: adminCpm, earnings: (clk / 1000) * adminCpm });
        });
      } else { setUser(null); setIsAdmin(false); }
      setAuthLoading(false);
    });
  }, [adminCpm]);

  const handleAuth = async () => {
    if (!email || !password) return alert("Missing fields!");
    try { if (isSignUp) { await createUserWithEmailAndPassword(auth, email, password); setIsSignUp(false); } else { await signInWithEmailAndPassword(auth, email, password); } } catch (e) { alert(e.message); }
  };

  const handleShorten = async () => {
    if (!longUrl) return alert("URL Missing!");
    const finalAlias = alias.trim() || Math.random().toString(36).substring(2, 7);
    const generatedPath = `${window.location.origin}?go=${finalAlias}`;
    await addDoc(collection(db, "links"), { userId: user.uid, originalUrl: longUrl, shortUrl: generatedPath, alias: finalAlias, expiry: expiryDate, clicks: 0 });
    setJustShortenedUrl(generatedPath);
    setLongUrl(''); setAlias(''); setExpiryDate('');
  };

  const AdIframeBlock = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '10px 0', width: '100%', maxWidth: '468px' }}>
      {[...Array(2)].map((_, i) => (
        <div key={i} style={{ background: '#0a0915', padding: '8px', borderRadius: '8px', border: '1px solid #1c1a30', display: 'flex', justifyContent: 'center' }}>
          <iframe src={`//${adminAdDomain}/watch.html?key=${adminBannerKey}`} width="468" height="60" frameBorder="0" scrolling="no" style={{ maxWidth: '100%', border: 'none' }}></iframe>
        </div>
      ))}
    </div>
  );

  if (authLoading) return <div style={{ background: '#04030a', color: '#6366f1', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif' }}>🔄 Loading Matrix...</div>;

  if (isRoutingActive) {
    return (
      <div style={{ background: '#04030a', color: '#fff', minHeight: '100vh', padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ padding: '6px 12px', borderRadius: '20px', background: '#0e0b20', color: '#a78bfa', fontSize: '12px', border: '1px solid #1f1938' }}>🔒 Checking Security • Stage {currentStage}/4</div>
        {currentStage !== 4 && <AdIframeBlock />}
        <div style={{ background: '#0e0b20', padding: '25px', borderRadius: '16px', border: '1px solid #1c1736', width: '100%', maxWidth: '420px', textAlign: 'center', margin: '20px 0' }}>
          {stageTimer > 0 ? ( <div>🔄 Verification Processing... <b style={{ color: '#fbbf24' }}>{stageTimer}s</b></div> ) : (
            currentStage === 4 ? (
              <div>
                <div style={{ background: '#1e40af', padding: '12px', borderRadius: '6px', marginBottom: '12px', fontSize: '13px' }}><a href="https://t.me/YOUR_CHANNEL" target="_blank" style={{ color: '#fff', textDecoration: 'none' }}>💬 Join Telegram Updates Channel</a></div>
                <button onClick={() => window.location.replace(lockedDestinationUrl.trim().startsWith('http') ? lockedDestinationUrl.trim() : 'https://' + lockedDestinationUrl.trim())} style={{ width: '100%', padding: '14px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '800', cursor: 'pointer' }}>🚀 UNLOCK TARGET LINK</button>
              </div>
            ) : ( <button onClick={() => { setCurrentStage(currentStage + 1); setStageTimer(currentStage + 1 === 4 ? 5 : 8); }} style={{ width: '100%', padding: '12px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>PROCEED STEP ➡️</button> )
          )}
        </div>
        {currentStage !== 4 && <AdIframeBlock />}
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ backgroundColor: '#04030a', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif', padding: '0 16px' }}>
        <h1 style={{ fontWeight: '900', color: '#fff', fontSize: '26px', marginBottom: '20px', letterSpacing: '1px' }}>💸 CLICK TO EARN</h1>
        <div style={{ background: '#09081d', padding: '30px', borderRadius: '20px', border: '1px solid #1a153a', width: '100%', maxWidth: '380px', boxSizing: 'border-box' }}>
          <h2 style={{ textAlign: 'center', color: '#a78bfa', margin: '0 0 20px 0', fontSize: '18px' }}>{isSignUp ? "Register Portal Profile" : "Identity Authorization Login"}</h2>
          <input type="email" placeholder="Email Address" style={{ width: '100%', padding: '12px', background: '#04030a', border: '1px solid #231c4f', borderRadius: '8px', color: '#fff', marginBottom: '12px', boxSizing: 'border-box' }} value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" style={{ width: '100%', padding: '12px', background: '#04030a', border: '1px solid #231c4f', borderRadius: '8px', color: '#fff', marginBottom: '20px', boxSizing: 'border-box' }} value={password} onChange={(e) => setPassword(e.target.value)} />
          <button onClick={handleAuth} style={{ width: '100%', padding: '12px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>{isSignUp ? "Sign Up Node" : "Sign In Router"}</button>
          <p onClick={() => setIsSignUp(!isSignUp)} style={{ color: '#64748b', fontSize: '12px', textAlign: 'center', marginTop: '15px', cursor: 'pointer' }}>{isSignUp ? "Switch to Login" : "Create New Workspace Account"}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#04030a', color: '#f1f5f9', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#090818', padding: '14px 20px', borderBottom: '1px solid #14122d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => setSidebarOpen(true)} style={{ background: '#100e2b', border: 'none', color: '#fff', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' }}>☰</button>
          <span style={{ fontWeight: '800', color: '#fff', fontSize: '16px', letterSpacing: '0.5px' }}>💸 CLICK TO EARN</span>
        </div>
        <span style={{ background: '#100e2b', color: '#818cf8', padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>Active Node</span>
      </div>

      <div style={{ position: 'fixed', top: 0, left: sidebarOpen ? 0 : '-280px', width: '250px', height: '100vh', background: '#09081a', borderRight: '1px solid #14122d', transition: '0.3s ease', zIndex: 999, padding: '20px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ color: '#818cf8', margin: '0 0 20px 0', fontSize: '16px' }}>CLICK TO EARN Menu</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button onClick={() => { setActiveTab('home'); setSidebarOpen(false); }} style={{ textAlign: 'left', width: '100%', padding: '10px', background: activeTab === 'home' ? '#18153c' : 'none', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer' }}>📊 Statistics</button>
            <button onClick={() => { setActiveTab('manage'); setSidebarOpen(false); }} style={{ textAlign: 'left', width: '100%', padding: '10px', background: activeTab === 'manage' ? '#18153c' : 'none', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer' }}>📁 Files & Links</button>
            {isAdmin && <button onClick={() => { setActiveTab('admin'); setSidebarOpen(false); }} style={{ textAlign: 'left', width: '100%', padding: '10px', background: activeTab === 'admin' ? '#18153c' : 'none', border: 'none', borderRadius: '6px', color: '#f59e0b', cursor: 'pointer' }}>👑 Admin Override</button>}
          </div>
        </div>
        <button onClick={() => signOut(auth)} style={{ width: '100%', padding: '8px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Logout</button>
      </div>

      {activeTab === 'home' && (
        <div style={{ padding: '20px 14px', maxWidth: '550px', margin: '0 auto' }}>
          <div style={{ marginBottom: '15px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '800', margin: '0' }}>Dashboard</h2>
            <small style={{ color: '#64748b' }}>Track your metrics performance logs.</small>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px', textAlign: 'center' }}>
            <div style={{ background: '#0a081d', padding: '12px', borderRadius: '10px', border: '1px solid #141130' }}><small style={{ color: '#64748b' }}>WALLET</small><h3 style={{ margin: '4px 0 0 0' }}>${globalNetworkStats.earnings.toFixed(2)}</h3></div>
            <div style={{ background: '#0a081d', padding: '12px', borderRadius: '10px', border: '1px solid #141130' }}><small style={{ color: '#64748b' }}>CPM</small><h3 style={{ margin: '4px 0 0 0', color: '#818cf8' }}>${globalNetworkStats.cpm.toFixed(2)}</h3></div>
            <div style={{ background: '#0a081d', padding: '12px', borderRadius: '10px', border: '1px solid #141130' }}><small style={{ color: '#64748b' }}>TOTAL APPROVAL</small><h3 style={{ margin: '4px 0 0 0', color: '#10b981' }}>$2.00</h3></div>
            <div style={{ background: '#0a081d', padding: '12px', borderRadius: '10px', border: '1px solid #141130' }}><small style={{ color: '#64748b' }}>LIFETIME EARNING</small><h3 style={{ margin: '4px 0 0 0', color: '#fbbf24' }}>$3.70</h3></div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #0e163a, #2e1035)', padding: '20px', borderRadius: '16px', border: '1px solid #231942' }}>
            <h4 style={{ margin: '0 0 12px 0' }}>📝 Shorten New URL Path</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input type="url" placeholder="Your URL Here (https://...)" style={{ width: '100%', padding: '10px', background: '#050311', border: '1px solid #191438', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }} value={longUrl} onChange={(e) => setLongUrl(e.target.value)} />
              <input type="text" placeholder="Alias (Optional)" style={{ width: '100%', padding: '10px', background: '#050311', border: '1px solid #191438', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }} value={alias} onChange={(e) => setAlias(e.target.value)} />
              <input type="date" style={{ width: '100%', padding: '10px', background: '#050311', border: '1px solid #191438', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }} value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
              <button onClick={handleShorten} style={{ width: '100%', padding: '12px', background: 'linear-gradient(90deg, #38bdf8, #a855f7)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '800', cursor: 'pointer' }}>Shorten ⚡</button>
            </div>
          </div>

          {/* 🔥 INSTANT ACTIONABLE COPY CARD */}
          {justShortenedUrl && (
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', padding: '16px', borderRadius: '12px', marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ overflow: 'hidden', width: '75%' }}>
                <small style={{ color: '#10b981', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>✓ LINK GENERATED CORRECTION INSTANCE:</small>
                <span style={{ fontSize: '13px', color: '#fff', whiteSpace: 'nowrap' }}>{justShortenedUrl}</span>
              </div>
              <button onClick={() => { navigator.clipboard.writeText(justShortenedUrl); alert("Copied successfully to dashboard clipboard!"); }} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>Copy Link</button>
            </div>
          )}

          <div style={{ background: '#0a081d', padding: '15px', borderRadius: '12px', border: '1px solid #141130', marginTop: '15px' }}>
            <small style={{ color: '#64748b' }}>TOTAL INTENSITY CLICKS</small>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '24px' }}>{globalNetworkStats.clicks}</h2>
          </div>
        </div>
      )}

      {activeTab === 'manage' && (
        <div style={{ padding: '20px 14px', maxWidth: '550px', margin: '0 auto' }}>
          <div style={{ background: '#0a081d', padding: '15px', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '14px', color: '#818cf8', margin: '0 0 12px 0' }}>📋 Storage Index History</h3>
            {userLinks.map((l, i) => (
              <div key={i} style={{ background: '#04030a', padding: '10px', marginBottom: '8px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '70%' }}>{l.shortUrl}</span>
                <button onClick={() => { navigator.clipboard.writeText(l.shortUrl); alert("Copied!"); }} style={{ background: '#312e81', border: 'none', color: '#818cf8', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Copy</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'admin' && isAdmin && (
        <div style={{ padding: '20px 14px', maxWidth: '550px', margin: '0 auto' }}>
          <div style={{ background: 'linear-gradient(145deg, #18113c, #090818)', padding: '20px', borderRadius: '12px' }}>
            <h3 style={{ color: '#f59e0b', margin: '0 0 12px 0', fontSize: '14px' }}>👑 Supreme Override Rules Settings</h3>
            <input type="number" placeholder="CPM Rate" style={{ width: '100%', padding: '10px', background: '#04030a', border: '1px solid #231c4f', borderRadius: '8px', color: '#fff', marginBottom: '8px', boxSizing: 'border-box' }} value={adminCpm} onChange={(e) => setAdminCpm(e.target.value)} />
            <input type="text" placeholder="Ad Domain" style={{ width: '100%', padding: '10px', background: '#04030a', border: '1px solid #231c4f', borderRadius: '8px', color: '#fff', marginBottom: '8px', boxSizing: 'border-box' }} value={adminAdDomain} onChange={(e) => setAdminAdDomain(e.target.value)} />
            <input type="text" placeholder="Banner Key" style={{ width: '100%', padding: '10px', background: '#04030a', border: '1px solid #231c4f', borderRadius: '8px', color: '#fff', marginBottom: '12px', boxSizing: 'border-box' }} value={adminBannerKey} onChange={(e) => setAdminBannerKey(e.target.value)} />
            <button onClick={() => setDoc(doc(db, "system", "settings"), { cpm: Number(adminCpm), adDomain: adminAdDomain, bannerKey: adminBannerKey, smartLink: adminSmartLink }).then(() => alert("Saved Rules Live!"))} style={{ width: '100%', padding: '10px', background: '#f59e0b', color: '#000', border: 'none', borderRadius: '6px', fontWeight: '800', cursor: 'pointer' }}>SAVE CORE PARAMETERS</button>
          </div>
          <div style={{ marginTop: '15px', background: '#0a081d', padding: '10px', borderRadius: '12px', maxHeight: '150px', overflowY: 'auto' }}>
            {allSystemLinks.map((l, i) => ( <div key={i} style={{ display: 'flex', just
