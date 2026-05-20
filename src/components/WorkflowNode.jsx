import { useState } from 'react';
import { NODE_TYPES } from '../data/initialNodes';

const DIFF_STYLES = {
  normal: { border: '1px solid var(--border-strong)' },
  added: {
    border: '1px dashed var(--green-border)',
    background: 'var(--green-dim)',
    boxShadow: '0 0 0 1px var(--green-dim)',
  },
  modified: {
    border: '1px dashed var(--yellow-border)',
    background: 'var(--yellow-dim)',
  },
  removed: {
    border: '1px dashed var(--red-border)',
    background: 'var(--red-dim)',
    opacity: 0.6,
  },
  generating: {
    border: '1px dashed var(--accent-border)',
    background: 'var(--accent-dim)',
    animation: 'thinkingPulse 1.4s ease-in-out infinite',
  },
};

const DIFF_BADGE = {
  added: { label: 'Nuevo', color: 'var(--green)', bg: 'var(--green-dim)' },
  modified: { label: 'Editado', color: 'var(--yellow)', bg: 'var(--yellow-dim)' },
  removed: { label: 'Eliminado', color: 'var(--red)', bg: 'var(--red-dim)' },
  generating: { label: 'Generando...', color: 'var(--accent)', bg: 'var(--accent-dim)' },
};

export default function WorkflowNode({ node, isSelected, onClick, onContextMenu }) {
  const [hovered, setHovered] = useState(false);
  const typeInfo = NODE_TYPES[node.type] || NODE_TYPES.message;
  const diffStyle = DIFF_STYLES[node.status] || DIFF_STYLES.normal;
  const badge = DIFF_BADGE[node.status];

  const isGenerating = node.status === 'generating';

  return (
    <div
      style={{
        position: 'absolute',
        left: node.x,
        top: node.y,
        width: 180,
        background: isSelected ? '#1e1c2e' : hovered ? 'var(--bg-elevated)' : 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        padding: '12px 14px',
        cursor: 'pointer',
        transition: 'background .15s, box-shadow .15s, transform .15s',
        boxShadow: isSelected
          ? `0 0 0 2px var(--accent), 0 4px 20px rgba(124,110,234,0.15)`
          : hovered ? '0 4px 16px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.3)',
        transform: hovered && !isGenerating ? 'translateY(-1px)' : 'none',
        animation: node._new ? 'nodeAppear 0.35s ease-out forwards' : 'none',
        userSelect: 'none',
        ...diffStyle,
      }}
      onClick={() => onClick(node.id)}
      onContextMenu={(e) => onContextMenu && onContextMenu(e, node)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Type badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{
            width: 20, height: 20, borderRadius: 5,
            background: typeInfo.color + '22',
            border: `1px solid ${typeInfo.color}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, color: typeInfo.color,
          }}>
            {typeInfo.icon}
          </span>
          <span style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {typeInfo.label}
          </span>
        </div>

        {badge && (
          <span style={{
            fontSize: 9, fontWeight: 600, letterSpacing: '0.05em',
            padding: '2px 5px', borderRadius: 3,
            color: badge.color, background: badge.bg,
            textTransform: 'uppercase',
          }}>
            {badge.label}
          </span>
        )}
      </div>

      {/* Node name */}
      {isGenerating ? (
        <div style={{
          height: 14, borderRadius: 3, marginBottom: 6,
          background: 'linear-gradient(90deg, var(--bg-elevated) 25%, var(--bg-active) 50%, var(--bg-elevated) 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
        }} />
      ) : (
        <div style={{ fontWeight: 500, fontSize: 13, color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.3 }}>
          {node.label}
        </div>
      )}

      {/* Subtitle */}
      {isGenerating ? (
        <div style={{
          height: 10, borderRadius: 3, width: '70%',
          background: 'linear-gradient(90deg, var(--bg-elevated) 25%, var(--bg-active) 50%, var(--bg-elevated) 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite 0.2s',
        }} />
      ) : (
        node.subtitle && (
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            {node.subtitle}
          </div>
        )
      )}

      {/* Hover actions */}
      {hovered && !isGenerating && (
        <div style={{
          position: 'absolute',
          bottom: -32,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 4,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-md)',
          padding: '4px 6px',
          whiteSpace: 'nowrap',
          animation: 'fadeIn 0.15s ease-out',
          zIndex: 10,
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        }}>
          <button style={{
            fontSize: 11, color: 'var(--text-secondary)', padding: '2px 6px',
            borderRadius: 3, transition: 'color .1s, background .1s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-active)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'none'; }}
          >
            ✎ Editar con IA
          </button>
          <div style={{ width: 1, background: 'var(--border)' }} />
          <button style={{
            fontSize: 11, color: 'var(--text-secondary)', padding: '2px 6px',
            borderRadius: 3, transition: 'color .1s, background .1s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-active)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'none'; }}
          >
            ⊙ Explicar
          </button>
        </div>
      )}
    </div>
  );
}
