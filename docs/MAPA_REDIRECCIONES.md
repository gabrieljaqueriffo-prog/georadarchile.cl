# Mapa de redirecciones

Actualizado: 30 de septiembre de 2026 (Etapa 2 de la migración).

La arquitectura nueva conserva los slugs públicos principales de Wix. Esas rutas no requieren una redirección de contenido: responden en su equivalente canónico con barra final.

## Fuente única

Las redirecciones viven en `src/_data/redirects.json`. A partir de ese archivo el build genera:

- una página HTML por ruta antigua (`src/redirects.njk`): meta refresh inmediato, `canonical` al destino y `noindex,follow`. Es el método que funciona en GitHub Pages, que no lee `_redirects`;
- el archivo `_redirects` (`src/redirects-netlify.njk`), solo como referencia si algún día se usa un hosting que lo lea.

`npm run check` verifica que cada página de redirección tenga canonical y que su destino exista.

## Redirecciones heredadas (14)

| Ruta anterior | Ruta canónica nueva | Código | Motivo |
|---|---|---:|---|
| `/blog/categories/georradar` | `/blog/tags/geo-radar/` | 301 | Taxonomía antigua trasladada a etiqueta |
| `/copia-de-experiencia` | `/experiencia/` | 301 | Página duplicada consolidada |
| `/empresa` | `/nosotros/` | 301 | Nombre de sección actualizado |
| `/minería` | `/mineria/` | 301 | Normalización de URL sin tilde |
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

## Rutas conservadas

Inicio, Servicios, Industrias, Empresa, Experiencia, Casos, Contacto, Biblioteca, categorías, etiquetas, búsqueda y artículos mantienen su slug. La mentoría 1:1 se publica en la ruta nueva `/mentoria-gpr/` (ADR-012).

## Pendiente antes del lanzamiento

- Verificar en staging que GitHub Pages responda 301 de la ruta sin barra final a la ruta con barra, incluidas `/minería` y el slug con "prospección".
- Comparar el export completo de URLs indexadas de Wix con `routes.json` y `redirects.json`.
- Revisar que no haya cadenas de redirección.

Este documento no autoriza publicación, cambios DNS ni edición del sitio Wix.
