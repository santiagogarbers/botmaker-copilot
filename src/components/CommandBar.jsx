import { useState, useEffect, useRef } from 'react';
import { Search, Zap, RotateCcw, Play, Plus, Settings, FileText, Cpu } from 'lucide-react';

const COMMANDS = [
  { icon: <Plus size={13} />, label: 'Nuevo nodo', desc: 'Agregar un nodo al flujo', shortcut: null, group: 'Canvas' },
  { icon: <RotateCcw size={13} />, label: 'Deshacer', desc: 'Revertir el último cambio', shortcut: '⌘Z', group: 'Canvas' },
  { icon: '⊡', label: 'Centrar canvas', desc: 'Volver a la vista completa', shortcut: null, group: 'Canvas' },
  { icon: <Play size={13} />, label: 'Preview', desc: 'Simular una conversación', shortcut: '⌘⇧P', group: 'Canvas' },
  { icon: '✎', label: 'Editar con IA', desc: 'Modificar nodo seleccionado con IA', shortcut: null, group: 'IA' },
  { icon: '⊙', label: 'Optimizar flujo', desc: 'Analizar y sugerir mejoras', shortcut: null, group: 'IA' },
  { icon: '↩', label: 'Rollback de conversación', desc: 'Volver a un estado anterior', shortcut: '⌘⇧R', group: 'IA' },
  { icon: <Settings size={13} />, label: 'Configuración', desc: 'Ajustes del agente y canal', shortcut: null, group: 'General' },
  { icon: <FileText size={13} />, label: 'Ver documentación', desc: 'Guía de uso y referencia', shortcut: null, group: 'General' },
];

export default function CommandBar({ onClose, onCommand }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handler = e => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const filtered = COMMANDS.filter(c =>
    !query || c.label.toLowerCase().includes(query.toLowerCase()) || c.desc.toLowerCase().includes(query.toLowerCase())
  );

  function handleKey(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    if (e.key === 'Enter') { onCommand?.(filtered[selected]); onClose(); }
  }

  const groups = [...new Set(filtered.map(c => c.group))];

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: 120,
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 500,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
          animation: 'nodeAppear 0.2s ease-out',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px',
          borderBottom: '1px solid var(--border)',
        }}>
          <Search size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(0); }}
            onKeyDown={handleKey}
            placeholder="Qué querés hacer..."
            style={{ flex: 1, fontSize: 14, color: 'var(--text-primary)' }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ color: 'var(--text-tertiary)', fontSize: 11, padding: '2px 6px', borderRadius: 3, background: 'var(--bg-active)' }}
            >
              ✕
            </button>
          )}
          <kbd style={{
            fontSize: 10, color: 'var(--text-tertiary)',
            background: 'var(--bg-active)', border: '1px solid var(--border)',
            padding: '2px 6px', borderRadius: 3, fontFamily: 'var(--font-sans)',
          }}>Esc</kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight: 340, overflowY: 'auto', padding: '8px 0' }}>
          {query && filtered.length === 0 && (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 12 }}>
              Sin resultados para "{query}"
            </div>
          )}

          {groups.map(group => {
            const items = filtered.filter(c => c.group === group);
            if (!items.length) return null;
            const globalStartIdx = filtered.indexOf(items[0]);
            return (
              <div key={group}>
                {!query && (
                  <div style={{
                    fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
                    color: 'var(--text-tertiary)', padding: '6px 16px 4px',
                  }}>
                    {group}
                  </div>
                )}
                {items.map((cmd, localIdx) => {
                  const globalIdx = filtered.indexOf(cmd);
                  const isSelected = globalIdx === selected;
                  return (
                    <button
                      key={cmd.label}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        width: '100%', padding: '8px 16px',
                        background: isSelected ? 'var(--accent-dim)' : 'none',
                        transition: 'background .1s',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={() => setSelected(globalIdx)}
                      onClick={() => { onCommand?.(cmd); onClose(); }}
                    >
                      <span style={{
                        width: 26, height: 26, borderRadius: 'var(--radius-sm)',
                        background: isSelected ? 'var(--accent)' : 'var(--bg-active)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: isSelected ? '#fff' : 'var(--text-secondary)',
                        fontSize: typeof cmd.icon === 'string' ? 12 : 13,
                        flexShrink: 0,
                        transition: 'background .1s, color .1s',
                      }}>
                        {cmd.icon}
                      </span>
                      <div style={{ flex: 1, textAlign: 'left' }}>
                        <div style={{ fontSize: 13, color: isSelected ? 'var(--text-primary)' : 'var(--text-primary)', fontWeight: 400 }}>
                          {cmd.label}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 1 }}>
                          {cmd.desc}
                        </div>
                      </div>
                      {cmd.shortcut && (
                        <kbd style={{
                          fontSize: 10, color: 'var(--text-tertiary)',
                          background: 'var(--bg-active)', border: '1px solid var(--border)',
                          padding: '2px 6px', borderRadius: 3, fontFamily: 'var(--font-sans)',
                          flexShrink: 0,
                        }}>
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          borderTop: '1px solid var(--border)',
          padding: '8px 16px',
          display: 'flex', gap: 12,
        }}>
          {[
            { k: '↑↓', l: 'navegar' },
            { k: '↵', l: 'seleccionar' },
            { k: 'Esc', l: 'cerrar' },
          ].map(({ k, l }) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-tertiary)' }}>
              <kbd style={{
                background: 'var(--bg-active)', border: '1px solid var(--border)',
                padding: '1px 5px', borderRadius: 3, fontFamily: 'var(--font-sans)', fontSize: 10,
              }}>{k}</kbd>
              {l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
