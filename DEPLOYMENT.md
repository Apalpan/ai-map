# AI Map - publicacion segura

Produccion actual: https://ai-map-six.vercel.app

## Vercel

Desde la raiz del repositorio:

```bash
npm run lint
npm run test -- --run
npm run build
npx vercel link
npx vercel build --prod
npx vercel deploy --prebuilt --prod
```

Conecta el repositorio una sola vez para que cada `push` a `main` genere un nuevo despliegue:

```bash
npx vercel git connect https://github.com/Apalpan/ai-map.git --yes
```

Verifica la URL entregada por Vercel antes de comunicar cierre:

```bash
npx vercel curl / --deployment https://tu-deployment.vercel.app
```

Estados distintos: `build correcto`, `deployment creado`, `alias de produccion asignado` y `HTTP verificado`. AI Map solo debe comunicar `publicado` cuando los cuatro tengan evidencia.

## GitHub Pages

El proyecto conserva `base: './'` y `HashRouter`, por lo que puede publicarse como sitio estatico bajo un subpath:

```bash
npm run deploy
```

Antes de usar Pages, confirma que el repositorio sea publico, la fuente sea la rama `gh-pages` y la URL raiz responda correctamente.

## Limite de seguridad del MVP

La app desplegada procesa el inventario de carpetas localmente. Si el usuario elige IA, solo el contexto permitido se entrega al proveedor configurado por el propio usuario. AI Map no guarda un token compartido de GitHub, Vercel o IA dentro del bundle publico.

La publicacion automatizada de mapas generados en repositorios ajenos requiere una segunda fase con GitHub App u OAuth y credenciales server-side. Toda publicacion necesita vista previa y confirmacion humana.
