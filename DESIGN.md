# AI Map by GEN+ — Design Contract

## Dirección

Herramienta operacional light-first: canvas claro, jerarquía sobria y un único acento azul. Inicio muestra contexto, señal de estado, siguiente acción y acceso directo a Biblioteca AP sin KPIs inventados.

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

La identidad visible del workspace usa el retrato estable `public/brand/alejandro-palpan.png` y el texto “Owner del workspace · acceso compartido GEN+”. No representa una cuenta individual.

## Biblioteca y workspace

- Biblioteca AP usa master-detail responsive, tabs, búsqueda y filtros reales.
- Todo panel persistente tiene Cerrar/Ocultar y un control accesible para reabrir que libera el espacio del layout.
- En móvil, el detalle seleccionado se presenta antes de la lista y el foco se mueve al control Cerrar.
- Canvas, catálogo y superficies de detalle usan `linear-gradient(135deg,#f7faff 0%,#eaf4ff 48%,#f5fbff 100%)` con controles blancos de alto contraste.
- Movimiento se limita a feedback corto y se neutraliza con `prefers-reduced-motion`.
