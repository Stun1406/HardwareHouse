/* ============================================================
   Hardware House — Site-wide JS
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initLang();
  initNav();
  initContact();
  if (typeof initHomePage   === 'function') initHomePage();
  if (typeof initCatalogue  === 'function') initCatalogue();
  if (typeof initContactPage=== 'function') initContactPage();
});

/* ── Language ─────────────────────────────────────────────── */
function initLang() {
  const lang = getCurrentLang();
  applyLang(lang);
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
    btn.addEventListener('click', () => {
      const l = btn.dataset.lang;
      setLang(l);
      applyLang(l);
      document.querySelectorAll('.lang-btn').forEach(b =>
        b.classList.toggle('active', b.dataset.lang === l)
      );
    });
  });
}

function applyLang(lang) {
  const t = TRANSLATIONS[lang];
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const k = el.dataset.i18n;
    if (t[k] !== undefined) el.textContent = t[k];
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const k = el.dataset.i18nPh;
    if (t[k] !== undefined) el.placeholder = t[k];
  });
}

/* ── Navigation ───────────────────────────────────────────── */
function initNav() {
  const ham = document.querySelector('.hamburger');
  const links = document.querySelector('.nav-links');
  if (ham && links) {
    ham.addEventListener('click', () => links.classList.toggle('open'));
    links.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => links.classList.remove('open'))
    );
  }
  /* mark active page */
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href === page || (page === '' && href === 'index.html')) a.classList.add('active');
  });
}

/* ── Contact info populate ────────────────────────────────── */
function initContact() {
  const c = getContact();
  sel('[data-c="phone1"]', el => el.textContent  = c.phone1);
  sel('[data-c="phone2"]', el => el.textContent  = c.phone2);
  sel('[data-c="email"]',  el => el.textContent  = c.email);
  sel('[data-c="address"]',el => el.textContent  = c.address);
  sel('[data-c="hours"]',  el => el.textContent  = c.hours);
  sel('[data-c="whatsapp-link"]', el => el.href  = `https://wa.me/${c.whatsapp}`);
  sel('[data-c="phone-link"]',    el => el.href  = `tel:${c.phone1.replace(/\D/g,'')}`);
  sel('[data-c="email-link"]',    el => el.href  = `mailto:${c.email}`);
}

function sel(q, fn) { document.querySelectorAll(q).forEach(fn); }

/* ── Product card renderer ────────────────────────────────── */
function renderProductCard(p, lang, opts = {}) {
  const t    = TRANSLATIONS[lang];
  const name = lang === 'hi' ? p.name_hi : p.name_en;
  const desc = lang === 'hi' ? p.desc_hi : p.desc_en;
  const price = (p.price === 'Contact for Price') ? t.contact_price : p.price;
  const lastUp = getLastUpdate();
  const catLink = opts.linkToContact ? 'index.html#contact' : `catalogue.html?cat=${p.cat}`;

  return `
    <div class="product-card" data-cat="${p.cat}">
      <div class="product-img">${getProductIcon(p.cat)}</div>
      <div class="product-info">
        <h3 class="product-name">${name}</h3>
        <p class="product-desc">${desc}</p>
        <div class="product-footer">
          <div>
            <div class="product-price">${price}</div>
            <div class="price-date">${t.price_updated}: ${lastUp}</div>
          </div>
          <a href="${catLink}" class="btn btn-primary btn-sm">${t.btn_quote}</a>
        </div>
      </div>
    </div>`;
}

function getProductIcon(cat) {
  const icons = {
    sections: `<svg width="72" height="72" viewBox="0 0 72 72" fill="none">
      <rect x="8" y="52" width="56" height="10" rx="3" fill="#C96A1E" opacity="0.55"/>
      <rect x="8" y="12" width="10" height="50" rx="3" fill="#C96A1E" opacity="0.55"/>
    </svg>`,
    sheets: `<svg width="72" height="72" viewBox="0 0 72 72" fill="none">
      <rect x="8" y="24" width="56" height="7" rx="2" fill="#888" opacity="0.45"/>
      <rect x="8" y="35" width="56" height="7" rx="2" fill="#888" opacity="0.45"/>
      <rect x="8" y="46" width="56" height="7" rx="2" fill="#888" opacity="0.45"/>
    </svg>`,
    hardware: `<svg width="72" height="72" viewBox="0 0 72 72" fill="none">
      <circle cx="36" cy="36" r="14" stroke="#888" stroke-width="6" opacity="0.45"/>
      <rect x="32" y="8"  width="8" height="18" rx="4" fill="#888" opacity="0.45"/>
      <rect x="32" y="46" width="8" height="18" rx="4" fill="#888" opacity="0.45"/>
      <rect x="8"  y="32" width="18" height="8" rx="4" fill="#888" opacity="0.45"/>
      <rect x="46" y="32" width="18" height="8" rx="4" fill="#888" opacity="0.45"/>
    </svg>`,
    accessories: `<svg width="72" height="72" viewBox="0 0 72 72" fill="none">
      <rect x="12" y="22" width="48" height="28" rx="4" stroke="#888" stroke-width="5" opacity="0.45"/>
      <rect x="27" y="14" width="18" height="12" rx="3" stroke="#888" stroke-width="4" opacity="0.45"/>
      <circle cx="27" cy="36" r="4" fill="#888" opacity="0.45"/>
      <circle cx="45" cy="36" r="4" fill="#888" opacity="0.45"/>
    </svg>`,
  };
  return icons[cat] || icons.sections;
}
