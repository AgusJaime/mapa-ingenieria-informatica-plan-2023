import { useState, useEffect } from 'react';
import { codeMap } from '../utils/constants';

export function useMapState() {
  const [showElectives, setShowElectives] = useState(true);
  const [showTransversals, setShowTransversals] = useState(true);
  const [simulationMode, setSimulationMode] = useState(false);
  const [simulationState, setSimulationState] = useState({});
  const [shiftPressed, setShiftPressed] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState(null);

  // Clean simulation state when disabling mode
  useEffect(() => {
    if (!simulationMode) setSimulationState({});
  }, [simulationMode]);

  // Handle shift key for highlighting transitive correlatives
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Shift') setShiftPressed(true);
    };
    const handleKeyUp = (e) => {
      if (e.key === 'Shift') setShiftPressed(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Handle user state persistence and migration
  const [userState, setUserState] = useState(() => {
    const saved = localStorage.getItem('unlam-state');
    if (!saved) return {};
    
    let parsed = JSON.parse(saved);
    
    let needsUpdate = false;
    const migrated = {};
    for (const key in parsed) {
      if (codeMap[key]) {
        migrated[codeMap[key]] = parsed[key];
        needsUpdate = true;
      } else {
        migrated[key] = parsed[key];
      }
    }
    
    if (needsUpdate) {
      localStorage.setItem('unlam-state', JSON.stringify(migrated));
    }
    
    return migrated;
  });

  return {
    showElectives, setShowElectives,
    showTransversals, setShowTransversals,
    simulationMode, setSimulationMode,
    simulationState, setSimulationState,
    shiftPressed, setShiftPressed,
    showShortcuts, setShowShortcuts,
    selectedDetails, setSelectedDetails,
    userState, setUserState
  };
}
