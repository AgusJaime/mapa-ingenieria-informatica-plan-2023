import { useState, useCallback, useRef, useEffect } from 'react';

export function useNodePositions() {
  const [positionsState, setPositionsState] = useState(() => {
    const saved = localStorage.getItem('unlam-positions');
    return saved ? JSON.parse(saved) : {};
  });
  
  const positionsRef = useRef(positionsState);
  useEffect(() => { 
    positionsRef.current = positionsState; 
  }, [positionsState]);

  const [resetTrigger, setResetTrigger] = useState(0);

  const onNodeDragStop = useCallback((event, node) => {
    setPositionsState(prev => {
      const newPos = { ...prev, [node.id]: node.position };
      localStorage.setItem('unlam-positions', JSON.stringify(newPos));
      return newPos;
    });
  }, []);

  const resetPositions = useCallback(() => {
    localStorage.removeItem('unlam-positions');
    setPositionsState({});
    positionsRef.current = {};
    setResetTrigger(prev => prev + 1);
    // Disparar evento para forzar recálculo
    window.dispatchEvent(new Event('storage'));
  }, []);

  return { positionsState, positionsRef, onNodeDragStop, resetPositions, resetTrigger };
}
