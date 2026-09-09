# AI Map by GEN+ — Product Contract

## Usuario y trabajo

Líderes de proyectos GEN+, coordinadores AEC y equipos de automatización que reciben información dispersa y necesitan convertirla en una visión accionable del proyecto.

## Promesa

En menos de cinco minutos, transforma una descripción, acta, alcance o brief en un mapa navegable de procesos con responsables, evidencia, riesgos, decisiones y la siguiente acción verificable.

## Activación y vertical slice

1. El usuario entra mediante el gate privado GEN+.
2. Revisa el resumen decisional de Inicio o entra a Biblioteca AP.
3. Selecciona un caso, proceso, plantilla o agente con estado y trazabilidad visibles.
4. Crea un mapa editable determinista con fuente, owner, evidencia, decisión humana y fallback.
5. También puede pegar contexto o seleccionar una carpeta local y mejorarlo opcionalmente con AI Mapper.
6. El mapa se guarda localmente y se exporta como JSON o Mermaid.

## Biblioteca AP · snapshot 2026-09-08

- 13 casos prioritarios y 13 procesos derivados del catálogo curado; incluye ESPARQ y no es un inventario exhaustivo del ecosistema.
- 10 plantillas AP: tres blueprints técnicos source-grounded (VisionPro, AECODE F3 y ESPARQ) más captura de proceso, automatización, agente, playbook, spec app, decision record y skill/evidencia AECODE.
- 11 fichas de agentes con problema, disparador, inputs, capacidades, resultado, control humano, fallback y evidencia.
- Estados permitidos: `Confirmado`, `Documentado`, `WIP` y `Requiere validación`.
- AgentFlow e ICEBOT permanecen WIP. VisionPro se describe únicamente como prototipo operativo en piloto.
- Los tres blueprints técnicos crean un `AI Process` nativo, no una rama DSL genérica: cuatro lanes horizontales apiladas, etapas únicas en orden izquierda → derecha y habilitadores técnicos visibles dentro del sistema de producción. Los nodos y lanes conservan drag, resize, edición, conexiones, historial, pan/zoom y exportación.
- Los blueprints separan realidad actual, arquitectura objetivo, entidades, integraciones, despliegue, documentación, gates y exclusiones. Toda integración o escala no probada conserva el estado `Requiere validación`.
- El snapshot se publica como datos TypeScript separados del store del canvas y no contiene rutas locales, secretos ni transcripciones privadas.

## Entidades iniciales

`Project`, `Process`, `Step`, `Decision`, `Risk`, `Evidence`, `Owner`, `AgentRecommendation`, `Action` y `MapSnapshot`.

## Estados que importan

- Información: confirmada, asumida, pendiente de validar.
- Proceso: por iniciar, activo, bloqueado, en revisión, completado.
- Riesgo: bajo, medio, alto, crítico.
- Acción: propuesta, aprobada, en curso, resuelta, rechazada.

## Evidencia de valor

Un proyecto pasa de texto no estructurado a un mapa revisable donde cada prioridad tiene owner, estado, fuente, confianza y siguiente acción.

## Métrica inicial

Mapas de proyecto revisados con al menos una acción trazable por usuario activo mensual.

## Exclusiones de la primera versión

- No ejecuta automatizaciones externas.
- No infiere cierres contractuales, financieros ni técnicos.
- No trata output de IA como evidencia confirmada.
- El gate protege la SPA/demo; no reemplaza autorización por recurso ni identidad multiusuario.
- Toda futura API sensible debe volver a validar la cookie firmada en servidor.
- El catálogo no prueba que agentes, MCP o sistemas externos estén conectados.
- La Biblioteca AP usa una síntesis segura para esta interfaz; no publica el contenido fuente del vault.
