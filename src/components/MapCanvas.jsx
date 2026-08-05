import React, { useRef } from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';

import SubjectNode from './SubjectNode';
import SemesterLabelNode from './SemesterLabelNode';
import { useGraphLayout } from '../hooks/useGraphLayout';

const nodeTypes = { subject: SubjectNode, semesterLabel: SemesterLabelNode };

export default function MapCanvas({
  subjectsData,
  showElectives,
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
  
  const { nodes, edges, onNodesChange } = useGraphLayout({
    subjectsData,
    showElectives,
    userState,
    simulationState,
    positionsRef,
    resetTrigger,
    handleNodeContextMenu,
    selectedNode,
    shiftPressed
  });

  const hoverTimeoutRef = useRef(null);

  const onNodeMouseEnter = (_, node) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setSelectedNode(node.id);
    }, 800);
  };

  const onNodeMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setSelectedNode(null);
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
        onNodesChange={onNodesChange}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={(_, node) => setSelectedDetails(node.id)}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.2}
      >
        <Background color="#52525b" gap={20} className="react-flow__background-pattern" />
        <Controls style={{ background: 'rgba(24,24,27,0.8)', fill: 'white' }} />
        <MiniMap 
          nodeColor={n => n.className?.includes('highlighted') ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)'} 
          maskColor="rgba(0,0,0,0.5)" 
          style={{ background: 'rgba(24,24,27,0.8)' }} 
        />
      </ReactFlow>
    </div>
  );
}
