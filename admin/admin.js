/* ============================================================
   Hardware House — Admin Panel JS
   ============================================================ */

const PW_KEY = 'hw_admin_pw';

function getAdminPw() { return localStorage.getItem(PW_KEY) || 'admin123'; }
function isLoggedIn()  { return sessionStorage.getItem('hw_admin') === '1'; }

/* ── BOOT ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  if (isLoggedIn()) showApp();

  document.getElementById('login-form').addEventListener('submit', e => {
    e.preventDefault();
    const pw = document.getElementById('login-pw').value;
    if (pw === getAdminPw()) {
      sessionStorage.setItem('hw_admin', '1');
      showApp();
    } else {
      document.getElementById('login-err').classList.add('show');
    }
  });
});

function showApp() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  renderDashboard();
  renderProductsTable();
  renderPriceTable();
  loadContactForm();
}

function logout() {
  sessionStorage.removeItem('hw_admin');
  location.reload();
}

/* ── PAGE NAVIGATION ─────────────────────────────────────── */
function showPage(id, btn) {
  document.querySelectorAll('.page-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  document.querySelectorAll('.sidebar-nav button, .sidebar-nav a').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

/* ── DASHBOARD ────────────────────────────────────────────── */
function renderDashboard() {
  const products = getProducts();
  const cats     = { sections:0, sheets:0, hardware:0, accessories:0 };
  products.forEach(p => { if (cats[p.cat] !== undefined) cats[p.cat]++; });
  const featured = products.filter(p => p.featured).length;

  document.getElementById('dash-stats').innerHTML = `
    <div class="stat-card">
      <div class="stat-num">${products.length}</div>
      <div class="stat-label">Total Products</div>
    </div>
    <div class="stat-card" style="border-color:#2563EB;">
      <div class="stat-num">${featured}</div>
      <div class="stat-label">Featured on Homepage</div>
    </div>
    <div class="stat-card" style="border-color:#16A34A;">
      <div class="stat-num">${getLastUpdate()}</div>
      <div class="stat-label">Last Price Update</div>
    </div>
    <div class="stat-card" style="border-color:#7C3AED;">
      <div class="stat-num">4</div>
      <div class="stat-label">Categories</div>
    </div>`;

  const fp = products.filter(p => p.featured);
  document.getElementById('dash-featured').innerHTML = fp.length
    ? `<table style="width:100%;border-collapse:collapse;">
        <thead><tr>
          <th style="padding:8px 12px;text-align:left;font-size:0.75rem;color:#888;border-bottom:1px solid #E0D5CC;">Product</th>
          <th style="padding:8px 12px;text-align:left;font-size:0.75rem;color:#888;border-bottom:1px solid #E0D5CC;">Price</th>
          <th style="padding:8px 12px;text-align:left;font-size:0.75rem;color:#888;border-bottom:1px solid #E0D5CC;">Category</th>
        </tr></thead>
        <tbody>${fp.map(p => `
          <tr>
            <td style="padding:9px 12px;border-bottom:1px solid #F5F0EB;font-size:0.83rem;">${p.name_en}</td>
            <td style="padding:9px 12px;border-bottom:1px solid #F5F0EB;font-weight:700;color:#7B1C1C;">${p.price}</td>
            <td style="padding:9px 12px;border-bottom:1px solid #F5F0EB;">
              <span class="badge badge-${p.cat}">${p.cat}</span>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>`
    : '<p style="color:#888;font-size:0.83rem;">No featured products. Edit products to mark them as featured.</p>';
}

/* ── PRODUCTS TABLE ───────────────────────────────────────── */
function renderProductsTable() {
  const products = getProducts();
  document.getElementById('product-count').textContent = `${products.length} product${products.length!==1?'s':''}`;

  const tbody = document.getElementById('products-tbody');
  tbody.innerHTML = products.map(p => `
    <tr>
      <td>
        <strong>${p.name_en}</strong>
        ${p.name_hi ? `<br><span style="font-size:0.75rem;color:#888;">${p.name_hi}</span>` : ''}
      </td>
      <td><span class="badge badge-${p.cat}">${catLabel(p.cat)}</span></td>
      <td class="price-cell">${p.price}</td>
      <td>${p.featured ? '<span class="badge badge-featured">Featured</span>' : '<span style="color:#aaa;font-size:0.75rem;">—</span>'}</td>
      <td>
        <div style="display:flex;gap:6px;">
          <button class="btn btn-outline btn-sm" onclick="openEditModal(${p.id})">Edit</button>
          <button class="btn btn-danger  btn-sm" onclick="deleteProduct(${p.id})">Del</button>
        </div>
      </td>
    </tr>`).join('');
}

function catLabel(cat) {
  return { sections:'Sections', sheets:'Sheets', hardware:'Hardware', accessories:'Accessories' }[cat] || cat;
}

/* ── ADD / EDIT MODAL ─────────────────────────────────────── */
let editingId = null;

function openAddModal() {
  editingId = null;
  document.getElementById('modal-title').textContent = 'Add New Product';
  document.getElementById('modal-save-btn').textContent = 'Add Product';
  document.getElementById('product-form').reset();
  document.getElementById('m-id').value = '';
  document.getElementById('product-modal').classList.add('open');
}

function openEditModal(id) {
  const p = getProducts().find(x => x.id === id);
  if (!p) return;
  editingId = id;
  document.getElementById('modal-title').textContent = 'Edit Product';
  document.getElementById('modal-save-btn').textContent = 'Save Changes';
  document.getElementById('m-id').value       = p.id;
  document.getElementById('m-name-en').value  = p.name_en;
  document.getElementById('m-name-hi').value  = p.name_hi || '';
  document.getElementById('m-cat').value      = p.cat;
  document.getElementById('m-price').value    = p.price;
  document.getElementById('m-desc-en').value  = p.desc_en || '';
  document.getElementById('m-desc-hi').value  = p.desc_hi || '';
  document.getElementById('m-featured').checked = !!p.featured;
  document.getElementById('product-modal').classList.add('open');
}

function closeModal() {
  document.getElementById('product-modal').classList.remove('open');
}

document.getElementById('product-form').addEventListener('submit', e => {
  e.preventDefault();
  const products = getProducts();
  const data = {
    name_en:  document.getElementById('m-name-en').value.trim(),
    name_hi:  document.getElementById('m-name-hi').value.trim(),
    cat:      document.getElementById('m-cat').value,
    price:    document.getElementById('m-price').value.trim() || 'Contact for Price',
    desc_en:  document.getElementById('m-desc-en').value.trim(),
    desc_hi:  document.getElementById('m-desc-hi').value.trim(),
    featured: document.getElementById('m-featured').checked,
  };

  if (editingId) {
    const idx = products.findIndex(p => p.id === editingId);
    if (idx !== -1) products[idx] = { ...products[idx], ...data };
  } else {
    const maxId = products.reduce((m, p) => Math.max(m, p.id), 0);
    products.push({ id: maxId + 1, ...data });
  }

  saveProducts(products);
  closeModal();
  renderProductsTable();
  renderPriceTable();
  renderDashboard();
});

function deleteProduct(id) {
  if (!confirm('Delete this product? This cannot be undone.')) return;
  const products = getProducts().filter(p => p.id !== id);
  saveProducts(products);
  renderProductsTable();
  renderPriceTable();
  renderDashboard();
}

/* ── PRICE TABLE ──────────────────────────────────────────── */
function renderPriceTable() {
  const products = getProducts();
  document.getElementById('price-tbody').innerHTML = products.map(p => `
    <tr>
      <td>
        <strong>${p.name_en}</strong>
        ${p.name_hi ? `<br><small style="color:#888;">${p.name_hi}</small>` : ''}
      </td>
      <td><span class="badge badge-${p.cat}">${catLabel(p.cat)}</span></td>
      <td>
        <input type="text"
          class="price-input"
          data-id="${p.id}"
          value="${p.price}"
          style="width:100%;padding:6px 10px;border:1.5px solid #E0D5CC;border-radius:4px;font-family:inherit;font-size:0.83rem;font-weight:700;color:#7B1C1C;">
      </td>
    </tr>`).join('');
}

function saveAllPrices() {
  const products = getProducts();
  document.querySelectorAll('.price-input').forEach(inp => {
    const id  = parseInt(inp.dataset.id);
    const idx = products.findIndex(p => p.id === id);
    if (idx !== -1) products[idx].price = inp.value.trim() || 'Contact for Price';
  });
  saveProducts(products);
  markPricesUpdated();
  renderProductsTable();
  renderDashboard();
  const n = document.getElementById('price-save-notice');
  n.classList.add('show');
  setTimeout(() => n.classList.remove('show'), 3000);
}

function bulkMarkUpdated() {
  markPricesUpdated();
  renderDashboard();
  alert('Prices marked as updated: ' + getLastUpdate());
}

/* ── CONTACT FORM ─────────────────────────────────────────── */
function loadContactForm() {
  const c = getContact();
  document.getElementById('c-phone1').value    = c.phone1;
  document.getElementById('c-phone2').value    = c.phone2;
  document.getElementById('c-email').value     = c.email;
  document.getElementById('c-address').value   = c.address;
  document.getElementById('c-hours').value     = c.hours;
  document.getElementById('c-whatsapp').value  = c.whatsapp;
}

document.getElementById('contact-form').addEventListener('submit', e => {
  e.preventDefault();
  saveContact({
    phone1:   document.getElementById('c-phone1').value.trim(),
    phone2:   document.getElementById('c-phone2').value.trim(),
    email:    document.getElementById('c-email').value.trim(),
    address:  document.getElementById('c-address').value.trim(),
    hours:    document.getElementById('c-hours').value.trim(),
    whatsapp: document.getElementById('c-whatsapp').value.trim(),
  });
  const n = document.getElementById('contact-save-notice');
  n.classList.add('show');
  setTimeout(() => n.classList.remove('show'), 3000);
});

/* ── PASSWORD ─────────────────────────────────────────────── */
document.getElementById('pw-form').addEventListener('submit', e => {
  e.preventDefault();
  const cur   = document.getElementById('pw-current').value;
  const nw    = document.getElementById('pw-new').value;
  const conf  = document.getElementById('pw-confirm').value;
  const errEl = document.getElementById('pw-err');

  errEl.style.display = 'none';

  if (cur !== getAdminPw()) {
    errEl.textContent = 'Current password is incorrect.';
    errEl.style.display = 'block'; return;
  }
  if (nw.length < 6) {
    errEl.textContent = 'New password must be at least 6 characters.';
    errEl.style.display = 'block'; return;
  }
  if (nw !== conf) {
    errEl.textContent = 'New passwords do not match.';
    errEl.style.display = 'block'; return;
  }

  localStorage.setItem(PW_KEY, nw);
  document.getElementById('pw-form').reset();
  const n = document.getElementById('pw-save-notice');
  n.classList.add('show');
  setTimeout(() => n.classList.remove('show'), 3000);
});

/* ── CLOSE MODAL ON OVERLAY CLICK ───────────────────────────*/
document.getElementById('product-modal').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal();
});
