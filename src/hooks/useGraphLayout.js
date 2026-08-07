import { useState, useEffect, useCallback } from 'react';
import { applyNodeChanges } from 'reactflow';
import { calculateInitialLayout, calculateStatus, getTransitiveCorrelatives, getPathColors } from '../utils/graphUtils';

export function useGraphLayout({
  subjectsData, 
  showElectives, 
  showTransversals,
  userState, 
  simulationState, 
  positionsRef,
  resetTrigger,
  selectedNode,
  shiftPressed
}) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  // Initialize and inject status to nodes
  useEffect(() => {
    const { nodes: initialNodes, edges: initialEdges } = calculateInitialLayout(subjectsData, showElectives, showTransversals);
    
    const configuredNodes = initialNodes.map(n => {
      const savedPos = positionsRef.current[n.id];
      const pos = savedPos || n.position;

      if (n.type !== 'subject') return { ...n, position: pos };
      
      return {
        ...n,
        position: pos,
        data: {
          ...n.data,
          status: calculateStatus(n.data.subject, userState, simulationState),
          note: userState[n.id]?.note || ''
        }
      };
    });
    
    setNodes(configuredNodes);
    setEdges(initialEdges);
  }, [showElectives, showTransversals, userState, simulationState, resetTrigger, positionsRef, subjectsData]);

  // Update classes for highlighting
  useEffect(() => {
    if (!selectedNode) {
      setNodes(nds => nds.map(n => ({ ...n, className: '' })));
      setEdges(eds => eds.map(e => ({ ...e, className: '' })));
      return;
    }

    const connectedEdges = edges.filter(e => e.target === selectedNode || e.source === selectedNode);
    let path = new Map();
    
    if (shiftPressed) {
      path = getTransitiveCorrelatives(selectedNode, subjectsData);
      path.set(selectedNode, 0);
    }

    const isSemesterLabelSelected = selectedNode.startsWith('sem-label-');
    const selectedSemesterNum = isSemesterLabelSelected ? parseInt(selectedNode.replace('sem-label-', '')) : null;

    setNodes(nds => nds.map(n => {
      let isConnected = false;
      let isPath = false;
      let nodeStyles = { ...n.style };

      if (isSemesterLabelSelected) {
        if (n.id === selectedNode) {
          isConnected = true;
        } else if (n.data?.subject?.semester === selectedSemesterNum) {
          isConnected = true;
        }
      } else if (shiftPressed) {
        isPath = path.has(n.id);
        isConnected = isPath;
      } else {
        isConnected = n.id === selectedNode || connectedEdges.some(e => e.source === n.id || e.target === n.id);
      }
      
      if (isPath) {
        const colors = getPathColors(path.get(n.id));
        nodeStyles = { ...nodeStyles, '--path-color': colors.color, '--path-glow-color': colors.glow };
      }

      return {
        ...n,
        className: isPath ? 'path-highlighted highlighted' : (isConnected ? 'highlighted' : ''),
        style: nodeStyles
      };
    }));

    setEdges(eds => eds.map(e => {
      let isConnected = false;
      let isPath = false;
      let edgeStyles = { ...e.style };

      if (shiftPressed) {
        if (path.has(e.source) && path.has(e.target)) {
          const sourceDepth = path.get(e.source);
          const targetDepth = path.get(e.target);
          if (sourceDepth > targetDepth) {
            isPath = true;
            isConnected = true;
          }
        }
      } else {
        isConnected = e.target === selectedNode || e.source === selectedNode;
      }

      if (isPath) {
        const colors = getPathColors(path.get(e.source));
        edgeStyles = { ...edgeStyles, '--path-color': colors.color };
      }

      return {
        ...e,
        className: isPath ? 'path-highlighted highlighted' : (isConnected ? 'highlighted' : ''),
        style: edgeStyles
      };
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNode, edges.length, shiftPressed, subjectsData]);

  const onNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    []
  );

  return { nodes, edges, setNodes, onNodesChange };
}
