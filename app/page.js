'use client';
import { useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';

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

export default function ClickToEarnUltimate() {
  const [tab, setTab] = useState('home');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [isUp, setIsUp] = useState(false);
  const [url, setUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [expiry, setExpiry] = useState('');
  const [shortened, setShortened] = useState('');
  const [links, setLinks] = useState([]);
  const [side, setSide] = useState(false);
  const [stats, setStats] = useState({ clk: 0, earn: 0, cpm: 3.0 });
  const [rt, setRt] = useState(false), [stage, setStage] = useState(1), [tmr, setTmr] = useState(10), [dest, setDest] = useState('');
  const [isTokenFound, setIsTokenFound] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const tok = new URLSearchParams(window.location.search).get('go');
      if (tok) {
        setIsTokenFound(true);
        getDocs(query(collection(db, "links"), where("alias", "==", tok))).then(snap => {
          if (!snap.empty) {
            const d = snap.docs[0]; setDest(d.data().originalUrl); setRt(true); setStage(1); setTmr(10);
            updateDoc(doc(db, "links", d.id), { clicks: (d.data().clicks || 0) + 1 });
          } else { alert("Invalid Short URL."); window.location.replace(window.location.origin); }
        }).catch(() => setIsTokenFound(false));
      }
    }
  }, []);

  useEffect(() => {
    if (rt && tmr > 0) { const r = setTimeout(() => setTmr(tmr - 1), 1000); return () => clearTimeout(r); }
  }, [rt, tmr]);

  useEffect(() => {
    if (rt) {
      if (stage !== 4 && !document.getElementById('ad-popunder-node')) {
        const pop = document.createElement('script'); pop.id = 'ad-popunder-node';
        pop.src = "https://rightyrely.com/b9/4d/11/b94d112da7a9eca56020cdc86de372e4.js"; document.body.appendChild(pop);
      } else if (stage === 4) document.getElementById('ad-popunder-node')?.remove();

      if (!document.getElementById('ad-social-node')) {
        const soc = document.createElement('script'); soc.id = 'ad-social-node';
        soc.src = "https://rightyrely.com/25/35/24/253524e061c1d53e48e5610b6dfa52e6.js"; document.body.appendChild(soc);
      }

      if (!document.getElementById('ad-native-node')) {
        const nat = document.createElement('script'); nat.id = 'ad-native-node';
        nat.async = true; nat.setAttribute("data-cfasync", "false");
        nat.src = "https://rightyrely.com/9a3ee810f662f820251422648340bfa6/invoke.js"; document.body.appendChild(nat);
      }
    }
  }, [rt, stage]);

  const loadLogs = (uid) => {
    getDocs(query(collection(db, "links"), where("userId", "==", uid))).then(snap => {
      let c = 0; const t = []; snap.forEach(d => { t.push({id:d.id, ...d.data()}); c += (d.data().clicks || 0); });
      setLinks(t); setStats({ clk: c, cpm: 3.0, earn: (c / 1000) * 3.0 });
    });
  };

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      if (u) { setUser(u); loadLogs(u.uid); } else { setUser(null); }
      setLoading(false);
    });
  }, []);

  const handleAuth = async () => {
    if (!email || !pass) return alert("Fill fields!");
    try { if (isUp) { await createUserWithEmailAndPassword(auth, email, pass); setIsUp(false); } else { await signInWithEmailAndPassword(auth, email, pass); } } catch (e) { alert(e.message); }
  };

  const handleShorten = () => {
    if (!url) return alert("Enter URL!");
    const al = alias.trim() || Math.random().toString(36).substring(2, 7);
    const gen = `${window.location.origin}?go=${al}`;
    const obj = { userId: user.uid, originalUrl: url, shortUrl: gen, alias: al, expiry, clicks: 0 };
    setShortened(gen); setLinks(p => [obj, ...p]); setUrl(''); setAlias(''); setExpiry('');
    addDoc(collection(db, "links"), obj).catch(e => console.error(e));
  };

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

  if (rt) return (
    <div className="main-bg font flex-col center p-20">
      <style>{`.main-bg{background:#04030a;min-height:100vh;color:#fff;}.font{font-family:sans-serif;}.flex-col{display:flex;flex-direction:column;}.center{align-items:center;justify-content:center;}.p-20{padding:20px;}.card{background:#0e0b20;padding:25px;border-radius:16px;border:1px solid #1c1736;width:100%;max-width:420px;text-align:center;}.btn{width:100%;padding:14px;background:linear-gradient(135deg,#4f46e5,#6366f1);color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer;}.inp{width:100%;padding:12px;background:#04030a;border:1px solid #231c4f;border-radius:8px;color:#fff;box-sizing:border-box;margin-bottom:12px;outline:none;}`}</style>
      <div style={{padding:'6px 12px',borderRadius:'20px',background:'#0e0b20',color:'#a78bfa',fontSize:'12px',border:'1px solid #1f1938',marginBottom:'15px'}}>🔒 Security Verification Tunnel • Step {stage}/4</div>
      {stage !== 4 && <SupremeAdPlacementMatrix />}
      <div className="card">
        {tmr > 0 ? ( <div>🔄 Processing Traffic Metrics... <b style={{color:'#fbbf24'}}>{tmr}s</b></div> ) : (
          stage === 4 ? (
            <div>
              <div style={{background:'#1e40af',padding:'12px',borderRadius:'6px',marginBottom:'12px',fontSize:'13px'}}><a href="https://t.me/YOUR_CHANNEL" target="_blank" style={{color:'#fff',textDecoration:'none'}}>💬 Join Our Official Telegram Channel</a></div>
              <button className="btn" style={{background:'#10b981',boxShadow:'0 0 15px #10b981'}} onClick={() => window.location.replace(dest.trim().startsWith('http') ? dest.trim() : 'https://' + dest.trim())}>🚀 UNLOCK FINAL TARGET LINK</button>
            </div>
          ) : ( <button className="btn" onClick={() => { setStage(stage + 1); setTmr(stage + 1 === 4 ? 5 : 10); window.scrollTo({top:0,behavior:'smooth'}); }}>CONTINUE TO NEXT STEP ➡️</button> )
        )}
      </div>
      {stage !== 4 && <SupremeAdPlacementMatrix />}
    </div>
  );

  if (isTokenFound) return <div style={{background:'#04030a',color:'#a78bfa',minHeight:'100vh',display:'flex',justifyContent:'center',alignItems:'center',fontFamily:'sans-serif'}}>🔒 Directing to Traffic Core Verification Instance...</div>;
                                                        
  if (loading) return <div style={{background:'#04030a',color:'#6366f1',minHeight:'100vh',display:'flex',justifyContent:'center',alignItems:'center',fontFamily:'sans-serif'}}>🔄 Connecting Click To Earn Hub...</div>;
                                                        

  if (!user) return (
    <div className="main-bg font flex-col center p-20">
      <style>{`.main-bg{background:#04030a;min-height:100vh;color:#fff;}.font{font-family:sans-serif;}.flex-col{display:flex;flex-direction:column;}.center{align-items:center;justify-content:center;}.card{background:#09081d;padding:30px;border-radius:20px;border:1px solid #1a153a;width:100%;max-width:380px;box-sizing:border-box;}.btn{width:100%;padding:12px;background:#4f46e5;color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer;}.inp{width:100%;padding:12px;background:#04030a;border:1px solid #231c4f;border-radius:8px;color:#fff;box-sizing:border-box;margin-bottom:12px;outline:none;}`}</style>
      <h1 style={{fontWeight:'900',fontSize:'26px',marginBottom:'20px',letterSpacing:'1px',textAlign:'center'}}>💸 CLICK TO EARN</h1>
      <div className="card">
        <h2 style={{textAlign:'center',color:'#a78bfa',margin:'0 0 20px 0',fontSize:'18px'}}>{isUp ? "Register Account" : "Identity Authorization Login"}</h2>
        <input className="inp" type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="inp" type="password" placeholder="Password" value={pass} onChange={e => setPass(e.target.value)} />
        <button className="btn" onClick={handleAuth}>{isUp ? "Sign Up" : "Sign In"}</button>
        <p onClick={() => setIsUp(!isUp)} style={{color:'#64748b',fontSize:'12px',textAlign:'center',marginTop:'15px',cursor:'pointer'}}>{isUp ? "Switch to Login" : "Create New Workspace Account"}</p>
      </div>
    </div>
  );

  return (
    <div style={{backgroundColor:'#04030a',color:'#f1f5f9',minHeight:'100vh',fontFamily:'sans-serif'}}>
      <style>{`.box{background:#0a081d;padding:12px;border-radius:10px;border:1px solid #141130;text-align:center;}.inp{width:100%;padding:10px;background:#050311;border:1px solid #191438;border-radius:8px;color:#fff;box-sizing:border-box;margin-bottom:10px;outline:none;}.btn{width:100%;padding:12px;background:linear-gradient(90deg,#38bdf8,#a855f7);color:#fff;border:none;border-radius:8px;font-weight:800;cursor:pointer;}`}</style>
      <div style={{background:'#090818',padding:'14px 20px',borderBottom:'1px solid #14122d',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <button onClick={() => setSide(true)} style={{background:'#100e2b',border:'none',color:'#fff',padding:'8px 12px',borderRadius:'6px',cursor:'pointer'}}>☰</button>
          <span style={{fontWeight:'800',fontSize:'16px',letterSpacing:'0.5px'}}>💸 CLICK TO EARN</span>
        </div>
      </div>

      <div style={{position:'fixed',top:0,left:side?0:'-280px',width:'250px',height:'100vh',background:'#09081a',borderRight:'1px solid #14122d',transition:'0.3s ease',zIndex:999,padding:'20px',boxSizing:'border-box',display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
        <div>
          <h3 style={{color:'#818cf8',margin:'0 0 20px 0',fontSize:'16px'}}>CLICK TO EARN</h3>
          <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
            <button onClick={() => { setTab('home'); setSide(false); }} style={{textAlign:'left',width:'100%',padding:'10px',background:tab==='home'?'#18153c':'none',border:'none',borderRadius:'6px',color:'#fff',cursor:'pointer'}}>📊 Statistics</button>
            <button onClick={() => { setTab('manage'); setSide(false); }} style={{textAlign:'left',width:'100%',padding:'10px',background:tab==='manage'?'#18153c':'none',border:'none',borderRadius:'6px',color:'#fff',cursor:'pointer'}}>📁 Files & Links</button>
          </div>
        </div>
        <button onClick={() => signOut(auth)} style={{width:'100%',padding:'8px',background:'#ef4444',color:'#fff',border:'none',borderRadius:'6px',cursor:'pointer'}}>Logout</button>
      </div>

      {tab === 'home' && (
        <div style={{padding:'20px 14px',maxWidth:'550px',margin:'0 auto'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'20px'}}>
            <div className="box"><small style={{color:'#64748b'}}>WALLET</small><h3 style={{margin:'4px 0 0 0'}}>${stats.earn.toFixed(2)}</h3></div>
            <div className="box"><small style={{color:'#64748b'}}>CPM</small><h3 style={{margin:'4px 0 0 0',color:'#818cf8'}}>${stats.cpm.toFixed(2)}</h3></div>
          </div>

          <div style={{background:'linear-gradient(135deg,#0e163a,#2e1035)',padding:'20px',borderRadius:'16px',border:'1px solid #231942'}}>
            <h4 style={{margin:'0 0 12px 0'}}>📝 Shorten New URL Path</h4>
            <input className="inp" type="url" placeholder="Your URL Here (https://...)" value={url} onChange={e => setUrl(e.target.value)} />
            <input className="inp" type="text" placeholder="Alias (Optional)" value={alias} onChange={e => setAlias(e.target.value)} />
            <input className="inp" type="date" value={expiry} onChange={e => setExpiry(e.target.value)} />
            <button className="btn" onClick={handleShorten}>Shorten ⚡</button>
          </div>

          {shortened && (
            <div style={{background:'rgba(16,185,129,0.1)',border:'1px solid #10b981',padding:'16px',borderRadius:'12px',marginTop:'16px',display:'flex',justifyContent: 'space-between',alignItems:'center'}}>
              <div style={{overflow:'hidden',width:'75%'}}>
                <small style={{color:'#10b981',fontWeight:'bold',display:'block',marginBottom:'4px'}}>✓ LINK GENERATED SUCCESSFULLY:</small>
                <span style={{fontSize:'13px',color:'#fff',whiteSpace:'nowrap'}}>{shortened}</span>
              </div>
              <button style={{background:'#10b981',color:'#fff',border:'none',padding:'8px 14px',borderRadius:'6px',fontSize:'12px',fontWeight:'700',cursor:'pointer'}} onClick={() => { navigator.clipboard.writeText(shortened); alert("Copied successfully!"); }}>Copy Link</button>
            </div>
          )}

          <div className="box" style={{marginTop:'15px',textAlign:'left'}}><small style={{color:'#64748b'}}>TOTAL PERFORMANCE CLICKS</small><h2 style={{margin:'4px 0 0 0',fontSize:'24px'}}>{stats.clk}</h2></div>
        </div>
      )}

      {tab === 'manage' && (
        <div style={{padding:'20px 14px',maxWidth:'550px',margin:'0 auto'}}>
          <div className="box" style={{textAlign:'left'}}>
            <h3 style={{fontSize:'14px',color:'#818cf8',margin:'0 0 12px 0'}}>📋 Storage Index History</h3>
            {links.map((l,i) => (
              <div key={i} style={{background:'#04030a',padding:'10px',marginBottom:'8px',borderRadius:'6px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontSize:'12px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',width:'70%'}}>{l.shortUrl}</span>
                <button style={{background:'#312e81',border:'none',color:'#818cf8',padding:'4px 10px',borderRadius:'4px',fontSize:'11px',cursor:'pointer'}} onClick={() => { navigator.clipboard.writeText(l.shortUrl); alert("Copied!"); }}>Copy</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

