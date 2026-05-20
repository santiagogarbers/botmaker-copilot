export const AI_SCRIPTS = {
  'agente de soporte': {
    thinking: [
      'Analizando el tipo de agente solicitado...',
      'Identificando nodos necesarios para el flujo...',
      'Evaluando estructura de conversación óptima...',
      'Diseñando lógica de detección de intención...',
      'Configurando condiciones de escalado a humano...',
      'Generando conexiones entre nodos...',
      'Validando coherencia del flujo completo...',
    ],
    response: 'Listo. Construí un flujo base de soporte con saludo, detección de intención y escalado a humano.',
    changes: [
      { type: 'added', id: 'n1', label: 'Usuario escribe', nodeType: 'trigger' },
      { type: 'added', id: 'n2', label: 'Saludo inicial', nodeType: 'message' },
      { type: 'added', id: 'n3', label: 'Intención del usuario', nodeType: 'condition' },
      { type: 'added', id: 'n4', label: 'Respuesta de soporte', nodeType: 'message' },
      { type: 'added', id: 'n5', label: 'Escalar a humano', nodeType: 'action' },
    ],
    suggestions: [
      'Agregá un nodo de captura de email',
      'Configurá el horario de atención',
      'Simulá una conversación de prueba',
    ],
  },
  'validar email': {
    thinking: [
      'Analizando el flujo actual...',
      'Mapeando nodos existentes...',
      'Buscando punto de inserción óptimo...',
      'Diseñando lógica de validación de formato...',
      'Definiendo rama para email inválido...',
      'Generando nodo de validación...',
      'Conectando con el flujo existente...',
    ],
    response: 'Agregué **ValidarEmail** entre "Saludo inicial" y "Intención del usuario". El nodo verifica formato y existencia antes de continuar.',
    changes: [
      { type: 'added', id: 'nv1', label: 'Validar Email', nodeType: 'condition' },
    ],
    suggestions: [
      'Qué pasa si el email no es válido',
      'Agregar retry automático',
      'Pedir el email al usuario',
    ],
  },
  'captura email': {
    thinking: [
      'Analizando contexto del flujo actual...',
      'Localizando punto de captura de datos...',
      'Evaluando posición óptima del nodo...',
      'Generando nodo de input de usuario...',
      'Definiendo variable de almacenamiento...',
      'Conectando con validación...',
      'Verificando compatibilidad con el flujo...',
    ],
    response: 'Agregué **Capturar Email** antes de la validación. El usuario debe ingresar su email para continuar.',
    changes: [
      { type: 'added', id: 'nc1', label: 'Capturar Email', nodeType: 'input' },
    ],
    suggestions: [
      'Validar formato del email',
      'Guardar en base de datos',
      'Enviar confirmación por email',
    ],
  },
  'optimizar': {
    thinking: [
      'Analizando estructura del flujo completo...',
      'Identificando nodos con alta latencia...',
      'Buscando condiciones redundantes...',
      'Evaluando paths sin timeout configurado...',
      'Calculando optimizaciones posibles...',
      'Priorizando cambios por impacto...',
      'Preparando recomendaciones de mejora...',
    ],
    response: 'Analicé el flujo. Encontré **2 oportunidades** de mejora: la condición de intención puede simplificarse y hay un path de escalado sin timeout configurado.',
    changes: [
      { type: 'modified', id: 'n3', label: 'Intención del usuario (optimizado)', nodeType: 'condition' },
    ],
    suggestions: [
      'Aplicar todas las optimizaciones',
      'Ver detalles del análisis',
      'Agregar timeout al escalado',
    ],
  },
  'plan agente': {
    thinking: [
      'Analizando el caso de uso solicitado...',
      'Identificando canales de comunicación...',
      'Definiendo etapas del flujo de atención...',
      'Mapeando casos de escalado a humano...',
      'Evaluando condiciones de ramificación...',
      'Estructurando el plan de implementación...',
      'Preparando opciones de siguiente paso...',
    ],
    response: 'Armé un plan para tu agente de atención. El flujo tiene **3 etapas**: recepción del mensaje, clasificación de intención, y respuesta o escalado a humano.\n\n¿Por dónde querés empezar?',
    actions: [
      { icon: '⚡', label: 'Construir flujo completo', desc: 'Generá todos los nodos del plan de una vez', value: 'Crear agente de soporte completo' },
      { icon: '→', label: 'Empezar por el trigger', desc: 'Solo el nodo de entrada y saludo inicial', value: 'Agregar trigger y saludo inicial' },
      { icon: '◎', label: 'Solo la lógica central', desc: 'Detección de intención y condiciones', value: 'Agregar lógica de intención del usuario' },
    ],
    changes: [],
    suggestions: [],
  },
  'base conocimiento': {
    thinking: [
      'Analizando el agente actual...',
      'Verificando configuración de conocimiento existente...',
      'Evaluando formatos de archivo compatibles...',
      'Consultando opciones de integración disponibles...',
      'Preparando recomendaciones de base de conocimiento...',
      'Evaluando impacto en el flujo de conversación...',
      'Generando opciones de configuración...',
    ],
    response: '¿Cómo querés agregar la base de conocimiento? Podés crear una nueva desde la sección de Knowledge, ir directamente a la página de canales, o compartirme el archivo acá mismo.',
    actions: [
      { icon: '📚', label: 'Crear nueva base de conocimiento', desc: 'Configurá desde cero en la sección de Knowledge', value: '__nav_knowledge__', isLink: true },
      { icon: '⇗', label: 'Ir a la página de canales', desc: 'Administrá todos tus canales y conexiones', value: '__nav_channels__', isLink: true },
      { icon: '📎', label: 'Compartir archivo en el chat', desc: 'Arrastrá o seleccioná un PDF, DOCX o TXT', value: '__upload_file__' },
    ],
    changes: [],
    suggestions: [],
  },
  'file_uploaded': {
    thinking: [
      'Recibiendo archivo...',
      'Analizando estructura del documento...',
      'Extrayendo contenido relevante...',
      'Procesando chunks de información...',
      'Generando embeddings del contenido...',
      'Indexando base de conocimiento...',
      'Vinculando al agente de atención...',
    ],
    response: '**5 bases agregadas con éxito.** El agente ahora puede consultar el contenido de los archivos para responder preguntas de los usuarios de forma precisa.',
    changes: [
      { type: 'added', id: 'kb1', label: 'precios.pdf agregada a Soporte',      nodeType: 'knowledge', fileType: 'pdf' },
      { type: 'added', id: 'kb2', label: 'reglas.docx agregado a Soporte',       nodeType: 'knowledge', fileType: 'doc' },
      { type: 'added', id: 'kb3', label: 'productos.docx agregado a Soporte',    nodeType: 'knowledge', fileType: 'doc' },
      { type: 'added', id: 'kb4', label: 'botmaker.com agregado a agente',        nodeType: 'knowledge', fileType: 'url' },
      { type: 'added', id: 'kb5', label: 'faq-clientes.pdf agregada a Soporte',  nodeType: 'knowledge', fileType: 'pdf' },
    ],
    suggestions: [
      'Agregar otro documento',
      'Ver qué preguntas puede responder',
      'Configurar prioridad de respuesta',
    ],
  },
  'default': {
    thinking: [
      'Procesando instrucción recibida...',
      'Analizando contexto del flujo actual...',
      'Identificando entidades relevantes...',
      'Evaluando posibles acciones disponibles...',
      'Consultando patrones de flujo similares...',
      'Sintetizando respuesta óptima...',
      'Preparando sugerencias de seguimiento...',
    ],
    response: 'Entendido. Puedo ayudarte a crear nodos, editar el flujo, o responder preguntas sobre el agente actual.',
    changes: [],
    suggestions: [
      'Crear nodo de validación',
      'Agregar manejo de errores',
      'Optimizar el flujo actual',
    ],
  },
};

export function matchScript(input) {
  const lower = input.toLowerCase();
  if (lower.includes('plan')) return AI_SCRIPTS['plan agente'];
  if (lower.includes('base') && lower.includes('conocimiento')) return AI_SCRIPTS['base conocimiento'];
  if (lower.includes('knowledge')) return AI_SCRIPTS['base conocimiento'];
  if (lower.includes('soporte') || lower.includes('agente') || lower.includes('crear flujo')) return AI_SCRIPTS['agente de soporte'];
  if (lower.includes('valid') && lower.includes('email')) return AI_SCRIPTS['validar email'];
  if (lower.includes('email') || lower.includes('captura')) return AI_SCRIPTS['captura email'];
  if (lower.includes('optim') || lower.includes('mejorar') || lower.includes('analiz')) return AI_SCRIPTS['optimizar'];
  return AI_SCRIPTS['default'];
}
