import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Star, Mail } from 'lucide-react';

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

export default function SubjectNode({ data, selected }) {
  const { subject, status, note } = data;
  const [showNote, setShowNote] = useState(false);

  return (
    <div
      className={`subject-node glass ${selected ? 'selected' : ''}`}
      style={{
        background: STATE_GRADIENTS[status] || STATE_GRADIENTS.nodisponible,
        borderColor: STATE_COLORS[status] || STATE_COLORS.nodisponible
      }}
    >
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      
      <h3 style={{ fontSize: '0.75rem', fontWeight: 500, lineHeight: 1.2, margin: 0, paddingBottom: (note || subject.elective) ? '6px' : '0' }}>
        {subject.name}
      </h3>

      {(note || subject.elective) && (
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
          {subject.elective && <Star size={12} color="#fbbf24" />}
        </div>
      )}

      {note && (
        <div 
          style={{ position: 'absolute', top: '-10px', right: '-10px', cursor: 'pointer', zIndex: 10, background: 'var(--accent-color)', borderRadius: '50%', padding: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.1)' }}
          onClick={(e) => { e.stopPropagation(); setShowNote(!showNote); }}
          title="Ver anotación"
        >
          <Mail size={14} color="white" />
        </div>
      )}

      {showNote && note && (
        <div 
          style={{ position: 'absolute', top: '-48px', right: '-20px', background: 'rgba(0,0,0,0.95)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.75rem', color: 'white', whiteSpace: 'nowrap', zIndex: 20, border: '1px solid rgba(255,255,255,0.2)', pointerEvents: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
        >
          {note}
          <div style={{ position: 'absolute', bottom: '-5px', right: '22px', width: '10px', height: '10px', background: 'rgba(0,0,0,0.95)', borderBottom: '1px solid rgba(255,255,255,0.2)', borderRight: '1px solid rgba(255,255,255,0.2)', transform: 'rotate(45deg)' }}></div>
        </div>
      )}
      
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
    </div>
  );
}
