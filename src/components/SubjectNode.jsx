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
      
      <h3 style={{ fontSize: '0.75rem', fontWeight: 500, lineHeight: 1.2, margin: 0, paddingBottom: (note || subject.elective) ? '6px' : '0' }}>
        {subject.name}
      </h3>

      {(note || subject.elective) && (
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
          {note && <span style={{ fontSize: '0.65rem', fontWeight: 'bold', background: 'rgba(255,255,255,0.15)', padding: '2px 6px', borderRadius: '4px' }}>{note}</span>}
          {subject.elective && <Star size={12} color="#fbbf24" />}
        </div>
      )}
      
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
    </div>
  );
}
