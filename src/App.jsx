import React, { useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import { HelpCircle } from 'lucide-react';

import MapCanvas from './components/MapCanvas';
import MapSidebar from './components/MapSidebar';
import MapProgressRings from './components/MapProgressRings';
import MapBottomBar from './components/MapBottomBar';

import { useMapState } from './hooks/useMapState';
import { useNodePositions } from './hooks/useNodePositions';
import { exportToExcel } from './utils/exportUtils';
import subjectsData from './data/subjects.json';

function MainFlow() {
  const {
    showElectives, setShowElectives,
    simulationMode, setSimulationMode,
    simulationState, setSimulationState,
    shiftPressed,
    showShortcuts, setShowShortcuts,
    selectedDetails, setSelectedDetails,
    contextMenu, setContextMenu,
    userState, setUserState
  } = useMapState();

  const { positionsRef, onNodeDragStop, resetPositions, resetTrigger } = useNodePositions();
  const [selectedNode, setSelectedNode] = useState(null);

  const handleNodeClick = (_, node) => {
    if (simulationMode) {
      setSimulationState(prev => {
        const currentState = prev[node.id]?.status;
        const newState = { ...prev };
        
        if (currentState === 'simulada') {
          delete newState[node.id];
        } else {
          newState[node.id] = { status: 'simulada' };
        }
        return newState;
      });
    } else {
      setUserState(prev => {
        const currentState = prev[node.id]?.status;
        const newState = { ...prev };
        
        if (currentState === 'promocionada') {
          const updatedNodeState = { ...prev[node.id] };
          delete updatedNodeState.status;
          
          if (Object.keys(updatedNodeState).length === 0) {
            delete newState[node.id];
          } else {
            newState[node.id] = updatedNodeState;
          }
        } else {
          newState[node.id] = { ...prev[node.id], status: 'promocionada' };
        }
        
        localStorage.setItem('unlam-state', JSON.stringify(newState));
        return newState;
      });
    }
  };

  const handleNodeContextMenu = (e, nodeId) => {
    e.preventDefault();
    setContextMenu({
      mouseX: e.clientX,
      mouseY: e.clientY,
      nodeId: nodeId
    });
  };

  const setNodeStatus = (status) => {
    if (!contextMenu) return;
    
    if (simulationMode) {
      setSimulationState(prev => {
        const newState = { ...prev };
        if (status === null) delete newState[contextMenu.nodeId];
        else newState[contextMenu.nodeId] = { status: 'simulada' };
        return newState;
      });
    } else {
      setUserState(prev => {
        const newState = { ...prev };
        const updatedNodeState = { ...prev[contextMenu.nodeId] };
        
        if (status === null) delete updatedNodeState.status;
        else updatedNodeState.status = status;
        
        if (Object.keys(updatedNodeState).length === 0) delete newState[contextMenu.nodeId];
        else newState[contextMenu.nodeId] = updatedNodeState;
        
        localStorage.setItem('unlam-state', JSON.stringify(newState));
        return newState;
      });
    }
    setContextMenu(null);
  };

  return (
    <>
      <MapCanvas 
        subjectsData={subjectsData}
        showElectives={showElectives}
        userState={userState}
        simulationState={simulationState}
        positionsRef={positionsRef}
        resetTrigger={resetTrigger}
        onNodeDragStop={onNodeDragStop}
        selectedNode={selectedNode}
        setSelectedNode={setSelectedNode}
        shiftPressed={shiftPressed}
        setSelectedDetails={setSelectedDetails}
        setContextMenu={setContextMenu}
        handleNodeClick={handleNodeClick}
        handleNodeContextMenu={handleNodeContextMenu}
      />

      <MapSidebar 
        selectedDetails={selectedDetails}
        subjectsData={subjectsData}
        setSelectedDetails={setSelectedDetails}
        userState={userState}
        setUserState={setUserState}
      />

      <MapProgressRings 
        subjectsData={subjectsData}
        userState={userState}
        simulationState={simulationState}
      />

      <MapBottomBar 
        subjectsData={subjectsData}
        userState={userState}
        simulationState={simulationState}
        simulationMode={simulationMode}
        setSimulationMode={setSimulationMode}
        showElectives={showElectives}
        setShowElectives={setShowElectives}
        setShowShortcuts={setShowShortcuts}
        exportToExcel={() => exportToExcel(subjectsData, userState, simulationState)}
        resetPositions={resetPositions}
      />

      {/* Context Menu */}
      {contextMenu && (
        <div 
          className="context-menu glass"
          style={{ top: contextMenu.mouseY, left: contextMenu.mouseX }}
        >
          <button onClick={() => setNodeStatus('promocionada')}>Aprobada</button>
          <button onClick={() => setNodeStatus('cursada')}>Regular</button>
          <button onClick={() => setNodeStatus(null)} className="danger">Quitar estado</button>
        </div>
      )}

      {/* Shortcuts tooltip without its own button now, as it's triggered from bottom bar */}
      {showShortcuts && (
        <div className="shortcuts-tooltip glass">
          <h4 style={{ margin: '0 0 8px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>Atajos</h4>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: '0.85rem' }}>
            <li style={{ marginBottom: '4px' }}><strong>Click:</strong> Aprobar / Desaprobar</li>
            <li style={{ marginBottom: '4px' }}><strong>Click Derecho:</strong> Cambiar estado (Aprobada/Regular)</li>
            <li style={{ marginBottom: '4px' }}><strong>Doble Click:</strong> Ver detalles / Agregar nota</li>
            <li style={{ marginBottom: '4px' }}><strong>Shift + Hover:</strong> Ver correlativas requeridas</li>
            <li><strong>Arrastrar materia:</strong> Personalizar ubicación</li>
          </ul>
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <MainFlow />
    </ReactFlowProvider>
  );
}
