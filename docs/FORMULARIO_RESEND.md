# Formulario con Cloudflare Functions y Resend

Actualizado: 2026-10-26. Backend e interfaz preparados localmente, desactivados
por defecto. Falta configurar cuentas y variables, publicar con autorización
y comprobar recepción real. No se han enviado mensajes reales.

## Integración local completada

- Frontend POST multipart a `/api/contact`, consentimiento con nombre, honeypot,
  widget Turnstile explícito, límites de archivos, estado ocupado y bloqueo de
  doble envío. Datos conservados si falla la red; no hay reintento automático.
- Token descartado después de cada intento; expiración y errores del widget
  deshabilitan el envío. Tras aceptación se limpia el formulario y se evita repetirlo.
- Solo PDF/JPG/PNG, tres archivos de 2 MB cada uno. CAD por correo.
- Aviso visible del tratamiento mediante Cloudflare/Resend y contacto para
  consultas o eliminación. Sigue pendiente acordar conservación y cerrar la
  política completa antes del lanzamiento.
- Sin configuración, no se carga Turnstile y el botón permanece desactivado;
  el aviso dirige al correo o WhatsApp. No se presenta como envío exitoso.
- Pruebas `node scripts/test-contact-ui.mjs` y `node scripts/test-contact.mjs`
  superadas sin red real; build y verificaciones generales pasan. Revisión
  visual de escritorio y móvil de 320 px sin overflow. No equivale a una
  prueba con Turnstile real ni a confirmación de entrega en Zoho.

## Variables que configuraremos en Pages

| Variable | Uso | Visibilidad |
|---|---|---|
| `TURNSTILE_SITE_KEY` | Build: clave pública del widget | Se incluye en HTML al habilitar |
| `CONTACT_FORM_ENABLED` | Build: `true` para mostrar y conectar widget | Pública; mantener desactivada hasta preparar prueba |
| `CONTACT_ENABLED` | Function: `true` para permitir envío | Configuración runtime, independiente del build |
| `RESEND_API_KEY` | Function: envío por Resend | Secret, nunca en Git/chat |
| `TURNSTILE_SECRET_KEY` | Function: validar token en servidor | Secret, nunca en Git/chat |
| `CONTACT_FROM` | Function: dirección del subdominio verificado | Debe coincidir con dominio autorizado por Resend |
| `CONTACT_HOSTS` | Function: hostnames exactos separados por coma | Sin esquema ni rutas; habilitar primero solo staging |

Un cambio de las variables del build requiere reconstruir. Guardar una variable
sin publicar un build nuevo no cambia el HTML existente. Configurar producción
y previews según el entorno real de Pages; no asumir que pages.dev es un preview.
El destinatario sigue fijo en `gabriel@georadarchile.cl`.

## Configuración pendiente, paso a paso

1. Crear cuenta gratuita en Resend. Mantener desactivados overages de pago.
2. Verificar un subdominio de envío, por ejemplo `notificaciones.georadarchile.cl`.
   Añadir únicamente los registros asignados por Resend en el proveedor DNS
   actual, sin cambiar nameservers, MX de Zoho ni SPF del dominio principal.
3. Crear API key restringida al envío y al dominio verificado. Guardarla como
   secret `RESEND_API_KEY` en Cloudflare Pages, nunca en el chat ni en Git.
4. Crear widget Turnstile con los hostnames del staging y producción. Guardar
   `TURNSTILE_SECRET_KEY` como secret y entregar solo la site key pública para
   integrar el widget. La acción prevista es `contact`.
5. Variables de Pages: `CONTACT_FROM` con dirección del subdominio verificado;
   `CONTACT_HOSTS` con hostnames autorizados separados por coma; mantener
   `CONTACT_ENABLED=false` hasta configurar y aprobar la interfaz.
6. Frontend integrado localmente: consentimiento con name `consentimiento`, honeypot
   `website`, widget Turnstile, POST multipart a `/api/contact`, estados de
   envío/error y prevención de doble clic. Ajustar ayuda de adjuntos a 3 PDF,
   JPG o PNG de máximo 2 MB cada uno; CAD se remite por correo.
7. Informar al cliente del tratamiento mediante Cloudflare y Resend, con
   finalidad, conservación y medio para solicitar eliminación acordados.
8. Publicar después de revisión. Habilitar solo en staging para una prueba
   autorizada, comprobar recepción en Zoho y revisar spam. La API acepta el
   mensaje, pero eso por sí solo no confirma entrega al buzón.

El endpoint valida origen, host, campos, consentimiento, Turnstile en servidor,
cantidad, tamaño y firma de adjuntos. El destinatario es fijo, no se envían
autorespuestas ni se registran datos o claves en logs de aplicación.
No hay almacenamiento de solicitudes en el sitio. La ruta `_routes.json`
limita Functions a `/api/contact` y deja estáticos fuera de sus invocaciones.
Pendiente de lanzamiento: protección adicional de frecuencia y monitoreo de
cuota; Turnstile no reemplaza un límite de solicitudes por cliente.

Fuentes verificadas:
- https://resend.com/pricing
- https://resend.com/docs/api-reference/emails/send-email
- https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
