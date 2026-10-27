import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
const source = await readFile('src/assets/js/contact.js', 'utf8');
function setup(enabled = true) {
  const status = { focus() {} };
  const button = {};
  const widget = { dataset: { sitekey: 'public-test-key' } };
  let submit, options, requests = 0, resets = 0;
  const form = {
    dataset: { contactEnabled: String(enabled) }, elements: { archivos: { files: [] } },
    querySelector: selector => selector.includes('status') ? status : selector.includes('button') ? button : widget,
    querySelectorAll: () => [], setAttribute() {}, reportValidity: () => true,
    addEventListener: (_, callback) => { submit = callback; }, reset: () => { resets++; }
  };
  const context = { document: { querySelector: () => form, createElement: () => ({}), head: { append() {} } }, window: { turnstile: { render: (_, config) => { options = config; return 'widget'; }, reset() {} } },
    FormData: class { set() {} }, AbortSignal, fetch: async () => { requests++; return { ok: true, json: async () => ({}) }; } };
  vm.runInNewContext(source, context);
  if (enabled) context.window.geoRadarContactReady();
  return { form, status, button, context, submit: () => submit({ preventDefault() {} }), verify: () => options.callback('test-token'), expire: () => options['expired-callback'](), requests: () => requests, resets: () => resets };
}
const disabled = setup(false);
await disabled.submit();
assert.equal(disabled.requests(), 0);
assert.equal(disabled.button.disabled, true);
const valid = setup();
await valid.submit();
assert.equal(valid.requests(), 0, 'No enviar sin verificación');
valid.verify();
valid.expire();
assert.equal(valid.button.disabled, true);
valid.verify();
valid.form.elements.archivos.files = [{ name: 'plano.dwg', size: 100 }];
await valid.submit();
assert.equal(valid.requests(), 0, 'CAD se remite por correo');
valid.form.elements.archivos.files = [];
let resolveRequest;
valid.context.fetch = () => new Promise(resolve => { resolveRequest = resolve; });
const sending = valid.submit();
assert.equal(valid.button.disabled, true);
await valid.submit();
resolveRequest({ ok: true, json: async () => ({}) });
await sending;
assert.equal(valid.resets(), 1);
assert.equal(valid.button.disabled, true, 'No repetir solicitud aceptada');
const failure = setup();
failure.verify();
failure.context.fetch = async () => { throw new Error('timeout'); };
await failure.submit();
assert.equal(failure.resets(), 0, 'Conservar antecedentes en error');
assert.match(failure.status.textContent, /No pudimos confirmar/);
assert.equal(failure.button.disabled, true, 'Exigir nuevo token después de error');
console.log('Frontend: cerrado sin configuración/token, expiración, adjuntos, bloqueo durante envío, aceptación y conservación en error verificados sin red.');
