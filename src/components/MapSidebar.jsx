import React from 'react';
import { X } from 'lucide-react';

export default function MapSidebar({ selectedDetails, subjectsData, setSelectedDetails, userState, setUserState }) {
  const updateNodeState = (nodeId, newStatus, newNote, newGrade) => {
    setUserState(prev => {
      const currentState = prev[nodeId] || {};
      const newState = { ...prev };
      
      const updatedNodeState = { ...currentState };
      
      if (newStatus !== undefined) {
        if (newStatus === null) delete updatedNodeState.status;
        else updatedNodeState.status = newStatus;
      }
      
      if (newNote !== undefined) {
        if (newNote === '') delete updatedNodeState.note;
        else updatedNodeState.note = newNote;
      }
      
      if (newGrade !== undefined) {
        if (newGrade === '') delete updatedNodeState.grade;
        else updatedNodeState.grade = newGrade;
      }
      
      if (Object.keys(updatedNodeState).length === 0) {
        delete newState[nodeId];
      } else {
        newState[nodeId] = updatedNodeState;
      }
      
      localStorage.setItem('unlam-state', JSON.stringify(newState));
      return newState;
    });
  };

  const renderSidebar = () => {
    if (!selectedDetails) return null;
    
    const sub = subjectsData.find(s => s.id === selectedDetails);
    if (!sub) return null;
    
    return (
      <>
        <button className="sidebar-close" onClick={() => setSelectedDetails(null)}><X size={24} /></button>
        <h3 style={{ margin: 0, marginTop: '24px' }}>{sub.id}</h3>
        <h2>{sub.name}</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          {sub.elective ? 'Materia Electiva' : `${sub.year}° Año - Cuatrimestre ${sub.semester}`}
        </p>
        
        <div style={{ marginTop: '24px' }}>
          <h4>Estado</h4>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
            <button 
              className={`btn ${userState[sub.id]?.status === 'promocionada' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => updateNodeState(sub.id, userState[sub.id]?.status === 'promocionada' ? null : 'promocionada')}
            >
              Aprobada
            </button>
            <button 
              className={`btn ${userState[sub.id]?.status === 'cursada' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => updateNodeState(sub.id, userState[sub.id]?.status === 'cursada' ? null : 'cursada')}
            >
              Regular
            </button>
            <button 
              className="btn danger"
              onClick={() => updateNodeState(sub.id, null)}
            >
              Quitar estado
            </button>
          </div>
        </div>

        <div style={{ marginTop: '24px' }}>
          <h4>Nota Final</h4>
          <input 
            type="text" 
            placeholder="Ej: 8, 10, Promocionado..."
            defaultValue={userState[sub.id]?.grade || ''}
            onBlur={(e) => updateNodeState(sub.id, undefined, undefined, e.target.value)}
            style={{ 
              width: '100%', 
              padding: '10px', 
              background: 'rgba(0,0,0,0.2)', 
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'white',
              borderRadius: '8px',
              marginTop: '8px'
            }}
          />
        </div>

        <div style={{ marginTop: '16px' }}>
          <h4>Anotaciones</h4>
          <input 
            type="text" 
            placeholder="Ej: Dar final en Diciembre, armar grupo..."
            defaultValue={userState[sub.id]?.note || ''}
            onBlur={(e) => updateNodeState(sub.id, undefined, e.target.value, undefined)}
            style={{ 
              width: '100%', 
              padding: '10px', 
              background: 'rgba(0,0,0,0.2)', 
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'white',
              borderRadius: '8px',
              marginTop: '8px'
            }}
          />
        </div>

        <div style={{ marginTop: '32px' }}>
          <h4>Correlativas requeridas</h4>
          {sub.correlatives.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>Ninguna</p>
          ) : (
            <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)' }}>
              {sub.correlatives.map(cId => {
                const corr = subjectsData.find(s => s.id === cId);
                return <li key={cId}>{cId} - {corr ? corr.name : 'Desconocida'}</li>;
              })}
            </ul>
          )}
        </div>
      </>
    );
  };

  return (
    <div className={`sidebar glass ${selectedDetails ? 'open' : ''}`}>
      {renderSidebar()}
    </div>
  );
}
