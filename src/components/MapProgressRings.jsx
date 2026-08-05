import React from 'react';

export default function MapProgressRings({ subjectsData, userState, simulationState }) {
  const totalMaterias = subjectsData.length;
  const materiasCompletadas = subjectsData.filter(s => {
    const st = simulationState[s.id]?.status || userState[s.id]?.status;
    return st === 'promocionada' || st === 'simulada';
  }).length;
  const pctTotal = Math.round((materiasCompletadas / totalMaterias) * 100);

  return (
    <div className="year-progress-container glass">
      {[1, 2, 3, 4, 5].map(year => {
        const yearSubs = subjectsData.filter(s => s.year === year && !s.elective);
        if (yearSubs.length === 0) return null;
        const passed = yearSubs.filter(s => {
          const st = simulationState[s.id]?.status || userState[s.id]?.status;
          return st === 'promocionada' || st === 'simulada';
        }).length;
        const pct = Math.round((passed / yearSubs.length) * 100);
        const dashoffset = 113 - (113 * pct) / 100;
        
        return (
          <div className="year-progress-ring" key={`year-${year}`}>
            <svg className="ring-svg">
              <circle cx="20" cy="20" r="18" className="ring-bg" />
              <circle cx="20" cy="20" r="18" className="ring-fill" style={{ strokeDasharray: 113, strokeDashoffset: dashoffset }} />
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 600 }}>{year}° Año</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{pct}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
