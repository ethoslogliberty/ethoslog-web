import { useState, useEffect } from 'react';
import { publishPost, fetchSinglePost } from './utils/oraculo.js';
import './App.css';
import backgroundImage from './bg.jpg'; 

function App() {
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fontSize, setFontSize] = useState(1.15);
  const [fontFamily, setFontFamily] = useState("'Playfair Display', serif");
  
  const [searchCID, setSearchCID] = useState('');
  const [foundPost, setFoundPost] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    console.log("🏛️ ETHOSLOG V2.0 - GLOBAL SYSTEM ONLINE");
  }, []);

  const handlePublish = async () => {
    if (!content.trim()) return;
    setIsLoading(true);
    setStatus('🏛️ CONSULTING THE ORACLE...');
    try {
      const ipfsHash = await publishPost(content);
      setSearchCID(ipfsHash); 
      setStatus(
        <div className="success-box">
          <p style={{color: '#d4af37', fontWeight: 'bold'}}>IMMORTALIZED!</p>
          <div className="cid-display">{ipfsHash}</div>
        </div>
      );
      setContent('');
    } catch (error) {
      setStatus('THE ORACLE HAS FAILED.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchCID.trim()) return;
    setIsSearching(true);
    try {
      const post = await fetchSinglePost(searchCID);
      setFoundPost(post);
    } catch (error) {
      alert("CID not found.");
    } finally {
      setIsSearching(false);
    }
  };

  if (!hasMounted) return null;

  return (
    <div className="app-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="overlay">
        <div className="main-content">
          <header className="header">
            <h1 className="title-ethos">ETHOSLOG</h1>
            <p className="subtitle">IMMUTABLE FREEDOM ON BASE</p>
          </header>

          <div className="grid-container">
            {/* THE SCRIBE */}
            <div className="glass-card">
              <h2 className="card-label">🏛️ CARVE THOUGHT</h2>
              <div className="scribe-tools">
                <select onChange={(e) => setFontFamily(e.target.value)} className="tool-select">
                  <option value="'Playfair Display', serif">Classic Serif</option>
                  <option value="'Cinzel', serif">Imperial Caps</option>
                </select>
                <div className="size-controls">
                  <button onClick={() => setFontSize(fontSize - 0.1)} className="btn-tool">−</button>
                  <span className="size-display">{Math.round(fontSize * 10)}</span>
                  <button onClick={() => setFontSize(fontSize + 0.1)} className="btn-tool">+</button>
                </div>
              </div>
              <textarea 
                className="greek-textarea"
                style={{ fontSize: `${fontSize}rem`, fontFamily: fontFamily }}
                placeholder="Inscribe your eternal truth..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <button onClick={handlePublish} disabled={isLoading} className="btn-primary">
                {isLoading ? 'CARVING...' : 'IMMORTALIZE'}
              </button>
              {status && <div className="status-msg">{status}</div>}
            </div>

            {/* THE ARCHIVE */}
            <div className="glass-card">
              <h2 className="card-label">🔍 QUERY ARCHIVE</h2>
              <div className="search-wrap">
                <input className="greek-input" placeholder="Paste CID..." value={searchCID} onChange={(e) => setSearchCID(e.target.value)} />
                <button onClick={handleSearch} className="btn-gold">GO</button>
              </div>
              {foundPost && (
                <div className="result-display clickable" onClick={() => setIsModalOpen(true)}>
                  <p className="result-text">"{foundPost.text.substring(0, 100)}..."</p>
                  <p style={{color: '#d4af37', fontSize: '0.7rem', marginTop: '10px'}}>READ FULL TEXT 📜</p>
                </div>
              )}
            </div>
          </div>

          <footer className="main-footer">BASE MAINNET • IPFS • MMXXV</footer>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && foundPost && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="card-label">ETERNAL MANIFESTO</h2>
            <div className="full-text-scroll">
              <p className="result-text-large">{foundPost.text}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;