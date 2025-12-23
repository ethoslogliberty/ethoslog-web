import { useState, useEffect } from 'react';
import { publishPost, fetchSinglePost } from './utils/ethos';
import './App.css';
import backgroundImage from './bg.jpg'; 

function App() {
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchCID, setSearchCID] = useState('');
  const [foundPost, setFoundPost] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  
  // SOLUCIÓN AL ERROR #418: Seguro de montaje
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handlePublish = async () => {
    if (!content.trim()) return;
    
    setIsLoading(true);
    setStatus('🏛️ CONSULTANDO AL ORÁCULO...');

    try {
      const ipfsHash = await publishPost(content);
      
      setSearchCID(ipfsHash); 
      setStatus(
        <div className="success-box">
          <p style={{color: '#84754e', fontWeight: 'bold', margin: '5px 0'}}>¡INMORTALIZADO!</p>
          <div className="cid-display">{ipfsHash}</div>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(ipfsHash);
              alert("CID Copiado al Pergamino");
            }}
            className="copy-btn"
          >
            COPIAR CID
          </button>
        </div>
      );
      setContent(''); 
    } catch (error) {
      console.error(error);
      setStatus(`❌ ERROR: ${error.message}`);
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
      setFoundPost(post);
    } catch (error) {
      alert("No se encontró el registro en el Oráculo.");
    } finally {
      setIsSearching(false);
    }
  };

  // Si no ha montado, no renderizamos para evitar el error de Hydration
  if (!hasMounted) return null;

  return (
    <div className="app-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="overlay">
        <div className="main-content">
          <header className="header">
            <h1 className="title-ethos">ETHOSLOG</h1>
            <p className="subtitle">LIBERTAD INMUTABLE EN BASE</p>
          </header>

          <div className="grid-container">
            <div className="glass-card">
              <h2 className="card-label">🏛️ TALLAR PENSAMIENTO</h2>
              <textarea 
                className="greek-textarea"
                placeholder="Escribe aquí tu verdad eterna..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <button onClick={handlePublish} disabled={isLoading} className="btn-primary">
                {isLoading ? 'TALLANDO...' : 'INMORTALIZAR'}
              </button>
              {status && <div className="status-msg">{status}</div>}
            </div>

            <div className="glass-card">
              <h2 className="card-label">🔍 CONSULTAR</h2>
              <div className="search-wrap">
                <input 
                  className="greek-input"
                  placeholder="Pegar CID del Oráculo..."
                  value={searchCID}
                  onChange={(e) => setSearchCID(e.target.value)}
                />
                <button onClick={handleSearch} disabled={isSearching} className="btn-gold">
                  {isSearching ? '...' : 'IR'}
                </button>
              </div>
              
              {foundPost && (
                <div className="result-display">
                  <p className="result-text">"{foundPost.text}"</p>
                  <div className="result-date">
                    REGISTRADO: {new Date(foundPost.date).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="manifesto-box">
            <p>"En la intersección de la razón clásica y la criptografía moderna..."</p>
          </div>

          <footer className="main-footer">BASE MAINNET • RED IPFS • MMXXV</footer>
        </div>
      </div>
    </div>
  );
}

export default App;