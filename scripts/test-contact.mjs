import assert from 'node:assert/strict';
import { onRequestPost } from '../functions/api/contact.js';
const env = { CONTACT_ENABLED: 'true', RESEND_API_KEY: 'test', TURNSTILE_SECRET_KEY: 'test', CONTACT_FROM: 'test@example.com', CONTACT_HOSTS: 'example.com' };
const make = (changes = {}) => {
  const form = new FormData();
  for (const [key, value] of Object.entries({ objetivo:'Redes', sector:'Minería', descripcion:'Prueba', ubicacion:'Prueba', nombre:'Prueba', email:'test@example.com', consentimiento:'on', 'cf-turnstile-response':'test', ...changes })) form.set(key, value);
  return new Request('https://example.com/api/contact', { method:'POST', headers:{Origin:'https://example.com'}, body:form });
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
    return Response.json({id:'mock'});
  };
  assert.equal((await onRequestPost({request:make(),env:{}})).status,503);
  assert.equal((await onRequestPost({request:make({consentimiento:''}),env})).status,400);
  assert.equal(calls,0);
  assert.equal((await onRequestPost({request:make(),env})).status,200);
  assert.equal(calls,2);
  globalThis.fetch = async () => Response.json({success:true,hostname:'attacker.example',action:'contact'});
  assert.equal((await onRequestPost({request:make(),env})).status,403);
  globalThis.fetch = async url => url.includes('siteverify') ? Response.json({success:true,hostname:'example.com',action:'contact'}) : new Response('',{status:429});
  assert.equal((await onRequestPost({request:make(),env})).status,502);
  console.log('Contacto: configuración cerrada, consentimiento, destino fijo, hostname Turnstile y fallo proveedor verificados sin correos reales.');
} finally { globalThis.fetch = original; }
