// Private Service binding only; no public route or workers.dev hostname.
export default {
  async fetch(request, env) {
    if (request.method !== 'POST' || new URL(request.url).pathname !== '/check') return new Response(null, { status: 404 });
    const ip = request.headers.get('X-Contact-Client-IP');
    if (!ip || ip.length > 64 || !/^[a-fA-F0-9.:]+$/.test(ip)) return new Response(null, { status: 400 });
    try {
      const decision = await env.CONTACT_ATTEMPTS.limit({ key: 'contact:' + ip });
      return new Response(null, { status: decision.success === true ? 204 : 429, headers: { 'Cache-Control': 'no-store', 'Retry-After': '60' } });
    } catch { return new Response(null, { status: 503 }); }
  }
};
