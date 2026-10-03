# Revisión del staging Cloudflare — 2026-10-03

Staging confirmado por capturas del usuario: https://georadarchile-cl.pages.dev
Commit desplegado observado: a96376c. Los cambios descritos abajo son locales.

## Evidencia manual

- Portada, servicios, contacto, blog, artículo y nosotros cargan con recursos.
- A 320 px: formulario en una columna, menú navegable, Escape cierra y
  devuelve foco, índice del artículo lleva al destino visible.
- WhatsApp abre el número +56 9 7590 9836 y el enlace ATLAS abre georadar.cl.
- Meta robots noindex,nofollow, robots.txt Disallow: / y cabecera
  X-Robots-Tag: noindex, nofollow observados.
- Ruta inexistente devuelve HTTP 404 y ofrece retorno al inicio.
- /empresa/ devuelve 200 con meta refresh y JavaScript; luego /nosotros/
  devuelve 200. No se debe marcar esta variante como 301 validada.
- Formulario solo valida una maqueta: sin envío ni carga de adjuntos.

## Ajustes preparados localmente

- Regla 301 para cada ruta heredada con y sin barra final.
- Caso de portada: quitar la altura de escritorio heredada en móvil y
  la altura mínima del bloque de cifras, conservando fotografías y textos.
- Títulos a 480 px o menos: eliminar guionado automático.
- Indicadores del blog a 480 px o menos: filas con cifra y etiqueta para
  conservar palabras completas en lugar de tres columnas demasiado estrechas.
- Ocultar acciones flotantes hasta 760 px para impedir que WhatsApp tape
  texto o enlaces. Los canales de contacto siguen en contacto y en el pie.
- Actualizar versión del CSS para invalidar la URL previamente cacheada.

## Pendientes antes del dominio

Revisión local adicional: portada y blog observados a 320 px, portada a
1440 px. Títulos sin guionado y etiquetas del blog completas en filas.
Sin overflow del documento en esas vistas. Artículo a 320 px: acciones
flotantes ocultas. Medición del caso destacado: imagen 285 px + pie 79,56 px
= figura 364,56 px, sin espacio residual de la fila de 510 px. La revisión
visual transversal de todas las páginas sigue pendiente.

Revisión visual local de estos ajustes en 320/390/768/1440 px; publicar los
cambios después de autorización explícita para commit/push y comprobarlos
en staging. Verificar todas las reglas 301 mediante HTTP. Implementar el
envío real del formulario, adjuntos, privacidad y protección antiabuso.
Completar accesibilidad, QA transversal y preparación DNS/Zoho.
