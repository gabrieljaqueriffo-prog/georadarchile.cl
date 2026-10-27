(() => {
  const form = document.querySelector('[data-contact-form]');
  if (!form) return;
  const status = form.querySelector('.contact-form-status');
  const button = form.querySelector('button[type="submit"]');
  const widget = form.querySelector('[data-turnstile]');
  const configured = form.dataset.contactEnabled === 'true';
  let token = '';
  let widgetId;
  let sending = false;
  let sent = false;
  const update = () => {
    button.disabled = !configured || !token || sending || sent;
    button.textContent = sending ? 'Enviando…' : sent ? 'Solicitud aceptada' : 'Enviar solicitud →';
    form.setAttribute('aria-busy', String(sending));
  };
  const message = (text, focus = false) => {
    status.textContent = text;
    status.hidden = false;
    if (focus) status.focus();
  };
  const resetVerification = () => {
    token = '';
    if (widgetId !== undefined && window.turnstile) window.turnstile.reset(widgetId);
    update();
  };
  form.querySelectorAll('input:not([type="file"]):not([type="checkbox"]), textarea').forEach(input => {
    input.maxLength = input.name === 'descripcion' ? 5000 : 250;
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!configured || sending || sent) return;
    if (!form.reportValidity()) return;
    if (!token) { message('Complete la verificación de seguridad antes de enviar.', true); return; }
    const files = [...form.elements.archivos.files];
    if (files.length > 3 || files.some(file => file.size > 2 * 1024 * 1024 || !/\.(pdf|png|jpe?g)$/i.test(file.name))) {
      message('Adjunte hasta 3 PDF, JPG o PNG, de máximo 2 MB cada uno. Los planos CAD pueden enviarse por correo.', true);
      return;
    }
    const payload = new FormData(form);
    payload.set('cf-turnstile-response', token);
    sending = true;
    update();
    message('Enviando los antecedentes. Espere la confirmación.');
    try {
      const response = await fetch('/api/contact', { method: 'POST', body: payload, credentials: 'same-origin', signal: AbortSignal.timeout(30000) });
      const result = await response.json();
      if (response.ok) {
        sent = true;
        form.reset();
        message('Su solicitud fue aceptada para envío. Esto no confirma una cotización. Revisaremos los antecedentes para responderle.', true);
      } else {
        message(typeof result.message === 'string' ? result.message : 'No pudimos confirmar el envío. Escríbanos a gabriel@georadarchile.cl antes de reintentar.', true);
      }
    } catch {
      message('No pudimos confirmar el envío. Para evitar duplicados, consulte a gabriel@georadarchile.cl antes de reintentar. Sus datos permanecen en el formulario.', true);
    } finally {
      sending = false;
      resetVerification();
    }
  });
  update();
  if (!configured) {
    message('El envío por formulario todavía no está disponible. Puede escribir a gabriel@georadarchile.cl o contactarnos por WhatsApp.');
    return;
  }
  message('Complete los antecedentes y la verificación de seguridad para enviar.');
  window.geoRadarContactReady = () => {
    widgetId = window.turnstile.render(widget, {
      sitekey: widget.dataset.sitekey,
      action: 'contact',
      size: 'flexible',
      language: 'es',
      callback: value => { token = value; update(); },
      'expired-callback': () => { token = ''; update(); message('La verificación expiró. Complétela nuevamente para enviar.'); },
      'error-callback': () => { token = ''; update(); message('No pudimos completar la verificación. Recargue la página o escriba a gabriel@georadarchile.cl.'); }
    });
  };
  const script = document.createElement('script');
  script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=geoRadarContactReady&render=explicit';
  script.async = true;
  script.onerror = () => message('No se pudo cargar la verificación. Puede escribir a gabriel@georadarchile.cl.');
  document.head.append(script);
})();
