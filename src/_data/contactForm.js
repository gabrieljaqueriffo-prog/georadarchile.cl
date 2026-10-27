// Public build-time settings only. Private keys belong in Pages secrets.
export default function () {
  const siteKey = (process.env.TURNSTILE_SITE_KEY || '').trim();
  return { enabled: process.env.CONTACT_FORM_ENABLED === 'true' && /^[a-zA-Z0-9_-]{10,100}$/.test(siteKey), siteKey };
}
