# Preparación de migración SEO de Geo Radar Chile

Fecha de revisión: 2026-10-24. Estado: preparación; corte de dominio pendiente.
Objetivo: conservar demanda orgánica y consultas al salir de Wix. No se garantiza ausencia de fluctuaciones. No hay evidencia reciente suficiente para afirmar cuánto tráfico se ha perdido.

## Evidencia comprobada

- `npm run build`: correcto.
- `npm run check`: 38 rutas canónicas generadas y 54 documentos auditados sin hallazgos del comprobador existente.
- `node scripts/check-cloudflare.mjs`: 28 reglas 301 estáticas con destinos existentes y configuración de staging noindex. Es una prueba local, no una comprobación HTTP de todas las rutas.
- Consulta HTTP del staging: portada 200, meta robots noindex,nofollow y X-Robots-Tag noindex,nofollow; canonical a https://www.georadarchile.cl/.
- Wix: robots.txt y sitemap.xml responden 200. El índice de Wix referencia tres sitemaps.
- Inventario actual: 36 URLs de esos sitemaps, ninguna sin equivalente en routes.json o redirects.json. Resultado detallado: `migration/live-url-inventory.json`.
- El inventario normaliza barra final y codificación para comparar rutas. NO demuestra que las variantes redirijan correctamente, ni paridad de contenido, imágenes o indexación.
- El backend del formulario sigue preparado localmente; no consta cierre de integración ni prueba de entrega real.
- El usuario confirmó acceso a Search Console. No se han consultado sus datos recientes.

## 1. Línea base antes del lanzamiento

Responsables: titular aporta acceso/datos; implementación analiza y conserva el informe.

- [ ] Search Console, propiedad georadarchile.cl: exportar Rendimiento de resultados de búsqueda, tipo Web, últimos 3 meses. Conservar fecha de exportación, filtros y última fecha completa disponible.
- [ ] Exportar tablas de páginas, consultas, fechas, dispositivos y países, con clics, impresiones, CTR y posición. Las tablas separadas no permiten reconstruir pares consulta/página: para las consultas prioritarias, filtrar cada página y exportar su tabla de consultas, o usar la API si está disponible.
- [ ] Comparar últimos 28 días completos con los 28 anteriores y, si hay datos, mismo periodo del año anterior; separar marca/no marca, Chile y dispositivos. Evitar días recientes incompletos.
- [ ] Exportar Indexación > Páginas y Sitemaps; guardar incidencias y ejemplos. Inspeccionar portada, servicios principales y artículos de mayor tráfico.
- [ ] Exportar Enlaces > páginas más enlazadas, y unir URLs relevantes con el inventario, incluyendo páginas fuera del sitemap. El sitemap no equivale al índice de Google.
- [ ] Revisar GA4 si existe: propiedad, etiqueta, sesiones orgánicas y contactos medidos. Si no existe medición fiable, documentar esa limitación sin inventar conversiones históricas.
- [ ] Crear lista protegida: todas las URLs con clics, impresiones, enlaces externos o consultas comerciales; asignar prioridad y destino.

La referencia de julio guardada en ATLAS (132 clics y 6.030 impresiones del dominio corporativo) es histórica; no sirve para afirmar una caída actual ni sustituye esta línea base.

## 2. Preservación de señales

- [ ] Unir sitemaps actuales, inventario histórico, Search Console y URLs con enlaces en una matriz: URL anterior exacta, estado actual, destino, estado esperado, canonical, prioridad, contenido y prueba HTTP.
- [ ] Conservar dominio, hostname canónico www y slugs que funcionan. Registrar cada normalización de barra final y variante con tilde como cambio de URL.
- [ ] Comparar Wix y staging para TODAS las páginas protegidas: intención, texto útil, title, H1, descripción, autor, fechas reales, evidencia, fotografías, descargas y enlaces internos. Priorizar páginas con tráfico y servicios.
- [ ] Revisar especialmente cambios editoriales ya realizados. No asumir que conservar el slug conserva por sí solo el posicionamiento; justificar cambios de enfoque y evitar más reescrituras durante el corte.
- [ ] Verificar datos estructurados en navegador renderizado o Rich Results Test. No concluir ausencia en Wix a partir de HTML descargado.
- [ ] No trasladar páginas comerciales a ATLAS durante el lanzamiento. Mantener las funciones de ambos dominios.
- [ ] Ejecutar pruebas HTTP de TODAS las URLs antiguas, destinos y variantes: 200 en equivalente, o 301 permanente hacia contenido pertinente; sin bucles, destinos 404 ni redirecciones masivas a portada. Reducir cadenas y verificar parámetros cuando sean relevantes.
- [ ] Enlaces internos y sitemap deben apuntar directamente a URLs canónicas finales. Páginas inexistentes deben devolver 404 real.
- [ ] Conservar las redirecciones de URLs modificadas al menos un año; preferir mantenerlas indefinidamente cuando existan enlaces o tráfico.

## 3. Criterios para autorizar el corte

Todos requieren evidencia guardada. Build correcto no sustituye revisión visual ni comparación editorial.

- [ ] Línea base reciente y matriz completa cerradas; cero URLs importantes sin destino.
- [ ] Paridad editorial y SEO revisada en páginas protegidas.
- [ ] QA móvil, tablet y escritorio; navegación por teclado y accesibilidad; imágenes y descargas funcionales. Medir rendimiento de páginas representativas y registrar herramientas/fecha; distinguir laboratorio de datos reales de campo.
- [ ] Formulario: Resend/Turnstile configurados, validación, consentimiento, adjuntos, límite de frecuencia, estados de error y recepción comprobada en Zoho. Revisar privacidad y cuotas.
- [ ] WhatsApp, teléfono y correo correctos; medición de contactos verificada si se implementa.
- [ ] Copia actual de Wix, activos, exportación DNS completa y valores de reversión guardados. Verificar que el respaldo previo sigue accesible.
- [ ] DNS de Zoho, verificaciones de Search Console y DNSSEC inventariados; preservar MX, SPF, DKIM y DMARC.
- [ ] Build de producción ensayado de forma aislada: páginas comerciales indexables, canonical propio correcto, sitemap válido y robots sin bloqueo accidental. Búsqueda interna y otras exclusiones deliberadas permanecen excluidas.
- [ ] Confirmar que previews siguen no indexables y que no hay dos copias públicas indexables. Revisar cabeceras además de meta robots.
- [ ] Definir responsable, ventana de bajo tráfico, versión a publicar y registros de reversión. Autorización explícita antes de commit/push, despliegue y DNS según AGENTS.md.

## 4. Secuencia del lanzamiento

1. Preparar zona Cloudflare y conservar correo; separar traslado de nameservers del cambio de hosting manteniendo inicialmente Wix en los registros web. Procedimiento detallado en HOSTING_CLOUDFLARE.md.
2. Con criterios cerrados, publicar versión aprobada, asociar dominios a Pages y aplicar únicamente los registros web asignados. Verificar certificado y redirección raíz a www con ruta y parámetros.
3. Retirar bloqueos de producción en HTML, cabeceras y robots; cambiar el comando de build que actualmente exige noindex. Evitar una ventana pública de staging indexable.
4. Probar HTTP de la matriz completa en el dominio real, además de formulario, imágenes y recursos críticos. Revisar WAF/antiabuso para que no bloquee rastreo legítimo.
5. Enviar sitemap en la propiedad existente de Search Console e inspeccionar URLs prioritarias. No usar Cambio de dirección: el dominio se mantiene.
6. Redirigir el hostname principal pages.dev al dominio oficial y mantener previews excluidas. Retirar GitHub Pages tras verificar reemplazo.
7. Registrar fecha/hora, commit, despliegue, DNS y resultados. Conservar Wix operativo para reversión.

## 5. Seguimiento y respuesta

Sin automatización creada. Ejecutar controles manuales hasta acordar un monitor.

- Primeras 48 horas: comprobar disponibilidad, HTTPS, robots, noindex, canonicals, URLs prioritarias, errores 404/5xx y recepción de contactos después del corte y al día siguiente.
- Días 3 a 14: revisión diaria de errores e indexación; comparar rendimiento cuando Search Console entregue días completos.
- Días 15 a 30: revisión semanal de tráfico, consultas, páginas y contactos; mantener vigilancia más tiempo si no hay estabilidad.
- Señales técnicas que requieren intervención inmediata: noindex o bloqueo involuntario en producción, canonical hacia otro sitio, páginas prioritarias 404/5xx, bucles, certificado inválido o contacto inutilizable.
- Alerta operativa propuesta, no regla de Google: caída de al menos 20% en clics orgánicos en una ventana de 7 días completos frente a los mismos días de la semana previos. Con poco volumen exigir también caída absoluta relevante y revisar por URL/consulta, estacionalidad e impresiones; una variación diaria o la posición media global no basta.
- Una caída de tráfico abre investigación; no provoca rollback automático. Corregir errores puntuales primero. Ante fallo técnico general que no pueda corregirse rápidamente, restaurar registros web de Wix respaldados y verificar HTTPS, web y correo. Considerar cachés DNS y mantener la zona y Zoho intactos.
- No cancelar Wix por una fecha fija: evaluar tras al menos 30 días y únicamente con estabilidad, contactos funcionales y comprobación de que el sitio anterior ya no es necesario.

## Próxima acción

Obtener las exportaciones de Search Console y completar matriz/paridad mientras se termina el formulario. No fijar el corte antes de cerrar esos controles. Actualizar contenido después en lotes medibles, evitando mezclar más cambios editoriales con el traslado.

## Fuentes

- Google, cambio de hosting: https://developers.google.com/search/docs/crawling-indexing/site-move-no-url-changes
- Google, migraciones con cambios de URL: https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes
- Estado local y pruebas ejecutadas el 2026-10-24; el inventario JSON registra también la hora UTC real de consulta.
