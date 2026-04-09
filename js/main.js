/* ============================================================
   Hardware House — Site-wide JS
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {
  // Sync from Supabase first (no-op if not configured)
  if (typeof syncFromSupabase === 'function') await syncFromSupabase();
  initLang();
  initNav();
  initContact();
  if (typeof initAdmin       === 'function') initAdmin();
  if (typeof initHomePage    === 'function') initHomePage();
  if (typeof initCatalogue   === 'function') initCatalogue();
  if (typeof initContactPage === 'function') initContactPage();
  initReveal(); // after all content is rendered
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
    ham.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      ham.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => {
        links.classList.remove('open');
        ham.setAttribute('aria-expanded', 'false');
      })
    );
  }
  /* mark active page */
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
    }
  });
  /* scroll shadow on navbar */
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }
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
  const t     = TRANSLATIONS[lang];
  const name  = lang === 'hi' ? p.name_hi : p.name_en;
  const desc  = lang === 'hi' ? p.desc_hi : p.desc_en;
  const price = (p.price === 'Contact for Price') ? t.contact_price : p.price;
  const lastUp = getLastUpdate();
  const catLabels = { sections:'Sections', sheets:'Sheets', hardware:'Hardware', accessories:'Accessories' };

  const imgContent = p.image_url
    ? `<img src="${p.image_url}" alt="${name}" loading="lazy">`
    : getProductIcon(p.cat);

  return `
    <article class="product-card" data-cat="${p.cat}" data-id="${p.id}">
      <div class="admin-card-actions" aria-hidden="true">
        <button class="admin-card-btn" onclick="openEditProduct(${p.id})" title="Edit product">✏</button>
        <button class="admin-card-btn delete" onclick="confirmDeleteProduct(${p.id})" title="Delete product">🗑</button>
      </div>
      <div class="product-img">${imgContent}</div>
      <div class="product-info">
        <span class="product-cat">${catLabels[p.cat] || p.cat}</span>
        <h3 class="product-name">${name}</h3>
        <p class="product-desc">${desc}</p>
        <div class="product-footer">
          <div>
            <div class="product-price">${price}</div>
            <div class="price-date">${t.price_updated}: ${lastUp}</div>
          </div>
        </div>
      </div>
    </article>`;
}

/* ── Scroll Reveal ────────────────────────────────────────── */
function initReveal() {
  // Auto-tag staggered grid children
  document.querySelectorAll('.values-grid, .contact-cards').forEach(grid => {
    [...grid.children].forEach((child, i) => {
      if (!child.hasAttribute('data-reveal')) {
        child.setAttribute('data-reveal', '');
        if (i > 0) child.setAttribute('data-reveal-delay', Math.min(i, 4).toString());
      }
    });
  });

  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;

  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('revealed'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => io.observe(el));
}

function getProductIcon(cat) {
  const icons = {
    /* Aluminium L-angle cross-section profile */
    sections: `<svg role="img" aria-label="Aluminium section profile" width="80" height="80" viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
      <title>Aluminium Section</title>
      <polyline points="18,62 18,18 62,18"/>
      <polyline points="18,18 18,30 30,30"/>
      <polyline points="18,62 30,62 30,18"/>
    </svg>`,
    /* Stacked flat sheet profiles */
    sheets: `<svg role="img" aria-label="Aluminium sheet" width="80" height="80" viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round">
      <title>Aluminium Sheet</title>
      <rect x="14" y="20" width="52" height="10" rx="2"/>
      <rect x="14" y="34" width="52" height="10" rx="2"/>
      <rect x="14" y="48" width="52" height="10" rx="2"/>
    </svg>`,
    /* Hex bolt / fastener */
    hardware: `<svg role="img" aria-label="Aluminium hardware fastener" width="80" height="80" viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round">
      <title>Aluminium Hardware</title>
      <polygon points="40,12 57,22 57,58 40,68 23,58 23,22"/>
      <circle cx="40" cy="40" r="11"/>
      <line x1="40" y1="12" x2="40" y2="29"/>
      <line x1="40" y1="51" x2="40" y2="68"/>
    </svg>`,
    /* Door handle / accessory */
    accessories: `<svg role="img" aria-label="Hardware accessory handle" width="80" height="80" viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
      <title>Hardware Accessory</title>
      <rect x="22" y="22" width="36" height="36" rx="5"/>
      <line x1="33" y1="34" x2="47" y2="34"/>
      <line x1="33" y1="40" x2="47" y2="40"/>
      <line x1="33" y1="46" x2="43" y2="46"/>
    </svg>`,
  };
  return icons[cat] || icons.sections;
}
