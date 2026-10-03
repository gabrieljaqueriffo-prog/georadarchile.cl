# Hosting definitivo elegido: Cloudflare Pages Free

Fecha: 2026-10-02. Preparación local; todavía no desplegado en Cloudflare.

Decisión confirmada por el usuario. Build local superado: 38 rutas canónicas,
54 documentos auditados y 28 reglas de redirección comprobadas. El workflow
de validación está preparado, pero aún no se ha ejecutado en GitHub.

Eleventy genera HTML estático y Cloudflare permite redirecciones HTTP 301,
cabeceras y Functions para el formulario. GitHub conserva el código.
El staging de GitHub Pages existente se mantiene hasta validar su reemplazo.

## Configuración del primer staging

1. Subir al repositorio remoto los cambios preparados en `README.md`,
   `src/_headers`, `src/redirects-netlify.njk`, `.github/workflows/validate.yml`,
   `scripts/check-cloudflare.mjs` y esta guía. No incluir `Claude outputs/`.
   El workflow de GitHub Pages existente seguirá publicando su staging al
   hacer push a main; se retirará cuando Cloudflare haya pasado la revisión.
2. Entrar a Cloudflare y abrir **Workers & Pages → Create application →
   Pages → Import an existing Git repository**. Elegir integración Git,
   para reconstruir el sitio con los cambios del repositorio.
3. Conectar GitHub y autorizar acceso al repositorio corporativo indicado
   abajo. Seleccionarlo y abrir **Begin setup**.
4. Usar la tabla de configuración siguiente; el nombre del proyecto puede
   ser `georadarchile` si está disponible. El subdominio real será el que
   Cloudflare asigne, no debe darse por creado antes del despliegue.
5. Pulsar **Save and Deploy**, esperar build exitoso y registrar URL,
   identificador del despliegue y commit publicado.
6. Revisar el staging según el checklist. No asociar todavía el dominio
   comercial: primero cerrar QA, formulario y aprobación final.

| Campo | Valor |
|---|---|
| Framework preset | Eleventy, o None con los valores manuales siguientes |
| Production branch | `main` |
| Root directory | Raíz del repositorio; dejar vacío si es el valor por defecto |
| Build command | `npm run build && npm run check && node scripts/check-cloudflare.mjs` |
| Build output directory | `_site` |
| Environment variable | `NODE_VERSION=22`, también en previews |
| BASE_PATH | No definir en Cloudflare |

El comando anterior corresponde a staging y exige noindex. Antes del corte
a producción cambiarlo a `npm run build && npm run check`: el comprobador
`check-cloudflare.mjs` está diseñado para impedir un staging indexable.

- Conectar el repositorio `gabrieljaqueriffo-prog/georadarchile.cl` mediante integración Git.
- Rama: `main`. Directorio raíz: raíz del repositorio.
- Comando: `npm run build`. Salida: `_site`.
- Variable `NODE_VERSION`: `22`. No definir `BASE_PATH`.
- Mantener `site.staging: true`, meta robots y `_headers` con noindex.
- Publicar primero en el subdominio temporal `pages.dev`, sin asociar el dominio.
- Ejecutar `npm ci`, `npm run build`, `npm run check` y `node scripts/check-cloudflare.mjs` antes de publicar.

## Validación después de publicar

Comprobar las 38 rutas canónicas, enlaces e imágenes; las 14 rutas heredadas
con y sin barra deben responder HTTP 301 hacia su destino. Revisar la ruta
con tilde tanto codificada como legible, cabecera noindex, robots y móvil.
El script local comprueba reglas y archivos; no sustituye las pruebas HTTP.
Pendientes: Playwright y axe en CI, formulario y QA contra el PDF aprobado.

## Corte a producción, fase posterior

1. Exportar la zona DNS actual y guardar nameservers y registros originales.
   Identificar dónde se administra el dominio; si está registrado en NIC
   Chile, el cambio de nameservers se realiza allí. No transferir el registro
   del dominio para cambiar hosting.
2. Añadir `georadarchile.cl` a Cloudflare con plan Free y comparar la zona
   importada con la exportación: A, AAAA, CNAME, MX, TXT, CAA y verificaciones.
   Preservar los valores reales de Wix y Zoho. Los hosts de correo deben
   permanecer DNS only; no crear un segundo SPF.
3. Revisar DNSSEC: si existe un DS del proveedor anterior, coordinar su
   retirada antes del cambio de nameservers; activar DNSSEC en Cloudflare
   y registrar su nuevo DS después de confirmar la zona activa.
4. Sustituir los nameservers en el registrador por los dos que asigne
   Cloudflare. Mantener todavía los registros web apuntando a Wix para
   separar el traslado DNS del cambio de sitio. Verificar web y correo.
5. Con QA y formulario cerrados, preparar el build de producción y cambiar
   el comando de build según lo indicado arriba. Retirar noindex de
   `src/_data/site.js` y `src/_headers`; revisar `robots.txt` y sitemap.
6. En el proyecto Pages abrir **Custom domains → Set up a domain** y asociar
   `www.georadarchile.cl` y `georadarchile.cl`. Aplicar los registros que indique
   Cloudflare; retirar únicamente A/AAAA/CNAME web incompatibles con Pages.
   No conservar las IP de Wix para esos mismos hosts ni usar IP de GitHub.
7. Configurar una redirección 301 del dominio raíz al hostname canónico
   `www.georadarchile.cl`, conservando ruta y query string. Confirmar HTTPS
   y ausencia de bucles antes de forzar redirecciones adicionales.
8. Comprobar respuesta HTTP de rutas, redirecciones, imágenes, contacto,
   robots y sitemap. Mantener la propiedad Search Console actual y enviar
   el sitemap; el dominio no cambia, por lo que no corresponde una solicitud
   de cambio de dirección en Search Console.
9. Al validar producción, redirigir el hostname principal `pages.dev` al
   dominio canónico y mantener previews no indexables. Verificar tanto meta
   robots como cabeceras: un preview construido desde main podría heredar
   la configuración indexable de producción.
10. Desactivar la publicación de GitHub Pages tras comprobar el reemplazo.
    Monitorear errores, contactos e indexación durante 30 días y cancelar
    Wix únicamente al cerrar ese seguimiento.

Rollback: si falla el nuevo sitio, restaurar en Cloudflare los registros web
de Wix guardados; conservar la zona DNS y el correo. La reversión también
depende de las cachés DNS. No cancelar Wix antes de terminar el seguimiento.

Inventariar primero toda la zona DNS, incluyendo MX, SPF, DKIM y DMARC de
Zoho. Conservar esos registros al trasladar la zona. Para usar el dominio
raíz en Pages, Cloudflare requiere la zona en su cuenta y sus nameservers.
Asociar el dominio desde Pages antes de cambiar registros del sitio.

Preparar un build de producción: `site.staging: false`, retirar el
`X-Robots-Tag` de staging y revisar robots, sitemap y canonical. Verificar
HTTPS, redirección al hostname canónico, contacto y Search Console.
Guardar los registros anteriores para rollback. Mantener Wix durante los
30 días de seguimiento y cancelarlo solo después de comprobar estabilidad.

## Referencias

- https://developers.cloudflare.com/pages/platform/limits/
- https://developers.cloudflare.com/pages/configuration/custom-domains/
- https://developers.cloudflare.com/pages/configuration/redirects/
- https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
