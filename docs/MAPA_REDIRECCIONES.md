# Mapa de redirecciones

Actualizado: 26 de octubre de 2026. Cuatro rutas adicionales preparadas localmente; todavía no publicadas.

La arquitectura nueva conserva los slugs públicos principales de Wix. Esas rutas no requieren una redirección de contenido: responden en su equivalente canónico con barra final.

## Fuente única

Las redirecciones viven en `src/_data/redirects.json`. A partir de ese archivo el build genera:

- una página HTML por ruta antigua (`src/redirects.njk`): meta refresh inmediato, `canonical` al destino y `noindex,follow`. Es el método que funciona en GitHub Pages, que no lee `_redirects`;
- el archivo `_redirects` (`src/redirects-netlify.njk`), aplicado por Cloudflare Pages para las redirecciones HTTP 301. El servidor estático local de Python no interpreta este archivo.

`npm run check` verifica que cada página de redirección tenga canonical y que su destino exista.

## Redirecciones heredadas (18)

| Ruta anterior | Ruta canónica nueva | Código | Motivo |
|---|---|---:|---|
| `/blog/categories/georradar` | `/blog/tags/geo-radar/` | 301 | Taxonomía antigua trasladada a etiqueta |
| `/copia-de-experiencia` | `/experiencia/` | 301 | Página duplicada consolidada |
| `/empresa` | `/nosotros/` | 301 | Nombre de sección actualizado |
| `/minería` | `/mineria/` | 301 | Normalización de URL sin tilde |
| `/industrias/mineria` | `/industrias/` | 301 | Mismo contenido SSR que Industrias en Wix y canonical seleccionado por Google |
| `/industrias/construccion` | `/industrias/` | 301 | Mismo contenido SSR que Industrias en Wix y canonical seleccionado por Google |
| `/blog/hashtags/Georadar` | `/blog/tags/geo-radar/` | 301 | Etiqueta histórica consolidada en el archivo temático |
| `/usos-aplicaciones-gpr` | `/georadar-gpr/` | 301 | Página antigua consolidada en el servicio GPR |
| `/post/geo-radar-excavacion-exploratoria-prospeccion-no-destructiva` | `/post/georradar-antes-de-excavar/` | 301 | Artículo heredado con impresiones (382) |
| `/servicios/lem-radio-deteccion` | `/lem-radio-deteccion/` | 301 | Servicio trasladado a la raíz |
| `/blog/tags/deteccion-de-ductos` | `/post/localizacion-de-tuberias-ductos-con-georadar/` | 301 | Etiqueta antigua sin equivalente |
| `/post/localizacion-de-ductos-con-georadar` | `/post/localizacion-de-tuberias-ductos-con-georadar/` | 301 | Slug antiguo del mismo artículo |
| `/post/localizacion-de-tuberias-ductos-con-georradar` | `/post/localizacion-de-tuberias-ductos-con-georadar/` | 301 | Variante ortográfica del slug |
| `/post/como-forma-georradar` | `/post/como-funciona-georadar/` | 301 | Slug antiguo del mismo artículo |
| `/post/como-georradar-gpr-explicacion-tecnica` | `/post/como-funciona-georadar/` | 301 | Slug antiguo del mismo artículo |
| `/post/que-es-georadar-gpr-chile-prospeccion-no-destructiva-con-georradar-en-chile-gpr` | `/post/que-es-georadar-gpr-chile-prospección-no-destructiva-con-georradar-en-chile-gpr/` | 301 | Variante sin tilde del slug canónico |
| `/mentoria` | `/mentoria-gpr/` | 301 | Ruta corta para la mentoría 1:1 (ATLAS /mentoria/ apunta aquí) |
| `/post/que-es-georadar-gpr-chile-prospección-no-destructiva-con-georadar-en-chile-gpr` | `/post/que-es-georadar-gpr-chile-prospección-no-destructiva-con-georradar-en-chile-gpr/` | 301 | Variante ortográfica con impresión histórica en Search Console |

## Rutas conservadas

Inicio, Servicios, Industrias, Empresa, Experiencia, Casos, Contacto, Biblioteca, categorías, etiquetas, búsqueda y artículos mantienen su slug. La mentoría 1:1 se publica en la ruta nueva `/mentoria-gpr/` (ADR-012).

## Pendiente antes del lanzamiento

- Publicar con autorización y verificar en Cloudflare las 36 variantes declaradas, incluidas las ocho nuevas (cuatro con/sin barra). Las 28 variantes previas ya pasaron comprobación HTTP en la auditoría del 26 de octubre. Las rutas canónicas sin barra se normalizan en Cloudflare mediante 308; no exigir 301 donde corresponde esa normalización permanente.
- Comparar el export completo de URLs indexadas de Wix con `routes.json` y `redirects.json`.
- Revisar que no haya cadenas de redirección.

Verificación local del 26 de octubre: build, 38 rutas canónicas, auditoría de 58 documentos y 36 reglas declaradas superados. El comprobador también rechaza orígenes duplicados y destinos que vuelven a redirigir. Equivalencia de contenido Wix registrada en `migration/legacy-equivalence-2026-10-26.json`. No se modificaron Wix, DNS ni el staging remoto. Las rutas sectoriales `/mineria/` y `/construccion/` permanecen independientes.

Este documento no autoriza publicación, cambios DNS ni edición del sitio Wix.
