const toggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('#main-menu');

if (toggle && menu) {
  const focusables = () => [toggle, ...menu.querySelectorAll('a[href], button:not([disabled])')].filter((el) => el.offsetParent !== null);
  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';
  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    menu.dataset.open = String(open);
    document.documentElement.classList.toggle('menu-open', open);
    if (open) menu.querySelector('a[href]')?.focus();
  };
  toggle.addEventListener('click', () => setOpen(!isOpen()));
  document.addEventListener('keydown', (event) => {
    if (!isOpen()) return;
    if (event.key === 'Escape') {
      setOpen(false);
      toggle.focus();
      return;
    }
    if (event.key === 'Tab') {
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  window.matchMedia('(min-width: 981px)').addEventListener('change', (event) => { if (event.matches) setOpen(false); });
}

const serviceNav = document.querySelector('.services-subnav');

if (serviceNav) {
  const links = [...serviceNav.querySelectorAll('a[href^="#"]')];
  const sections = links.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  const setActive = (id) => {
    links.forEach((link) => link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`));
  };
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) setActive(visible.target.id);
  }, { rootMargin: '-24% 0px -64% 0px', threshold: [0, .15, .4] });
  sections.forEach((section) => observer.observe(section));
}

const articleToc = document.querySelector('.article-toc');

if (articleToc) {
  const links = [...articleToc.querySelectorAll('nav a[href^="#"]')];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);
  const setCurrent = (id) => {
    links.forEach((link) => {
      const current = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('is-current', current);
      if (current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };

  links.forEach((link) => link.addEventListener('click', () => {
    setCurrent(link.getAttribute('href').slice(1));
  }));

  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) setCurrent(visible.target.id);
  }, { rootMargin: '-18% 0px -68% 0px', threshold: [0, .08, .25] });

  sections.forEach((section) => observer.observe(section));
  const hashSection = location.hash && document.querySelector(location.hash);
  setCurrent(hashSection && sections.includes(hashSection) ? hashSection.id : sections[0]?.id);
}

const floatingActions = document.querySelector('[data-floating-actions]');

if (floatingActions) {
  const backToTop = floatingActions.querySelector('[data-back-to-top]');
  const footer = document.querySelector('.site-footer');
  const updateFloatingActions = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    floatingActions.dataset.visible = String(scrollTop > 420);
    backToTop.dataset.visible = String(scrollTop > 900);
  };

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });

  if (footer) {
    const footerObserver = new IntersectionObserver(([entry]) => {
      floatingActions.dataset.footerVisible = String(entry.isIntersecting);
    }, { threshold: .06 });
    footerObserver.observe(footer);
  }

  updateFloatingActions();
  window.addEventListener('scroll', updateFloatingActions, { passive: true });
}
