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

export interface APArchitectureLayer {
  title: string;
  purpose: string;
  components: string[];
  state: APLibraryState;
}

export interface APBlueprintIntegration {
  name: string;
  purpose: string;
  state: APLibraryState;
}

export interface APDeploymentHorizon {
  horizon: 'Prototipo' | 'MVP' | 'Escala';
  description: string;
  state: APLibraryState;
}

export interface APTechnicalDocument {
  title: string;
  contribution: string;
  state: APLibraryState;
}

export interface APValidationGate {
  title: string;
  evidence: string;
  state: APLibraryState;
}

export interface APOperationalTemplate extends APBaseItem {
  kind: 'template';
  templateType: 'operational';
  fields: string[];
}

export interface APTechnicalBlueprintTemplate extends APBaseItem {
  kind: 'template';
  templateType: 'technical-blueprint';
  blueprint: {
    currentTruth: string;
    targetOutcome: string;
    layers: APArchitectureLayer[];
    entities: string[];
    integrations: APBlueprintIntegration[];
    deployment: APDeploymentHorizon[];
    technicalDocumentation: APTechnicalDocument[];
    validationGates: APValidationGate[];
    exclusions: string[];
  };
}

export type APTemplate = APOperationalTemplate | APTechnicalBlueprintTemplate;

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
  {
    id: 'esparq-control-multiobra', kind: 'case', title: 'ESPARQ · control multiobra',
    summary: 'Ordena planificación, avance, evidencia, mano de obra y alertas en una vista operacional multiobra.',
    unit: 'GEN+', state: 'WIP', purpose: 'Conectar el cronograma meta con la ejecución diaria sin confundir una interfaz demostrable con una plataforma productiva.',
    trigger: 'Una empresa necesita controlar varias obras, cuadrillas y desviaciones desde una fuente común.',
    inputs: ['Cronograma meta', 'WBS y actividades', 'Cuadrillas y horas-hombre', 'Avance y evidencia de campo'],
    stages: stages('Definir cronograma meta', 'Dimensionar recursos', 'Programar cuadrillas y HH', 'Capturar avance', 'Vincular evidencia', 'Conciliar tareo', 'Analizar histograma', 'Emitir alertas y reporte', 'Consolidar multiobra'),
    owner: 'Equipo de producto ESPARQ', evidence: ['Discovery y secuencia UX documentados', 'Mock navegable', 'Criterios de piloto por validar'],
    humanGate: 'Operaciones valida avances, tareos, alertas y aceptación del piloto antes de escalar.',
    fallback: 'Mantener captura y conciliación manual, mostrando vacíos de integración y datos no verificados.',
    nextAction: 'Validar un flujo extremo a extremo con una obra, datos reales y responsables nominados.',
    source: curatedSource('ESPARQ · discovery, UX MVP y control multiobra'), linkedCaseIds: [],
    outcome: 'MVP en validación; backend, autenticación, integraciones y operación multiobra requieren evidencia.',
  },
];

export const AP_PROCESSES: APProcess[] = AP_CASES.map((item) => ({
  ...item,
  id: `process-${item.id}`,
  kind: 'process' as const,
  title: `Proceso · ${item.title}`,
  linkedCaseIds: [item.id],
}));

const templateBase = (id: string, title: string, unit: APUnit, purpose: string, fields: string[], linkedCaseIds: string[]): APOperationalTemplate => ({
  id, kind: 'template', templateType: 'operational', title, summary: `Estructura reutilizable para ${purpose.toLowerCase()}.`, unit, state: 'Documentado', purpose,
  trigger: 'El usuario necesita iniciar un mapa con una estructura consistente.', inputs: ['Contexto disponible', 'Objetivo', 'Fuentes'],
  stages: stages('Completar contexto', 'Definir flujo', 'Vincular evidencia', 'Revisar vacíos', 'Aprobar siguiente acción'),
  owner: 'Owner del caso', evidence: ['Plantilla completada', 'Fuentes vinculadas', 'Revisión humana'],
  humanGate: 'El owner valida el contenido antes de usarlo como decisión.', fallback: 'Conservar campos desconocidos como Requiere validación.',
  nextAction: 'Crear mapa editable y completar los campos faltantes.', source: curatedSource(`Plantilla AP · ${title}`), linkedCaseIds, fields,
});

const AP_TEMPLATES_UNSORTED: APTemplate[] = [
  templateBase('tpl-captura-proceso', 'Captura de proceso', 'GEN+', 'levantar proceso actual, owners, evidencia y fricción', ['Objetivo', 'Inicio y fin', 'Etapas', 'Owners', 'Evidencia', 'Excepciones'], ['diagnostico-enterprise']),
  templateBase('tpl-automatizacion', 'Diseño de automatización', 'AgentFlow', 'definir entrada, reglas, permisos, logs, fallback y control humano', ['Trigger', 'Entrada', 'Reglas', 'Herramientas disponibles', 'Permisos', 'Fallback', 'Log'], ['automatizacion-agentflow']),
  templateBase('tpl-agente', 'Diseño de agente', 'AgentFlow', 'especificar un agente auditable sin fingir integraciones', ['Problema', 'Trigger', 'Inputs', 'Capacidades', 'Output', 'Human gate', 'Fallback', 'Evidencia'], ['agente-crm-aecode', 'agente-contenido']),
  templateBase('tpl-playbook', 'Playbook operativo', 'AP', 'convertir un proceso repetible en pasos, decisiones y escalamiento', ['Alcance', 'Roles', 'Pasos', 'SLA', 'Excepciones', 'Evidencia', 'Control'], ['conocimiento-documentacion']),
  templateBase('tpl-spec-app', 'Spec de aplicación', 'GEN+', 'enmarcar usuario, promesa, activación, vertical slice y arquitectura mínima', ['Usuario', 'Problema', 'Promesa', 'Activación', 'Datos', 'Estados', 'QA'], ['app-factory']),
  templateBase('tpl-decision-record', 'Decision record', 'AP', 'registrar contexto, opciones, decisión, evidencia y consecuencias', ['Contexto', 'Opciones', 'Criterio', 'Decisión', 'Evidencia', 'Riesgo', 'Revisión'], ['conocimiento-documentacion']),
  templateBase('tpl-skill-evidencia', 'Skill y evidencia AECODE', 'AECODE', 'diseñar práctica, evidencia, rúbrica, feedback y validación', ['Skill', 'Resultado', 'Práctica', 'Evidencia', 'Rúbrica', 'Feedback', 'Criterio de validación'], ['skill-verificable-aecode']),
  {
    id: 'tpl-blueprint-visionpro', kind: 'template', templateType: 'technical-blueprint',
    title: 'Blueprint técnico · VisionPro',
    summary: 'Proceso, arquitectura edge-cloud y documentación para llevar un caso visual desde cámaras hasta cierre con evidencia.',
    unit: 'VisionPro', state: 'WIP', purpose: 'Explicar y validar la solución VisionPro sin presentar el piloto actual como un SaaS multiobra terminado.',
    trigger: 'Se necesita diseñar, explicar o auditar una implementación de inteligencia visual en obra.',
    inputs: ['Caso de uso y criterio de éxito', 'Inventario de cámaras y NVR', 'Condiciones de red y edge', 'Políticas de datos y operación'],
    stages: stages('Definir caso y criterio', 'Validar readiness de cámaras y datos', 'Diseñar solución', 'Configurar edge y NVR', 'Calibrar modelos', 'Ejecutar piloto', 'Detectar evento', 'Revisar con humano', 'Asignar acción y SLA', 'Cerrar con evidencia', 'Decidir escala'),
    owner: 'Producto e implementación VisionPro',
    evidence: ['Ficha de caso y readiness', 'Evento con evidencia visual', 'Decisión de cierre o escala registrada'],
    humanGate: 'Especialista de obra valida el evento, la acción correctiva y el cierre; el cliente aprueba cualquier escala.',
    fallback: 'Clasificar el evento como no concluyente, conservar evidencia y volver a operación manual.',
    nextAction: 'Completar un piloto de 14 días con dueño, SLA, alerta y cierre medibles.',
    source: curatedSource('VisionPro · producto, arquitectura, MLOps y operación de piloto'),
    linkedCaseIds: ['visionpro-evento-cierre', 'implementacion-visionpro'],
    blueprint: {
      currentTruth: 'Existe un prototipo operacional en una obra con cámaras, NVR, edge, procesamiento, eventos y panel. La alerta extremo a extremo, precisión, recuperación y multiobra aún no están cerradas.',
      targetOutcome: 'Un sistema repetible que convierta eventos visuales en evidencia revisable, responsables, SLA, acciones y cierres auditables por obra.',
      layers: [
        { title: 'Captura y edge', purpose: 'Adquirir señales y sostener operación local.', components: ['Cámaras IP / CCTV', 'NVR o DVR', 'Jetson o gateway', 'Buffer y health local'], state: 'Confirmado' },
        { title: 'Ingesta y evidencia', purpose: 'Transportar eventos, frames y metadatos con reintentos.', components: ['API de eventos y frames', 'Cola y retry', 'Almacenamiento de objetos', 'Base de metadatos'], state: 'WIP' },
        { title: 'Computer vision y MLOps', purpose: 'Detectar, versionar y evaluar modelos y datasets.', components: ['Módulos CV', 'Motor de umbrales', 'Versionado de modelo y dataset', 'Experimentos y métricas'], state: 'Documentado' },
        { title: 'Aplicación operativa', purpose: 'Convertir señales en decisiones y cierres.', components: ['Dashboard de obra', 'Feed de alertas', 'Timeline de evidencia', 'Reportes y vista TV'], state: 'WIP' },
        { title: 'Gobierno y seguridad', purpose: 'Proteger datos, roles, retención y auditoría.', components: ['Cliente y obra', 'Usuarios y roles', 'Auditoría', 'Privacidad y retención'], state: 'Documentado' },
        { title: 'Cloud, multiobra y recovery', purpose: 'Escalar y recuperar la operación con evidencia.', components: ['Servicios cloud', 'Observabilidad', 'Backup y rollback', 'Consolidación multiobra'], state: 'Requiere validación' },
      ],
      entities: ['Cliente', 'Obra', 'Cámara', 'Zona', 'Módulo', 'Evento', 'Evidencia', 'Acción', 'Usuario', 'Log'],
      integrations: [
        { name: 'CCTV / NVR', purpose: 'Captura de streams, frames y eventos de origen.', state: 'WIP' },
        { name: 'Jetson / gateway edge', purpose: 'Procesamiento local, buffering y health.', state: 'WIP' },
        { name: 'Alertas operativas', purpose: 'Notificar evento, responsable y SLA.', state: 'Requiere validación' },
        { name: 'Cloud de evidencia', purpose: 'Persistir objetos y metadatos del evento.', state: 'Documentado' },
      ],
      deployment: [
        { horizon: 'Prototipo', description: 'Una obra, cámaras y edge existentes, eventos y panel supervisados.', state: 'Confirmado' },
        { horizon: 'MVP', description: 'Piloto repetible con alerta, acción, SLA, cierre y health medibles.', state: 'WIP' },
        { horizon: 'Escala', description: 'Multiobra, observabilidad, recuperación, seguridad y costos operables.', state: 'Requiere validación' },
      ],
      technicalDocumentation: [
        { title: 'Estado real de VisionPro', contribution: 'Baseline, límites y siguiente piloto.', state: 'Confirmado' },
        { title: 'PRD VisionPro', contribution: 'Problema, usuarios, módulos y criterios de producto.', state: 'Documentado' },
        { title: 'Arquitectura AWS–Jetson–NVR', contribution: 'Topología edge-cloud de referencia.', state: 'Documentado' },
        { title: 'Pipeline de eventos y frames', contribution: 'Datos, metadatos, retención y transporte.', state: 'Documentado' },
        { title: 'MLOps de computer vision', contribution: 'Datasets, experimentos, métricas y versiones.', state: 'Documentado' },
        { title: 'Seguridad, privacidad y compliance', contribution: 'Roles, protección, auditoría y retención.', state: 'Documentado' },
        { title: 'Playbook de implementación', contribution: 'Discovery, instalación, calibración, piloto y handover.', state: 'Documentado' },
        { title: 'SOP operativo de obra', contribution: 'Operación diaria, excepciones y cierre.', state: 'Documentado' },
      ],
      validationGates: [
        { title: 'Readiness de captura', evidence: 'Cámara, red, NVR y edge operan durante el piloto.', state: 'WIP' },
        { title: 'Gobierno de datos', evidence: 'Uso y retención de datos aprobados.', state: 'Requiere validación' },
        { title: 'Evento revisable', evidence: 'Evento y evidencia pueden ser confirmados por un humano.', state: 'WIP' },
        { title: 'Ciclo de atención', evidence: 'Alerta, responsable y SLA quedan registrados.', state: 'Requiere validación' },
        { title: 'Cierre y escala', evidence: 'Existe evidencia posterior y decisión Go / No-Go.', state: 'Requiere validación' },
      ],
      exclusions: ['No declara SaaS multiobra validado', 'No afirma precisión de modelos sin medición', 'No declara alerta extremo a extremo cerrada', 'No trata detección automática como cierre humano'],
    },
  },
  {
    id: 'tpl-blueprint-aecode-f3', kind: 'template', templateType: 'technical-blueprint',
    title: 'Blueprint técnico · AECODE F3',
    summary: 'Arquitectura de Learning OS para llevar al profesional desde diagnóstico y ruta hasta skill verificada con evidencia.',
    unit: 'AECODE', state: 'Requiere validación', purpose: 'Alinear experiencia, dominio y adaptadores alrededor del loop de habilidades verificables, sin fingir que la arquitectura objetivo ya está desplegada.',
    trigger: 'Se diseña o revisa una ruta, skill, evaluación, AI Coach o Skill Passport de AECODE.',
    inputs: ['Usuario y organización', 'Ruta y skill versionada', 'Práctica y evidencia', 'Rúbrica y criterio de validación'],
    stages: stages('Entrar y registrarse', 'Completar onboarding y diagnóstico', 'Recibir ruta', 'Iniciar skill y cápsulas', 'Practicar', 'Subir evidencia', 'Recibir evaluación IA preliminar', 'Revisar con rúbrica humana', 'Validar skill', 'Actualizar Skill Passport y siguiente ruta'),
    owner: 'Producto académico y tecnología AECODE', evidence: ['Evidencia del usuario', 'Rúbrica versionada', 'Revisión aprobada', 'Registro de skill verificada'],
    humanGate: 'Un badge o skill verificada solo se emite cuando la evidencia satisface la rúbrica y la revisión requerida.',
    fallback: 'Entregar feedback accionable, nueva práctica y estado pendiente; no certificar ni emitir badge.',
    nextAction: 'Implementar y medir el loop completo con una skill prioritaria y una cohorte.',
    source: curatedSource('AECODE F3 · Learning OS, arquitectura y evidencia'), linkedCaseIds: ['skill-verificable-aecode', 'postventa-certificacion-aecode'],
    blueprint: {
      currentTruth: 'El loop, los dominios y la arquitectura hexagonal modular están documentados como propuesta y MVP; su despliegue integral requiere validación técnica y de uso.',
      targetOutcome: 'Una plataforma donde cada usuario recibe una ruta, practica, aporta evidencia, obtiene feedback y construye un Skill Passport verificable.',
      layers: [
        { title: 'Experiencia', purpose: 'Guiar activación, progreso y siguiente acción.', components: ['Landing y registro', 'Onboarding y diagnóstico', 'Ruta y skill player', 'Dashboard y Skill Passport'], state: 'Documentado' },
        { title: 'Aplicación', purpose: 'Orquestar casos de uso sin acoplar proveedores.', components: ['Asignar ruta', 'Iniciar skill', 'Recibir evidencia', 'Evaluar y verificar', 'Otorgar acceso'], state: 'Documentado' },
        { title: 'Dominio de aprendizaje', purpose: 'Conservar reglas de habilidades y evidencia.', components: ['Route / Cluster / Skill', 'Capsule / Practice', 'Evidence / Rubric / Review', 'Passport'], state: 'Documentado' },
        { title: 'Puertos', purpose: 'Expresar necesidades del dominio.', components: ['Repositorio', 'Evaluador', 'Pagos y acceso', 'Notificación', 'Credenciales'], state: 'Documentado' },
        { title: 'Adaptadores', purpose: 'Conectar proveedores reemplazables.', components: ['Persistencia', 'IA evaluadora', 'Pasarela de pago', 'Mensajería', 'Emisión de credencial'], state: 'Requiere validación' },
        { title: 'Eventos y analítica', purpose: 'Medir el loop y la North Star.', components: ['Eventos de activación', 'Progreso', 'Evidencia enviada', 'Skill verificada', 'Retención'], state: 'WIP' },
        { title: 'Identidad, RBAC y despliegue', purpose: 'Separar usuarios, organizaciones, permisos y operación.', components: ['Autenticación', 'Roles y permisos', 'Auditoría', 'Observabilidad y release'], state: 'Requiere validación' },
      ],
      entities: ['User', 'Organization', 'Cohort', 'SkillVersion', 'LearningRoute', 'Practice', 'Evidence', 'Rubric', 'Review', 'SkillPassport', 'Order', 'AccessGrant'],
      integrations: [
        { name: 'Evaluador IA', purpose: 'Feedback preliminar explicable, nunca certificación autónoma.', state: 'Requiere validación' },
        { name: 'Pasarela de pago', purpose: 'Confirmar orden antes de otorgar acceso.', state: 'Requiere validación' },
        { name: 'Notificaciones', purpose: 'Activación, recordatorios y resultado de revisión.', state: 'Requiere validación' },
        { name: 'Credenciales verificables', purpose: 'Emitir badge o Skill Passport tras aprobación.', state: 'Requiere validación' },
      ],
      deployment: [
        { horizon: 'Prototipo', description: 'Una skill y un flujo demostrable con datos controlados.', state: 'Documentado' },
        { horizon: 'MVP', description: 'Cohorte real con acceso, práctica, evidencia, revisión y passport.', state: 'WIP' },
        { horizon: 'Escala', description: 'Multiempresa, catálogo versionado, analítica, pagos y credenciales operables.', state: 'Requiere validación' },
      ],
      technicalDocumentation: [
        { title: 'Arquitectura de producto AECODE', contribution: 'Dominios, loop y límites del sistema.', state: 'Documentado' },
        { title: 'Skills y plataforma', contribution: 'Modelo de skill, ruta y experiencia.', state: 'Documentado' },
        { title: 'Sistema de evaluación', contribution: 'Evidencia, rúbrica, revisión y resultado.', state: 'Documentado' },
        { title: 'AI Coach', contribution: 'Feedback preliminar y control humano.', state: 'Documentado' },
        { title: 'AECODE Learning OS', contribution: 'Visión integrada de aprendizaje verificable.', state: 'Documentado' },
        { title: 'F3 estrategia, aplicación y roadmap', contribution: 'Alcance, funcionalidades, riesgos y gates.', state: 'Documentado' },
        { title: 'Spec técnica', contribution: 'Arquitectura hexagonal modular y contratos.', state: 'Documentado' },
        { title: 'Templates de skill y evidencia', contribution: 'Estructura reutilizable para contenido y validación.', state: 'Documentado' },
      ],
      validationGates: [
        { title: 'Skill y rúbrica', evidence: 'Una skill prioritaria tiene resultado y rúbrica aprobados.', state: 'Documentado' },
        { title: 'Acceso', evidence: 'El acceso depende de una orden confirmada.', state: 'Requiere validación' },
        { title: 'Trazabilidad de evidencia', evidence: 'La evidencia conserva fuente y versión.', state: 'WIP' },
        { title: 'IA explicable', evidence: 'La IA explica su feedback y no certifica.', state: 'Requiere validación' },
        { title: 'Verificación humana', evidence: 'La revisión humana habilita badge o Skill Passport.', state: 'Requiere validación' },
      ],
      exclusions: ['No afirma proveedores conectados', 'No confunde propuesta arquitectónica con despliegue', 'No certifica por participación o pago', 'No presenta feedback IA como veredicto final'],
    },
  },
  {
    id: 'tpl-blueprint-esparq', kind: 'template', templateType: 'technical-blueprint',
    title: 'Blueprint técnico · ESPARQ',
    summary: 'Proceso de control de obra en diez pasos y arquitectura evolutiva desde discovery y mock hasta una operación multiobra validada.',
    unit: 'GEN+', state: 'WIP', purpose: 'Explicar qué está documentado, qué existe en la interfaz y qué debe probarse antes de declarar ESPARQ productivo.',
    trigger: 'Se requiere diseñar, demostrar o auditar el flujo de planificación y control multiobra.',
    inputs: ['Cronograma y WBS', 'Cuadrillas y HH', 'Avance y evidencia', 'Tareo, requerimientos y documentos'],
    stages: stages('Cargar cronograma meta', 'Dimensionar producción', 'Asignar cuadrillas y HH', 'Programar trabajo', 'Capturar avance', 'Adjuntar evidencia', 'Conciliar tareo y asistencia', 'Analizar histograma', 'Generar alertas y reporte', 'Consolidar vista multiobra'),
    owner: 'Producto ESPARQ y operaciones de obra', evidence: ['Discovery y secuencia UX documentados', 'Flujo UX demostrable', 'Datos, integración y aceptación de piloto por validar'],
    humanGate: 'Operaciones valida datos de campo, desviaciones, alertas y cierre; el sponsor decide avance del piloto.',
    fallback: 'Usar fuentes manuales o exportables, conservar conciliación humana y marcar cualquier dato no integrado.',
    nextAction: 'Ejecutar una prueba de una obra con cronograma, avance, tareo y evidencia reales.',
    source: curatedSource('ESPARQ · Hub, Fase 0, UX MVP y arquitectura'), linkedCaseIds: ['esparq-control-multiobra'],
    blueprint: {
      currentTruth: 'El discovery, la secuencia UX y un mock Next.js están documentados o son demostrables. Backend, base de datos, autenticación, APIs e infraestructura productiva no están verificados.',
      targetOutcome: 'Un control multiobra que conecte meta, recursos, ejecución, evidencia y alertas con permisos, auditoría y aceptación operativa.',
      layers: [
        { title: 'Campo y entradas', purpose: 'Capturar fuentes operativas con responsable.', components: ['Cronograma y WBS', 'Avance y evidencia', 'Tareo y asistencia', 'Requerimientos y documentos'], state: 'Documentado' },
        { title: 'Interfaz Next.js', purpose: 'Mostrar módulos y recorridos del MVP.', components: ['Inicio ejecutivo', 'Planificación', 'Producción y avance', 'Recursos y multiobra'], state: 'WIP' },
        { title: 'Dominio de planificación y control', purpose: 'Aplicar reglas, estados y conciliación.', components: ['Cronograma meta', 'Cuadrillas y HH', 'Curvas e histogramas', 'Alertas y aprobaciones'], state: 'Documentado' },
        { title: 'Adaptadores Netlog / Bildin', purpose: 'Consumir logística y mano de obra en modo lectura.', components: ['Netlog: proveedores y requerimientos', 'Bildin: trabajadores y tareos', 'Contratos de sincronización'], state: 'Requiere validación' },
        { title: 'Datos SQL y archivos', purpose: 'Persistir entidades, evidencia y auditoría.', components: ['Base relacional', 'Repositorio de archivos', 'Importación y exportación', 'Backups'], state: 'Requiere validación' },
        { title: 'Identidad, roles y auditoría', purpose: 'Restringir acciones por empresa, obra y rol.', components: ['Usuarios', 'Roles y permisos', 'Aprobaciones', 'Audit events'], state: 'Documentado' },
        { title: 'Infraestructura y operación', purpose: 'Desplegar, observar, recuperar y escalar.', components: ['Runtime web/API', 'Observabilidad', 'Backup y restore', 'Seguridad perimetral'], state: 'Requiere validación' },
      ],
      entities: ['Empresa', 'Obra', 'Usuario', 'Rol', 'Permiso', 'WBS', 'Actividad', 'Cronograma', 'Avance', 'Evidencia', 'Cuadrilla', 'Trabajador', 'HH', 'Tareo', 'Requerimiento', 'Proveedor', 'SAME', 'RFI', 'Documento', 'Aprobación', 'AuditEvent'],
      integrations: [
        { name: 'Netlog', purpose: 'Consulta de logística, requerimientos y proveedores; objetivo solo lectura.', state: 'Requiere validación' },
        { name: 'Bildin', purpose: 'Consulta de trabajadores, asistencia y tareo; objetivo solo lectura.', state: 'Requiere validación' },
        { name: 'Importación Excel / archivos', purpose: 'Ruta mínima para validar datos antes de APIs.', state: 'Documentado' },
        { name: 'Servicios Azure objetivo', purpose: 'Alternativa PaaS condicionada a spike técnico y costos.', state: 'Requiere validación' },
      ],
      deployment: [
        { horizon: 'Prototipo', description: 'Mock Next.js y recorrido UX con datos representativos etiquetados.', state: 'Confirmado' },
        { horizon: 'MVP', description: 'Una obra con persistencia, roles, importación y conciliación supervisada.', state: 'WIP' },
        { horizon: 'Escala', description: 'Multiobra, APIs verificadas, recuperación y PaaS condicionado a prueba.', state: 'Requiere validación' },
      ],
      technicalDocumentation: [
        { title: 'Hub ESPARQ', contribution: 'Mapa de producto y navegación documental.', state: 'Documentado' },
        { title: 'Discovery Fase 0', contribution: 'Problema, actores, fuentes y vacíos.', state: 'Documentado' },
        { title: 'Reporte de discovery', contribution: 'Hallazgos y decisiones a la fecha.', state: 'Documentado' },
        { title: 'Secuencia UX del MVP', contribution: 'Recorrido y priorización de módulos.', state: 'Documentado' },
        { title: 'Matriz de accesos y roles E140', contribution: 'Permisos y acciones por rol.', state: 'Documentado' },
        { title: 'Checklist de cierre', contribution: 'Gates de aceptación y evidencia.', state: 'Documentado' },
        { title: 'Arquitectura de plataforma', contribution: 'Capas, datos, integraciones e infraestructura objetivo.', state: 'Requiere validación' },
      ],
      validationGates: [
        { title: 'Datos del piloto', evidence: 'Datos reales de una obra están disponibles y autorizados.', state: 'Requiere validación' },
        { title: 'Conciliación operativa', evidence: 'El flujo meta → avance → evidencia queda conciliado.', state: 'WIP' },
        { title: 'Roles y aprobaciones', evidence: 'Permisos y decisiones están probados por perfil.', state: 'Requiere validación' },
        { title: 'APIs externas', evidence: 'Netlog y Bildin se confirman antes de integrar.', state: 'Requiere validación' },
        { title: 'Continuidad y aceptación', evidence: 'Backup, restore y aceptación operativa están demostrados.', state: 'Requiere validación' },
      ],
      exclusions: ['No afirma backend, base de datos o autenticación implementados', 'No afirma APIs de Netlog o Bildin disponibles', 'No presenta Azure como infraestructura existente', 'No confunde avance con aceptación ni pago'],
    },
  },
];

export const AP_TEMPLATES: APTemplate[] = AP_TEMPLATES_UNSORTED.sort(
  (left, right) => Number(right.templateType === 'technical-blueprint') - Number(left.templateType === 'technical-blueprint')
);

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
