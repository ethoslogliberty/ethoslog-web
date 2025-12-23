import { useState, useEffect } from 'react';
import { publishPost, fetchSinglePost } from './utils/oraculo.js';
import './App.css';
import backgroundImage from './bg.jpg'; 

function App() {
  // --- ESTADOS DE PUBLICACIÓN Y ESTILO ---
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fontSize, setFontSize] = useState(1.15); // en rem
  const [fontFamily, setFontFamily] = useState("'Playfair Display', serif");
  
  // --- ESTADOS DE BÚSQUEDA Y LECTURA ---
  const [searchCID, setSearchCID] = useState('');
  const [foundPost, setFoundPost] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // --- HIDRATACIÓN ---
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    console.log("🏛️ ETHOSLOG V.2 ONLINE - SCRIBE PRO SYSTEM READY");
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
          <p style={{color: '#d4af37', fontWeight: 'bold'}}>IMMORTALIZED SUCCESSFULLY</p>
          <div className="cid-display">CID: {ipfsHash}</div>
          <button className="copy-btn" onClick={() => navigator.clipboard.writeText(ipfsHash)}>COPY CID</button>
        </div>
      );
      setContent(''); 
    } catch (error) {
      console.error(error);
      setStatus('THE ORACLE HAS FAILED. CHECK YOUR CONNECTION.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchCID.trim()) return;
    setIsSearching(true);
    setFoundPost(null);
    try {
      const post = await fetchSinglePost(searchCID);
      if (post) setFoundPost(post);
      else alert("This CID does not exist in the Polis records.");
    } catch (error) {
      console.error(error);
      alert("Error querying the archive.");
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
            <div className="gold-separator"></div>
          </header>

          <div className="grid-container">
            
            {/* COLUMNA 1: THE SCRIBE (CON EDITOR MEJORADO) */}
            <div className="glass-card">
              <h2 className="card-label">🏛️ CARVE THOUGHT</h2>
              
              <div className="scribe-tools">
                <select 
                  onChange={(e) => setFontFamily(e.target.value)} 
                  className="tool-select"
                >
                  <option value="'Playfair Display', serif">Classic Serif</option>
                  <option value="'Cinzel', serif">Imperial Caps</option>
                  <option value="monospace">Ancient Script</option>
                </select>

                <div className="size-controls">
                  <button onClick={() => setFontSize(Math.max(0.8, fontSize - 0.1))} className="btn-tool">−</button>
                  <span className="size-display">{Math.round(fontSize * 10)}</span>
                  <button onClick={() => setFontSize(Math.min(2, fontSize + 0.1))} className="btn-tool">+</button>
                </div>
              </div>

              <textarea 
                className="greek-textarea"
                style={{ fontSize: `${fontSize}rem`, fontFamily: fontFamily }}
                placeholder="Inscribe your eternal truth here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              
              <button onClick={handlePublish} disabled={isLoading} className="btn-primary">
                {isLoading ? 'CARVING...' : 'IMMORTALIZE'}
              </button>
              {status && <div className="status-msg">{status}</div>}
            </div>

            {/* COLUMNA 2: THE ARCHIVE */}
            <div className="glass-card">
              <h2 className="card-label">🔍 QUERY ARCHIVE</h2>
              <div className="search-wrap">
                <input 
                  className="greek-input"
                  placeholder="Paste Oracle CID..."
                  value={searchCID}
                  onChange={(e) => setSearchCID(e.target.value)}
                />
                <button onClick={handleSearch} disabled={isSearching} className="btn-gold">
                  {isSearching ? '...' : 'GO'}
                </button>
              </div>
              
              {foundPost ? (
                <div className="result-display clickable" onClick={() => setIsModalOpen(true)}>
                  <p className="result-text">
                    "{foundPost.text.length > 150 ? foundPost.text.substring(0, 150) + "..." : foundPost.text}"
                  </p>
                  <div className="read-more">CLICK TO EXPAND FULL TEXT 📜</div>
                  <div className="result-date">
                    REGISTERED: {new Date(foundPost.date).toLocaleDateString()}
                  </div>
                </div>
              ) : (
                <div className="result-display" style={{opacity: 0.5, borderLeft: 'none'}}>
                  <p className="result-text" style={{fontSize: '0.9rem'}}>
                    Knowledge awaits. Enter a CID to retrieve history...
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* MODAL: READER VIEW (FULL SCREEN) */}
          {isModalOpen && foundPost && (
            <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-modal" onClick={() => setIsModalOpen(false)}>×</button>
                <h2 className="card-label">ETERNAL MANIFESTO</h2>
                <div className="full-text-scroll">
                  <p className="result-text-large">{foundPost.text}</p>
                </div>
                <div className="cid-footer">SOURCE CID: {searchCID}</div>
              </div>
            </div>
          )}

          <div className="manifesto-box">
            <p>"At the intersection of classical reason and modern cryptography, our words remain."</p>
          </div>

          <footer className="main-footer">BASE MAINNET • IPFS NETWORK • MMXXV</footer>
        </div>
      </div>
    </div>
  );
}

export default App;