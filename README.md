# georadarchile.cl

Reconstrucción controlada del sitio corporativo de Geo Radar Chile.

## Estado

2026-10-02: Cloudflare Pages Free confirmado como hosting definitivo. Preparación local validada; despliegue Cloudflare y cambio de dominio pendientes. GitHub Pages continúa como staging temporal. Paso a paso en `docs/HOSTING_CLOUDFLARE.md`.

Etapa 2 de la migración aplicada (30 de septiembre de 2026): 38 rutas canónicas, 14 redirecciones heredadas, titles de compra, `/mentoria-gpr/`, crónica de Ingesud, socavones como servicio, fichas de casos con enlace a ATLAS y correcciones de la auditoría del 29 de septiembre. No sustituye el sitio publicado en Wix y no debe indexarse: mientras `site.staging` sea `true`, todas las páginas llevan `noindex,nofollow`.

## Uso local

Preparación de Cloudflare Pages (2026-10-02): consultar `docs/HOSTING_CLOUDFLARE.md`.
Las reglas `_redirects` incluyen variantes con y sin barra final. Validar el
staging con `node scripts/check-cloudflare.mjs` después del build sin `BASE_PATH`.

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
