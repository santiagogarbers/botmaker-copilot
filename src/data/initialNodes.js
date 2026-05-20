export const NODE_TYPES = {
  trigger: { label: 'Trigger', color: '#7c6eea', icon: '⚡' },
  message: { label: 'Mensaje', color: '#3b82f6', icon: '💬' },
  condition: { label: 'Condición', color: '#f59e0b', icon: '◇' },
  action: { label: 'Acción', color: '#10b981', icon: '⚙' },
  input: { label: 'Captura', color: '#ec4899', icon: '✎' },
  delay: { label: 'Espera', color: '#8b5cf6', icon: '⏱' },
  end: { label: 'Fin', color: '#555555', icon: '■' },
};

export const INITIAL_NODES = [
  {
    id: 'n1',
    type: 'trigger',
    label: 'Usuario escribe',
    subtitle: 'Canal: WhatsApp',
    x: 20,
    y: 140,
    status: 'normal',
  },
  {
    id: 'n2',
    type: 'message',
    label: 'Saludo inicial',
    subtitle: '"¡Hola! ¿En qué puedo ayudarte?"',
    x: 230,
    y: 80,
    status: 'normal',
  },
  {
    id: 'n3',
    type: 'condition',
    label: 'Intención del usuario',
    subtitle: 'Soporte / Ventas / Otro',
    x: 440,
    y: 140,
    status: 'normal',
  },
  {
    id: 'n4',
    type: 'message',
    label: 'Respuesta de soporte',
    subtitle: 'FAQ automática',
    x: 650,
    y: 60,
    status: 'normal',
  },
  {
    id: 'n5',
    type: 'action',
    label: 'Escalar a humano',
    subtitle: 'Asignar agente disponible',
    x: 650,
    y: 230,
    status: 'normal',
  },
];

export const INITIAL_CONNECTIONS = [
  { id: 'c1', from: 'n1', to: 'n2' },
  { id: 'c2', from: 'n2', to: 'n3' },
  { id: 'c3', from: 'n3', to: 'n4', label: 'Soporte' },
  { id: 'c4', from: 'n3', to: 'n5', label: 'Escalado' },
];
