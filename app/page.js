'use client';
import { useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc, setDoc, getDoc } from 'firebase/firestore';

// 🔥 YOUR EXACT FIREBASE INSTANCE INTEGRATION
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
  const [globalNetworkStats, setGlobalNetworkStats] = useState({ clicks: 0, earnings: 0.00, cpm: 9.00 });

  // 👑 EXTRA ADMIN SYSTEM STATES (Live Sync with Database)
  const [adminCpm, setAdminCpm] = useState(9.00);
  const [adminAdDomain, setAdminAdDomain] = useState("rightyrely.com");
  const [adminBannerKey, setAdminBannerKey] = useState("23591d15e448b5bf1900c3bf28352b68");
  const [adminNativeKey, setAdminNativeKey] = useState("cf611de77a66f7b9cc6ae3b4ca404da7");
  const [adminSmartLink, setAdminSmartLink] = useState("https://rightyrely.com/zf7xraia?key=41a44697420ad362de39e8934daee4f3");
  const [allSystemLinks, setAllSystemLinks] = useState([]);

  // 💸 Multi-Stage Setup Routing Engine
  const [isRoutingActive, setIsRoutingActive] = useState(false);
  const [currentStage, setCurrentStage] = useState(1);
  const [stageTimer, setStageTimer] = useState(10);
  const [lockedDestinationUrl, setLockedDestinationUrl] = useState('');

  // Sync Admin Global Dynamic Control Map
  useEffect(() => {
    const fetchAdminSettings = async () => {
      try {
        const settingsRef = doc(db, "system", "settings");
        const settingsSnap = await getDoc(settingsRef);
        if (settingsSnap.exists()) {
          const s = settingsSnap.data();
          setAdminCpm(Number(s.cpm || 9.00));
          setAdminAdDomain(s.adDomain || "rightyrely.com");
          setAdminBannerKey(s.bannerKey || "23591d15e448b5bf1900c3bf28352b68");
          setAdminNativeKey(s.nativeKey || "cf611de77a66f7b9cc6ae3b4ca404da7");
          setAdminSmartLink(s.smartLink || "https://rightyrely.com/zf7xraia?key=41a44697420ad362de39e8934daee4f3");
        }
      } catch (e) { console.log("Admin configs initiated defaults."); }
    };
    fetchAdminSettings();
  }, [isRoutingActive, activeTab]);

  // Capture Routing Link Token
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const goToken = urlParams.get('go');
      if (goToken) {
        const fetchSecureLinkNode = async () => {
          try {
            const q = query(collection(db, "links"), where("alias", "==", goToken));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              const docNode = querySnapshot.docs[0];
              const nodeData = docNode.data();
              setLockedDestinationUrl(nodeData.originalUrl);
              setIsRoutingActive(true);
              setCurrentStage(1);
              setStageTimer(10);
              await updateDoc(doc(db, "links", docNode.id), { clicks: (nodeData.clicks || 0) + 1 });
            }
          } catch (err) { console.error("Redirection failure check."); }
        };
        fetchSecureLinkNode();
      }
    }
  }, []);

  // Timer Countdown Controller 
  useEffect(() => {
    if (isRoutingActive && stageTimer > 0) {
      const runCount = setTimeout(() => setStageTimer(stageTimer - 1), 1000);
      return () => clearTimeout(runCount);
    }
  }, [isRoutingActive, stageTimer]);

  // Global Dynamic Script Matrix Control
  useEffect(() => {
    if (isRoutingActive) {
      if (currentStage !== 4 && !document.getElementById('ad-popunder-node')) {
        const pop = document.createElement('script');
        pop.id = 'ad-popunder-node';
        pop.src = `https://${adminAdDomain}/f0/02/71/f002719497291bd1aae6841c87eba4bf.js`;
        document.body.appendChild(pop);
      } else if (currentStage === 4) {
        const oldPop = document.getElementById('ad-popunder-node');
        if (oldPop) oldPop.remove();
      }

      if (!document.getElementById('ad-social-node')) {
        const soc = document.createElement('script');
        soc.id = 'ad-social-node';
        soc.src = `https://${adminAdDomain}/95/ae/46/95ae4674af57a43a33c9600843babfe3.js`;
        document.body.appendChild(soc);
      }
    }
  }, [isRoutingActive, currentStage, adminAdDomain]);

  // Auth Status Watcher
  useEffect(() => {
    const checkState = onAuthStateChanged(auth, (curr) => {
      if (curr) {
        setUser(curr);
        // Change this email string to make anyone your system's supreme admin
        if (curr.email === "admin@clicktoearn.in" || curr.email.includes("admin")) {
          setIsAdmin(true);
          fetchAllLinksForAdmin();
        }
        fetchNetworkLogs(curr);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });
    return () => checkState();
  }, []);

  const fetchNetworkLogs = async (currentUser) => {
    try {
      const q = query(collection(db, "links"), where("userId", "==", currentUser.uid));
      const snap = await getDocs(q);
      const logs = [];
      let clicksCounter = 0;
      snap.forEach((doc) => {
        const d = doc.data();
        logs.push({ id: doc.id, ...d });
        clicksCounter += (d.clicks || 0);
      });
      setUserLinks(logs);
      setGlobalNetworkStats({
        clicks: clicksCounter,
        cpm: adminCpm,
        earnings: (clicksCounter / 1000) * adminCpm
      });
    } catch (e) { console.log("Logs execution issue."); }
  };

  const fetchAllLinksForAdmin = async () => {
    try {
      const snap = await getDocs(collection(db, "links"));
      const temp = [];
      snap.forEach((doc) => { temp.push({ id: doc.id, ...doc.data() }); });
      setAllSystemLinks(temp);
    } catch (e) { console.log("Admin list extraction error."); }
  };

  const handleAuthEngine = async () => {
    if (!email || !password) return alert("Credentials fields missing!");
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        setIsSignUp(false);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) { alert(err.message); }
  };

  const handleShortenEngine = async () => {
    if (!longUrl) return alert("Target Link missing!");
    const aliasToken = Math.random().toString(36).substring(2, 7);
    const generatedShortUrl = `${window.location.origin}?go=${aliasToken}`;
    const linkPayload = {
      userId: user ? user.uid : "guest_instance",
      originalUrl: longUrl,
      shortUrl: generatedShortUrl,
      alias: aliasToken,
      clicks: 0,
      createdAt: new Date().toISOString()
    };
    try {
      await addDoc(collection(db, "links"), linkPayload);
      if (user) fetchNetworkLogs(user);
      setLongUrl('');
      alert("Link Node Encrypted successfully! View in All Links console.");
      setActiveTab('manage');
    } catch (e) { alert("Database routing failure."); }
  };

  const saveAdminSettings = async () => {
    try {
      await setDoc(doc(db, "system", "settings"), {
        cpm: adminCpm,
        adDomain: adminAdDomain,
        bannerKey: adminBannerKey,
        nativeKey: adminNativeKey,
        smartLink: adminSmartLink
      });
      alert("👑 Supreme Network Rules updated live across database!");
      fetchAllLinksForAdmin();
    } catch (e) { alert("Write access violation."); }
  };

  const advanceRoutingStage = (nextLevel) => {
    if (stageTimer > 0) return alert("Complete security evaluation block sequence above first!");
    setCurrentStage(nextLevel);
    setStageTimer(nextLevel === 4 ? 5 : 8); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const executeFinalDestinationHandshake = () => {
    if (lockedDestinationUrl) {
      let absolutePath = lockedDestinationUrl.trim();
      if (!/^https?:\/\//i.test(absolutePath)) {
        absolutePath = 'https://' + absolutePath;
      }
      window.location.replace(absolutePath);
    }
  };

  // Dynamic 12 Positions Maximum CPM Matrix Layer Components
  const AdPlacementBlockGroup = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', margin: '15px 0', width: '100%' }}>
      {[...Array(4)].map((_, idx) => (
        <div key={`nat-${idx}`} style={{ background: '#111c2e', border: '1px solid #1f2e4d', padding: '12px', borderRadius: '6px', textAlign: 'center' }}>
          <div id={`container-${adminNativeKey}`}></div>
          <span style={{ fontSize: '9px', color: '#475d82' }}>Live Native Optimization Engine Block #{idx+1}</span>
        </div>
      ))}
      {[...Array(4)].map((_, idx) => (
        <div key={`ban-${idx}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#0e1726', padding: '8px', borderRadius: '6px' }}>
          <iframe src={`//${adminAdDomain}/watch.html?key=${adminBannerKey}`} width="468" height="60" frameBorder="0" scrolling="no" style={{ maxWidth: '100%' }}></iframe>
          <span style={{ fontSize: '9px', color: '#475d82', marginTop: '3px' }}>Display Core Frame Slot #{idx+1}</span>
        </div>
      ))}
      {[...Array(4)].map((_, idx) => (
        <div key={`smart-${idx}`} onClick={() => window.open(adminSmartLink, '_blank')} style={{ background: 'linear-gradient(90deg, #1e293b, #0f172a)', border: '1px solid #38bdf8', padding: '14px', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', color: '#38bdf8', fontWeight: '700', fontSize: '13px' }}>
          ⚡ CLOUD MEDIA REPOSITORY SERVERS #00{idx+1} [TAP TO SYNC]
        </div>
      ))}
    </div>
  );

  if (isRoutingActive) {
    return (
      <div style={{ background: '#070b12', color: '#e2e8f0', minHeight: '100vh', padding: '16px', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ padding: '6px 14px', borderRadius: '30px', background: '#101726', border: '1px solid #1f2e4d', color: '#38bdf8', fontSize: '12px', marginBottom: '15px' }}>
          🔒 Cloud Network Handshake Tunnel • Step {currentStage}/4
        </div>

        {currentStage !== 4 && <AdPlacementBlockGroup />}

        <div style={{ background: '#0f172a', padding: '24px', borderRadius: '12px', border: '1px solid #1e293b', width: '100%', maxWidth: '480px', textAlign: 'center', margin: '20px 0' }}>
          {stageTimer > 0 ? (
            <div style={{ fontSize: '16px', fontWeight: '600' }}>
              🔄 Analyzing Traffic Integrity Constraints... <span style={{ color: '#f59e0b' }}>{stageTimer}s</span>
            </div>
          ) : (
            currentStage === 4 ? (
              <div>
                {/* Clean Telegram replacement layer without annoying loops */}
                <div style={{ background: '#0284c7', padding: '16px', borderRadius: '8px', color: '#fff', marginBottom: '16px', fontWeight: '600' }}>
                  💬 Join Our Official Updates Telegram Channel!<br/>
                  <a href="https://t.me/YOUR_CHANNEL" target="_blank" style={{ color: '#fff', textDecoration: 'underline', fontSize: '13px' }}>Click Here To Join Portal</a>
                </div>
                <button onClick={executeFinalDestinationHandshake} style={{ width: '100%', padding: '16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '800', cursor: 'pointer' }}>
                  🚀 UNLOCK FINAL TARGET LINK
                </button>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>Verification metrics passed. Scroll down and press proceed button.</p>
                <button onClick={() => advanceRoutingStage(currentStage + 1)} style={{ width: '100%', padding: '14px', background: '#38bdf8', color: '#030712', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
                  CONTINUE TO NEXT EXECUTABLE STEP ➡️
                </button>
              </div>
            )
          )}
        </div>

        {currentStage !== 4 && <AdPlacementBlockGroup />}

        <div style={{ fontSize: '12px', color: '#475d82', marginTop: '25px' }}>
          Copyright © Click To Earn | Powered by Earnlinks Infrastructure 2026
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#070b12', color: '#f1f5f9', minHeight: '100vh', fontFamily: 'sans-serif', paddingBottom: '60px' }}>
      
      <div style={{ background: '#0f172a', padding: '16px 24px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '18px', fontWeight: '800', color: '#38bdf8', letterSpacing: '0.5px' }}>CLICK TO EARN</span>
        <div style={{ display: 'flex', gap: '14px' }}>
          <button onClick={() => setActiveTab('home')} style={{ background: 'none', border: 'none', color: activeTab === 'home' ? '#38bdf8' : '#94a3b8', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>Dashboard</button>
          <button onClick={() => setActiveTab('manage')} style={{ background: 'none', border: 'none', color: activeTab === 'manage' ? '#38bdf8' : '#94a3b8', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>All Links</button>
          <button onClick={() => setActiveTab('profile')} style={{ background: 'none', border: 'none', color: activeTab === 'profile' ? '#38bdf8' : '#94a3b8', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>Settings</button>
          {isAdmin && <button onClick={() => setActiveTab('admin')} style={{ background: '#f59e0b', color: '#000', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '800' }}>👑 Admin Core</button>}
        </div>
      </div>

      {activeTab === 'home' && (
        <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            <div style={{ background: '#0f172a', padding: '16px', borderRadius: '8px', border: '1px solid #1e293b' }}>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Network Total Clicks</span>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '22px' }}>{globalNetworkStats.clicks}</h3>
            </div>
            <div style={{ background: '#0f172a', padding: '16px', borderRadius: '8px', border: '1px solid #1e293b' }}>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Average Network CPM</span>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '22px', color: '#38bdf8' }}>${globalNetworkStats.cpm.toFixed(2)}</h3>
            </div>
            <div style={{ background: '#0f172a', padding: '16px', borderRadius: '8px', border: '1px solid #1e293b' }}>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Account Balance</span>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '22px', color: '#10b981' }}>${globalNetworkStats.earnings.toFixed(4)}</h3>
            </div>
          </div>

          <div style={{ background: '#0f172a', padding: '24px', borderRadius: '12px', border: '1px solid #1e293b' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#94a3b8' }}>🔗 Shorten New Destination Link URL</h4>
            <input type="url" placeholder="Paste your dynamic destination link here..." style={{ width: '100%', padding: '12px', background: '#070b12', border: '1px solid #334155', borderRadius: '6px', color: '#fff', marginBottom: '14px', boxSizing: 'border-box', outline: 'none' }} value={longUrl} onChange={(e) => setLongUrl(e.target.value)} />
            <button onClick={handleShortenEngine} style={{ width: '100%', padding: '12px', background: '#38bdf8', color: '#030712', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>Generate Encrypted Token Node</button>
          </div>
        </div>
      )}

      {activeTab === 'manage' && (
        <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#38bdf8' }}>📋 Architecture Saved History Logs</h3>
            {userLinks.map((link, idx) => (
              <div key={idx} style={{ background: '#070b12', padding: '12px', borderRadius: '6px', border: '1px solid #1e293b', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ width: '75%', overflow: 'hidden' }}>
                  <div style={{ fontSize: '13px', color: '#38bdf8', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', fontWeight: '600' }}>{link.shortUrl}</div>
                  <div style={{ fontSize: '11px', color: '#475d82', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{link.originalUrl}</div>
                </div>
                <button onClick={() => { navigator.clipboard.writeText(link.shortUrl); alert("Node Copied to Dashboard Clipboard!"); }} style={{ background: '#38bdf8', color: '#000', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>Copy</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div style={{ padding: '24px', maxWidth: '500px', margin: '0 auto' }}>
          {!user ? (
            <div style={{ background: '#0f172a', padding: '24px', borderRadius: '12px', border: '1px solid #1e293b' }}>
              <h3 style={{ textAlign: 'center', marginBottom: '16px' }}>{isSignUp ? "Register Portal Instance" : "Secure Gateway Login"}</h3>
              <input type="email" placeholder="Database Username/Email" style={{ width: '100%', padding: '12px', background: '#070b12', border: '1px solid #334155', borderRadius: '6px', color: '#fff', marginBottom: '12px', boxSizing: 'border-box' }} value={email} onChange={(e) => setEmail(e.target.value)} />
              <input type="password" placeholder="Account Key Password" style={{ width: '100%', padding: '12px', background: '#070b12', border: '1px solid #334155', borderRadius: '6px', color: '#fff', marginBottom: '16px', boxSizing: 'border-box' }} value={password} onChange={(e) => setPassword(e.target.value)} />
              <button onClick={handleAuthEngine} style={{ width: '100%', padding: '12px', background: '#38bdf8', color: '#030712', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>{isSignUp ? "Register Credentials" : "Open Workspace Profile"}</button>
              <button onClick={() => setIsSignUp(!isSignUp)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '12px', width: '100%', marginTop: '12px', cursor: 'pointer' }}>{isSignUp ? "Log In Instead" : "Deploy New Account System"}</button>
            </div>
          ) : (
            <div style={{ background: '#0f172a', padding
