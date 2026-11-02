## Configuración vigente para el lanzamiento — 31 de octubre de 2026

Esta sección sustituye las instrucciones posteriores que piden editar tres archivos o retirar check-cloudflare del comando de build.

- Comando de build en Pages: `npm run build && npm run check && node scripts/check-cloudflare.mjs`.
- Para staging y Preview: dejar SITE_ENV sin definir.
- Para el corte comercial: definir SITE_ENV=production **solo en Production**, con rama main.
- El build coordina meta robots, robots.txt y _headers. Una rama diferente de main conserva noindex aunque herede SITE_ENV.
- El subdominio principal pages.dev de Production debe redirigirse al dominio canónico al completar el corte.
- CONTACT_HOSTS debe incluir www.georadarchile.cl y georadarchile.cl, además del host temporal durante la transición. Añadir los mismos dominios al widget Turnstile. No cambiar claves ni los MX/TXT de correo.
- No conectar el dominio comercial hasta verificar el despliegue actualizado, el formulario y los registros de reversión.

# Hosting definitivo elegido: Cloudflare Pages Free

Revisado: 2026-11-02. Staging desplegado en https://georadarchile-cl.pages.dev.

Decisión confirmada por el usuario. Build local superado: 38 rutas canónicas,
54 documentos auditados. Commit `28f35c9` publicado el 2026-10-03; workflow
de validación exitoso. Las 28 variantes heredadas se comprobaron en Cloudflare
mediante HTTP 301, incluida `/empresa/`. Staging conserva noindex.

El backend y la interfaz del formulario están implementados y sus pruebas
locales pasan. Falta comprobar entrega real de un adjunto en Zoho desde el
staging actualizado. Ver `FORMULARIO_RESEND.md` y
`migration/AVANCE_2026-11-02.md` para el estado y las limitaciones.

Eleventy genera HTML estático y Cloudflare permite redirecciones HTTP 301,
cabeceras y Functions para el formulario. GitHub conserva el código.
El staging de GitHub Pages existente se mantiene hasta validar su reemplazo.

## Configuración del primer staging

1. Subir al repositorio remoto los cambios preparados en `README.md`,
   `src/headers.njk`, `src/redirects-netlify.njk`, `.github/workflows/validate.yml`,
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

El mismo comando valida staging y producción. Para staging y Preview dejar
`SITE_ENV` sin definir. Para el corte definir `SITE_ENV=production` solo en
Production, rama `main`. No retirar `check-cloudflare.mjs` del build.

- Conectar el repositorio `gabrieljaqueriffo-prog/georadarchile.cl` mediante integración Git.
- Rama: `main`. Directorio raíz: raíz del repositorio.
- Comando: `npm run build && npm run check && node scripts/check-cloudflare.mjs`. Salida: `_site`.
- Variable `NODE_VERSION`: `22`. No definir `BASE_PATH`.
- Dejar `SITE_ENV` sin definir: el build genera meta robots, robots.txt y `_headers` de staging.
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
5. Con QA y formulario cerrados, definir `SITE_ENV=production` únicamente
   en Production, rama `main`. Conservar el comando completo de validación.
   El build coordina meta robots, robots.txt y cabeceras; no editar estos
   archivos manualmente. Revisar la salida y el sitemap.
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

Preparar producción con `SITE_ENV=production` solo en Production/main;
el build retira el bloqueo de indexación. Revisar robots, sitemap y canonical. Verificar
HTTPS, redirección al hostname canónico, contacto y Search Console.
Guardar los registros anteriores para rollback. Mantener Wix durante los
30 días de seguimiento y cancelarlo solo después de comprobar estabilidad.

## Referencias

- https://developers.cloudflare.com/pages/platform/limits/
- https://developers.cloudflare.com/pages/configuration/custom-domains/
- https://developers.cloudflare.com/pages/configuration/redirects/
- https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
