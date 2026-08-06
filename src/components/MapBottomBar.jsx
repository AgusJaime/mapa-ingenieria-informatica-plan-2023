import React from 'react';
import { Download, Eye, EyeOff, Wand2, HelpCircle, RefreshCcw } from 'lucide-react';

export default function MapBottomBar({ 
  subjectsData, 
  userState, 
  simulationState, 
  simulationMode, 
  setSimulationMode,
  showElectives,
  setShowElectives,
  showTransversals,
  setShowTransversals,
  setShowShortcuts,
  exportToExcel,
  resetPositions
}) {
  const totalIntermedio = subjectsData.filter(s => s.year <= 3 && !s.elective).length;
  const passedIntermedio = subjectsData.filter(s => s.year <= 3 && !s.elective && (userState[s.id]?.status === 'promocionada' || simulationState[s.id]?.status === 'simulada')).length;
  const pctIntermedio = totalIntermedio > 0 ? Math.round((passedIntermedio / totalIntermedio) * 100) : 0;

  const totalMaterias = subjectsData.length;
  const materiasCompletadas = subjectsData.filter(s => {
    const st = simulationState[s.id]?.status || userState[s.id]?.status;
    return st === 'promocionada' || st === 'simulada';
  }).length;
  const pctTotal = totalMaterias > 0 ? Math.round((materiasCompletadas / totalMaterias) * 100) : 0;

  const validGrades = subjectsData
    .filter(s => {
      const st = simulationState[s.id]?.status || userState[s.id]?.status;
      return st === 'promocionada' || st === 'simulada';
    })
    .map(s => parseFloat(userState[s.id]?.grade))
    .filter(g => !isNaN(g) && g >= 1 && g <= 10);
    
  const sumGrades = validGrades.reduce((a, b) => a + b, 0);
  const promedio = validGrades.length > 0 ? (sumGrades / validGrades.length).toFixed(2) : 0;

  return (
    <div className="bottom-bar glass">
      {/* Botones de Acción */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button 
          className="btn btn-secondary" 
          onClick={() => setShowElectives(!showElectives)}
        >
          {showElectives ? <EyeOff size={18} /> : <Eye size={18} />}
          {showElectives ? 'Ocultar Electivas' : 'Mostrar Electivas'}
        </button>

        <button 
          className="btn btn-secondary" 
          onClick={() => setShowTransversals(!showTransversals)}
        >
          {showTransversals ? <EyeOff size={18} /> : <Eye size={18} />}
          {showTransversals ? 'Ocultar Transversales' : 'Mostrar Transversales'}
        </button>

        <button 
          className={`btn ${simulationMode ? 'btn-sim active' : 'btn-secondary'}`}
          onClick={() => setSimulationMode(!simulationMode)}
        >
          <Wand2 size={18} />
          Modo Simulación
        </button>

        <button 
          className="btn btn-secondary"
          onMouseEnter={() => setShowShortcuts(true)}
          onMouseLeave={() => setShowShortcuts(false)}
        >
          <HelpCircle size={18} />
          Atajos
        </button>
        
        <button 
          className="btn btn-secondary" 
          onClick={resetPositions} 
          title="Restaurar Posiciones"
        >
          <RefreshCcw size={18} />
        </button>
      </div>

      <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)', height: '40px', margin: '0 8px' }}></div>

      {/* Estadísticas */}
      <div className="stats">
        <div className="stat-item">
          <span className="stat-label">PROMEDIO</span>
          <span className="stat-value">{promedio}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">TÍTULO INTERMEDIO</span>
          <span className="stat-value">{pctIntermedio}%</span>
        </div>
        
        <div className="stat-item" style={{ width: '180px' }}>
          <span className="stat-label">PROGRESO ({materiasCompletadas}/{totalMaterias})</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
            <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pctTotal}%`, background: 'var(--accent-color)' }}></div>
            </div>
            <span style={{ fontWeight: 600, fontSize: '1rem' }}>{pctTotal}%</span>
          </div>
        </div>
      </div>

      {/* Exportar */}
      <button 
        className="btn btn-primary" 
        onClick={exportToExcel}
        style={{ marginLeft: '12px' }}
      >
        <Download size={18} />
        Exportar
      </button>
    </div>
  );
}
