import { MarkerType } from 'reactflow';
import { X_SPACING, Y_SPACING } from './constants';

export function calculateInitialLayout(subjects, showElectives) {
  const nodes = [];
  const edges = [];
  
  // Group by semester
  const semesters = {};
  
  subjects.forEach(sub => {
    if (!showElectives && sub.elective) return;
    
    if (!semesters[sub.semester]) semesters[sub.semester] = [];
    semesters[sub.semester].push(sub);
  });
  
  // Calculate node positions
  Object.keys(semesters).forEach(sem => {
    const semNum = parseInt(sem);
    const semSubjects = semesters[sem];
    const xPos = (semNum - 1) * X_SPACING;
    
    if (semNum > 0) {
      nodes.push({
        id: `sem-label-${semNum}`,
        type: 'semesterLabel',
        position: { x: xPos + 100, y: 120 }, // Above the columns
        data: { semester: semNum },
        draggable: false,
        selectable: false
      });
    }
    
    semSubjects.forEach((sub, index) => {
      // Top alignment
      const yPos = index * Y_SPACING;
      
      nodes.push({
        id: sub.id,
        type: 'subject',
        position: { x: xPos + 100, y: yPos + 200 },
        data: { subject: sub },
        draggable: true,
      });
    });
  });
  
  // Calculate edges
  subjects.forEach(sub => {
    if (!showElectives && sub.elective) return;
    
    sub.correlatives.forEach(corrId => {
      if (!showElectives && subjects.find(s => s.id === corrId)?.elective) return;
      
      edges.push({
        id: `e${corrId}-${sub.id}`,
        source: corrId,
        target: sub.id,
        type: 'default',
        animated: false,
        style: { stroke: 'rgba(255, 255, 255, 0.1)', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: 'rgba(255, 255, 255, 0.1)',
        },
      });
    });
  });
  
  return { nodes, edges };
}

export function calculateStatus(subject, userState, simulationState, subjectsData) {
  if (simulationState && simulationState[subject.id]?.status) {
    return simulationState[subject.id].status;
  }
  if (userState[subject.id]?.status) {
    return userState[subject.id].status;
  }
  
  // Check if available based on correlatives
  const canTake = subject.correlatives.every(corrId => {
    const st = (simulationState && simulationState[corrId]?.status) || userState[corrId]?.status;
    return st === 'cursada' || st === 'promocionada' || st === 'simulada';
  });
  
  return canTake ? 'disponible' : 'nodisponible';
}

export function getTransitiveCorrelatives(nodeId, subjectsData, depth = 1, acc = new Map()) {
  const subject = subjectsData.find(s => s.id === nodeId);
  if (!subject) return acc;
  
  subject.correlatives.forEach(corrId => {
    const currentDepth = acc.has(corrId) ? acc.get(corrId) : Infinity;
    if (depth < currentDepth) {
      acc.set(corrId, depth);
      getTransitiveCorrelatives(corrId, subjectsData, depth + 1, acc);
    }
  });
  
  return acc;
}

export function getPathColors(depth) {
  if (depth === 0) return { color: '#ef4444', glow: 'rgba(239, 68, 68, 0.8)' };
  if (depth === 1) return { color: '#f97316', glow: 'rgba(249, 115, 22, 0.7)' };
  if (depth === 2) return { color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.7)' };
  if (depth === 3) return { color: '#eab308', glow: 'rgba(234, 179, 8, 0.7)' };
  return { color: '#fef08a', glow: 'rgba(254, 240, 138, 0.5)' };
}
