import assert from 'node:assert/strict';
import { onRequestPost } from '../functions/api/contact.js';
import guard from '../workers/contact-guard/index.js';
const env = { CONTACT_ENABLED: 'true', RESEND_API_KEY: 'test', TURNSTILE_SECRET_KEY: 'test', CONTACT_FROM: 'test@example.com', CONTACT_HOSTS: 'example.com' };
const make = (changes = {}, files = []) => {
  const form = new FormData();
  for (const [key, value] of Object.entries({ objetivo:'Redes', sector:'Minería', descripcion:'Prueba', ubicacion:'Prueba', nombre:'Prueba', email:'test@example.com', consentimiento:'on', 'cf-turnstile-response':'test', ...changes })) form.set(key, value);
  for (const file of files) form.append('archivos', file.blob, file.name);
  return new Request('https://example.com/api/contact', { method:'POST', headers:{Origin:'https://example.com','CF-Connecting-IP':'192.0.2.1'}, body:form });
};
const original = globalThis.fetch;
let calls = 0;
try {
  globalThis.fetch = async (url, options) => {
    calls++;
    if (url.includes('siteverify')) return Response.json({success:true,hostname:'example.com',action:'contact'});
    const payload = JSON.parse(options.body);
    assert.deepEqual(payload.to, ['gabriel@georadarchile.cl']);
    assert.equal(payload.reply_to, 'test@example.com');
    assert.match(payload.html, /Solicitud de evaluación GPR/);
    assert.match(payload.text, /Descripción del proyecto:/);
    if (payload.text.includes('<script>')) {
      assert(!payload.html.includes('<script>'));
      assert(payload.html.includes('&lt;script&gt;'));
    }
    return Response.json({id:'mock'});
  };
  assert.equal((await onRequestPost({request:make(),env:{}})).status,503);
  assert.equal((await onRequestPost({request:make({consentimiento:''}),env})).status,400);
  assert.equal(calls,0);
  const guarded = { ...env, CONTACT_RATE_LIMIT_ENABLED: 'true' };
  assert.equal((await onRequestPost({request:make(),env:guarded})).status,503);
  guarded.CONTACT_GUARD = { fetch: async (url, options) => {
    assert.equal(url,'https://contact-guard/check');
    assert.equal(options.headers['X-Contact-Client-IP'],'192.0.2.1');
    assert.equal(options.body,undefined,'No compartir campos ni adjuntos con el limitador');
    return new Response(null,{status:429});
  } };
  const limited = await onRequestPost({request:make(),env:guarded});
  assert.equal(limited.status,429);
  assert.equal(limited.headers.get('Retry-After'),'60');
  assert.equal(calls,0,'Bloquear antes de Turnstile y correo');
  guarded.CONTACT_GUARD.fetch = async () => { throw new Error('unavailable'); };
  assert.equal((await onRequestPost({request:make(),env:guarded})).status,503);
  assert.equal(calls,0);
  guarded.CONTACT_GUARD.fetch = async () => new Response(null,{status:204});
  assert.equal((await onRequestPost({request:make(),env:guarded})).status,200);
  calls = 0;
  const guardRequest = () => new Request('https://contact-guard/check',{method:'POST',headers:{'X-Contact-Client-IP':'192.0.2.1'}});
  const guardEnv = success => ({CONTACT_ATTEMPTS:{limit:async ({key})=>{assert.equal(key,'contact:192.0.2.1');return {success};}}});
  assert.equal((await guard.fetch(guardRequest(),guardEnv(true))).status,204);
  assert.equal((await guard.fetch(guardRequest(),guardEnv(false))).status,429);
  assert.equal((await guard.fetch(guardRequest(),{})).status,503);
  assert.equal((await guard.fetch(new Request('https://contact-guard/check',{method:'POST'}),guardEnv(true))).status,400);
  assert.equal((await onRequestPost({request:make(),env})).status,200);
  assert.equal(calls,2);
  assert.equal((await onRequestPost({request:make({descripcion:'<script>alert("test")</script>'}),env})).status,200);
  const attachment = (name, bytes) => ({ name, blob: new Blob([bytes]) });
  const files = [attachment('plano.pdf', '%PDF-1.4\nprueba'), attachment('foto.png', new Uint8Array([137,80,78,71,13,10,26,10])), attachment('foto.jpg', new Uint8Array([255,216,255]))];
  let delivered;
  globalThis.fetch = async (url, options) => {
    if (url.includes('siteverify')) return Response.json({success:true,hostname:'example.com',action:'contact'});
    delivered = JSON.parse(options.body);
    return Response.json({id:'mock-attachments'});
  };
  assert.equal((await onRequestPost({request:make({}, files),env})).status,200);
  assert.equal(delivered.attachments.length,3);
  for (let i=0; i<files.length; i++) {
    assert.equal(delivered.attachments[i].filename, files[i].name);
    assert.deepEqual(Buffer.from(delivered.attachments[i].content,'base64'), Buffer.from(await files[i].blob.arrayBuffer()));
  }
  for (const rejected of [
    [attachment('falso.pdf','archivo sin firma PDF')],
    [attachment('falso.png','archivo sin firma PNG')],
    [attachment('falso.jpg','archivo sin firma JPEG')],
    [attachment('plano.dwg','CAD')],
    [attachment('grande.pdf',new Uint8Array(2*1024*1024+1))],
    [...files,files[0]]
  ]) {
    delivered = undefined;
    assert.equal((await onRequestPost({request:make({},rejected),env})).status,400);
    assert.equal(delivered,undefined,'Un adjunto rechazado no llega al proveedor de correo');
  }
  globalThis.fetch = async () => Response.json({success:true,hostname:'attacker.example',action:'contact'});
  assert.equal((await onRequestPost({request:make(),env})).status,403);
  globalThis.fetch = async url => url.includes('siteverify') ? Response.json({success:true,hostname:'example.com',action:'contact'}) : new Response('',{status:429});
  assert.equal((await onRequestPost({request:make(),env})).status,502);
  console.log('Contacto: configuración, consentimiento, destino, Turnstile, adjuntos, límite de frecuencia y fallos de proveedores verificados sin correos reales.');
} finally { globalThis.fetch = original; }
