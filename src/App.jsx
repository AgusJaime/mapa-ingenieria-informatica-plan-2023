import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ReactFlow, { Background, Controls, MiniMap, applyNodeChanges, MarkerType, useReactFlow, ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import * as XLSX from 'xlsx';
import { Download, Eye, EyeOff, Wand2, HelpCircle, X } from 'lucide-react';

import SubjectNode from './components/SubjectNode';
import SemesterLabelNode from './components/SemesterLabelNode';
import subjectsData from './data/subjects.json';

const nodeTypes = { subject: SubjectNode, semesterLabel: SemesterLabelNode };

// Constants for layout
const X_SPACING = 180;
const Y_SPACING = 80;

function calculateInitialLayout(subjects, showElectives) {
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
      // Top alignment instead of centering
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

function calculateStatus(subject, userState, simulationState, subjects) {
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

function getTransitiveCorrelatives(nodeId, subjectsData, depth = 1, acc = new Map()) {
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

function getPathColors(depth) {
  if (depth === 0) return { color: '#ef4444', glow: 'rgba(239, 68, 68, 0.7)' };
  if (depth === 1) return { color: '#f97316', glow: 'rgba(249, 115, 22, 0.7)' };
  if (depth === 2) return { color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.7)' };
  if (depth === 3) return { color: '#eab308', glow: 'rgba(234, 179, 8, 0.7)' };
  return { color: '#fef08a', glow: 'rgba(254, 240, 138, 0.5)' };
}

function MainFlow() {
  const [showElectives, setShowElectives] = useState(true);
  const [simulationMode, setSimulationMode] = useState(false);
  const [simulationState, setSimulationState] = useState({});
  const [shiftPressed, setShiftPressed] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState(null);

  useEffect(() => {
    if (!simulationMode) setSimulationState({});
  }, [simulationMode]);

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

  const [userState, setUserState] = useState(() => {
    const saved = localStorage.getItem('unlam-state');
    if (!saved) return {};
    
    let parsed = JSON.parse(saved);
    const codeMap = {
      "matematica_discreta": "3621", "analisis_matematico_i": "3622", "programacion_inicial": "3623",
      "introduccion_a_los_sistemas_de_informacion": "3624", "sistemas_de_numeracion": "3625", "principios_de_calidad_de_software": "3626",
      "algebra_y_geometria_analitica_i": "3627", "fisica_i": "3628", "programacion_estructurada_basica": "3629",
      "introduccion_a_la_gestion_de_requisitos": "3630", "fundamentos_de_sistemas_embebidos": "3631", "introduccion_a_los_proyectos_informaticos": "3632",
      "analisis_matematico_ii": "3633", "fisica_ii": "3634", "topicos_de_programacion": "3635",
      "bases_de_datos": "3636", "analisis_de_sistemas": "3637", "arquitectura_de_computadoras": "3638",
      "analisis_matematico_iii": "3639", "algoritmos_y_estructuras_de_datos": "3640", "bases_de_datos_aplicada": "3641",
      "principios_de_diseno_de_sistemas": "3642", "redes_de_computadoras": "3643", "gestion_de_las_organizaciones": "3644",
      "algebra_y_geometria_analitica_ii": "3645", "paradigmas_de_programacion": "3646", "requisitos_avanzados": "3647",
      "diseno_de_software": "3648", "sistemas_operativos": "3649", "seguridad_de_la_informacion": "3650",
      "probabilidad_y_estadistica": "3651", "programacion_avanzada": "3652", "arquitecturas_de_sistemas_software": "3653",
      "virtualizacion_de_hardware": "3654", "auditoria_y_legislacion": "3655", "estadistica_aplicada": "3656",
      "automatas_y_gramatica": "3657", "programacion_concurrente": "3658", "gestion_aplicada_al_desarrollo_de_software_i": "3659",
      "sistemas_operativos_avanzados": "3660", "gestion_de_proyectos": "3661", "matematica_aplicada": "3662",
      "lenguajes_y_compiladores": "3663", "inteligencia_artificial": "3664", "gestion_aplicada_al_desarrollo_de_software_ii": "3665",
      "seguridad_aplicada_y_forensia": "3666", "gestion_de_la_calidad_de_procesos_de_sistemas": "3667",
      "inteligencia_artificial_aplicada": "3668", "ciencia_de_datos": "3669", "innovacion_y_emprendedorismo": "3670",
      "proyecto_final_de_carrera": "3671", "practica_profesional_supervisada": "3675", "responsabilidad_social_universitaria": "3676",
      "taller_de_integracion": "3680", "ingles_i": "00901", "ingles_ii": "00902", "ingles_iii": "00903", "ingles_iv": "00904",
      "computacion_i": "00911", "computacion_ii": "00912", "electiva_i": "E1", "electiva_ii_1": "E2.1", "electiva_ii_2": "E2.2", "electiva_iii": "E3"
    };

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
  
  const [positionsState, setPositionsState] = useState(() => {
    const saved = localStorage.getItem('unlam-positions');
    return saved ? JSON.parse(saved) : {};
  });
  const positionsRef = useRef(positionsState);
  useEffect(() => { positionsRef.current = positionsState; }, [positionsState]);

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  
  // Context Menu state
  const [contextMenu, setContextMenu] = useState(null);
  const flowWrapper = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const { project } = useReactFlow();

  // Initialize graph
  useEffect(() => {
    const { nodes: initialNodes, edges: initialEdges } = calculateInitialLayout(subjectsData, showElectives);
    
    // Inject status, state, callbacks to nodes
    const configuredNodes = initialNodes.map(n => {
      const savedPos = positionsRef.current[n.id];
      const pos = savedPos || n.position;

      if (n.type !== 'subject') return { ...n, position: pos };
      
      return {
        ...n,
        position: pos,
        data: {
          ...n.data,
          status: calculateStatus(n.data.subject, userState, simulationState, subjectsData),
          note: userState[n.id]?.note || '',
          onContextMenu: handleNodeContextMenu
        }
      };
    });
    
    setNodes(configuredNodes);
    setEdges(initialEdges);
  }, [showElectives, userState, simulationState]);

  const handleNodeClick = useCallback((_, node) => {
    if (simulationMode) {
      setSimulationState(prev => {
        if (prev[node.id]) {
          const newState = { ...prev };
          delete newState[node.id];
          return newState;
        } else {
          return { ...prev, [node.id]: { status: 'simulada' } };
        }
      });
    } else {
      setUserState(prev => {
        const currentState = prev[node.id]?.status;
        const newState = { ...prev };
        
        if (currentState === 'promocionada') {
          // Si ya está promocionada, removemos el estado
          const updatedNodeState = { ...prev[node.id] };
          delete updatedNodeState.status;
          
          if (Object.keys(updatedNodeState).length === 0) {
            delete newState[node.id];
          } else {
            newState[node.id] = updatedNodeState;
          }
        } else {
          // Si no está promocionada, la marcamos
          newState[node.id] = { ...prev[node.id], status: 'promocionada' };
        }
        
        localStorage.setItem('unlam-state', JSON.stringify(newState));
        return newState;
      });
    }
  }, [simulationMode]);

  const handleNodeContextMenu = useCallback((event, nodeId) => {
    if (!flowWrapper.current) return;
    const bounds = flowWrapper.current.getBoundingClientRect();
    
    setContextMenu({
      nodeId,
      top: event.clientY - bounds.top,
      left: event.clientX - bounds.left,
    });
  }, []);

  const updateNodeState = (nodeId, newStatus, newNote) => {
    setUserState(prev => {
      const st = prev[nodeId] || {};
      const newState = { 
        ...prev, 
        [nodeId]: { 
          status: newStatus !== undefined ? newStatus : st.status, 
          note: newNote !== undefined ? newNote : st.note 
        } 
      };
      
      // If setting to available/unavailable, we just remove the forced state so it auto-calculates
      if (newStatus === 'clear') {
        delete newState[nodeId];
      }
      
      localStorage.setItem('unlam-state', JSON.stringify(newState));
      return newState;
    });
    setContextMenu(null);
  };

  const onNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    []
  );

  const onNodeDragStop = useCallback((event, node) => {
    setPositionsState(prev => {
      const newPos = { ...prev, [node.id]: node.position };
      localStorage.setItem('unlam-positions', JSON.stringify(newPos));
      return newPos;
    });
  }, []);

  const onNodeMouseEnter = useCallback((_, node) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setSelectedNode(node.id);
    }, 800); // 800ms delay para evitar activaciones accidentales rápidas
  }, []);

  const onNodeMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setSelectedNode(null);
  }, []);

  const onPaneClick = useCallback(() => {
    setContextMenu(null);
  }, []);

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

    setNodes(nds => nds.map(n => {
      let isConnected = false;
      let isPath = false;
      let nodeStyles = { ...n.style }; // Preserve existing styles like width/height if any

      if (shiftPressed) {
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
          isPath = true;
          isConnected = true;
        }
      } else {
        isConnected = e.target === selectedNode || e.source === selectedNode;
      }
      
      if (isPath) {
        const colors = getPathColors(path.get(e.source)); // Color based on the prerequisite's depth
        edgeStyles = { ...edgeStyles, '--path-color': colors.color };
      }

      return {
        ...e,
        className: isPath ? 'path-highlighted highlighted' : (isConnected ? 'highlighted' : ''),
        style: edgeStyles
      };
    }));
  }, [selectedNode, edges.length, shiftPressed]); // edges.length as dependency to avoid cycles but run on edge update

  const exportToExcel = () => {
    const statusMap = {
      'promocionada': 'Aprobada / Promocionada',
      'cursada': 'Cursada',
      'disponible': 'Disponible',
      'nodisponible': 'No Disponible',
      'simulada': 'Proyectada (Simulación)'
    };

    const dataToExport = subjectsData.map(sub => {
      const st = calculateStatus(sub, userState, simulationState, subjectsData);
      return {
        'Código': sub.id,
        'Materia': sub.name,
        'Año': sub.year === 0 ? 'Transversal' : `${sub.year}° Año`,
        'Cuatrimestre': sub.semester === 0 ? '-' : (sub.semester % 2 === 1 ? '1er Cuatrimestre' : '2do Cuatrimestre'),
        'Estado': statusMap[st] || st,
        'Nota / Anotación': userState[sub.id]?.note || '-'
      };
    });

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    
    // Anchos de columna para que quede más prolijo
    ws['!cols'] = [
      {wch: 8},   // Código
      {wch: 45},  // Materia
      {wch: 12},  // Año
      {wch: 20},  // Cuatrimestre
      {wch: 25},  // Estado
      {wch: 30}   // Nota / Anotación
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Progreso UNLaM");
    XLSX.writeFile(wb, "Progreso_UNLaM_Informatica.xlsx");
  };

  // Stats calculation
  const totalWithNote = Object.values(userState).filter(s => s.note && !isNaN(s.note));
  const avg = totalWithNote.length 
    ? (totalWithNote.reduce((acc, curr) => acc + parseInt(curr.note), 0) / totalWithNote.length).toFixed(2) 
    : 0;

  const totalIntermedio = subjectsData.filter(s => s.year <= 3 && !s.elective).length;
  const passedIntermedio = subjectsData.filter(s => s.year <= 3 && !s.elective && (userState[s.id]?.status === 'promocionada' || simulationState[s.id]?.status === 'simulada')).length;
  const pctIntermedio = Math.round((passedIntermedio / totalIntermedio) * 100);

  const totalMaterias = subjectsData.length;
  const materiasCompletadas = subjectsData.filter(s => {
    const st = simulationState[s.id]?.status || userState[s.id]?.status;
    return st === 'promocionada' || st === 'simulada';
  }).length;
  const pctTotal = Math.round((materiasCompletadas / totalMaterias) * 100);

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
        onPaneClick={() => {
          setSelectedDetails(null);
          setContextMenu(null);
        }}
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

      {/* Context Menu */}
      {contextMenu && (
        <div 
          className="context-menu glass" 
          style={{ top: contextMenu.top, left: contextMenu.left }}
        >
          <button onClick={() => updateNodeState(contextMenu.nodeId, 'promocionada')}>✅ Promocionada</button>
          <button onClick={() => updateNodeState(contextMenu.nodeId, 'cursada')}>⏱️ Cursada</button>
          <button onClick={() => updateNodeState(contextMenu.nodeId, 'clear')}>🔄 Auto-calcular</button>
          <input 
            type="number" 
            placeholder="Nota (ej. 8)"
            min="1" max="10"
            defaultValue={userState[contextMenu.nodeId]?.note || ''}
            onBlur={(e) => updateNodeState(contextMenu.nodeId, undefined, e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && updateNodeState(contextMenu.nodeId, undefined, e.target.value)}
          />
        </div>
      )}

      {/* Bottom Bar */}
      <div className="bottom-bar glass">
        <button className="btn" onClick={() => setShowElectives(!showElectives)}>
          {showElectives ? <EyeOff size={18} /> : <Eye size={18} />}
          {showElectives ? "Ocultar Electivas" : "Ver Electivas"}
        </button>

        <button className={`btn ${simulationMode ? 'btn-sim active' : ''}`} onClick={() => setSimulationMode(!simulationMode)}>
          <Wand2 size={18} />
          {simulationMode ? "Salir Simulación" : "Modo Simulación"}
        </button>
        
        <button className="btn" onClick={() => setShowShortcuts(true)} style={{ marginLeft: 'auto' }}>
          <HelpCircle size={18} />
          Atajos
        </button>

        <div className="stats" style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '24px' }}>
          <div className="stat-item">
            <span className="stat-label">Promedio</span>
            <span className="stat-value">{avg}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Título Intermedio</span>
            <span className="stat-value">{pctIntermedio}%</span>
          </div>
          <div className="stat-item" style={{ marginLeft: '8px' }}>
            <span className="stat-label" style={{ textTransform: 'uppercase' }}>Progreso ({materiasCompletadas}/{totalMaterias})</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', height: '6px', width: '100px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ background: 'var(--accent-color)', width: `${pctTotal}%`, height: '100%', transition: 'width 0.3s ease' }}></div>
              </div>
              <span className="stat-value" style={{ fontSize: '0.9rem' }}>{pctTotal}%</span>
            </div>
          </div>
        </div>

        <button className="btn btn-primary" onClick={exportToExcel} style={{ marginLeft: '16px' }}>
          <Download size={18} />
          Exportar
        </button>
      </div>

      {/* Year Progress Rings */}
      <div className="year-progress-container glass">
        {[1, 2, 3, 4, 5].map(year => {
          const yearSubs = subjectsData.filter(s => s.year === year && !s.elective);
          if (yearSubs.length === 0) return null;
          const passed = yearSubs.filter(s => {
            const st = simulationState[s.id]?.status || userState[s.id]?.status;
            return st === 'promocionada' || st === 'simulada';
          }).length;
          const pct = Math.round((passed / yearSubs.length) * 100);
          const dashoffset = 113 - (113 * pct) / 100; // 113 is approx circumference of r=18

          return (
            <div className="year-progress-ring" key={`year-${year}`}>
              <svg className="ring-svg">
                <circle cx="20" cy="20" r="18" className="ring-bg" />
                <circle cx="20" cy="20" r="18" className="ring-fill" style={{ strokeDasharray: 113, strokeDashoffset: dashoffset }} />
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 600 }}>{year}° Año</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sidebar Details */}
      <div className={`sidebar glass ${selectedDetails ? 'open' : ''}`}>
        {selectedDetails && (() => {
          const sub = subjectsData.find(s => s.id === selectedDetails);
          if (!sub) return null;
          
          return (
            <>
              <button className="sidebar-close" onClick={() => setSelectedDetails(null)}><X size={24} /></button>
              <h3 style={{ margin: 0, marginTop: '24px' }}>{sub.id}</h3>
              <h2>{sub.name}</h2>
              <div style={{ marginTop: '16px' }}>
                <h3 style={{ margin: '0 0 8px 0' }}>Requisitos Directos:</h3>
                <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)' }}>
                  {sub.correlatives.length === 0 ? <li>Ninguno</li> : 
                    sub.correlatives.map(c => {
                      const cSub = subjectsData.find(x => x.id === c);
                      return <li key={c}>{cSub ? cSub.name : c}</li>;
                    })
                  }
                </ul>
              </div>
              <textarea 
                placeholder="Anotaciones, tips, recordatorios para esta materia..."
                defaultValue={userState[sub.id]?.note || ''}
                onBlur={(e) => updateNodeState(sub.id, undefined, e.target.value)}
              />
            </>
          );
        })()}
      </div>

      {/* Shortcuts Modal */}
      {showShortcuts && (
        <div className="shortcuts-overlay" onClick={() => setShowShortcuts(false)}>
          <div className="shortcuts-modal glass" onClick={e => e.stopPropagation()}>
            <button className="sidebar-close" onClick={() => setShowShortcuts(false)}><X size={24} /></button>
            <h2>Atajos y Controles</h2>
            <div className="shortcut-row">
              <div className="shortcut-key">Click Izq.</div>
              <div className="shortcut-desc">Alternar estado Promocionada / Neutral.</div>
            </div>
            <div className="shortcut-row">
              <div className="shortcut-key" style={{ color: '#c084fc', borderColor: 'rgba(192, 132, 252, 0.3)' }}>Click (Sim.)</div>
              <div className="shortcut-desc">En Modo Simulación, marca como Simulada para proyectar requisitos.</div>
            </div>
            <div className="shortcut-row">
              <div className="shortcut-key">Click Der.</div>
              <div className="shortcut-desc">Abre menú contextual (Cursada, Auto-calcular, Nota).</div>
            </div>
            <div className="shortcut-row">
              <div className="shortcut-key">Doble Clic</div>
              <div className="shortcut-desc">Abre el panel lateral con detalles y notas de la materia.</div>
            </div>
            <div className="shortcut-row">
              <div className="shortcut-key" style={{ color: '#f97316', borderColor: 'rgba(249, 115, 22, 0.3)' }}>Shift + Hover</div>
              <div className="shortcut-desc">Muestra la cadena completa de correlativas hacia atrás (Ruta Crítica).</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <MainFlow />
    </ReactFlowProvider>
  );
}
