# Auditoría prioritaria antes de migrar

Fecha: 26 de octubre de 2026. Resultado: **no cerrar todavía el corte a producción**.

Se revisaron respuestas HTTP reales de Wix y Cloudflare, HTML del build local y exportaciones de Search Console. No se modificó contenido público, DNS, Wix ni configuración de indexación. No se hizo commit, push o despliegue.

## Alcance y evidencia

- Rendimiento: `D:/Descargas/georadarchile.cl-Performance-on-Search-2026-10-24.xlsx`.
- Enlaces externos: `D:/Descargas/georadarchile.cl-Top target pages-2026-10-26.xlsx`.
- 40 paths distintos al unir las URLs del rendimiento y enlaces (se agrupan variantes de hostname; no equivale a comprobar todos los hostnames).
- 29 páginas con clics o enlaces externos, incluidas las nueve páginas que concentran los 74 enlaces externos reportados.
- Comparación técnica de las 40 rutas; lectura editorial detallada centrada en las cinco primeras por clics. Las otras páginas requieren revisión editorial final, no se declaran con paridad completa.
- 109 URLs de imágenes y variantes responsivas: archivos locales presentes y respuesta HEAD 200 en staging. Esto no confirma encuadre, apariencia ni equivalencia visual con Wix.
- 28 variantes de redirección declaradas (14 rutas con/sin barra): GET con HTTP 301 y Location al destino esperado.
- Build correcto; 38 rutas y 54 documentos pasan los comprobadores locales; comprobador de staging correcto. Pruebas del backend de contacto pasan con simulaciones y sin correos reales; no acreditan integración frontend ni entrega a Zoho.

Evidencia completa: `priority-audit-2026-10-26/evidence.json` y `resources.json`. Snapshots de texto por página en la misma carpeta; índices 00 a 04 corresponden a las cinco páginas de mayor tráfico.

No sumar las filas de páginas para reconstruir los clics de la propiedad: la tabla suma 411, mientras el total mostrado en Search Console fue 402; las agregaciones por página y propiedad difieren. Tampoco unir consultas y páginas como si el export incluyera pares consulta/URL.

## Lo que funciona

1. Las 29 páginas con clics o backlinks llegan a un destino HTTP 200 en staging. Ninguna de las nueve páginas enlazadas externamente carece de destino.
2. Las rutas principales de Wix sin barra redirigen por 308 permanente a su equivalente con barra; no es un fallo por no ser 301. El contenido y los canonicals finales coinciden con la variante con barra del sitio nuevo. Hay cambio de URL visible por normalización, no paridad literal.
3. Los destinos prioritarios tienen canonical hacia el dominio comercial y mantienen meta robots y cabecera noindex en staging. La copia pública temporal sigue excluida; esos bloqueos deberán retirarse únicamente en producción.
4. Los textos principales extraídos de local y staging coinciden en las 29 páginas prioritarias. No se detectó divergencia de contenido entre ambos en ese conjunto.
5. Todos los enlaces raíz locales observados en las páginas prioritarias apuntan a archivos o rutas existentes. No se verificaron todos los enlaces externos ni anclas por HTTP/navegador.

## Bloqueo 1: cambios editoriales importantes en páginas con rendimiento

Conservar el slug no basta para cerrar paridad. Hay cambios de title y contenido; algunos mejoran rigor, otros eliminan respuestas y evidencia. Los conteos siguientes son diagnósticos del texto SSR dentro de main/article e incluyen módulos auxiliares. No son un porcentaje de pérdida SEO ni equivalen a contenido útil perdido.

| Página | Clics del export | Wix / nuevo, palabras aproximadas | Resultado y acción |
|---|---:|---:|---|
| Inicio | 149 | 809 / 663 | Mantiene credenciales, sectores y proceso, pero cambia title y H1. El H1 nuevo es una propuesta abstracta y no nombra georradar/GPR/Chile. Revisar alineación comercial y mantener evidencia relevante; no atribuir una caída futura a este cambio sin medición. |
| Localización de tuberías y ductos | 53 | 948 / 947 | Conserva intención: localización, radargramas, métodos complementarios y límites. Agrega entrega y trazado. Prioridad técnica cubierta; falta QA visual/evidencia fotográfica y confirmar cobertura de materiales/aplicaciones. |
| Cómo funciona el georradar | 42 | 1.596 / 1.199 | Conserva física, radargramas, frecuencia y limitaciones. No asumir pérdida por longitud. Revisar fuentes técnicas y guía de preparación presentes en Wix; completar trazabilidad editorial antes del corte. |
| Capacitación GPR | 34 | 1.116 / 809 | Conserva dos niveles, horas, grupos pequeños, certificado e instructor. Wix también atiende independientes; nuevo orienta empresas y deriva a mentoría. Es decisión ya registrada, no se revierte automáticamente. Faltan respuestas explícitas a dudas sobre país/modalidad, equipo propio y software que hoy están en Wix. Recuperar respuestas válidas sin prometer compatibilidad no comprobada. |
| Guía completa: qué es el GPR (slug largo con prospección) | 20 | 3.050 / 906 | Riesgo editorial prioritario: se convierte una guía amplia con casos chilenos en introducción genérica. No aparecen los tres casos Chuquicamata/Providencia/SQM ni la sección FAQ ni el desarrollo de errores de interpretación. Restaurar cobertura útil y evidencia; corregir afirmaciones técnicas inseguras en lugar de copiarlas. |

La guía antigua contiene también afirmaciones demasiado absolutas sobre materiales, profundidad, identificación, normativa y resultados. La restauración debe conservar preguntas y casos verificables con sus límites; no reinstalar promesas falsas o requisitos sectoriales no acreditados. No se ha realizado verificación normativa en esta auditoría.

## Bloqueo 2: URLs adicionales de Search Console sin destino en staging

| Ruta observada | HTTP staging | Acción preparada para siguiente intervención |
|---|---:|---|
| `/industrias/mineria` | 404 | Comparar contenido real de la variante. Si es fallback/duplicado de `/industrias`, redirigir a ese equivalente; si es minería específica, a `/mineria/`. No elegir solo por el nombre del path. |
| `/industrias/construccion` | 404 | Mismo análisis para escoger `/industrias/` o `/construccion/` con equivalencia real. |
| `/blog/hashtags/Georadar` | 404 | Revisar equivalencia con `/blog/tags/geo-radar/`; era noindex en Search Console. Menor riesgo que una página indexada con tráfico, pero debe tener una decisión explícita. |
| `/post/que-es-georadar-gpr-chile-prospección-no-destructiva-con-georadar-en-chile-gpr` | 404 | Variante con una sola r en el segundo georadar: también 404 en Wix, pero registró una impresión en el export. Evaluar 301 al artículo canónico con georradar; no hace falta reconstruir página independiente. |

Estas rutas no estaban cubiertas por la comprobación de 36 URLs del sitemap: confirma por qué el sitemap por sí solo era insuficiente. Las dos rutas con /industrias fueron obtenidas de las capturas del usuario; no se infiere tráfico histórico en ellas.

Las dos URLs 404 históricas que mostró el usuario sí están resueltas en staging: excavación exploratoria responde 301 hacia `/post/georradar-antes-de-excavar/` y usos/aplicaciones responde 301 hacia `/georadar-gpr/`.

## Evidencia de canónicas de Search Console aportada por el usuario

Capturas inspeccionadas durante esta conversación, no una consulta actual a la API:

- `/mineria`: indexada y Google coincide con canonical propio. Último rastreo mostrado: 15 septiembre.
- `/construccion`: Google selecciona la URL inspeccionada como canonical propio. Último rastreo mostrado: 22 septiembre.
- `/lem-radio-deteccion`: indexada y canonical propio coincidente. Último rastreo mostrado: 11 septiembre.
- `/industrias/mineria` y `/industrias/construccion`: declaraban canonical propio, Google seleccionaba `/industrias`. Últimos rastreos mostrados: 24 octubre.
- `/servicios/lem-radio-deteccion`: declaraba canonical propio, Google seleccionaba `/servicios`; variante nueva ya tiene 301 a la página específica LEM.

Los aumentos de 16 a 18 excluidas se explican en los datos mostrados por el aumento de 1 a 3 duplicadas; las indexadas permanecen en 35. Esto no demuestra por sí mismo pérdida de rankings ni ausencia de otros problemas.

## Bloqueo 3: contacto y lanzamiento siguen pendientes

El formulario del sitio nuevo no se considera funcional por pasar pruebas unitarias del backend. Falta verificar frontend, Turnstile, proveedor configurado, consentimiento, adjuntos y recepción real. La migración conserva WhatsApp/correo/teléfono, pero no debe presentar como operativo un formulario de maqueta.

Tampoco se realizó auditoría visual completa, renderizado de Wix/schema, verificación de todos los descargas/recursos externos, Core Web Vitals ni prueba aislada del build de producción indexable. La revisión técnica actual no cierra esos requisitos del plan general.

## Orden recomendado de resolución

1. Recuperar la cobertura útil de la guía completa GPR, empezando por casos reales y FAQ; revisar capacitación y portada con los datos de rendimiento, sin introducir más cambios de enfoque durante el corte.
2. Determinar equivalencia de las cuatro rutas adicionales, añadir solo las redirecciones justificadas y repetir pruebas locales/HTTP tras una publicación autorizada.
3. Cerrar integración de contacto y QA visual de páginas protegidas; ensayar producción indexable y conservar staging excluido.
4. Actualizar copia Wix/DNS, preparar corte y monitoreo. No cambiar DNS antes de cerrar los bloqueos.

Fuentes de criterio: Google Search Central, https://developers.google.com/search/docs/crawling-indexing/site-move-no-url-changes y https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes. Este informe separa observaciones HTTP de recomendaciones e hipótesis editoriales; no predice posiciones.
