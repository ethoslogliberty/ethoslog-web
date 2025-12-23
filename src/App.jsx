import { useState, useEffect } from 'react';
// IMPORTANTE: Usamos 'oraculo' para forzar al navegador a olvidar el archivo viejo
import { publishPost, fetchSinglePost } from './utils/oraculo'; 
import './App.css';
import backgroundImage from './bg.jpg'; 

function App() {
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchCID, setSearchCID] = useState('');
  const [foundPost, setFoundPost] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  
  // SOLUCIÓN AL ERROR #418: Seguro de hidratación
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    // Rastro en consola para verificar que el código nuevo está cargado
    console.log("SISTEMA DE DATOS MANUALES V.999 CARGADO - RED BASE");
  }, []);

  const handlePublish = async () => {
    if (!content.trim()) return;
    
    setIsLoading(true);
    setStatus('🏛️ CONSULTANDO AL ORÁCULO...');

    try {
      // Llamada a la lógica en oraculo.js que ya tiene los datos manuales
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
      console.error("Error en publicación:", error);
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

  // No renderizar hasta que el componente esté montado para evitar Hydration Mismatch
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
              <button 
                onClick={handlePublish} 
                disabled={isLoading} 
                className="btn-primary"
              >
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
                <button 
                  onClick={handleSearch} 
                  disabled={isSearching} 
                  className="btn-gold"
                >
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