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
  
  // URL Input States
  const [longUrl, setLongUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const [userLinks, setUserLinks] = useState([]);
  const [allSystemLinks, setAllSystemLinks] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [globalNetworkStats, setGlobalNetworkStats] = useState({ clicks: 0, earnings: 0, cpm: 3.00 });

  // Admin Variables
  const [adminCpm, setAdminCpm] = useState(3.00);
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
          setAdminCpm(Number(s.cpm || 3.00));
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
        if (curr.email.includes("admin")) { 
          setIsAdmin(true); 
          getDocs(collection(db, "links")).then(s => setAllSystemLinks(s.docs.map(d => ({id:d.id, ...d.data()})))); 
        }
        getDocs(query(collection(db, "links"), where("userId", "==", curr.uid))).then(snap => {
          let c = 0; const logs = []; snap.forEach(d => { logs.push({id:d.id, ...d.data()}); c += (d.data().clicks || 0); });
          setUserLinks(logs); setGlobalNetworkStats({ clicks: c, cpm: adminCpm, earnings: (c / 1000) * adminCpm });
        });
      } else { 
        setUser(null); 
        setIsAdmin(false); 
      }
      setAuthLoading(false);
    });
  }, [adminCpm]);

  const handleAuth = async () => {
    if (!email || !password) return alert("Fields missing!");
    try { 
      if (isSignUp) { 
        await createUserWithEmailAndPassword(auth, email, password); 
        setIsSignUp(false); 
      } else { 
        await signInWithEmailAndPassword(auth, email, password); 
      } 
    } catch (err) { 
      alert(err.message); 
    }
  };

  const handleShorten = async () => {
    if (!longUrl) return alert("Link missing!");
    const finalAlias = alias.trim() || Math.random().toString(36).substring(2, 7);
    await addDoc(collection(db, "links"), { 
      userId: user ? user.uid : "guest", 
      originalUrl: longUrl, 
      shortUrl: `${window.location.origin}?go=${finalAlias}`, 
      alias: finalAlias, 
      expiry: expiryDate,
      clicks: 0 
    });
    setLongUrl('');
    setAlias('');
    setExpiryDate('');
    alert("URL Shortened successfully!"); 
    setActiveTab('manage');
  };

  const AdPlacementBlockGroup = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '15px 0', width: '100%', maxWidth: '468px' }}>
      {[...Array(3)].map((_, i) => (
        <div key={i} style={{ background: '#0a0915', padding: '10px', borderRadius: '8px', border: '1px solid #1c1a30', display: 'flex', justifyContent: 'center' }}>
          <iframe src={`//${adminAdDomain}/watch.html?key=${adminBannerKey}`} width="468" height="60" frameBorder="0" scrolling="no" style={{ maxWidth: '100%', border: 'none' }}></iframe>
        </div>
      ))}
    </div>
  );

  if (authLoading) {
    return (
      <div style={{ backgroundColor: '#04030a', color: '#7c3aed', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif', fontWeight: 'bold' }}>
        🔄 Loading Network Parameters...
      </div>
    );
  }

  // Verification Screen Router
  if (isRoutingActive) {
    return (
      <div style={{ background: '#04030a', color: '#f3f4f6', minHeight: '100vh', padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ padding: '8px 16px', borderRadius: '30px', background: '#0e0b20', color: '#a78bfa', fontSize: '12px', fontWeight: '600', border: '1px solid #1f1938', marginBottom: '15px' }}>🔒 Cloud Secure Check • Link Stage {currentStage}/4</div>
        
        {currentStage !== 4 && <AdPlacementBlockGroup />}
        
        <div style={{ background: 'linear-gradient(145deg, #0d0a21, #04030a)', padding: '30px 20px', borderRadius: '16px', border: '1px solid #1c1736', width: '100%', maxWidth: '450px', textAlign: 'center', margin: '20px 0' }}>
          {stageTimer > 0 ? ( 
            <div style={{ fontSize: '17px', fontWeight: '700', color: '#e2e8f0' }}>
              🔄 Validating Destination Secure Node... <span style={{ color: '#d97706', fontSize: '22px' }}>{stageTimer}s</span>
            </div> 
          ) : (
            currentStage === 4 ? (
              <div>
                <div style={{ background: 'linear-gradient(90deg, #1d4ed8, #1e40af)', padding: '14px', borderRadius: '8px', color: '#fff', marginBottom: '16px', fontWeight: '600', fontSize: '13px' }}>
                  <a href="https://t.me/YOUR_CHANNEL" target="_blank" style={{ color: '#fff', textDecoration: 'none' }}>💬 Join Our Telegram Updates System Node</a>
                </div>
                <button onClick={() => window.location.replace(lockedDestinationUrl.trim().startsWith('http') ? lockedDestinationUrl.trim() : 'https://' + lockedDestinationUrl.trim())} style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #059669, #10b981)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '16px', cursor: 'pointer' }}>🚀 UNLOCK MAIN LINK</button>
              </div>
            ) : ( 
              <button onClick={() => { setCurrentStage(currentStage + 1); setStageTimer(currentStage + 1 === 4 ? 5 : 8); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '15px', cursor: 'pointer' }}>CONTINUE SYSTEM STEP ➡️</button> 
            )
          )}
        </div>
        
        {currentStage !== 4 && <AdPlacementBlockGroup />}
      </div>
    );
  }

  // LOGIN PAGE LAYOUT
  if (!user) {
    return (
      <div style={{ backgroundColor: '#04030a', color: '#f1f5f9', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px 16px' }}>
        <div style={{ background: 'linear-gradient(145deg, #0a081d, #04030a)', padding: '30px', borderRadius: '24px', border: '1px solid #1a153a', width: '100%', maxWidth: '400px', boxSizing: 'border-box', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '24px', fontSize: '22px', color: '#a78bfa', fontWeight: '800', letterSpacing: '0.5px' }}>
            {isSignUp ? "Sign Up Node" : "Login Dashboard"}
          </h2>
          <input type="email" placeholder="Email Address" style={{ width: '100%', padding: '12px', background: '#04030a', border: '1px solid #231c4f', borderRadius: '8px', color: '#fff', marginBottom: '12px', boxSizing: 'border-box', outline: 'none' }} value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Key Password" style={{ width: '100%', padding: '12px', background: '#04030a', border: '1px solid #231c4f', borderRadius: '8px', color: '#fff', marginBottom: '20px', boxSizing: 'border-box', outline: 'none' }} value={password} onChange={(e) => setPassword(e.target.value)} />
          <button onClick={handleAuth} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
            {isSignUp ? "Register Node" : "Access Console"}
          </button>
          <button onClick={() => setIsSignUp(!isSignUp)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '12px', width: '100%', marginTop: '16px', cursor: 'pointer' }}>
            {isSignUp ? "Have an account? Login" : "Create new portal layout"}
          </button>
        </div>
      </div>
    );
  }

  // MAIN CONTENT ROUTER WITH COMPACT HIGHLIGHTS
  return (
    <div style={{ backgroundColor: '#04030a', color: '#f1f5f9', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', position: 'relative', overflowX: 'hidden' }}>
      
      {/* HEADER SECTION BAR - EXACTLY LIKE URLKING */}
      <div style={{ background: '#090818', padding: '14px 20px', borderBottom: '1px solid #14122d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button onClick={() => setSidebarOpen(true)} style={{ background: '#100e2b', border: 'none', color: '#fff', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}>☰</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366f1, #d946ef)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>👑</span>
            <span style={{ fontWeight: '800', color: '#fff', fontSize: '18px', letterSpacing: '0.5px' }}>URLKING</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <span style={{ background: '#100e2b', color: '#818cf8', padding: '8px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', border: '1px solid #1b1747' }}>🔗 Links</span>
        </div>
      </div>

      {/* 🧭 SLIDING SIDEBAR COMPONENT (MATCHES GRAPHIC MATRIX) */}
      <div style={{ position: 'fixed', top: 0, left: sidebarOpen ? 0 : '-300px', width: '270px', height: '100vh', background: '#09081a', borderRight: '1px solid #14122d', transition: 'all 0.3s ease', zIndex: 999, padding: '20px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366f1, #d946ef)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👑</span>
              <span style={{ fontWeight: '800', fontSize: '18px' }}>URLKING</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '20px', cursor: 'pointer' }}>✕</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button onClick={() => { setActiveTab('home'); setSidebarOpen(false); }} style={{ textAlgin: 'left', textAlign: 'left', width: '100%', padding: '12px 16px', background: activeTab === 'home' ? 'linear-gradient(90deg, #18153c, #0d0b24)' : 'none', border: 'none', borderRadius: '10px', color: activeTab === 'home' ? '#818cf8' : '#94a3b8', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>📊 Statistics</button>
            <button onClick={() => { setActiveTab('manage'); setSidebarOpen(false); }} style={{ textAlgin: 'left', textAlign: 'left', width: '100%', padding: '12px 16px', background: activeTab === 'manage' ? 'linear-gradient(90deg, #18153c, #0d0b24)' : 'none', border: 'none', borderRadius: '10px', color: activeTab === 'manage' ? '#818cf8' : '#94a3b8', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>📁 Files & Links</button>
            {isAdmin && <button onClick={() => { setActiveTab('admin'); setSidebarOpen(false); }} style={{ textAlgin: 'left', textAlign: 'left', width: '100%', padding: '12px 16px', background: activeTab === 'admin' ? 'linear-gradient(90deg, #18153c, #0d0b24)' : 'none', border: 'none', borderRadius: '10px', color: '#f59e0b', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>⚙️ Admin Rules</button>}
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#0d0b22', padding: '12px', borderRadius: '12px', marginBottom: '15px' }}>
            <div style={{ width: '35px', height: '35px', background: '#312e81', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', fontWeight: 'bold' }}>L</div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '700' }}>lgdarkyt9101</div>
              <div style={{ fontSize: '11px', color: '#10b981' }}>● Online</div>
            </div>
          </div>
          <button onClick={() => signOut(auth)} style={{ width: '100%', padding: '10px', background: 'none', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>Logout</button>
        </div>
      </div>

      {/* HOME DASHBOARD PLATFORM VIEW */}
      {activeTab === 'home' && (
        <div style={{ padding: '20px 14px', maxWidth: '600px', margin: '0 auto' }}>
          
          <div style={{ marginBottom: '15px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 4px 0' }}>Dashboard</h2>
            <small style={{ color: '#64748b' }}>Track your performance.</small>
          </div>

          {/* 4x Grid Metric Blocks Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            <div style={{ background: '#0a081d', padding: '14px 16px', borderRadius: '14px', border: '1px solid #141130' }}>
              <small style={{ color: '#64748b', fontSize: '11px', fontWeight: '600' }}>💼 WALLET</small>
              <h3 style={{ margin: '6px 0 0 0', fontSize: '20px', fontWeight: '800' }}>${globalNetworkStats.earnings.toFixed(2)}</h3>
            </div>
            <div style={{ background: '#0a081d', padding: '14px 16px', borderRadius: '14px', border: '1px solid #141130' }}>
              <small style={{ color: '#64748b', fontSize: '11px', fontWeight: '600' }}>🔮 CPM</small>
              <h3 style={{ margin: '6px 0 0 0', fontSize: '20px', fontWeight: '800', color: '#818cf8' }}>${globalNetworkStats.cpm.toFixed(2)}</h3>
            </div>
            <div style={{ background: '#0a081d', padding: '14px 16px', borderRadius: '14px', border: '1px solid #141130' }}>
              <small style={{ color: '#64748b', fontSize: '11px', fontWeight: '600' }}>✅ TOTAL APPROVAL</small>
              <h3 style={{ margin: '6px 0 0 0', fontSize: '20px', fontWeight: '800', color: '#10b981' }}>$2.00</h3>
            </div>
            <div style={{ background: '#0a081d', padding: '14px 16px', borderRadius: '14px', border: '1px solid #141130' }}>
              <small style={{ color: '#64748b', fontSize: '11px', fontWeight: '600' }}>🏆 LIFETIME EARNING</small>
              <h3 style={{ margin: '6px 0 0 0', fontSize: '20px', fontWeight: '800', color: '#fbbf24' }}>$3.70</h3>
            </div>
          </div>

          {/* Premium Custom Gradient URL Shortener Wrapper */}
          <div style={{ background: 'linear-gradient(135deg, #0e163a, #2e1035)', padding: '24px 20px', borderRadius: '20px', border: '1px solid #231942', boxShadow: '0 8px 20px rgba(0,0,0,0.3)', marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>📝 Shorten New URL</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <input type="url" placeholder="Your URL Here (https://...)" style={{ width: '100%', padding: '12px 14px', background: '#050311', border: '1px solid #191438', borderRadius: '10px', color: '#fff', boxSizing: 'border-box', outline: 'none', fontSize: '13px' }} value={longUrl} onChange={(e) => setLongUrl(e.target.value)} />
              </div>
              
              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '6
