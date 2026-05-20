import { useRef, useState, useEffect } from 'react';
import WorkflowNode from './WorkflowNode';
import { NODE_TYPES } from '../data/initialNodes';

function ConnectionLine({ from, to, nodes, label, isNew }) {
  const fromNode = nodes.find(n => n.id === from);
  const toNode = nodes.find(n => n.id === to);
  if (!fromNode || !toNode) return null;

  const x1 = fromNode.x + 180;
  const y1 = fromNode.y + 42;
  const x2 = toNode.x;
  const y2 = toNode.y + 42;

  const cx1 = x1 + (x2 - x1) * 0.5;
  const cy1 = y1;
  const cx2 = x1 + (x2 - x1) * 0.5;
  const cy2 = y2;

  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  const pathD = `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
  const pathLength = 300;

  return (
    <g>
      <path
        d={pathD}
        fill="none"
        stroke={isNew ? 'var(--green-border)' : 'var(--border-strong)'}
        strokeWidth={isNew ? 1.5 : 1.5}
        strokeDasharray={isNew ? '5 3' : 'none'}
        style={isNew ? {
          strokeDasharray: pathLength,
          strokeDashoffset: pathLength,
          animation: 'connectionDraw 0.6s ease-out forwards',
        } : {}}
      />
      {/* Arrow */}
      <polygon
        points={`${x2},${y2} ${x2 - 7},${y2 - 3} ${x2 - 7},${y2 + 3}`}
        fill={isNew ? 'var(--green-border)' : 'var(--border-strong)'}
      />
      {label && (
        <g>
          <rect
            x={midX - (label.length * 3.5)}
            y={midY - 9}
            width={label.length * 7}
            height={16}
            rx={3}
            fill="var(--bg-elevated)"
            stroke="var(--border)"
            strokeWidth={1}
          />
          <text
            x={midX}
            y={midY + 3}
            textAnchor="middle"
            fontSize={10}
            fill="var(--text-secondary)"
            fontFamily="var(--font-sans)"
          >
            {label}
          </text>
        </g>
      )}
    </g>
  );
}

function EmptyState({ onStartChat }) {
  const templates = [
    { icon: '🛎', title: 'Atención al cliente', desc: 'Responde FAQs y escala a humanos' },
    { icon: '📋', title: 'Calificación de leads', desc: 'Califica y agenda demos automáticas' },
    { icon: '📦', title: 'Seguimiento de pedidos', desc: 'Estado de envíos y devoluciones' },
  ];

  return (
    <div style={{
      position: 'absolute', inset: 0, display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 32,
    }}>
      <div style={{ textAlign: 'center', animation: 'fadeIn 0.4s ease-out' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⚡</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
          Describí tu agente de IA
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          y lo construimos juntos en segundos
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, animation: 'fadeIn 0.5s ease-out 0.1s both' }}>
        {templates.map((t, i) => (
          <button
            key={i}
            onClick={onStartChat}
            style={{
              width: 160, padding: '14px', textAlign: 'left',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              transition: 'border-color .15s, background .15s, transform .15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--accent-border)';
              e.currentTarget.style.background = 'var(--bg-elevated)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.background = 'var(--bg-surface)';
              e.currentTarget.style.transform = 'none';
            }}
          >
            <div style={{ fontSize: 20, marginBottom: 8 }}>{t.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>
              {t.title}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{t.desc}</div>
            <div style={{ marginTop: 10, fontSize: 11, color: 'var(--accent)' }}>Usar este →</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Canvas({ nodes, connections, selectedNodeId, onSelectNode, isEmpty, onStartChat, chatOpen, onToggleChat }) {
  const svgRef = useRef(null);
  const [pan, setPan] = useState({ x: 20, y: 40 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [contextMenu, setContextMenu] = useState(null);
  const [zoom, setZoom] = useState(0.9);

  // Close context menu on click outside
  useEffect(() => {
    const close = () => setContextMenu(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  function handleMouseDown(e) {
    if (e.target === svgRef.current || e.target.tagName === 'svg') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }

  function handleMouseMove(e) {
    if (!isPanning) return;
    setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
  }

  function handleMouseUp() { setIsPanning(false); }

  function handleWheel(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.95 : 1.05;
    setZoom(z => Math.max(0.4, Math.min(2, z * delta)));
  }

  function handleContextMenu(e, node) {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, node });
  }

  return (
    <div
      style={{
        flex: 1, position: 'relative', overflow: 'hidden',
        background: 'var(--bg-base)',
        backgroundImage: `radial-gradient(circle, var(--border) 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
        cursor: isPanning ? 'grabbing' : 'default',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Zoom controls */}
      <div style={{
        position: 'absolute', bottom: 16, left: 16, zIndex: 20,
        display: 'flex', flexDirection: 'column', gap: 2,
      }}>
        {[
          { label: '+', action: () => setZoom(z => Math.min(2, z * 1.15)) },
          { label: '−', action: () => setZoom(z => Math.max(0.4, z / 1.15)) },
          { label: '⊡', action: () => { setZoom(1); setPan({ x: 40, y: 20 }); } },
        ].map(({ label, action }) => (
          <button
            key={label}
            onClick={action}
            style={{
              width: 28, height: 28, background: 'var(--bg-elevated)',
              border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
              color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500,
              transition: 'color .1s, background .1s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-active)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Zoom level indicator */}
      <div style={{
        position: 'absolute', bottom: 16, left: 52, zIndex: 20,
        fontSize: 11, color: 'var(--text-tertiary)', padding: '4px 8px',
        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)',
      }}>
        {Math.round(zoom * 100)}%
      </div>

      {/* AI Copilot toggle */}
      <button
        onClick={onToggleChat}
        style={{
          position: 'absolute', top: 12, right: 12, zIndex: 20,
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '5px 10px',
          background: chatOpen ? 'var(--accent-dim)' : 'var(--bg-elevated)',
          border: `1px solid ${chatOpen ? 'var(--accent-border)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-md)',
          color: chatOpen ? 'var(--accent)' : 'var(--text-secondary)',
          fontSize: 11, fontWeight: 500,
          cursor: 'pointer', transition: 'all .15s',
        }}
        onMouseEnter={e => { if (!chatOpen) { e.currentTarget.style.borderColor = 'var(--accent-border)'; e.currentTarget.style.color = 'var(--accent)'; }}}
        onMouseLeave={e => { if (!chatOpen) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}}
      >
        <span style={{ fontSize: 10 }}>⚡</span>
        AI Copilot
      </button>

      {isEmpty ? (
        <EmptyState onStartChat={onStartChat} />
      ) : (
        <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '0 0', position: 'relative' }}>
          {/* SVG connections layer */}
          <svg
            ref={svgRef}
            style={{ position: 'absolute', top: 0, left: 0, width: 1400, height: 800, overflow: 'visible', pointerEvents: 'none' }}
          >
            <defs>
              <style>{`
                @keyframes connectionDraw {
                  from { stroke-dashoffset: 300; }
                  to   { stroke-dashoffset: 0; }
                }
              `}</style>
            </defs>
            {connections.map(conn => (
              <ConnectionLine
                key={conn.id}
                from={conn.from}
                to={conn.to}
                nodes={nodes}
                label={conn.label}
                isNew={conn._new}
              />
            ))}
          </svg>

          {/* Nodes */}
          {nodes.map(node => (
            <WorkflowNode
              key={node.id}
              node={node}
              isSelected={selectedNodeId === node.id}
              onClick={onSelectNode}
              onContextMenu={handleContextMenu}
            />
          ))}
        </div>
      )}

      {/* Context menu */}
      {contextMenu && (
        <div
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-md)',
            padding: '4px',
            zIndex: 100,
            minWidth: 180,
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            animation: 'fadeIn 0.12s ease-out',
          }}
          onClick={e => e.stopPropagation()}
        >
          {[
            { icon: '✎', label: 'Editar con IA' },
            { icon: '⊕', label: 'Duplicar' },
            { icon: '←', label: 'Agregar nodo antes' },
            { icon: '→', label: 'Agregar nodo después' },
            null,
            { icon: '⊙', label: 'Explicar este nodo' },
            { icon: '✓', label: 'Probar este nodo' },
            null,
            { icon: '✗', label: 'Eliminar', danger: true },
          ].map((item, i) =>
            item === null ? (
              <div key={i} style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
            ) : (
              <button
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  width: '100%', padding: '6px 8px', borderRadius: 'var(--radius-sm)',
                  color: item.danger ? 'var(--red)' : 'var(--text-secondary)',
                  transition: 'background .1s, color .1s', fontSize: 12,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = item.danger ? 'var(--red-dim)' : 'var(--bg-active)';
                  if (!item.danger) e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.color = item.danger ? 'var(--red)' : 'var(--text-secondary)';
                }}
                onClick={() => setContextMenu(null)}
              >
                <span style={{ width: 14, textAlign: 'center', fontSize: 11 }}>{item.icon}</span>
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
