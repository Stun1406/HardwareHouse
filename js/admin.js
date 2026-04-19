/* ============================================================
   Hardware House — Inline Admin Panel
   Requires: config.js → supabase-client.js → data.js → main.js
   If Supabase is not configured, falls back to admin/index.html
   ============================================================ */

/* ── INIT ─────────────────────────────────────────────────── */
function initAdmin() {
  if (!sbEnabled()) return; // no Supabase — footer trigger will go to admin/index.html

  sbOnAuthChange(session => session ? _enterAdminMode() : _exitAdminMode());
  sbGetSession().then(session => { if (session) _enterAdminMode(); });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') _closeAllModals();
  });

  document.getElementById('admin-pw-input')
    ?.addEventListener('keydown', e => { if (e.key === 'Enter') doAdminLogin(); });
}

function _enterAdminMode() {
  document.body.classList.add('admin-mode');
  document.getElementById('admin-bar')?.removeAttribute('hidden');
}

function _exitAdminMode() {
  document.body.classList.remove('admin-mode');
  document.getElementById('admin-bar')?.setAttribute('hidden', '');
}

function _closeAllModals() {
  document.querySelectorAll('.admin-modal-overlay').forEach(m => m.setAttribute('hidden', ''));
}

/* ── TRIGGER / LOGIN ──────────────────────────────────────── */
function showAdminLogin() {
  if (!sbEnabled()) { window.location.href = 'admin/index.html'; return; }
  document.getElementById('admin-login-modal').removeAttribute('hidden');
  setTimeout(() => document.getElementById('admin-email-input')?.focus(), 60);
}

function hideAdminLogin() {
  document.getElementById('admin-login-modal').setAttribute('hidden', '');
  document.getElementById('admin-login-err').setAttribute('hidden', '');
  document.getElementById('admin-email-input').value = '';
  document.getElementById('admin-pw-input').value = '';
}

async function doAdminLogin() {
  const email = document.getElementById('admin-email-input')?.value.trim();
  const pw    = document.getElementById('admin-pw-input')?.value;
  const btn   = document.getElementById('admin-login-btn');

  if (!email || !pw) { _loginErr('Please enter your email and password.'); return; }

  btn.disabled    = true;
  btn.textContent = 'Signing in…';
  document.getElementById('admin-login-err').setAttribute('hidden', '');

  try {
    await sbSignIn(email, pw);
    hideAdminLogin();
  } catch (err) {
    _loginErr(err.message || 'Login failed. Check your credentials.');
    btn.disabled    = false;
    btn.textContent = 'Sign In';
  }
}

function _loginErr(msg) {
  const el = document.getElementById('admin-login-err');
  el.textContent = msg;
  el.removeAttribute('hidden');
}

async function doAdminLogout() {
  await sbSignOut();
  _toast('Logged out');
}

/* ── PRODUCTS ─────────────────────────────────────────────── */
function openAddProduct() {
  document.getElementById('prod-modal-heading').textContent = 'Add Product';
  document.getElementById('prod-save-btn').textContent      = 'Add Product';
  document.getElementById('prod-form').reset();
  document.getElementById('prod-id').value = '';
  _clearImgPreview();
  document.getElementById('admin-prod-modal').removeAttribute('hidden');
  document.getElementById('prod-name-en').focus();
}

function openEditProduct(id) {
  const p = getProducts().find(x => x.id == id);
  if (!p) return;

  document.getElementById('prod-modal-heading').textContent = 'Edit Product';
  document.getElementById('prod-save-btn').textContent      = 'Save Changes';
  document.getElementById('prod-id').value      = p.id;
  document.getElementById('prod-name-en').value = p.name_en  || '';
  document.getElementById('prod-name-hi').value = p.name_hi  || '';
  document.getElementById('prod-cat').value     = p.cat      || 'sections';
  document.getElementById('prod-price').value   = p.price    || '';
  document.getElementById('prod-desc-en').value = p.desc_en  || '';
  document.getElementById('prod-desc-hi').value = p.desc_hi  || '';
  document.getElementById('prod-featured').checked = !!p.featured;

  p.image_url ? _setImgPreview(p.image_url) : _clearImgPreview();
  document.getElementById('admin-prod-modal').removeAttribute('hidden');
}

function closeProdModal() {
  document.getElementById('admin-prod-modal').setAttribute('hidden', '');
}

async function saveProduct() {
  const btn   = document.getElementById('prod-save-btn');
  const rawId = document.getElementById('prod-id').value;
  const id    = rawId ? parseInt(rawId) : null;

  const data = {
    name_en:  document.getElementById('prod-name-en').value.trim(),
    name_hi:  document.getElementById('prod-name-hi').value.trim(),
    cat:      document.getElementById('prod-cat').value,
    price:    document.getElementById('prod-price').value.trim() || 'Contact for Price',
    desc_en:  document.getElementById('prod-desc-en').value.trim(),
    desc_hi:  document.getElementById('prod-desc-hi').value.trim(),
    featured: document.getElementById('prod-featured').checked,
  };

  if (!data.name_en) { alert('Product name (English) is required.'); return; }

  btn.disabled    = true;
  btn.textContent = 'Saving…';

  try {
    const imgFile = document.getElementById('prod-image').files[0];
    if (imgFile) {
      data.image_url = await sbUploadImage(imgFile, id || ('new-' + Date.now()));
    } else if (id) {
      const existing = getProducts().find(p => p.id === id);
      if (existing?.image_url) data.image_url = existing.image_url;
    }

    if (id) data.id = id;
    const saved = await sbSaveProduct(data);

    // Mirror to localStorage
    const products = getProducts();
    if (id) {
      const idx = products.findIndex(p => p.id === id);
      if (idx !== -1) products[idx] = { ...products[idx], ...data, id };
    } else {
      products.push({ ...data, id: saved.id });
    }
    saveProducts(products);

    closeProdModal();
    _refreshGrids();
    _toast(id ? 'Product updated' : 'Product added');
  } catch (err) {
    alert('Error saving product: ' + (err.message || err));
  } finally {
    btn.disabled    = false;
    btn.textContent = id ? 'Save Changes' : 'Add Product';
  }
}

async function confirmDeleteProduct(id) {
  if (!confirm('Delete this product? This cannot be undone.')) return;
  try {
    await sbDeleteProduct(id);
    saveProducts(getProducts().filter(p => p.id != id));
    _refreshGrids();
    _toast('Product deleted');
  } catch (err) {
    alert('Error: ' + (err.message || err));
  }
}

/* ── CONTACT ──────────────────────────────────────────────── */
function openEditContact() {
  const c = getContact();
  document.getElementById('ac-phone1').value   = c.phone1   || '';
  document.getElementById('ac-phone2').value   = c.phone2   || '';
  document.getElementById('ac-email').value    = c.email    || '';
  document.getElementById('ac-address').value  = c.address  || '';
  document.getElementById('ac-hours').value    = c.hours    || '';
  document.getElementById('ac-whatsapp').value = c.whatsapp || '';
  document.getElementById('admin-contact-modal').removeAttribute('hidden');
}

function closeContactModal() {
  document.getElementById('admin-contact-modal').setAttribute('hidden', '');
}

async function saveContactInfo() {
  const btn = document.getElementById('ac-save-btn');
  btn.disabled    = true;
  btn.textContent = 'Saving…';
  try {
    const data = {
      phone1:   document.getElementById('ac-phone1').value.trim(),
      phone2:   document.getElementById('ac-phone2').value.trim(),
      email:    document.getElementById('ac-email').value.trim(),
      address:  document.getElementById('ac-address').value.trim(),
      hours:    document.getElementById('ac-hours').value.trim(),
      whatsapp: document.getElementById('ac-whatsapp').value.trim(),
    };
    await sbSaveContact(data);
    saveContact(data);
    closeContactModal();
    initContact();
    _toast('Contact info updated');
  } catch (err) {
    alert('Error: ' + (err.message || err));
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Save Changes';
  }
}

/* ── PRICES ───────────────────────────────────────────────── */
async function adminMarkPricesUpdated() {
  const date = markPricesUpdated();
  await sbSetSetting('last_price_update', date);
  // Refresh all price-date elements on page
  document.querySelectorAll('.price-date').forEach(el => {
    el.textContent = el.textContent.replace(/:\s.*$/, ': ' + date);
  });
  _toast('Prices marked as updated: ' + date);
}

/* ── HELPERS ──────────────────────────────────────────────── */
function _refreshGrids() {
  const lang     = getCurrentLang();
  const products = getProducts();

  const feat = document.getElementById('featured-products');
  if (feat) {
    const shown = products.some(p => p.featured) ? products.filter(p => p.featured) : products;
    feat.innerHTML = shown
      .map(p => renderProductCard(p, lang, { linkToContact: true }))
      .join('');
  }
  if (typeof renderGrid === 'function') {
    const cat = document.querySelector('.filter-tab.active')?.dataset.cat || 'all';
    renderGrid(cat, lang);
  }
}

function _setImgPreview(url) {
  const img = document.getElementById('prod-img-preview');
  img.src = url;
  img.removeAttribute('hidden');
}

function _clearImgPreview() {
  const img = document.getElementById('prod-img-preview');
  img.src = '';
  img.setAttribute('hidden', '');
}

function previewImage(input) {
  if (input.files?.[0]) {
    const reader = new FileReader();
    reader.onload = e => _setImgPreview(e.target.result);
    reader.readAsDataURL(input.files[0]);
  }
}

function _toast(msg) {
  const el = document.getElementById('admin-toast');
  if (!el) return;
  el.textContent = msg;
  el.removeAttribute('hidden');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.setAttribute('hidden', ''), 3000);
}
