# clicTec Front Client

Frontend publico de clicTec para analisis, comparativas y fichas de moviles.

## Requisitos

- Node.js 24+
- npm 11+

## Scripts

- `npm install` instala dependencias.
- `npm start` arranca el entorno de desarrollo.
- `npm run build` genera la build de produccion.
- `npm test` ejecuta los tests con Vitest.
- `npm run generate:sitemap` regenera el sitemap.

## Prerender

Para construir el sitio con prerender y resolver datos contra una API concreta:

```bash
PRERENDER_API_BASE=http://localhost:8080 npm run build
```

La salida final se genera en `dist/front-client/browser`.
