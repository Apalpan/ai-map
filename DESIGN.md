# AI Map — Design Contract

## Dirección

Herramienta operacional light-first: canvas claro, jerarquía sobria y un único acento azul. La vista inicial debe mostrar contexto del proyecto, señal de estado, el mapa, riesgos y siguiente acción.

## Tipografía

- UI y contenido: Poppins, con `system-ui` como fallback.
- Titulares: Poppins 600–700.

## Tokens

```css
:root {
  --ai-map-navy: #0E2A6B;
  --ai-map-blue: #2165FF;
  --ai-map-blue-soft: #E9F0FF;
  --ai-map-bg: #F7F9FD;
  --ai-map-surface: #FFFFFF;
  --ai-map-border: #DCE5F2;
  --ai-map-text: #10264D;
  --ai-map-muted: #5B6C87;
}
```

## Estados de información

Cada recomendación debe mostrar origen, confianza, owner y control humano: Aprobar, Editar o Rechazar. El color nunca reemplaza texto ni evidencia.

## Anti-patrones

No usar modo oscuro como superficie principal, neón, gradientes decorativos, tarjetas sin decisión ni “output de IA” sin fuente o limitación explícita.
