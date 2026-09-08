# AI Map by GEN+ — Product Contract

## Usuario y trabajo

Líderes de proyectos GEN+, coordinadores AEC y equipos de automatización que reciben información dispersa y necesitan convertirla en una visión accionable del proyecto.

## Promesa

En menos de cinco minutos, transforma una descripción, acta, alcance o brief en un mapa navegable de procesos con responsables, evidencia, riesgos, decisiones y la siguiente acción verificable.

## Activación y vertical slice

1. El usuario entra mediante el gate privado GEN+.
2. Pega contexto o selecciona una carpeta local.
3. Crea primero un mapa base determinista sin llamar a una API.
4. Opcionalmente lo mejora con AI Mapper y valida supuestos/evidencia.
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
- El gate protege la SPA/demo; no reemplaza autorización por recurso ni identidad multiusuario.
- Toda futura API sensible debe volver a validar la cookie firmada en servidor.
