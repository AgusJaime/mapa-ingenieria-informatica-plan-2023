import React from 'react';

export default function SemesterLabelNode({ data }) {
  const { semester } = data;
  
  if (semester === 0) return null;

  const year = Math.ceil(semester / 2);
  const semType = semester % 2 === 1 ? 'C1' : 'C2';

  return (
    <div style={{
      padding: '8px 12px',
      background: 'rgba(24, 24, 27, 0.8)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '8px',
      width: '140px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      color: 'var(--text-secondary)',
      backdropFilter: 'blur(8px)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
    }}>
      <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{year}° Año</span>
      <span style={{ fontSize: '0.65rem', fontWeight: 700, background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '2px 6px', borderRadius: '4px' }}>{semType}</span>
    </div>
  );
}
