# AI Map by GEN+ — Design Contract

## Dirección

Herramienta operacional light-first: canvas claro, jerarquía sobria y un único acento azul. La vista inicial debe mostrar contexto del proyecto, señal de estado, el mapa, riesgos y siguiente acción.

## Tipografía

- UI, contenido y titulares: Plus Jakarta Sans 400–800, autoalojada.
- Ninguna fuente remota. Las clases tipográficas heredadas se remapean a Plus Jakarta Sans.

## Tokens

```css
:root {
  --ai-map-navy: #0e2a6b;
  --ai-map-blue: #2165ff;
  --ai-map-blue-soft: #e9f0ff;
  --ai-map-bg: #f7f9fd;
  --ai-map-surface: #ffffff;
  --ai-map-border: #dce5f2;
  --ai-map-text: #0e2a6b;
  --ai-map-muted: #5b6c87;
}
```

## Estados de información

Cada recomendación debe mostrar origen, confianza, owner y control humano: Aprobar, Editar o Rechazar. El color nunca reemplaza texto ni evidencia.

## Anti-patrones

No usar modo oscuro como superficie principal, neón, gradientes decorativos, tarjetas sin decisión ni “output de IA” sin fuente o limitación explícita.

## Marca y acceso

El logo oficial GEN+ usa `public/brand/gen-logo-primary.png` sobre claro y `gen-logo-white.png` sobre navy. El acceso inicial es una minilanding de producto con un único CTA, estados de red/sesión y foco visible; la promesa operacional precede al formulario.
