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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '10px 0', width: '100%' }}>
      {[...Array(3)].map((_, i) => (
        <div key={i} style={{ background: '#111c2e', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
          <iframe src={`//${adminAdDomain}/watch.html?key=${adminBannerKey}`} width="468" height="60" frameBorder="0" scrolling="no" style={{ maxWidth: '100%' }}></iframe>
        </div>
      ))}
      <button onClick={() => window.open(adminSmartLink, '_blank')} style={{ background: '#38bdf8', color: '#000', padding: '12px', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>⚡ FAST DOWNLOAD ACCESS</button>
    </div>
  );

  if (isRoutingActive) {
    return (
      <div style={{ background: '#070b12', color: '#e2e8f0', minHeight: '100vh', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ padding: '6px 12px', borderRadius: '20px', background: '#101726', color: '#38bdf8', fontSize: '12px' }}>🔒 Verification Step {currentStage}/4</div>
        {currentStage !== 4 && <AdPlacementBlockGroup />}
        <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b', width: '100%', maxWidth: '450px', textAlign: 'center', margin: '15px 0' }}>
          {stageTimer > 0 ? ( <div>🔄 Security Scanning... <span style={{ color: '#f59e0b' }}>{stageTimer}s</span></div> ) : (
            currentStage === 4 ? (
              <div>
                <div style={{ background: '#0284c7', padding: '12px', borderRadius: '6px', color: '#fff', marginBottom: '12px' }}><a href="https://t.me/YOUR_CHANNEL" target="_blank" style={{ color: '#fff' }}>💬 Join Our Telegram Updates Portal</a></div>
                <button onClick={() => window.location.replace(lockedDestinationUrl.trim().startsWith('http') ? lockedDestinationUrl.trim() : 'https://' + lockedDestinationUrl.trim())} style={{ width: '100%', padding: '14px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '800', cursor: 'pointer' }}>🚀 UNLOCK DESTINATION LINK</button>
              </div>
            ) : ( <button onClick={() => { setCurrentStage(currentStage + 1); setStageTimer(currentStage + 1 === 4 ? 5 : 8); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ width: '100%', padding: '12px', background: '#38bdf8', color: '#030712', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>CONTINUE ➡️</button> )
          )}
        </div>
        {currentStage !== 4 && <AdPlacementBlockGroup />}
        <footer style={{ fontSize: '11px', color: '#475d82', marginTop: '20px' }}>Copyright © Click To Earn 2026</footer>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#070b12', color: '#f1f5f9', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#0f172a', padding: '15px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: '800', color: '#38bdf8' }}>CLICK TO EARN</span>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setActiveTab('home')} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', fontSize: '12px' }}>Dashboard</button>
          <button onClick={() => setActiveTab('manage')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '12px' }}>Links</button>
          <button onClick={() => setActiveTab('profile')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '12px' }}>Account</button>
          {isAdmin && <button onClick={() => setActiveTab('admin')} style={{ background: '#f59e0b', color: '#000', border: 'none', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '800' }}>👑 Admin</button>}
        </div>
      </div>

      {activeTab === 'home' && (
        <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px', textAlign: 'center' }}>
            <div style={{ background: '#0f172a', padding: '10px', borderRadius: '6px' }}><small style={{color:'#64748b'}}>Clicks</small><br/><b>{globalNetworkStats.clicks}</b></div>
            <div style={{ background: '#0f172a', padding: '10px', borderRadius: '6px' }}><small style={{color:'#64748b'}}>CPM</small><br/><b style={{color:'#38bdf8'}}>${globalNetworkStats.cpm}</b></div>
            <div style={{ background: '#0f172a', padding: '10px', borderRadius: '6px' }}><small style={{color:'#64748b'}}>Balance</small><br/><b style={{color:'#10b981'}}>${globalNetworkStats.earnings.toFixed(3)}</b></div>
          </div>
          <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b' }}>
            <input type="url" placeholder="Paste target URL link..." style={{ width: '100%', padding: '10px', background: '#070b12', border: '1px solid #334155', borderRadius: '6px', color: '#fff', marginBottom: '10px', boxSizing:'border-box' }} value={longUrl} onChange={(e) => setLongUrl(e.target.value)} />
            <button onClick={handleShorten} style={{ width: '100%', padding: '10px', background: '#38bdf8', color: '#030712', border: 'none', borderRadius: '6px', fontWeight: '700' }}>Shorten Link Node</button>
          </div>
        </div>
      )}

      {activeTab === 'manage' && (
        <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ background: '#0f172a', padding: '15px', borderRadius: '12px' }}>
            {userLinks.map((l, i) => (
              <div key={i} style={{ background: '#070b12', padding: '8px', marginBottom: '8px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#38bdf8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '75%' }}>{l.shortUrl}</span>
                <button onClick={() => { navigator.clipboard.writeText(l.shortUrl); alert("Copied!"); }} style={{ background: '#38bdf8', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>Copy</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
          {!user ? (
            <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px' }}>
              <input type="email" placeholder="Email" style={{ width: '100%', padding: '10px', background: '#070b12', border: '1px solid #334155', borderRadius: '6px', color: '#fff', marginBottom: '10px', boxSizing:'border-box' }} value={email} onChange={(e) => setEmail(e.target.value)} />
              <input type="password" placeholder="Password" style={{ width: '100%', padding: '10px', background: '#070b12', border: '1px solid #334155', borderRadius: '6px', color: '#fff', marginBottom: '10px', boxSizing:'border-box' }} value={password} onChange={(e) => setPassword(e.target.value)} />
              <button onClick={handleAuth} style={{ width: '100%', padding: '10px', background: '#38bdf8', color: '#030712', border: 'none', borderRadius: '6px', fontWeight: '700' }}>{isSignUp ? "Register" : "Login"}</button>
              <button onClick={() => setIsSignUp(!isSignUp)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '11px', width: '100%', marginTop: '10px' }}>{isSignUp ? "Login Instead" : "Create Account"}</button>
            </div>
          ) : (
            <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
              <p style={{ fontSize: '13px' }}>{user.email}</p>
              <button onClick={() => signOut(auth)} style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700' }}>Logout</button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'admin' && isAdmin && (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ background: '#1e1b4b', padding: '20px', borderRadius: '12px', marginBottom: '15px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#f59e0b', fontSize: '15px' }}>👑 Supreme Matrix Panel</h3>
            <input type="number" placeholder="CPM Rate" style={{ width: '100%', padding: '8px', background: '#070b12', border: '1px solid #334155', borderRadius: '6px', color: '#fff', marginBottom: '8px' }} value={adminCpm} onChange={(e) => setAdminCpm(e.target.value)} />
            <input type="text" placeholder="Ad Domain" style={{ width: '100%', padding: '8px', background: '#070b12', border: '1px solid #334155', borderRadius: '6px', color: '#fff', marginBottom: '8px' }} value={adminAdDomain} onChange={(e) => setAdminAdDomain(e.target.value)} />
            <input type="text" placeholder="Banner Key" style={{ width: '100%', padding: '8px', background: '#070b12', border: '1px solid #334155', borderRadius: '6px', color: '#fff', marginBottom: '8px' }} value={adminBannerKey} onChange={(e) => setAdminBannerKey(e.target.value)} />
            <input type="text" placeholder="SmartLink Url" style={{ width: '100%', padding: '8px', background: '#070b12', border: '1px solid #334155', borderRadius: '6px', color: '#fff', marginBottom: '10px' }} value={adminSmartLink} onChange={(e) => setAdminSmartLink(e.target.value)} />
            <button onClick={() => setDoc(doc(db, "system", "settings"), { cpm: Number(adminCpm), adDomain: adminAdDomain, bannerKey: adminBannerKey, nativeKey: adminNativeKey, smartLink: adminSmartLink }).then(() => alert("Saved Rules Live!"))} style={{ width: '100%', padding: '10px', background: '#f59e0b', color: '#000', border: 'none', borderRadius: '6px', fontWeight: '800' }}>SAVE ENGINE PARAMETERS</button>
          </div>
          <div style={{ background: '#0f172a', padding: '15px', borderRadius: '12px', maxHeight: '180px', overflowY: 'auto' }}>
            {allSystemLinks.map((l, i) => ( <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', borderBottom: '1px solid #1e293b', padding: '4px 0' }}><span style={{color:'#94a3b8', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', width:'60%'}}>{l.shortUrl}</span><span style={{color:'#10b981'}}>Clicks: {l.clicks||0}</span></div> ))}
          </div>
        </div>
      )}
    </div>
  );
}
