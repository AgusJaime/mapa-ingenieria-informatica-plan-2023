import React from 'react';
import { Handle, Position } from 'reactflow';
import { CheckCircle2, Circle, Clock, Ban, Star } from 'lucide-react';

const STATE_COLORS = {
  promocionada: 'var(--state-promocionada)',
  cursada: 'var(--state-cursada)',
  disponible: 'var(--state-disponible)',
  nodisponible: 'var(--state-nodisponible)',
  simulada: 'var(--state-simulada)',
};

const STATE_GRADIENTS = {
  promocionada: 'var(--grad-promocionada)',
  cursada: 'var(--grad-cursada)',
  disponible: 'var(--grad-disponible)',
  nodisponible: 'var(--grad-nodisponible)',
  simulada: 'var(--grad-simulada)',
};

const STATE_ICONS = {
  promocionada: <CheckCircle2 size={16} color="var(--state-promocionada)" />,
  cursada: <Clock size={16} color="var(--state-cursada)" />,
  disponible: <Circle size={16} color="var(--state-disponible)" />,
  nodisponible: <Ban size={16} color="var(--state-nodisponible)" />,
  simulada: <Clock size={16} color="var(--state-simulada)" />,
};

export default function SubjectNode({ data, selected }) {
  const { subject, status, note, onContextMenu } = data;

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onContextMenu) onContextMenu(e, subject.id);
  };

  return (
    <div 
      className={`subject-node glass ${selected ? 'selected' : ''}`}
      style={{
        background: STATE_GRADIENTS[status] || STATE_GRADIENTS.nodisponible,
        borderColor: STATE_COLORS[status] || STATE_COLORS.nodisponible
      }}
      onContextMenu={handleContextMenu}
    >
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          {subject.id}
        </span>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {note && <span style={{ fontSize: '0.75rem', fontWeight: 'bold', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>{note}</span>}
          {subject.elective && <Star size={14} color="#fbbf24" />}
          {STATE_ICONS[status] || STATE_ICONS.nodisponible}
        </div>
      </div>
      
      <h3 style={{ fontSize: '0.9rem', fontWeight: 500, lineHeight: 1.3, margin: 0 }}>
        {subject.name}
      </h3>
      
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
    </div>
  );
}
