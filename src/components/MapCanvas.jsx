import React, { useRef, useState } from 'react';
import ReactFlow, { Background, Controls, MiniMap, ControlButton } from 'reactflow';
import { Lock, Unlock } from 'lucide-react';
import 'reactflow/dist/style.css';

import SubjectNode from './SubjectNode';
import SemesterLabelNode from './SemesterLabelNode';
import { useGraphLayout } from '../hooks/useGraphLayout';

const nodeTypes = { subject: SubjectNode, semesterLabel: SemesterLabelNode };

export default function MapCanvas({
  subjectsData,
  showElectives,
  showTransversals,
  userState,
  simulationState,
  positionsRef,
  resetTrigger,
  onNodeDragStop,
  selectedNode,
  setSelectedNode,
  shiftPressed,
  setSelectedDetails,
  setContextMenu,
  handleNodeClick,
  handleNodeContextMenu
}) {
  const flowWrapper = useRef(null);
  const [nodesLocked, setNodesLocked] = useState(false);
  
  const { nodes, edges, onNodesChange } = useGraphLayout({
    subjectsData,
    showElectives,
    showTransversals,
    userState,
    simulationState,
    positionsRef,
    resetTrigger,
    selectedNode,
    shiftPressed
  });

  const hoverTimeoutRef = useRef(null);
  const isDraggingRef = useRef(false);

  const onNodeMouseEnter = (_, node) => {
    if (isDraggingRef.current) return;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setSelectedNode(node.id);
    }, 800);
  };

  const onNodeMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setSelectedNode(null);
  };

  const onNodeDragStart = () => {
    isDraggingRef.current = true;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setSelectedNode(null);
  };

  const handleNodeDragStop = (event, node) => {
    isDraggingRef.current = false;
    onNodeDragStop(event, node);
  };

  const onPaneClick = () => {
    setSelectedDetails(null);
    setContextMenu(null);
  };

  return (
    <div className={`app-container ${selectedNode ? 'focus-mode' : ''}`} style={{ width: '100vw', height: '100vh', position: 'relative' }} ref={flowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodesDraggable={!nodesLocked}
        onNodesChange={onNodesChange}
        onNodeDragStart={onNodeDragStart}
        onNodeDragStop={handleNodeDragStop}
        onNodeClick={handleNodeClick}
        onNodeContextMenu={(e, node) => handleNodeContextMenu(e, node.id)}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.2}
      >
        <Background color="#52525b" gap={20} className="react-flow__background-pattern" />
        <Controls showInteractive={false} style={{ background: 'rgba(24,24,27,0.8)', fill: 'white' }}>
          <ControlButton onClick={() => setNodesLocked(!nodesLocked)} title={nodesLocked ? 'Desbloquear posiciones' : 'Bloquear posiciones'} style={{ color: nodesLocked ? '#f97316' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {nodesLocked ? <Lock size={14} /> : <Unlock size={14} />}
          </ControlButton>
        </Controls>
        <MiniMap 
          nodeColor={n => n.className?.includes('highlighted') ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)'} 
          maskColor="rgba(0,0,0,0.5)" 
          style={{ background: 'rgba(24,24,27,0.8)' }} 
        />
      </ReactFlow>
    </div>
  );
}
