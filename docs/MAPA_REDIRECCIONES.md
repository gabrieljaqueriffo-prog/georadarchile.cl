# Mapa de redirecciones

Estado de trabajo local: 28 de septiembre de 2026.

La arquitectura nueva conserva los slugs públicos principales de Wix. Esas rutas no requieren una redirección de contenido: deben responder en su equivalente canónico con barra final, según la convención del sitio nuevo.

## Redirecciones heredadas

| Ruta anterior | Ruta canónica nueva | Código | Motivo |
|---|---|---:|---|
| `/blog/categories/georradar` | `/blog/tags/geo-radar/` | 301 | Taxonomía antigua trasladada a etiqueta |
| `/copia-de-experiencia` | `/experiencia/` | 301 | Página duplicada consolidada |
| `/empresa` | `/nosotros/` | 301 | Nombre de sección actualizado |
| `/minería` | `/mineria/` | 301 | Normalización de URL sin acento |
| `/usos-aplicaciones-gpr` | `/georadar-gpr/` | 301 | Página antigua consolidada en el servicio GPR |

## Rutas conservadas

Las rutas de Inicio, Servicios, Industrias, Empresa, Experiencia, Casos, Contacto, Biblioteca, categorías, etiquetas, búsqueda y artículos mantienen su slug de destino en la nueva arquitectura. La nueva ruta de capacitación publicada en Wix se incorpora como:

`/post/capacitacion-en-georradar-gpr-aprender-a-adquirir-procesar-e-interpretar-datos/`

## Pendiente antes del lanzamiento

- Exportar desde Wix el listado completo de URLs indexadas y enlaces externos.
- Comparar ese export con `src/_data/routes.json` y `src/_redirects`.
- Verificar respuestas HTTP 301/200 en staging y ausencia de cadenas de redirección.
- Confirmar la política de barra final del hosting antes de cambiar el dominio.

Este documento no autoriza publicación, cambios DNS ni edición del sitio Wix.
