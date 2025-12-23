import React, { useEffect, useRef } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Embed from '@editorjs/embed';

const EthosEditor = () => {
  const ejInstance = useRef(null);

  useEffect(() => {
    // Inicialización del Editor
    if (!ejInstance.current) {
      const editor = new EditorJS({
        holder: 'editorjs',
        autofocus: true,
        placeholder: 'Haz clic aquí para escribir tu legado...',
        tools: {
          header: {
            class: Header,
            inlineToolbar: true,
            config: {
              placeholder: 'Escribe un título...',
              levels: [1, 2, 3],
              defaultLevel: 2
            }
          },
          list: {
            class: List,
            inlineToolbar: true,
          },
          embed: {
            class: Embed,
            config: {
              services: {
                youtube: true,
                twitter: true
              }
            }
          }
        },
        onReady: () => {
          ejInstance.current = editor;
          console.log('EthosEditor centrado y listo');
        },
      });
    }

    // Limpieza al desmontar para evitar que se duplique el editor
    return () => {
      if (ejInstance.current && typeof ejInstance.current.destroy === 'function') {
        ejInstance.current.destroy();
        ejInstance.current = null;
      }
    };
  }, []);

  const handleSave = async () => {
    if (ejInstance.current) {
      try {
        const content = await ejInstance.current.save();
        console.log('JSON generado para IPFS:', content);
        alert('Contenido capturado con éxito. Revisa la consola (F12).');
      } catch (error) {
        console.error('Error al guardar:', error);
      }
    }
  };

  return (
    <div className="editor-inner-wrapper" style={{ color: '#1a1a1a', width: '100%' }}>
      {/* Contenedor del editor */}
      <div id="editorjs" style={{ textAlign: 'left', width: '100%' }}></div>
      
      {/* Botón de acción centrado */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px', width: '100%' }}>
        <button className="save-btn" onClick={handleSave}>
          Firmar y Guardar en IPFS
        </button>
      </div>
    </div>
  );
};

export default EthosEditor;