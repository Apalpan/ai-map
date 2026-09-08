# AI Map — Product Contract

## Usuario y trabajo

Líderes de proyectos GEN+, coordinadores AEC y equipos de automatización que reciben información dispersa y necesitan convertirla en una visión accionable del proyecto.

## Promesa

En menos de cinco minutos, transforma una descripción, acta, alcance o brief en un mapa navegable de procesos con responsables, evidencia, riesgos, decisiones y la siguiente acción verificable.

## Activación y vertical slice

1. El usuario pega el contexto de un proyecto.
2. AI Map lo descompone en procesos, hitos, roles, dependencias y vacíos.
3. Presenta el mapa visual con una cola de decisiones y un panel de evidencia.
4. El usuario revisa, edita o rechaza una recomendación.
5. El mapa se guarda localmente y se exporta como JSON o Mermaid.

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
- No requiere backend o autenticación para validar el flujo.
