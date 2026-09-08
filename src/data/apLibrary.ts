export const AP_LIBRARY_SNAPSHOT_DATE = '2026-09-08';
export const AP_LIBRARY_SNAPSHOT_LABEL = 'Snapshot curado · 8 sep 2026';

export type APLibraryTab = 'cases' | 'processes' | 'templates' | 'agents';
export type APLibraryState = 'Confirmado' | 'Documentado' | 'WIP' | 'Requiere validación';
export type APUnit = 'GEN+' | 'AECODE' | 'VisionPro' | 'AgentFlow' | 'AP';

export interface APStage {
  title: string;
  owner: string;
  evidence: string;
}

interface APBaseItem {
  id: string;
  title: string;
  summary: string;
  unit: APUnit;
  state: APLibraryState;
  purpose: string;
  trigger: string;
  inputs: string[];
  stages: APStage[];
  owner: string;
  evidence: string[];
  humanGate: string;
  fallback: string;
  nextAction: string;
  source: string;
  linkedCaseIds: string[];
}

export interface APCase extends APBaseItem {
  kind: 'case';
  outcome: string;
}

export interface APProcess extends APBaseItem {
  kind: 'process';
}

export interface APTemplate extends APBaseItem {
  kind: 'template';
  fields: string[];
}

export interface APAgent extends APBaseItem {
  kind: 'agent';
  capabilities: string[];
  output: string;
}

export type APLibraryItem = APCase | APProcess | APTemplate | APAgent;

function curatedSource(label: string): string {
  return `${label} · síntesis sanitizada · 8 sep 2026`;
}
const DEFAULT_EVIDENCE = ['Fuente identificada', 'Entregable revisable', 'Decisión registrada'];

function stages(...titles: string[]): APStage[] {
  return titles.map((title, index) => ({
    title,
    owner: index === titles.length - 1 ? 'Responsable de decisión' : 'Owner del proceso',
    evidence: index === titles.length - 1 ? 'Aprobación o siguiente acción registrada' : 'Artefacto verificable',
  }));
}

export const AP_CASES: APCase[] = [
  {
    id: 'venta-b2b-genplus', kind: 'case', title: 'Venta B2B GEN+',
    summary: 'De oportunidad calificada a propuesta, aprobación y seguimiento comercial trazable.',
    unit: 'GEN+', state: 'Documentado', purpose: 'Reducir ambigüedad entre necesidad, alcance, propuesta y decisión del cliente.',
    trigger: 'Ingreso de una oportunidad empresarial con problema concreto.', inputs: ['Brief comercial', 'Necesidad del cliente', 'Alcance preliminar'],
    stages: stages('Calificar oportunidad', 'Diagnosticar necesidad', 'Diseñar alcance', 'Valorizar propuesta', 'Validar decisión'),
    owner: 'Comercial GEN+', evidence: ['Brief aprobado', 'Propuesta versionada', 'Respuesta del cliente'],
    humanGate: 'Dirección aprueba alcance, precio y condiciones antes de enviar.', fallback: 'Volver a diagnóstico si falta problema, decisor o presupuesto.',
    nextAction: 'Seleccionar una oportunidad real y auditar sus vacíos.', source: curatedSource('Playbook Ventas B2B GEN+'), linkedCaseIds: [],
    outcome: 'Propuesta sustentada y siguiente paso comercial explícito.',
  },
  {
    id: 'diagnostico-enterprise', kind: 'case', title: 'Diagnóstico enterprise',
    summary: 'Descubre fricción operativa y prioriza una intervención medible antes de construir.',
    unit: 'GEN+', state: 'Confirmado', purpose: 'Convertir síntomas dispersos en problema, baseline, riesgo y oportunidad priorizada.',
    trigger: 'Empresa solicita automatización, IA o mejora sin diagnóstico suficiente.', inputs: ['Entrevistas', 'Proceso actual', 'Evidencias disponibles'],
    stages: stages('Definir problema', 'Levantar proceso actual', 'Identificar fricción', 'Priorizar impacto', 'Aprobar hipótesis'),
    owner: 'Consultoría GEN+', evidence: DEFAULT_EVIDENCE,
    humanGate: 'Sponsor valida problema, alcance y criterio de éxito.', fallback: 'Emitir diagnóstico preliminar con vacíos visibles; no prometer impacto.',
    nextAction: 'Elegir un proceso y completar baseline, owner y evidencia.', source: curatedSource('Proceso B2B Enterprise GEN+'), linkedCaseIds: [],
    outcome: 'Caso priorizado con criterio de éxito y decisión de avanzar o detener.',
  },
  {
    id: 'app-factory', kind: 'case', title: 'App Factory',
    summary: 'Transforma una necesidad ambigua en vertical slice funcional, verificable y desplegable.',
    unit: 'GEN+', state: 'Documentado', purpose: 'Construir el mínimo producto que demuestra valor sin sobredimensionar arquitectura.',
    trigger: 'Idea, nota, brief o proceso que necesita convertirse en producto.', inputs: ['Problema', 'Usuario', 'Fuentes', 'Restricciones'],
    stages: stages('Enmarcar producto', 'Definir vertical slice', 'Diseñar experiencia', 'Construir', 'Verificar', 'Preparar despliegue'),
    owner: 'Producto y desarrollo', evidence: ['Contrato de producto', 'Build aprobado', 'QA del flujo principal'],
    humanGate: 'Owner aprueba alcance, marca y publicación.', fallback: 'Entregar demo local con datos mock declarados.',
    nextAction: 'Mapear un producto actual y señalar su activación.', source: curatedSource('AP App Factory · flujo de desarrollo'), linkedCaseIds: [],
    outcome: 'Prototipo entendible, navegable y listo para validación.',
  },
  {
    id: 'automatizacion-agentflow', kind: 'case', title: 'Automatización AgentFlow',
    summary: 'Diseña agentes y automatizaciones auditables con permisos, evidencia y fallback.',
    unit: 'AgentFlow', state: 'WIP', purpose: 'Reducir trabajo repetitivo sin crear una caja negra ni asumir conexiones disponibles.',
    trigger: 'Proceso repetitivo con entradas, reglas y resultado evaluable.', inputs: ['Proceso actual', 'Sistemas disponibles', 'Reglas', 'Excepciones'],
    stages: stages('Descubrir tarea', 'Definir límites', 'Diseñar agente', 'Configurar controles', 'Probar fallback', 'Validar piloto'),
    owner: 'Automation Architect', evidence: ['Diagrama de flujo', 'Matriz de permisos', 'Log de prueba'],
    humanGate: 'Humano aprueba acciones con efecto externo.', fallback: 'Devolver tarea a operación manual con contexto y error.',
    nextAction: 'Validar una automatización acotada en entorno de prueba.', source: curatedSource('Playbook Automate Process + AgentFlow'), linkedCaseIds: [],
    outcome: 'Diseño de automatización; operación real requiere validación.',
  },
  {
    id: 'agente-crm-aecode', kind: 'case', title: 'Agente CRM AECODE',
    summary: 'Clasifica conversaciones y prepara seguimiento comercial sin inventar acuerdos.',
    unit: 'AECODE', state: 'WIP', purpose: 'Acelerar seguimiento manteniendo trazabilidad entre contacto, interés y evidencia de pago.',
    trigger: 'Nuevo lead, respuesta o cambio de etapa.', inputs: ['Conversación autorizada', 'Oferta vigente', 'Estado comercial'],
    stages: stages('Capturar lead', 'Clasificar intención', 'Proponer respuesta', 'Aprobar envío', 'Registrar resultado'),
    owner: 'Comercial AECODE', evidence: ['Fuente del contacto', 'Respuesta aprobada', 'Cambio de etapa'],
    humanGate: 'Comercial aprueba mensaje, oferta y cambio sensible.', fallback: 'Escalar conversación ambigua sin enviar respuesta.',
    nextAction: 'Probar clasificación con casos anonimizados.', source: curatedSource('AECODE 3.0 + operación comercial'), linkedCaseIds: [],
    outcome: 'Siguiente acción comercial propuesta y revisable.',
  },
  {
    id: 'agente-contenido', kind: 'case', title: 'Agente de contenido',
    summary: 'Convierte fuentes curadas en piezas consistentes con marca, objetivo y revisión.',
    unit: 'AP', state: 'Documentado', purpose: 'Aumentar velocidad de producción sin perder origen ni control editorial.',
    trigger: 'Existe una fuente aprobada y un objetivo de comunicación.', inputs: ['Fuente curada', 'Audiencia', 'Canal', 'Marca'],
    stages: stages('Seleccionar fuente', 'Extraer argumento', 'Diseñar pieza', 'Revisar marca', 'Aprobar publicación'),
    owner: 'Contenido', evidence: ['Fuente enlazada', 'Borrador versionado', 'Aprobación editorial'],
    humanGate: 'Owner aprueba afirmaciones, diseño y publicación.', fallback: 'Guardar borrador y marcar afirmaciones no verificadas.',
    nextAction: 'Elegir una fuente y generar una pieza de prueba.', source: curatedSource('Centro de Agentes AP · documentación y contenido'), linkedCaseIds: [],
    outcome: 'Borrador listo para aprobación, no publicación automática.',
  },
  {
    id: 'icebot', kind: 'case', title: 'ICEBOT',
    summary: 'Estructura sesiones ICE, acuerdos, responsables y evidencia de seguimiento.',
    unit: 'GEN+', state: 'WIP', purpose: 'Reducir pérdida de decisiones y compromisos en coordinación colaborativa.',
    trigger: 'Sesión ICE o reunión de coordinación con decisiones.', inputs: ['Agenda', 'Participantes', 'Temas', 'Evidencia compartida'],
    stages: stages('Preparar sesión', 'Capturar decisión', 'Asignar compromiso', 'Vincular evidencia', 'Verificar cierre'),
    owner: 'Coordinación ICE', evidence: ['Minuta', 'Acuerdo explícito', 'Evidencia de cierre'],
    humanGate: 'Participantes validan acuerdos y cierre.', fallback: 'Marcar acuerdo como pendiente; nunca inferir aceptación.',
    nextAction: 'Validar estructura con una sesión real supervisada.', source: curatedSource('Proyecto ICEBOT + protocolo de reuniones ICE'), linkedCaseIds: [],
    outcome: 'Diseño en desarrollo; no se declara operativo.',
  },
  {
    id: 'visionpro-evento-cierre', kind: 'case', title: 'VisionPro · evento a cierre',
    summary: 'Convierte un evento visual detectado en revisión, asignación y cierre con evidencia.',
    unit: 'VisionPro', state: 'WIP', purpose: 'Trazar una observación visual desde detección hasta validación humana.',
    trigger: 'Evento visual generado en un piloto de obra.', inputs: ['Imagen o video', 'Ubicación', 'Tipo de evento', 'Contexto de obra'],
    stages: stages('Detectar evento', 'Clasificar', 'Revisar evidencia', 'Asignar acción', 'Validar cierre'),
    owner: 'Equipo de piloto VisionPro', evidence: ['Captura visual', 'Clasificación revisada', 'Evidencia posterior'],
    humanGate: 'Especialista confirma evento y cierre.', fallback: 'Marcar no concluyente y solicitar nueva evidencia.',
    nextAction: 'Medir precisión y tiempo de atención en un piloto.', source: curatedSource('VisionPro · flujo evento a cierre'), linkedCaseIds: [],
    outcome: 'Prototipo operativo en piloto; escala y precisión requieren validación.',
  },
  {
    id: 'implementacion-visionpro', kind: 'case', title: 'Implementación VisionPro',
    summary: 'Estructura descubrimiento, preparación de datos, piloto, validación y adopción.',
    unit: 'VisionPro', state: 'WIP', purpose: 'Evitar desplegar inteligencia visual sin caso, datos ni aceptación definidos.',
    trigger: 'Cliente evalúa un caso de inteligencia visual en obra.', inputs: ['Caso de uso', 'Fuentes visuales', 'Restricciones', 'Criterio de éxito'],
    stages: stages('Descubrir caso', 'Evaluar datos', 'Diseñar piloto', 'Configurar', 'Validar', 'Decidir escala'),
    owner: 'Líder de implementación', evidence: ['Ficha de caso', 'Dataset autorizado', 'Reporte de piloto'],
    humanGate: 'Cliente aprueba uso de datos, piloto y decisión de escala.', fallback: 'Cerrar piloto como no concluyente con aprendizajes.',
    nextAction: 'Completar readiness de un caso candidato.', source: curatedSource('Proyecto VisionPro · implementación'), linkedCaseIds: [],
    outcome: 'Plan de implementación; operación compartida requiere validación.',
  },
  {
    id: 'skill-verificable-aecode', kind: 'case', title: 'Skill verificable AECODE',
    summary: 'Del diagnóstico a práctica, evidencia, rúbrica y validación de una habilidad aplicada.',
    unit: 'AECODE', state: 'Confirmado', purpose: 'Convertir aprendizaje técnico en habilidad demostrable con evidencia.',
    trigger: 'Usuario inicia una skill desde su ruta.', inputs: ['Diagnóstico', 'Skill', 'Práctica', 'Criterios de rúbrica'],
    stages: stages('Entender punto de partida', 'Aprender', 'Practicar', 'Subir evidencia', 'Evaluar', 'Validar skill'),
    owner: 'Producto académico AECODE', evidence: ['Entrega del usuario', 'Rúbrica', 'Feedback', 'Resultado de validación'],
    humanGate: 'Evaluador valida evidencia cuando el criterio lo requiere.', fallback: 'Devolver feedback y nueva práctica; no certificar.',
    nextAction: 'Probar el loop con una skill prioritaria.', source: curatedSource('Sistema Operativo AECODE · skill verificable'), linkedCaseIds: [],
    outcome: 'Skill validada con evidencia o devolución accionable.',
  },
  {
    id: 'postventa-certificacion-aecode', kind: 'case', title: 'Postventa y certificación AECODE',
    summary: 'Acompaña acceso, avance, evidencia, requisitos y emisión verificable.',
    unit: 'AECODE', state: 'Documentado', purpose: 'Evitar confundir pago, participación, finalización y certificación.',
    trigger: 'Compra confirmada o solicitud de certificación.', inputs: ['Evidencia de pago', 'Inscripción', 'Progreso', 'Requisitos'],
    stages: stages('Confirmar pago', 'Habilitar acceso', 'Acompañar progreso', 'Revisar requisitos', 'Aprobar certificación', 'Emitir'),
    owner: 'Operaciones AECODE', evidence: ['Transferencia verificada', 'Registro de avance', 'Aprobación académica'],
    humanGate: 'Operaciones y academia validan pago y requisitos.', fallback: 'Mantener estado pendiente y comunicar el requisito faltante.',
    nextAction: 'Auditar separación entre pago, acceso y certificación.', source: curatedSource('Sistema académico y postventa AECODE'), linkedCaseIds: [],
    outcome: 'Certificación emitida solo con requisitos y evidencia confirmados.',
  },
  {
    id: 'conocimiento-documentacion', kind: 'case', title: 'Conocimiento y documentación',
    summary: 'Convierte información en decisiones, notas atómicas, activos y siguientes acciones.',
    unit: 'AP', state: 'Confirmado', purpose: 'Evitar acumulación de información sin origen, relación ni uso operativo.',
    trigger: 'Llega una conversación, archivo, reunión, investigación o decisión.', inputs: ['Fuente', 'Contexto', 'Objetivo', 'Destino autorizado'],
    stages: stages('Capturar fuente', 'Clasificar', 'Sintetizar', 'Vincular', 'Decidir', 'Activar siguiente acción'),
    owner: 'Knowledge owner', evidence: ['Fuente trazable', 'Artefacto estructurado', 'Decisión o acción'],
    humanGate: 'Owner aprueba escritura, decisión y destino cuando corresponda.', fallback: 'Mantener como borrador con vacíos explícitos.',
    nextAction: 'Mapear una entrada reciente hasta su activo final.', source: curatedSource('Knowledge OS · captura, documentación y gobierno'), linkedCaseIds: [],
    outcome: 'Conocimiento utilizable y trazable, no simple archivo acumulado.',
  },
];

export const AP_PROCESSES: APProcess[] = AP_CASES.map((item) => ({
  ...item,
  id: `process-${item.id}`,
  kind: 'process' as const,
  title: `Proceso · ${item.title}`,
  linkedCaseIds: [item.id],
}));

const templateBase = (id: string, title: string, unit: APUnit, purpose: string, fields: string[], linkedCaseIds: string[]): APTemplate => ({
  id, kind: 'template', title, summary: `Estructura reutilizable para ${purpose.toLowerCase()}.`, unit, state: 'Documentado', purpose,
  trigger: 'El usuario necesita iniciar un mapa con una estructura consistente.', inputs: ['Contexto disponible', 'Objetivo', 'Fuentes'],
  stages: stages('Completar contexto', 'Definir flujo', 'Vincular evidencia', 'Revisar vacíos', 'Aprobar siguiente acción'),
  owner: 'Owner del caso', evidence: ['Plantilla completada', 'Fuentes vinculadas', 'Revisión humana'],
  humanGate: 'El owner valida el contenido antes de usarlo como decisión.', fallback: 'Conservar campos desconocidos como Requiere validación.',
  nextAction: 'Crear mapa editable y completar los campos faltantes.', source: curatedSource(`Plantilla AP · ${title}`), linkedCaseIds, fields,
});

export const AP_TEMPLATES: APTemplate[] = [
  templateBase('tpl-captura-proceso', 'Captura de proceso', 'GEN+', 'levantar proceso actual, owners, evidencia y fricción', ['Objetivo', 'Inicio y fin', 'Etapas', 'Owners', 'Evidencia', 'Excepciones'], ['diagnostico-enterprise']),
  templateBase('tpl-automatizacion', 'Diseño de automatización', 'AgentFlow', 'definir entrada, reglas, permisos, logs, fallback y control humano', ['Trigger', 'Entrada', 'Reglas', 'Herramientas disponibles', 'Permisos', 'Fallback', 'Log'], ['automatizacion-agentflow']),
  templateBase('tpl-agente', 'Diseño de agente', 'AgentFlow', 'especificar un agente auditable sin fingir integraciones', ['Problema', 'Trigger', 'Inputs', 'Capacidades', 'Output', 'Human gate', 'Fallback', 'Evidencia'], ['agente-crm-aecode', 'agente-contenido']),
  templateBase('tpl-playbook', 'Playbook operativo', 'AP', 'convertir un proceso repetible en pasos, decisiones y escalamiento', ['Alcance', 'Roles', 'Pasos', 'SLA', 'Excepciones', 'Evidencia', 'Control'], ['conocimiento-documentacion']),
  templateBase('tpl-spec-app', 'Spec de aplicación', 'GEN+', 'enmarcar usuario, promesa, activación, vertical slice y arquitectura mínima', ['Usuario', 'Problema', 'Promesa', 'Activación', 'Datos', 'Estados', 'QA'], ['app-factory']),
  templateBase('tpl-decision-record', 'Decision record', 'AP', 'registrar contexto, opciones, decisión, evidencia y consecuencias', ['Contexto', 'Opciones', 'Criterio', 'Decisión', 'Evidencia', 'Riesgo', 'Revisión'], ['conocimiento-documentacion']),
  templateBase('tpl-skill-evidencia', 'Skill y evidencia AECODE', 'AECODE', 'diseñar práctica, evidencia, rúbrica, feedback y validación', ['Skill', 'Resultado', 'Práctica', 'Evidencia', 'Rúbrica', 'Feedback', 'Criterio de validación'], ['skill-verificable-aecode']),
];

const agentBase = (
  id: string, title: string, unit: APUnit, purpose: string, trigger: string, inputs: string[], capabilities: string[], output: string, humanGate: string, fallback: string, linkedCaseIds: string[], state: APLibraryState = 'Documentado'
): APAgent => ({
  id, kind: 'agent', title, summary: purpose, unit, state, purpose, trigger, inputs, capabilities, output,
  stages: stages('Recibir contexto', 'Procesar con límites', 'Producir artefacto', 'Exponer evidencia', 'Solicitar decisión humana'),
  owner: 'Alejandro Palpan / owner delegado', evidence: ['Fuentes de entrada', 'Artefacto producido', 'Registro de revisión'],
  humanGate, fallback, nextAction: 'Validar con un caso acotado y evidencia real.', source: curatedSource(`Centro de Agentes AP · ${title}`), linkedCaseIds,
});

export const AP_AGENTS: APAgent[] = [
  agentBase('agent-vault-researcher', 'Vault Researcher', 'AP', 'Localiza fuentes y relaciones sin editar el vault.', 'Se requiere contexto interno verificable.', ['Pregunta', 'Alcance de lectura'], ['Búsqueda de archivos', 'Síntesis source-grounded', 'Detección de vacíos'], 'Inventario de evidencia y hallazgos.', 'Humano define si lo encontrado se incorpora o modifica.', 'Reporta que no existe evidencia suficiente.', ['conocimiento-documentacion']),
  agentBase('agent-product-architect', 'Product Architect', 'AP', 'Convierte una idea ambigua en producto, vertical slice y decisión de alcance.', 'Se plantea un producto o mejora.', ['Problema', 'Usuario', 'Contexto', 'Restricciones'], ['Framing de producto', 'Priorización', 'Arquitectura de experiencia'], 'Contrato de producto y slice recomendado.', 'Owner aprueba alcance y trade-offs.', 'Propone la demo mínima y marca vacíos.', ['app-factory']),
  agentBase('agent-frontend-builder', 'Frontend Builder', 'GEN+', 'Implementa interfaces funcionales dentro del repositorio activo.', 'Existe un alcance aprobado para construir.', ['Contrato de producto', 'Diseño', 'Repositorio'], ['React/TypeScript cuando están disponibles', 'Componentes', 'Pruebas focales'], 'Vertical slice navegable.', 'Owner autoriza publicación y cambios externos.', 'Entrega build local y lista bloqueos.', ['app-factory']),
  agentBase('agent-design-reviewer', 'Design Reviewer', 'GEN+', 'Detecta ruido, inconsistencia y falta de orientación a decisiones.', 'Existe una interfaz para revisar.', ['Pantallas', 'Contrato de marca', 'Flujo'], ['Revisión UX/UI', 'Jerarquía', 'Responsive', 'Anti-patrones'], 'Hallazgos priorizados con correcciones.', 'Producto decide cambios de alcance.', 'Declara limitaciones si no hay runtime visual.', ['app-factory']),
  agentBase('agent-qa-evidence', 'QA Evidence Reviewer', 'GEN+', 'Verifica funcionamiento, regresiones y accesibilidad con evidencia.', 'El slice está listo para validar.', ['Build', 'Criterios de aceptación'], ['Pruebas', 'QA de navegador', 'Accesibilidad básica'], 'Veredicto pass/fail y evidencia.', 'Humano acepta riesgos residuales.', 'Marca Requiere validación cuando no puede ejecutar.', ['app-factory']),
  agentBase('agent-technical-docs', 'Technical Docs Researcher', 'AP', 'Consulta documentación oficial dependiente de versión antes de implementar.', 'Una decisión depende de API, SDK o framework actual.', ['Pregunta técnica', 'Versión', 'Restricción'], ['Documentación oficial', 'Comparación de versiones', 'Citas'], 'Recomendación técnica actualizada.', 'Ingeniería valida adopción y prueba.', 'No recomienda API no confirmada.', ['app-factory']),
  agentBase('agent-automation-architect', 'Automation Architect', 'AgentFlow', 'Diseña automatizaciones auditables con permisos, logs y fallback.', 'Existe una tarea repetitiva candidata.', ['Proceso', 'Sistemas', 'Reglas', 'Riesgo'], ['Diseño de agentes', 'MCP/workflows si están disponibles', 'Human-in-the-loop'], 'Arquitectura de automatización.', 'Humano aprueba toda acción externa.', 'Ruta manual y registro de error.', ['automatizacion-agentflow'], 'WIP'),
  agentBase('agent-chief-of-staff', 'Chief of Staff', 'AP', 'Sintetiza prioridades, decisiones, bloqueos y siguiente acción ejecutiva.', 'Se necesita coordinación o decisión transversal.', ['Estado', 'Evidencia', 'Agenda'], ['Síntesis ejecutiva', 'Priorización', 'Seguimiento'], 'Brief decisional.', 'Alejandro toma decisiones y delega; no se le asigna ejecución por defecto.', 'Expone información faltante sin inventar.', ['venta-b2b-genplus', 'conocimiento-documentacion']),
  agentBase('agent-documentacion', 'Documentación', 'AP', 'Transforma fuentes en documentos trazables y reutilizables.', 'Existe material que debe convertirse en activo.', ['Fuentes autorizadas', 'Audiencia', 'Formato'], ['Estructuración', 'Redacción', 'Control de fuentes'], 'Documento o playbook revisable.', 'Owner aprueba contenido y destino.', 'Mantiene borrador con vacíos.', ['conocimiento-documentacion']),
  agentBase('agent-desarrollo', 'Desarrollo', 'GEN+', 'Construye, prueba y documenta software dentro de un alcance aprobado.', 'Existe una tarea técnica concreta.', ['Repositorio', 'Criterio de aceptación', 'Stack'], ['Código', 'Tests', 'Build', 'Diagnóstico'], 'Cambio verificable en repositorio.', 'Humano autoriza deploy, secretos y efectos externos.', 'Entrega parche local o diagnóstico.', ['app-factory']),
  agentBase('agent-comercial', 'Comercial', 'GEN+', 'Estructura oportunidad, diagnóstico, propuesta y seguimiento con evidencia.', 'Llega un lead u oportunidad.', ['Contacto', 'Necesidad', 'Oferta vigente'], ['Calificación', 'Scoping', 'Borrador de propuesta'], 'Siguiente acción comercial sustentada.', 'Humano aprueba precio, condiciones y envío.', 'Escala vacíos y no inventa acuerdos.', ['venta-b2b-genplus', 'diagnostico-enterprise']),
];

export const AP_LIBRARY_BY_TAB: Record<APLibraryTab, APLibraryItem[]> = {
  cases: AP_CASES,
  processes: AP_PROCESSES,
  templates: AP_TEMPLATES,
  agents: AP_AGENTS,
};

export const AP_LIBRARY_COUNTS = {
  cases: AP_CASES.length,
  processes: AP_PROCESSES.length,
  templates: AP_TEMPLATES.length,
  agents: AP_AGENTS.length,
} as const;
