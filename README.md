# georadarchile.cl

Reconstrucción controlada del sitio corporativo de Geo Radar Chile.

## Estado

Fase 1.2 cerrada: scaffold local con 37 rutas canónicas y cinco redirecciones heredadas. No sustituye el sitio publicado en Wix y no debe indexarse.

## Uso local

```bash
npm install
npm run dev
```

## Validación

```bash
npm run build
npm run check
```

El build de staging incluye bloqueo de rastreo mediante `robots.txt` y `X-Robots-Tag`.
