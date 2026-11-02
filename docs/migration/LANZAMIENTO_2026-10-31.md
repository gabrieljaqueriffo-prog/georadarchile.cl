# Lanzamiento prioritario — 31 de octubre de 2026

## Preparado

- 38 rutas y 36 redirecciones validadas; pruebas de contacto correctas.
- Producción configurable con SITE_ENV=production solo en Production de Pages; Preview sin esa variable y ramas diferentes de main bloqueadas aunque la hereden.
- Meta robots, robots.txt y cabeceras cambian juntos. check-cloudflare valida ambos modos.
- Ensayo aislado correcto: 37 URL en sitemap y previewBlocked=true.
- DNS público: nameservers carmelo.ns.cloudflare.com / adel.ns.cloudflare.com; web todavía en Wix y MX de Zoho presentes. Snapshot dns-public-before-launch-2026-10-31.json. Es un subconjunto público, no una exportación completa de la zona; faltan DKIM, verificaciones y registros no enumerables.

## Secuencia inmediata

1. Con autorización explícita de commit/push, subir cambios del sitio, excluyendo Claude outputs y artefactos temporales ajenos. SITE_ENV permanece sin definir: primer despliegue sigue siendo staging.
2. Verificar el despliegue actualizado y realizar prueba real con un PDF inocuo para confirmar recepción del adjunto en Zoho.
3. En Cloudflare guardar exportación completa de la zona. Conservar MX/TXT/SPF/DKIM/DMARC. Verificar que Turnstile acepte dominio raíz y www; CONTACT_HOSTS debe admitir ambos y el host temporal durante transición.
4. En Pages usar npm run build && npm run check && node scripts/check-cloudflare.mjs y SITE_ENV=production solo para Production. Asociar www y raíz mediante Custom domains y cambiar únicamente los registros web indicados por Pages.
5. Verificar HTTPS, canonical www, redirects, formulario, robots/sitemap. Redirigir el host principal pages.dev al canónico y mantener previews noindex.
6. Si falla, restaurar registros web Wix de la exportación conservada. No cancelar Wix ni cambiar el correo.

La variedad fotográfica restante se tratará después del lanzamiento. El procedimiento de conservación de 90 días debe resolverse sin publicar promesas todavía no implementadas. No se han hecho commit/push, despliegue, cambios DNS ni cambios en Wix en esta preparación.
