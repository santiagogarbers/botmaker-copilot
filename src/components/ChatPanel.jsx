import { useState, useRef, useEffect, useCallback } from 'react';
import { matchScript, AI_SCRIPTS } from '../data/aiScripts';
import { X, ChevronRight, RotateCcw, History } from 'lucide-react';

// ─────────────────────────────────────────────
// Live elapsed timer hook
// ─────────────────────────────────────────────
function useElapsed(startTime, running) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!running || !startTime) { setElapsed(0); return; }
    const tick = () => setElapsed(((Date.now() - startTime) / 1000).toFixed(1));
    tick();
    const id = setInterval(tick, 100);
    return () => clearInterval(id);
  }, [running, startTime]);
  return elapsed;
}

function useTokens(startTime, running) {
  const [tokens, setTokens] = useState(0);
  useEffect(() => {
    if (!running || !startTime) { setTokens(0); return; }
    const id = setInterval(() => {
      const secs = (Date.now() - startTime) / 1000;
      // ~180 tok/s base + slight acceleration over time + noise
      const base = Math.floor(secs * 180 + secs * secs * 2.5);
      const noise = Math.floor(Math.random() * 12);
      setTokens(base + noise);
    }, 120);
    return () => clearInterval(id);
  }, [running, startTime]);
  return tokens;
}

// ─────────────────────────────────────────────
// ThinkingBlock — the Claude-style collapsible
// ─────────────────────────────────────────────
function ThinkingBlock({ msg }) {
  const [expanded, setExpanded] = useState(false);
  const elapsed = useElapsed(msg.startTime, msg.thinking);
  const tokens = useTokens(msg.startTime, msg.thinking);

  const { thinkingSteps: steps = [], thinkingStep: currentIdx = 0, thinking, thinkingElapsed } = msg;
  const currentText = steps[currentIdx] ?? steps[steps.length - 1] ?? '';
  const isDone = !thinking;
  const finalElapsed = thinkingElapsed ?? elapsed;

  return (
    <div style={{ marginBottom: 10 }}>

      {/* ── Collapsible row ── */}
      <button
        onClick={() => setExpanded(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          width: '100%', padding: '4px 0',
          background: 'none',
          border: 'none',
          borderBottom: expanded ? '1px solid var(--border-subtle)' : 'none',
          borderRadius: 0,
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        {/* Chevron */}
        <ChevronRight
          size={11}
          style={{
            color: 'var(--text-tertiary)', flexShrink: 0,
            transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform .2s ease',
          }}
        />

        {isDone ? (
          <span style={{
            fontSize: 12, fontStyle: 'italic', flex: 1,
            color: 'var(--text-tertiary)',
          }}>
            Pensamiento completado
          </span>
        ) : (
          <span style={{
            fontSize: 12, flex: 1,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            background: 'linear-gradient(90deg, #808080 0%, #808080 25%, #b8b0ff 45%, #e0dcff 50%, #b8b0ff 55%, #808080 75%, #808080 100%)',
            backgroundSize: '300% 100%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'thinkingShimmer 2.5s ease-in-out infinite',
          }}>
            {currentText}
          </span>
        )}

        {/* Elapsed — plain text, no box */}
        <span style={{
          fontSize: 10, fontFamily: 'var(--font-mono)',
          color: isDone ? 'var(--text-tertiary)' : 'var(--accent)',
          ...(isDone ? {} : {
            background: 'var(--accent-dim)',
            border: '1px solid var(--accent-border)',
            padding: '1px 5px', borderRadius: 3,
          }),
          flexShrink: 0,
        }}>
          {finalElapsed}s
        </span>
      </button>

      {/* ── Expanded history ── */}
      {expanded && (
        <div style={{
          borderRadius: 'var(--radius-md)',
          padding: '6px 10px 8px',
          background: 'var(--bg-elevated)',
          animation: 'fadeIn 0.15s ease-out',
        }}>
          {steps.slice(0, currentIdx + 1).map((step, i) => {
            const isCurrent = i === currentIdx && !isDone;
            const isDoneStep = i < currentIdx || isDone;
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '4px 0',
                borderBottom: i < steps.slice(0, currentIdx + 1).length - 1 ? '1px solid var(--border-subtle)' : 'none',
                opacity: isDoneStep && !isCurrent && isDone ? 0.55 : 1,
                animation: isCurrent ? 'fadeIn 0.2s ease-out' : 'none',
              }}>
                {/* Icon */}
                {isDoneStep && (!isCurrent || isDone) ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="var(--green)" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                ) : (
                  <div style={{
                    width: 12, height: 12, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      border: '1.5px solid var(--accent)',
                      borderTopColor: 'transparent',
                      animation: 'spin 0.75s linear infinite',
                    }} />
                  </div>
                )}
                <span style={{
                  fontSize: 12,
                  color: isCurrent && !isDone ? 'var(--text-primary)' : 'var(--text-secondary)',
                  lineHeight: 1.4,
                  fontStyle: isCurrent && !isDone ? 'normal' : 'normal',
                }}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Live status bar (always visible while thinking) ── */}
      {!isDone && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          marginTop: 6, padding: '0 2px',
          animation: 'fadeIn 0.2s ease-out',
        }}>
          <svg
            width="22" height="20" viewBox="0 0 27 24" fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ flexShrink: 0, animation: 'botmakerPulse 1.4s ease-in-out infinite' }}
          >
            <path d="M20.3923 11.8723C18.7561 11.9701 17.2473 12.6972 16.1298 13.6661C15.5613 14.1592 15.0842 14.711 14.6688 15.2956C14.268 15.8598 13.9252 16.454 13.6147 17.0542C13.1217 18.0056 12.7014 18.981 12.3623 19.9752C12.1074 20.7239 11.9122 21.4784 11.75 22.2433C11.6347 22.7869 11.4408 23.4443 10.7297 23.6669C10.0876 23.8682 9.31556 23.6198 8.90698 23.2028C8.47364 22.7609 8.30515 22.1928 8.13619 21.6461C7.93348 20.9899 7.71838 20.3529 7.47901 19.7319C7.45304 19.6651 7.4273 19.5981 7.4006 19.5314C7.39987 19.5299 7.39963 19.5282 7.3989 19.5268C7.09787 18.7688 6.75775 18.0342 6.355 17.3166C6.35427 17.3151 6.35354 17.3137 6.35281 17.3127C6.33412 17.2799 6.31543 17.2472 6.29673 17.2142C6.27731 17.1804 6.25789 17.1462 6.23823 17.112C5.80318 16.3633 5.29725 15.6323 4.69325 14.9122C4.68135 14.8981 4.66994 14.8841 4.65829 14.8705C4.6561 14.8683 4.6544 14.8661 4.65246 14.8639C3.60589 13.6282 2.7108 13.0482 1.88927 12.5833C1.62223 12.4319 1.29109 12.301 0.981319 12.1969C0.979134 12.1961 0.977435 12.1954 0.97525 12.1947C0.461552 12.0218 0.00878906 11.9213 0.00878906 11.9213C0.00878906 11.9213 0.00976013 11.9213 0.0124306 11.9211C0.0126733 11.9211 0.0126734 11.9211 0.0131589 11.9211C0.0439905 11.9187 0.251557 11.8992 0.640472 11.7931C0.643386 11.7924 0.646542 11.7917 0.649698 11.7907C0.886639 11.7256 1.1901 11.629 1.56105 11.4856C1.68146 11.4387 1.8094 11.387 1.94438 11.3299C2.15219 11.2423 2.40418 11.1017 2.6739 10.9301C3.2143 10.6079 3.79209 10.1826 4.36308 9.62085C4.54322 9.45188 4.69786 9.29117 4.81293 9.15012C4.82216 9.13871 4.83163 9.12754 4.84061 9.11589C7.03572 6.40951 7.24062 4.50377 7.99611 2.0591C8.16508 1.51263 8.47364 0.977079 8.90698 0.53524C9.31556 0.118407 10.0873 -0.130188 10.7297 0.0710672C11.441 0.293686 11.6347 0.95086 11.75 1.4949C11.9122 2.25938 12.1074 3.01439 12.3623 3.7626C12.7014 4.75674 13.1217 5.73218 13.6147 6.68359C13.9524 7.33543 14.3278 7.98119 14.7747 8.5886C15.1648 9.11904 15.6093 9.62012 16.1298 10.0717C17.2473 11.0406 18.7561 11.7681 20.3923 11.8655C20.3911 11.8665 20.3919 11.8667 20.3923 11.8723Z" fill="url(#bm_g1)"/>
            <path d="M26.3736 12.0219C26.3736 12.0243 26.3736 12.0243 26.3736 12.0272C25.0746 12.1044 23.876 12.6844 22.9885 13.4532C22.1007 14.2221 21.4923 15.1745 20.9905 16.1448C20.5996 16.9005 20.2656 17.6742 19.9966 18.464C19.7919 19.059 19.6366 19.6596 19.5098 20.2653C19.4166 20.6974 19.2642 21.2204 18.6973 21.3964C18.1875 21.5568 17.574 21.36 17.2504 21.0286C16.9064 20.6766 16.7719 20.2265 16.6369 19.7914C16.1608 18.2489 15.5605 16.7143 14.6702 15.2985V15.2961C14.6695 15.2961 14.6693 15.2961 14.6688 15.2958C14.6673 15.2951 14.6673 15.2937 14.6673 15.2937C14.6397 15.2483 14.6083 15.2048 14.5799 15.1604C14.26 14.6909 13.1151 13.1925 11.4941 13.1947C8.5117 13.2022 7.52363 19.4256 7.47848 19.7179C7.47751 19.7252 7.47702 19.7286 7.47702 19.7286C7.47702 19.7286 7.45153 19.6674 7.40007 19.5314C7.39934 19.53 7.39909 19.5283 7.39837 19.5268C7.25465 19.1478 6.91234 18.3086 6.35446 17.3166C6.35373 17.3152 6.35301 17.3137 6.35228 17.3128C6.33383 17.28 6.31538 17.247 6.2962 17.2142C6.27702 17.1805 6.2576 17.1462 6.23769 17.112C5.82159 16.3946 5.29672 15.611 4.65775 14.8705C4.65557 14.8683 4.65387 14.8661 4.65193 14.864C3.69202 13.7535 2.47478 12.7412 0.980784 12.1967C0.978599 12.1959 0.9769 12.1952 0.974715 12.1945C0.665914 12.0823 0.345217 11.9898 0.012624 11.9209C0.0121384 11.9209 0.0121384 11.9209 0.0118956 11.9209C0.00801135 11.9201 0.00388429 11.9192 0 11.9184C0 11.9184 0.240826 11.8966 0.639937 11.7929C0.642851 11.7922 0.646007 11.7915 0.649163 11.7905C0.898728 11.7254 1.20899 11.6288 1.56051 11.4854C1.89918 11.3477 2.27595 11.1668 2.67337 10.9299C3.21377 10.6077 3.79156 10.1824 4.36255 9.62065C4.52253 9.46358 4.68227 9.29558 4.84007 9.11593C5.73759 8.09655 6.58436 6.70913 7.19978 4.82209C7.19978 4.82209 7.88584 10.5755 11.4368 10.6196C11.4368 10.6196 12.7121 10.6507 14.7739 8.58888C15.9081 7.45467 16.1798 5.74364 16.6364 4.26056C16.7712 3.82552 16.9057 3.37543 17.2499 3.02342C17.5735 2.6918 18.187 2.49515 18.6968 2.65319C19.2639 2.83187 19.4164 3.35212 19.5094 3.78425C19.6363 4.39214 19.7917 4.993 19.9961 5.58559C20.2651 6.37775 20.5991 7.15145 20.99 7.90719C21.492 8.87753 22.1004 9.82749 22.988 10.5988C23.876 11.3671 25.0746 11.9442 26.3736 12.0219Z" fill="url(#bm_g2)"/>
            <defs>
              <radialGradient id="bm_g1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(13.6053 11.5727) scale(12.0324)">
                <stop stopColor="white"/>
                <stop offset="0.6098" stopColor="#6C82FE"/>
                <stop offset="0.8799" stopColor="#304FFE"/>
              </radialGradient>
              <radialGradient id="bm_g2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(13.1868 12.0252) scale(18.0689 18.0689)">
                <stop stopColor="#304FFE"/>
                <stop offset="0.212" stopColor="#3351FE"/>
                <stop offset="0.3565" stopColor="#3C59FE"/>
                <stop offset="0.481" stopColor="#4B66FE"/>
                <stop offset="0.5941" stopColor="#6178FE"/>
                <stop offset="0.6995" stopColor="#7D90FE"/>
                <stop offset="0.7992" stopColor="#9FADFF"/>
                <stop offset="0.8945" stopColor="#C8D0FF"/>
                <stop offset="0.984" stopColor="#F6F7FF"/>
                <stop offset="1" stopColor="white"/>
              </radialGradient>
            </defs>
          </svg>
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
            {elapsed}s
          </span>
          <span style={{ fontSize: 10, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', opacity: 0.7 }}>·</span>
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
            {tokens.toLocaleString()} tok
          </span>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// DiffItem
// ─────────────────────────────────────────────
function DiffItem({ change, onAccept, onReject }) {
  const colors = { added: 'var(--green)', modified: 'var(--yellow)', removed: 'var(--red)' };
  const icons = { added: '+', modified: '~', removed: '−' };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6, padding: '4px 6px',
      borderRadius: 'var(--radius-sm)', background: 'var(--bg-active)', marginBottom: 3,
    }}>
      <span style={{
        width: 14, height: 14, borderRadius: 3,
        background: colors[change.type] + '22', color: colors[change.type],
        fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {icons[change.type]}
      </span>
      <span style={{ flex: 1, fontSize: 11, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {change.label}
      </span>
      <button onClick={onAccept} title="Aceptar"
        style={{ width: 18, height: 18, borderRadius: 3, color: 'var(--green)', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .1s' }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--green-dim)'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >✓</button>
      <button onClick={onReject} title="Rechazar"
        style={{ width: 18, height: 18, borderRadius: 3, color: 'var(--red)', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .1s' }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--red-dim)'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >✕</button>
    </div>
  );
}

// ─────────────────────────────────────────────
// ChangesSummary
// ─────────────────────────────────────────────
function NodeIcon({ nodeType, fileType, label = '' }) {
  const lower = label.toLowerCase();
  const isPdf = fileType === 'pdf' || lower.endsWith('.pdf');
  const isDoc = fileType === 'doc' || lower.endsWith('.doc') || lower.endsWith('.docx');

  let src;
  if (nodeType === 'knowledge') {
    src = isPdf ? '/PDF.png' : isDoc ? '/DOC.png' : '/web.png';
  } else if (nodeType === 'condition') {
    src = '/conditional-node.png';
  } else {
    src = '/instruction-node.png';
  }

  return (
    <img
      src={src}
      alt={nodeType}
      style={{ width: 24, height: 24, flexShrink: 0, objectFit: 'contain' }}
    />
  );
}

function ChangesSummary({ changes, version, reverted, onRevert }) {
  const [open, setOpen] = useState(true);

  const total = changes.length;
  const title = `${total} elemento${total !== 1 ? 's' : ''} creado${total !== 1 ? 's' : ''}`;

  // Build grouped display rows
  const instructions = changes.filter(c => c.nodeType !== 'knowledge' && c.nodeType !== 'condition');
  const conditions   = changes.filter(c => c.nodeType === 'condition');
  const knowledge    = changes.filter(c => c.nodeType === 'knowledge');

  const displayRows = [];
  if (instructions.length > 0) displayRows.push({
    nodeType: 'message',
    label: `${instructions.length} nodo${instructions.length > 1 ? 's' : ''} de instrucción creado${instructions.length > 1 ? 's' : ''}`,
  });
  if (conditions.length > 0) displayRows.push({
    nodeType: 'condition',
    label: `${conditions.length} nodo${conditions.length > 1 ? 's' : ''} de condicional creado${conditions.length > 1 ? 's' : ''}`,
  });
  knowledge.forEach(c => displayRows.push({
    nodeType: 'knowledge',
    fileType: c.fileType,
    label: c.label.split(' ')[0], // just "precios.pdf" or "botmaker.com"
  }));

  return (
    <div style={{
      marginTop: 12,
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      overflow: 'hidden',
      animation: 'fadeIn 0.25s ease-out',
    }}>
      {/* Header */}
      <div
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center',
          padding: '13px 16px',
          cursor: 'pointer', userSelect: 'none',
          borderBottom: open ? '1px solid var(--border)' : 'none',
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', flex: 1 }}>{title}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {!reverted ? (
            <button
              onClick={e => { e.stopPropagation(); onRevert(); }}
              title="Restaurar esta versión"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 22, height: 22, borderRadius: 5, border: 'none', background: 'none',
                color: 'var(--text-tertiary)', cursor: 'pointer',
                transition: 'color .15s, background .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-dim)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.background = 'none'; }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v6h6"/><path d="M3 13C4.5 8.5 9 6 14 7a10 10 0 0 1 7 9"/></svg>
            </button>
          ) : (
            <span style={{ fontSize: 11, color: 'var(--green)' }}>✓</span>
          )}
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            style={{ color: 'var(--text-tertiary)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}
          >
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>
      </div>

      {/* Items */}
      {open && displayRows.map((row, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 16px',
          borderBottom: i < displayRows.length - 1 ? '1px solid var(--border-subtle)' : 'none',
          animation: `fadeIn 0.2s ease-out ${i * 0.04}s both`,
        }}>
          <NodeIcon nodeType={row.nodeType} fileType={row.fileType} label={row.label} />
          <span style={{ flex: 1, fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {row.label}
          </span>
          <button
            style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', flexShrink: 0, padding: '2px 4px', borderRadius: 4, transition: 'opacity .15s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Ver
          </button>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// AIMessage
// ─────────────────────────────────────────────
function AIMessage({ msg, onAcceptAll, onRejectAll, onAcceptOne, onRejectOne, onSendMessage, version, onRevertVersion }) {
  const [diffExpanded, setDiffExpanded] = useState(true);
  const [undone, setUndone] = useState(false);
  const [reverted, setReverted] = useState(false);
  const hasDiff = msg.changes && msg.changes.length > 0;
  const hasActions = !msg.thinking && msg.actions && msg.actions.length > 0;
  const pendingChanges = msg.changes?.filter(c => c.status === 'pending') || [];

  function parseMarkdown(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.+?)`/g, `<code style="font-family:var(--font-mono);font-size:11px;background:var(--bg-active);padding:1px 4px;border-radius:3px">$1</code>`);
  }

  return (
    <div style={{
      padding: '12px 0',
      animation: 'fadeIn 0.25s ease-out',
    }}>
      {/* Thinking block — always rendered while thinking, stays after as collapsed summary */}
      {(msg.thinking || msg.thinkingElapsed) && (
        <ThinkingBlock msg={msg} />
      )}

      {/* Response text — only after thinking done */}
      {!msg.thinking && msg.text && (
        <div
          style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}
          dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.text) }}
        />
      )}

      {/* Plan action buttons */}
      {hasActions && (
        <div style={{
          marginTop: 12,
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          animation: 'fadeIn 0.3s ease-out',
        }}>
          {/* Title */}
          <div style={{
            padding: '10px 12px 8px',
            borderBottom: '1px solid var(--border-subtle)',
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--text-secondary)',
            letterSpacing: '0.01em',
          }}>
            ¿Qué deseas hacer?
          </div>
          <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 5 }}>
          {msg.actions.map((action, i) => (
            <button
              key={i}
              onClick={() => onSendMessage(action.value)}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                width: '100%', padding: '8px 10px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface)',
                textAlign: 'left', cursor: 'pointer',
                transition: 'background .12s, border-color .12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <span style={{ fontSize: 13, flexShrink: 0, width: 16, textAlign: 'center', lineHeight: 1 }}>{action.icon}</span>
              <span style={{ flex: 1, fontSize: 12, color: 'var(--text-primary)', fontWeight: 450 }}>{action.label}</span>
              {action.isLink ? (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-tertiary)', flexShrink: 0 }}>
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              ) : (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-tertiary)', flexShrink: 0 }}>
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              )}
            </button>
          ))}
          </div>
        </div>
      )}

      {/* v0-style changes summary */}
      {!msg.thinking && version && hasDiff && (
        <ChangesSummary
          changes={msg.changes}
          version={version}
          reverted={reverted}
          onRevert={() => { onRevertVersion(version.id); setReverted(true); }}
        />
      )}

      {/* Undo button — hidden for now */}
    </div>
  );
}

// ─────────────────────────────────────────────
// FileMessage — file attachment bubble (user side)
// ─────────────────────────────────────────────
function FileMessage({ msg }) {
  const ext = msg.fileName.split('.').pop().toUpperCase();
  const size = msg.fileSize < 1024
    ? `${msg.fileSize} B`
    : msg.fileSize < 1024 * 1024
    ? `${(msg.fileSize / 1024).toFixed(1)} KB`
    : `${(msg.fileSize / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <div style={{ padding: '10px 0', display: 'flex', justifyContent: 'flex-end', animation: 'fadeIn 0.15s ease-out' }}>
      <div style={{
        maxWidth: '82%', background: '#D6DCFF', color: '#111111',
        padding: '10px 12px', borderRadius: '14px 14px 3px 14px',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: 8, flexShrink: 0,
          background: 'rgba(91,79,216,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 700, color: '#5b4fd8', fontFamily: 'var(--font-mono)',
          letterSpacing: '-0.02em',
        }}>{ext}</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#111111', marginBottom: 2, wordBreak: 'break-all', lineHeight: 1.4 }}>{msg.fileName}</div>
          <div style={{ fontSize: 10, color: '#555558' }}>{size}</div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// UserMessage
// ─────────────────────────────────────────────
function UserMessage({ msg }) {
  return (
    <div style={{ padding: '10px 0', display: 'flex', justifyContent: 'flex-end', animation: 'fadeIn 0.15s ease-out' }}>
      <div style={{
        maxWidth: '82%',
        background: '#D6DCFF',
        color: '#111111',
        fontSize: 13,
        lineHeight: 1.55,
        padding: '8px 12px',
        borderRadius: '14px 14px 3px 14px',
      }}>{msg.text}</div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const EMPTY_SUGGESTIONS = [
  'Creá un agente de atención al cliente',
  'Armá un plan para un agente de atención',
  'Agente que valida emails y escala a soporte',
  'Bot de seguimiento de pedidos con número de orden',
  'Agregar base de conocimiento al agente',
];

// ─────────────────────────────────────────────
// ChatPanel
// ─────────────────────────────────────────────
export default function ChatPanel({ selectedNode, onAIAction, messages, setMessages, onClose, versions = [], onRevertVersion }) {
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [panelWidth, setPanelWidth] = useState(290);
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const resizingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(290);
  const dragCounterRef = useRef(0);

  function handleResizeMouseDown(e) {
    e.preventDefault();
    resizingRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = panelWidth;
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';

    function onMouseMove(e) {
      if (!resizingRef.current) return;
      const delta = startXRef.current - e.clientX;
      const next = Math.max(240, Math.min(560, startWidthRef.current + delta));
      setPanelWidth(next);
    }

    function onMouseUp() {
      resizingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  // ── Drag & drop handlers ──
  function handleDragEnter(e) {
    e.preventDefault();
    dragCounterRef.current += 1;
    if (dragCounterRef.current === 1) setIsDragging(true);
  }
  function handleDragLeave(e) {
    e.preventDefault();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) setIsDragging(false);
  }
  function handleDragOver(e) { e.preventDefault(); }
  function handleDrop(e) {
    e.preventDefault();
    dragCounterRef.current = 0;
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) sendFile(file);
  }

  // ── File upload flow ──
  async function sendFile(file) {
    if (isThinking) return;
    setIsThinking(true);

    const fileMsg = {
      id: Date.now(), role: 'user', type: 'file',
      fileName: file.name, fileSize: file.size, fileType: file.type,
    };
    setMessages(prev => [...prev, fileMsg]);

    const script = AI_SCRIPTS['file_uploaded'];
    const startTime = Date.now();
    const aiMsgId = Date.now() + 1;

    setMessages(prev => [...prev, {
      id: aiMsgId, role: 'ai', text: '', thinking: true,
      thinkingSteps: script.thinking, thinkingStep: 0,
      startTime, changes: [], actions: [], suggestions: script.suggestions,
    }]);

    for (let i = 1; i < script.thinking.length; i++) {
      await new Promise(r => setTimeout(r, 2300));
      setMessages(prev => prev.map(m =>
        m.id === aiMsgId ? { ...m, thinkingStep: i } : m
      ));
    }

    if (script.changes.length > 0) {
      onAIAction({ type: 'generate', changes: script.changes, msgId: aiMsgId });
    }

    await new Promise(r => setTimeout(r, 700));
    const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const changesWithStatus = script.changes.map(c => ({ ...c, status: 'pending' }));

    setMessages(prev => prev.map(m =>
      m.id !== aiMsgId ? m : {
        ...m, thinking: false, thinkingElapsed: totalElapsed,
        text: script.response, changes: changesWithStatus, actions: [],
      }
    ));
    setIsThinking(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const lastAIMessage = [...messages].reverse().find(m => m.role === 'ai' && m.suggestions);

  async function sendMessage(text) {
    if (!text.trim() || isThinking) return;
    const trimmed = text.trim();

    // Special action intercepts
    if (trimmed === '__upload_file__') { fileInputRef.current?.click(); return; }
    if (trimmed === '__nav_knowledge__' || trimmed === '__nav_channels__') return;

    setInput('');
    setIsThinking(true);

    const userMsg = { id: Date.now(), role: 'user', text: trimmed };
    setMessages(prev => [...prev, userMsg]);

    const script = matchScript(trimmed);
    const startTime = Date.now();

    const aiMsgId = Date.now() + 1;
    setMessages(prev => [...prev, {
      id: aiMsgId,
      role: 'ai',
      text: '',
      thinking: true,
      thinkingSteps: script.thinking,
      thinkingStep: 0,
      startTime,
      changes: [],
      actions: script.actions || [],
      suggestions: script.suggestions,
    }]);

    // Step through thinking states
    for (let i = 1; i < script.thinking.length; i++) {
      await new Promise(r => setTimeout(r, 2300));
      setMessages(prev => prev.map(m =>
        m.id === aiMsgId ? { ...m, thinkingStep: i } : m
      ));
    }

    // Trigger canvas generation
    if (script.changes.length > 0) {
      onAIAction({ type: 'generate', changes: script.changes, msgId: aiMsgId });
    }

    await new Promise(r => setTimeout(r, 700));

    const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const changesWithStatus = script.changes.map(c => ({ ...c, status: 'pending' }));

    // Freeze the thinking block and reveal response
    setMessages(prev => prev.map(m =>
      m.id !== aiMsgId ? m : {
        ...m,
        thinking: false,
        thinkingElapsed: totalElapsed,
        text: script.response,
        changes: changesWithStatus,
        actions: script.actions || [],
      }
    ));

    setIsThinking(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function handleAcceptAll(msgId) {
    setMessages(prev => prev.map(m => {
      if (m.id !== msgId) return m;
      const count = m.changes.filter(c => c.status === 'pending').length;
      return { ...m, changes: m.changes.map(c => c.status === 'pending' ? { ...c, status: 'accepted' } : c), acceptedCount: count };
    }));
    onAIAction({ type: 'acceptAll', msgId });
  }

  function handleRejectAll(msgId) {
    setMessages(prev => prev.map(m =>
      m.id !== msgId ? m : {
        ...m,
        changes: m.changes.map(c => c.status === 'pending' ? { ...c, status: 'rejected' } : c),
        acceptedCount: 0,
      }
    ));
    onAIAction({ type: 'rejectAll', msgId });
  }

  function handleAcceptOne(msgId, changeId) {
    setMessages(prev => prev.map(m => {
      if (m.id !== msgId) return m;
      const updated = m.changes.map(c => c.id === changeId ? { ...c, status: 'accepted' } : c);
      return { ...m, changes: updated, acceptedCount: updated.filter(c => c.status === 'accepted').length };
    }));
  }

  function handleRejectOne(msgId, changeId) {
    setMessages(prev => prev.map(m => {
      if (m.id !== msgId) return m;
      const updated = m.changes.map(c => c.id === changeId ? { ...c, status: 'rejected' } : c);
      return { ...m, changes: updated, acceptedCount: updated.filter(c => c.status === 'accepted').length };
    }));
  }

  const placeholder = selectedNode
    ? `Preguntá o editá "${selectedNode.label}"...`
    : messages.length === 0
    ? 'Describí el agente que querés construir...'
    : '¿Ajustamos algo más?';

  return (
    <div
      style={{ width: panelWidth, borderLeft: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'relative' }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >

      {/* ── Drag overlay ── */}
      {isDragging && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 50,
          background: 'rgba(91,79,216,0.07)',
          border: '2px dashed var(--accent)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 10, pointerEvents: 'none',
          animation: 'fadeIn 0.12s ease-out',
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'var(--accent-dim)', border: '1px solid var(--accent-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
          }}>📎</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>Soltá el archivo aquí</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>PDF, DOCX, TXT y más formatos</div>
        </div>
      )}

      {/* ── Hidden file input ── */}
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        accept=".pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,.md"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) sendFile(file);
          e.target.value = '';
        }}
      />

      {/* ── Resize handle ── */}
      <div
        onMouseDown={handleResizeMouseDown}
        style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
          cursor: 'ew-resize', zIndex: 10,
          background: 'transparent',
          transition: 'background .15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-border)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      />

      {/* ── Header ── */}
      <div style={{
        height: 44, display: 'flex', alignItems: 'center',
        padding: '0 14px', borderBottom: '1px solid var(--border)', flexShrink: 0, gap: 6,
      }}>
        <svg width="26" height="24" viewBox="0 0 51 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
          <path d="M0 16C0 7.16345 7.16344 0 16 0H34.3736C43.2102 0 50.3736 7.16344 50.3736 16V31.738C50.3736 40.5746 43.2102 47.738 34.3736 47.738H16C7.16344 47.738 0 40.5746 0 31.738V16Z" fill="url(#hdr_bg)" fillOpacity="0.15"/>
          <path d="M32.3923 23.8723C30.7561 23.9701 29.2473 24.6972 28.1298 25.6661C27.5613 26.1592 27.0842 26.711 26.6688 27.2956C26.268 27.8598 25.9252 28.454 25.6147 29.0542C25.1217 30.0056 24.7014 30.981 24.3623 31.9752C24.1074 32.7239 23.9122 33.4784 23.75 34.2433C23.6347 34.7869 23.4408 35.4443 22.7297 35.6669C22.0876 35.8682 21.3156 35.6198 20.907 35.2028C20.4736 34.7609 20.3052 34.1928 20.1362 33.6461C19.9335 32.9899 19.7184 32.3529 19.479 31.7319C19.453 31.6651 19.4273 31.5981 19.4006 31.5314C19.3999 31.5299 19.3996 31.5282 19.3989 31.5268C19.0979 30.7688 18.7577 30.0342 18.355 29.3166C18.3543 29.3151 18.3535 29.3137 18.3528 29.3127C18.3341 29.2799 18.3154 29.2472 18.2967 29.2142C18.2773 29.1804 18.2579 29.1462 18.2382 29.112C17.8032 28.3633 17.2973 27.6323 16.6932 26.9122C16.6814 26.8981 16.6699 26.8841 16.6583 26.8705C16.6561 26.8683 16.6544 26.8661 16.6525 26.8639C15.6059 25.6282 14.7108 25.0482 13.8893 24.5833C13.6222 24.4319 13.2911 24.301 12.9813 24.1969C12.9791 24.1961 12.9774 24.1954 12.9752 24.1947C12.4616 24.0218 12.0088 23.9213 12.0088 23.9213C12.0088 23.9213 12.0098 23.9213 12.0124 23.9211C12.0127 23.9211 12.0127 23.9211 12.0132 23.9211C12.044 23.9187 12.2516 23.8992 12.6405 23.7931C12.6434 23.7924 12.6465 23.7917 12.6497 23.7907C12.8866 23.7256 13.1901 23.629 13.561 23.4856C13.6815 23.4387 13.8094 23.387 13.9444 23.3299C14.1522 23.2423 14.4042 23.1017 14.6739 22.9301C15.2143 22.6079 15.7921 22.1826 16.3631 21.6208C16.5432 21.4519 16.6979 21.2912 16.8129 21.1501C16.8222 21.1387 16.8316 21.1275 16.8406 21.1159C19.0357 18.4095 19.2406 16.5038 19.9961 14.0591C20.1651 13.5126 20.4736 12.9771 20.907 12.5352C21.3156 12.1184 22.0873 11.8698 22.7297 12.0711C23.441 12.2937 23.6347 12.9509 23.75 13.4949C23.9122 14.2594 24.1074 15.0144 24.3623 15.7626C24.7014 16.7567 25.1217 17.7322 25.6147 18.6836C25.9524 19.3354 26.3278 19.9812 26.7747 20.5886C27.1648 21.119 27.6093 21.6201 28.1298 22.0717C29.2473 23.0406 30.7561 23.7681 32.3923 23.8655C32.3911 23.8665 32.3919 23.8667 32.3923 23.8723Z" fill="url(#hdr_g1)"/>
          <path d="M38.3736 24.0219C38.3736 24.0243 38.3736 24.0243 38.3736 24.0272C37.0746 24.1044 35.876 24.6844 34.9885 25.4532C34.1007 26.2221 33.4923 27.1745 32.9905 28.1448C32.5996 28.9005 32.2656 29.6742 31.9966 30.464C31.7919 31.059 31.6366 31.6596 31.5098 32.2653C31.4166 32.6974 31.2642 33.2204 30.6973 33.3964C30.1875 33.5568 29.574 33.36 29.2504 33.0286C28.9064 32.6766 28.7719 32.2265 28.6369 31.7914C28.1608 30.2489 27.5605 28.7143 26.6702 27.2985V27.2961C26.6695 27.2961 26.6693 27.2961 26.6688 27.2958C26.6673 27.2951 26.6673 27.2937 26.6673 27.2937C26.6397 27.2483 26.6083 27.2048 26.5799 27.1604C26.26 26.6909 25.1151 25.1925 23.4941 25.1947C20.5117 25.2022 19.5236 31.4256 19.4785 31.7179C19.4775 31.7252 19.477 31.7286 19.477 31.7286C19.477 31.7286 19.4515 31.6674 19.4001 31.5314C19.3993 31.53 19.3991 31.5283 19.3984 31.5268C19.2546 31.1478 18.9123 30.3086 18.3545 29.3166C18.3537 29.3152 18.353 29.3137 18.3523 29.3128C18.3338 29.28 18.3154 29.247 18.2962 29.2142C18.277 29.1805 18.2576 29.1462 18.2377 29.112C17.8216 28.3946 17.2967 27.611 16.6578 26.8705C16.6556 26.8683 16.6539 26.8661 16.6519 26.864C15.692 25.7535 14.4748 24.7412 12.9808 24.1967C12.9786 24.1959 12.9769 24.1952 12.9747 24.1945C12.6659 24.0823 12.3452 23.9898 12.0126 23.9209C12.0121 23.9209 12.0121 23.9209 12.0119 23.9209C12.008 23.9201 12.0039 23.9192 12 23.9184C12 23.9184 12.2408 23.8966 12.6399 23.7929C12.6429 23.7922 12.646 23.7915 12.6492 23.7905C12.8987 23.7254 13.209 23.6288 13.5605 23.4854C13.8992 23.3477 14.276 23.1668 14.6734 22.9299C15.2138 22.6077 15.7916 22.1824 16.3625 21.6206C16.5225 21.4636 16.6823 21.2956 16.8401 21.1159C17.7376 20.0965 18.5844 18.7091 19.1998 16.8221C19.1998 16.8221 19.8858 22.5755 23.4368 22.6196C23.4368 22.6196 24.7121 22.6507 26.7739 20.5889C27.9081 19.4547 28.1798 17.7436 28.6364 16.2606C28.7712 15.8255 28.9057 15.3754 29.2499 15.0234C29.5735 14.6918 30.187 14.4952 30.6968 14.6532C31.2639 14.8319 31.4164 15.3521 31.5094 15.7843C31.6363 16.3921 31.7917 16.993 31.9961 17.5856C32.2651 18.3777 32.5991 19.1515 32.99 19.9072C33.492 20.8775 34.1004 21.8275 34.988 22.5988C35.876 23.3671 37.0746 23.9442 38.3736 24.0219Z" fill="url(#hdr_g2)"/>
          <defs>
            <linearGradient id="hdr_bg" x1="19.19" y1="52.8528" x2="50.5368" y2="12.1318" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1D309C"/>
              <stop offset="0.25" stopColor="#5265D8"/>
              <stop offset="0.5625" stopColor="#2238BE"/>
              <stop offset="1" stopColor="#1D2F98"/>
            </linearGradient>
            <radialGradient id="hdr_g1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(25.6053 23.5727) scale(12.0324)">
              <stop stopColor="white"/>
              <stop offset="0.6098" stopColor="#6C82FE"/>
              <stop offset="0.8799" stopColor="#304FFE"/>
            </radialGradient>
            <radialGradient id="hdr_g2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(25.1868 24.0252) scale(18.0689 18.0689)">
              <stop stopColor="#304FFE"/>
              <stop offset="0.212" stopColor="#3351FE"/>
              <stop offset="0.3565" stopColor="#3C59FE"/>
              <stop offset="0.481" stopColor="#4B66FE"/>
              <stop offset="0.5941" stopColor="#6178FE"/>
              <stop offset="0.6995" stopColor="#7D90FE"/>
              <stop offset="0.7992" stopColor="#9FADFF"/>
              <stop offset="0.8945" stopColor="#C8D0FF"/>
              <stop offset="0.984" stopColor="#F6F7FF"/>
              <stop offset="1" stopColor="white"/>
            </radialGradient>
          </defs>
        </svg>
        <span style={{ fontWeight: 500, fontSize: 13, color: 'var(--text-primary)' }}>Asistente de IA</span>

        {/* Live thinking dot in header */}
        {isThinking && (
          <div style={{ display: 'flex', gap: 2.5, marginLeft: 4 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 3, height: 3, borderRadius: '50%', background: 'var(--accent)',
                animation: `dotBlink 1.2s ease-in-out infinite`,
                animationDelay: `${i * 0.18}s`,
              }} />
            ))}
          </div>
        )}

        <div style={{ flex: 1 }} />

        <button title="Historial de chats"
          style={{ width: 24, height: 24, borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: showHistory ? 'var(--accent)' : 'var(--text-tertiary)', background: showHistory ? 'var(--accent-dim)' : 'none', transition: 'color .15s, background .15s' }}
          onMouseEnter={e => { if (!showHistory) { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'var(--bg-hover)'; }}}
          onMouseLeave={e => { if (!showHistory) { e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.background = 'none'; }}}
          onClick={() => setShowHistory(v => !v)}
        ><History size={12} /></button>

        {messages.length > 0 && (
          <button title="Nueva conversación"
            style={{ width: 24, height: 24, borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', transition: 'color .15s, background .15s' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'var(--bg-hover)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.background = 'none'; }}
            onClick={() => {
              if (messages.length > 0) {
                const firstUser = messages.find(m => m.role === 'user');
                setChatHistory(prev => [{
                  id: Date.now(),
                  title: firstUser ? firstUser.text : 'Conversación',
                  messages,
                  date: new Date(),
                }, ...prev]);
              }
              setMessages([]);
              setShowHistory(false);
            }}
          ><RotateCcw size={12} /></button>
        )}

        <button onClick={onClose} title="Cerrar"
          style={{ width: 24, height: 24, borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', transition: 'color .15s, background .15s' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'var(--bg-hover)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.background = 'none'; }}
        ><X size={12} /></button>
      </div>

      {/* ── Context chip ── */}
      {selectedNode && (
        <div style={{ padding: '6px 14px', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0, animation: 'slideIn 0.2s ease-out' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: 'var(--accent-dim)', border: '1px solid var(--accent-border)',
            borderRadius: 'var(--radius-sm)', padding: '3px 8px', fontSize: 11, color: 'var(--accent)',
          }}>
            <span style={{ fontSize: 9 }}>◈</span>{selectedNode.label}
          </div>
        </div>
      )}

      {/* ── History panel ── */}
      {showHistory && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 14px', animation: 'fadeIn 0.15s ease-out' }}>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase', padding: '12px 0 8px' }}>
            Conversaciones anteriores
          </div>
          {chatHistory.length === 0 ? (
            <div style={{ padding: '24px 0', textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 4 }}>Sin historial aún</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', opacity: 0.6 }}>Las conversaciones guardadas aparecerán aquí</div>
            </div>
          ) : (
            chatHistory.map((entry, i) => (
              <button
                key={entry.id}
                onClick={() => { setMessages(entry.messages); setShowHistory(false); }}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10, width: '100%',
                  padding: '9px 10px', marginBottom: 4,
                  borderRadius: 'var(--radius-md)', textAlign: 'left',
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  cursor: 'pointer', transition: 'background .15s, border-color .15s',
                  animation: `fadeIn 0.2s ease-out ${i * 0.04}s both`,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-active)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {entry.title.length > 40 ? entry.title.slice(0, 40) + '…' : entry.title}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                    {entry.messages.filter(m => m.role === 'user').length} mensajes · {entry.date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)', flexShrink: 0, marginTop: 1 }}>→</span>
              </button>
            ))
          )}
        </div>
      )}

      {/* ── Messages ── */}
      {!showHistory && <div style={{ flex: 1, overflowY: 'auto', padding: '4px 14px' }}>
        {messages.length === 0 ? (
          <div style={{ padding: '16px 0', animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 10, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Ideas para empezar
            </div>
            {EMPTY_SUGGESTIONS.map((s, i) => (
              <button key={i} onClick={() => sendMessage(s)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, width: '100%',
                  padding: '7px 0', borderBottom: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)', fontSize: 12, textAlign: 'left',
                  cursor: 'pointer', transition: 'color .15s',
                  animation: `suggestIn 0.3s ease-out ${i * 0.05}s both`,
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                <span style={{ color: 'var(--text-tertiary)', flexShrink: 0 }}>→</span>{s}
              </button>
            ))}
          </div>
        ) : (
          messages.map(msg =>
            msg.role === 'user'
              ? msg.type === 'file'
                ? <FileMessage key={msg.id} msg={msg} />
                : <UserMessage key={msg.id} msg={msg} />
              : <AIMessage
                  key={msg.id} msg={msg}
                  onAcceptAll={handleAcceptAll}
                  onRejectAll={handleRejectAll}
                  onAcceptOne={handleAcceptOne}
                  onRejectOne={handleRejectOne}
                  onSendMessage={sendMessage}
                  version={versions.find(v => v.msgId === msg.id)}
                  onRevertVersion={onRevertVersion}
                />
          )
        )}

        {/* Context suggestions */}
        {messages.length > 0 && !isThinking && lastAIMessage?.suggestions && (
          <div style={{ padding: '10px 0 4px' }}>
            {lastAIMessage.suggestions.map((s, i) => (
              <button key={i} onClick={() => sendMessage(s)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5, width: '100%',
                  padding: '5px 0', fontSize: 11, color: 'var(--text-tertiary)',
                  textAlign: 'left', cursor: 'pointer', transition: 'color .15s',
                  animation: `suggestIn 0.25s ease-out ${i * 0.07}s both`,
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
              >
                <span style={{ flexShrink: 0 }}>→</span>{s}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>}

      {/* ── Input ── */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '10px 14px 12px', flexShrink: 0 }}>
        <div
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-lg)', padding: '10px 12px', transition: 'border-color .15s' }}
          onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--accent-border)'}
          onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
            }}
            placeholder={placeholder}
            rows={2}
            style={{ width: '100%', color: 'var(--text-primary)', fontSize: 13, lineHeight: 1.5 }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>↵ Enviar · ⇧↵ Nueva línea</span>
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isThinking}
              style={{
                display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                background: input.trim() && !isThinking ? 'var(--accent)' : 'var(--bg-active)',
                color: input.trim() && !isThinking ? '#fff' : 'var(--text-tertiary)',
                fontSize: 11, fontWeight: 500, transition: 'background .15s, color .15s',
                cursor: input.trim() && !isThinking ? 'pointer' : 'default',
              }}
            >
              {isThinking
                ? <><div style={{ width: 10, height: 10, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite' }} /> Generando</>
                : 'Enviar ↵'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
