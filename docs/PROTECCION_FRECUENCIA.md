# Protección de frecuencia del formulario

Preparado localmente el 29 de octubre de 2026. No desplegado ni activado.

## Implementación

Pages Function llama al Worker privado workers/contact-guard mediante el Service binding CONTACT_GUARD, únicamente si CONTACT_RATE_LIMIT_ENABLED=true. Sin la variable, el comportamiento existente se conserva. Si está activada y falta el servicio, IP de Cloudflare o respuesta válida, se devuelve 503 sin envío.

El control ocurre después de comprobar origen, tipo y Content-Length y antes de leer el cuerpo o consultar Turnstile/Resend. Devuelve 429 y Retry-After: 60 cuando se supera el umbral. El frontend conserva los antecedentes ante error y exige otra verificación; no reintenta automáticamente.

Umbral inicial: 10 intentos por 60 segundos por IP y centro de datos, contando también solicitudes posteriormente rechazadas. El límite nativo es aproximado, no global ni garantía de cuota. Una IP compartida puede agrupar usuarios legítimos; revisar falsos bloqueos en staging. Turnstile continúa obligatorio. No protege por sí solo frente a ataques distribuidos ni evita todas las invocaciones facturables.

El servicio recibe solo la IP aportada por CF-Connecting-IP, sin correo, texto ni adjuntos. No tiene logs de aplicación, almacenamiento propio, ruta pública ni workers.dev. Cloudflare procesa las claves del contador; no equivale a afirmar ausencia de registros del proveedor. Revisar captura de cabeceras en observabilidad antes de habilitar y reflejar la finalidad antiabuso en el aviso de privacidad.

## Activación posterior, con despliegue autorizado

1. Revisar disponibilidad y cuotas de Workers/Rate Limiting en la cuenta y verificar que namespace_id 2026102901 no esté usado. Si lo está, elegir un entero positivo único antes de publicar. No activar planes de pago como parte de este procedimiento.
2. Validar configuración con Wrangler vigente y desplegar el Worker desde workers/contact-guard. No añadir rutas públicas ni hostname workers.dev.
3. En Pages, Settings > Bindings > Add > Service binding: nombre CONTACT_GUARD, servicio georadarchile-contact-guard. Preparar primero el entorno de staging. Las variables/bindings requieren un nuevo despliegue.
4. Publicar el cambio de Function y definir CONTACT_RATE_LIMIT_ENABLED=true en staging. No habilitar producción todavía.
5. Comprobar rechazo controlado sin correos reales y un envío real autorizado. Verificar preservación de campos, expiración de Turnstile, respuesta 429 y recuperación tras la ventana. El umbral no implica que exactamente el intento once deba bloquearse por consistencia eventual.
6. Revisar métricas 429/503 y cuota de Functions, Worker y Resend, sin registrar datos del formulario. Acordar seguimiento antes del lanzamiento.
7. Tras validar staging, configurar el mismo enlace y variable en producción en su fase de corte. Reversión: CONTACT_RATE_LIMIT_ENABLED=false y nuevo despliegue; Turnstile permanece activo.

## Verificación realizada

Pruebas con simulaciones: servicio ausente, bloqueo 429/Retry-After, excepción, aceptación 204 y envío posterior; el bloqueo no llama a Turnstile ni Resend. Worker: IP ausente, aceptación, rechazo y binding ausente. No sustituyen validación de Wrangler ni ejecución real de Cloudflare. No se instalaron dependencias ni configuraron recursos de cuenta.

Fuentes oficiales consultadas el 29 de octubre de 2026:

- https://developers.cloudflare.com/pages/functions/bindings/#service-bindings
- https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/
