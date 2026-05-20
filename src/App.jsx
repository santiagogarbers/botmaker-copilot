import { useState, useEffect, useCallback, useRef } from 'react';
import TopBar from './components/TopBar';
import Canvas from './components/Canvas';
import ChatPanel from './components/ChatPanel';
import CommandBar from './components/CommandBar';
import { INITIAL_NODES, INITIAL_CONNECTIONS } from './data/initialNodes';

const NODE_POSITIONS = {
  nv1: { x: 340, y: 290 },
  nc1: { x: 230, y: 290 },
};

let nodeIdCounter = 100;

export default function App() {
  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [connections, setConnections] = useState(INITIAL_CONNECTIONS);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showCommandBar, setShowCommandBar] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [theme, setTheme] = useState('light');
  const [versions, setVersions] = useState([]);
  const versionNumRef = useRef(0);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  function toggleTheme() {
    setTheme(t => t === 'dark' ? 'light' : 'dark');
  }

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setShowCommandBar(v => !v);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        // Undo: remove last _new nodes
        setNodes(prev => {
          const lastNew = [...prev].reverse().find(n => n._new);
          if (!lastNew) return prev;
          return prev.filter(n => n.id !== lastNew.id);
        });
      }
      if (e.key === 'Escape') {
        setSelectedNodeId(null);
        setShowCommandBar(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  function handleRevertVersion(versionId) {
    const v = versions.find(v => v.id === versionId);
    if (v) {
      setNodes(v.nodes);
      setConnections(v.connections);
    }
  }

  const handleAIAction = useCallback((action) => {
    if (action.type === 'generate') {
      // Snapshot canvas state BEFORE applying changes
      versionNumRef.current += 1;
      const snapNum = versionNumRef.current;
      setVersions(prev => [...prev, {
        id: snapNum,
        number: snapNum,
        nodes,
        connections,
        msgId: action.msgId,
        createdAt: new Date(),
      }]);

      const newNodeIds = [];

      action.changes.forEach((change, i) => {
        if (change.type === 'added') {
          const pos = NODE_POSITIONS[change.id] || {
            x: 20 + (nodes.length + i) * 210,
            y: 140 + (i % 2) * 130,
          };

          const newNode = {
            id: change.id || `n_${++nodeIdCounter}`,
            type: change.nodeType || 'message',
            label: change.label,
            subtitle: change.subtitle || '',
            x: pos.x,
            y: pos.y,
            status: 'generating',
            _new: true,
          };
          newNodeIds.push(newNode.id);

          // Stagger node appearances
          setTimeout(() => {
            setNodes(prev => {
              const exists = prev.find(n => n.id === newNode.id);
              if (exists) return prev;
              return [...prev, newNode];
            });

            // Transition generating → added after short delay
            setTimeout(() => {
              setNodes(prev => prev.map(n =>
                n.id === newNode.id ? { ...n, status: 'added' } : n
              ));
            }, 600);
          }, i * 200);
        }

        if (change.type === 'modified') {
          setNodes(prev => prev.map(n =>
            n.id === change.id
              ? { ...n, label: change.label || n.label, status: 'modified' }
              : n
          ));
        }
      });

      setIsEmpty(false);
    }

    if (action.type === 'acceptAll') {
      setNodes(prev => prev.map(n =>
        n.status === 'added' || n.status === 'modified'
          ? { ...n, status: 'normal', _new: false }
          : n
      ));
    }

    if (action.type === 'rejectAll') {
      setNodes(prev => prev.filter(n => n.status !== 'added'));
      setNodes(prev => prev.map(n =>
        n.status === 'modified' ? { ...n, status: 'normal' } : n
      ));
    }
  }, [nodes]);

  function handleStartChat() {
    setIsEmpty(false);
  }

  function handleSelectNode(id) {
    setSelectedNodeId(prev => prev === id ? null : id);
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <TopBar onCommandBar={() => setShowCommandBar(true)} theme={theme} onToggleTheme={toggleTheme} />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        <Canvas
          nodes={nodes}
          connections={connections}
          selectedNodeId={selectedNodeId}
          onSelectNode={handleSelectNode}
          isEmpty={isEmpty}
          onStartChat={handleStartChat}
          chatOpen={chatOpen}
          onToggleChat={() => setChatOpen(v => !v)}
        />

        {chatOpen && (
          <ChatPanel
            selectedNode={selectedNode}
            onAIAction={handleAIAction}
            messages={messages}
            setMessages={setMessages}
            onClose={() => setChatOpen(false)}
            versions={versions}
            onRevertVersion={handleRevertVersion}
          />
        )}

        {/* Floating chat toggle when closed */}
        {!chatOpen && (
          <button
            onClick={() => setChatOpen(true)}
            style={{
              position: 'absolute', bottom: 20, right: 20, zIndex: 30,
              width: 44, height: 44, borderRadius: '50%',
              background: 'var(--accent)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, boxShadow: '0 4px 20px rgba(124,110,234,0.4)',
              cursor: 'pointer', border: 'none',
              transition: 'transform .15s, box-shadow .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(124,110,234,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,110,234,0.4)'; }}
            title="Abrir AI Copilot"
          >
            ⚡
          </button>
        )}
      </div>

      {showCommandBar && (
        <CommandBar
          onClose={() => setShowCommandBar(false)}
          onCommand={(cmd) => {
            console.log('Command:', cmd.label);
          }}
        />
      )}
    </div>
  );
}
