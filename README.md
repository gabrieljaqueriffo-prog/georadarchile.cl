# georadarchile.cl

Reconstrucción controlada del sitio corporativo de Geo Radar Chile.

## Estado

Etapa 2 de la migración aplicada (30 de septiembre de 2026): 38 rutas canónicas, 14 redirecciones heredadas, titles de compra, `/mentoria-gpr/`, crónica de Ingesud, socavones como servicio, fichas de casos con enlace a ATLAS y correcciones de la auditoría del 29 de septiembre. No sustituye el sitio publicado en Wix y no debe indexarse: mientras `site.staging` sea `true`, todas las páginas llevan `noindex,nofollow`.

## Uso local

```bash
npm install
npm run dev
```

## Validación

```bash
npm run build
npm run check
```

El build de staging bloquea el rastreo con `robots.txt` y con la meta robots (`site.staging` en `src/_data/site.js`).

Las imágenes se sirven en WebP a 480, 960 y 1600 px mediante `@11ty/eleventy-img` (los originales de `src/assets/images` se mantienen para `og:image`).
