const LIMIT = 8 * 1024 * 1024;
const FIELDS = ['objetivo', 'sector', 'descripcion', 'ubicacion', 'dimension', 'profundidad', 'superficie', 'fecha', 'acceso', 'nombre', 'empresa', 'email', 'telefono'];
const LABELS = ['Objetivo', 'Sector', 'Descripción del proyecto', 'Ubicación', 'Superficie o longitud estimada', 'Profundidad esperada', 'Tipo de superficie', 'Fecha o ventana de trabajo', 'Condición de acceso', 'Nombre', 'Empresa', 'Correo electrónico', 'Teléfono'];
const escapeHtml = value => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const reply = (status, message) => Response.json({ message }, { status, headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } });

export async function onRequestPost({ request, env }) {
  if (env.CONTACT_ENABLED !== 'true' || !env.RESEND_API_KEY || !env.TURNSTILE_SECRET_KEY || !env.CONTACT_FROM) {
    return reply(503, 'El envío aún no está disponible. Escríbanos a gabriel@georadarchile.cl.');
  }
  const url = new URL(request.url);
  const allowed = (env.CONTACT_HOSTS || '').split(',').map(x => x.trim()).filter(Boolean);
  if (!allowed.includes(url.hostname) || request.headers.get('Origin') !== url.origin) return reply(403, 'Origen no permitido.');
  if (!request.headers.get('Content-Type')?.startsWith('multipart/form-data')) return reply(415, 'Formato de solicitud no permitido.');
  if (Number(request.headers.get('Content-Length')) > LIMIT) return reply(413, 'Los archivos y datos superan el límite de 8 MB.');
  try {
    // Contar también cuerpos sin Content-Length antes de interpretar el multipart.
    const reader = request.body?.getReader();
    if (!reader) return reply(400, 'Solicitud vacía.');
    const chunks = []; let size = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > LIMIT) { await reader.cancel(); return reply(413, 'Los archivos y datos superan el límite de 8 MB.'); }
      chunks.push(value);
    }
    const form = await new Response(new Blob(chunks), { headers: { 'Content-Type': request.headers.get('Content-Type') } }).formData();
    if (form.get('website')) return reply(400, 'Solicitud no válida.');
    const data = {};
    for (const key of FIELDS) {
      const value = form.get(key);
      if (value !== null && typeof value !== 'string') return reply(400, 'Campo no válido.');
      data[key] = (value || '').trim();
      if (data[key].length > (key === 'descripcion' ? 5000 : 250)) return reply(400, 'Un campo supera el largo permitido.');
    }
    if (['objetivo', 'sector', 'descripcion', 'ubicacion', 'nombre', 'email'].some(key => !data[key]) || form.get('consentimiento') !== 'on') return reply(400, 'Complete los campos obligatorios y la autorización.');
    if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(data.email) || /[\r\n]/.test(data.email)) return reply(400, 'Revise el correo electrónico.');
    const token = form.get('cf-turnstile-response');
    if (typeof token !== 'string' || !token || token.length > 2048) return reply(400, 'Complete la verificación de seguridad.');
    const files = form.getAll('archivos').filter(file => typeof file !== 'string' && file.size > 0);
    if (files.length > 3 || files.some(file => file.size > 2 * 1024 * 1024 || !/\.(pdf|png|jpe?g)$/i.test(file.name))) return reply(400, 'Adjunte hasta 3 PDF, JPG o PNG, de máximo 2 MB cada uno. Los planos CAD pueden enviarse por correo.');
    const verification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: env.TURNSTILE_SECRET_KEY, response: token }), signal: AbortSignal.timeout(10000)
    });
    if (!verification.ok) return reply(503, 'No pudimos verificar la solicitud. Inténtelo nuevamente.');
    const result = await verification.json();
    if (!result.success || result.hostname !== url.hostname || result.action !== 'contact') return reply(403, 'La verificación expiró o no es válida. Inténtelo nuevamente.');
    const attachments = [];
    for (const file of files) {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const ext = file.name.split('.').pop().toLowerCase();
      const valid = ext === 'pdf' ? new TextDecoder().decode(bytes.slice(0, 5)) === '%PDF-' : ext === 'png' ? [137,80,78,71,13,10,26,10].every((n,i) => bytes[i] === n) : bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
      if (!valid) return reply(400, 'Un archivo no coincide con su formato.');
      let binary = '';
      for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
      attachments.push({ filename: file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-100), content: btoa(binary) });
    }
    const sent = await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: env.CONTACT_FROM, to: ['gabriel@georadarchile.cl'], reply_to: data.email,
        subject: 'Solicitud de evaluación GPR desde la web',
        text: FIELDS.map((key, index) => `${LABELS[index]}: ${data[key] || '(sin indicar)'}`).join('\n\n') + '\n\nAutorización de uso de antecedentes: aceptada.',
        html: '<!doctype html><html lang="es"><body style="margin:0;padding:24px;background:#f5f1eb;font-family:Arial,sans-serif;color:#243034"><div style="max-width:680px;margin:auto;background:#fff;padding:28px"><p style="color:#984326;font-weight:bold">GEO RADAR CHILE</p><h1 style="font-size:24px">Solicitud de evaluación GPR</h1><p>Una persona envió los siguientes antecedentes desde el formulario web. Puede usar Responder para contactarla.</p><table style="width:100%;border-collapse:collapse">' + FIELDS.map((key, index) => '<tr><th scope="row" style="width:35%;text-align:left;vertical-align:top;padding:12px 8px;border-bottom:1px solid #e5ded5;font-size:14px">' + LABELS[index] + '</th><td style="padding:12px 8px;border-bottom:1px solid #e5ded5;overflow-wrap:anywhere;word-break:break-word;font-size:14px">' + escapeHtml(data[key] || '(sin indicar)').replace(/\r?\n/g, '<br>') + '</td></tr>').join('') + '</table><p style="font-size:12px;color:#625c54">Autorización de uso de antecedentes: aceptada. Esta solicitud requiere evaluación y no constituye una cotización confirmada.</p></div></body></html>',
        attachments }), signal: AbortSignal.timeout(15000)
    });
    if (!sent.ok) return reply(502, 'No pudimos enviar la solicitud. Contacte a gabriel@georadarchile.cl antes de reintentar.');
    return reply(200, 'La solicitud fue aceptada para envío. Revisaremos los antecedentes para responderle.');
  } catch {
    return reply(502, 'No pudimos confirmar el envío. Contacte a gabriel@georadarchile.cl antes de reintentar.');
  }
}

export const onRequestGet = () => reply(405, 'Use el formulario de contacto.');
