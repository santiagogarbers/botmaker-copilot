import { useState } from 'react';
import { ChevronDown, Play, Share2, Settings, Sun, Moon } from 'lucide-react';

const s = {
  bar: {
    height: 44,
    background: 'var(--bg-surface)',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
    gap: 8,
    flexShrink: 0,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontWeight: 600,
    fontSize: 13,
    color: 'var(--text-primary)',
    marginRight: 8,
  },
  logoDot: {
    width: 20,
    height: 20,
    borderRadius: 6,
    background: 'var(--accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    color: 'var(--text-secondary)',
  },
  sep: { color: 'var(--text-tertiary)', fontSize: 11 },
  crumb: {
    padding: '3px 6px',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'color .15s, background .15s',
    fontSize: 12,
  },
  crumbActive: {
    padding: '3px 6px',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    fontSize: 12,
    display: 'flex', alignItems: 'center', gap: 3,
    cursor: 'pointer',
  },
  spacer: { flex: 1 },
  actions: { display: 'flex', alignItems: 'center', gap: 4 },
  iconBtn: {
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)',
    transition: 'color .15s, background .15s',
    cursor: 'pointer',
  },
  divider: { width: 1, height: 18, background: 'var(--border)', margin: '0 4px' },
  previewBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    padding: '5px 12px',
    borderRadius: 'var(--radius-md)',
    background: 'var(--accent)',
    color: '#fff',
    fontWeight: 500,
    fontSize: 12,
    cursor: 'pointer',
    transition: 'opacity .15s',
  },
  kbdHint: {
    marginLeft: 2,
    fontSize: 10,
    opacity: 0.6,
    background: 'rgba(255,255,255,0.15)',
    padding: '1px 4px',
    borderRadius: 3,
  },
};

export default function TopBar({ onCommandBar, theme, onToggleTheme }) {
  return (
    <div style={s.bar}>
      <div style={s.logo}>
        <div style={s.logoDot}>⚡</div>
        Botmaker
      </div>

      <div style={s.breadcrumb}>
        <span style={s.crumb}>Agentes</span>
        <span style={s.sep}>/</span>
        <span style={s.crumb}>Producción</span>
        <span style={s.sep}>/</span>
        <span style={s.crumbActive}>
          Atención al cliente
          <ChevronDown size={11} />
        </span>
      </div>

      <div style={s.spacer} />

      <div style={s.actions}>
        <button
          style={s.iconBtn}
          title="Deshacer (⌘Z)"
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v6h6"/><path d="M3 13c1.5-4.5 6-7 11-6a10 10 0 0 1 7 9"/></svg>
        </button>

        <button
          style={s.iconBtn}
          title="Configuración"
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <Settings size={14} />
        </button>

        <button
          style={s.iconBtn}
          title="Compartir"
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <Share2 size={14} />
        </button>

        <button
          style={s.iconBtn}
          title={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
          onClick={onToggleTheme}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        <div style={s.divider} />

        <button
          style={s.iconBtn}
          title="Command bar (⌘K)"
          onClick={onCommandBar}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/></svg>
        </button>

        <button
          style={s.previewBtn}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          <Play size={11} fill="currentColor" />
          Preview
          <span style={s.kbdHint}>⌘⇧P</span>
        </button>
      </div>
    </div>
  );
}
