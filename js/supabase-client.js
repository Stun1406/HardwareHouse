/* ============================================================
   Hardware House — Supabase Client
   All database/auth operations. Falls back gracefully if
   SUPABASE_URL / SUPABASE_ANON_KEY are not set in config.js
   ============================================================ */

const _sb = (typeof SUPABASE_URL !== 'undefined' && SUPABASE_URL && SUPABASE_ANON_KEY)
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

/** Returns true if Supabase credentials are configured */
function sbEnabled() { return !!_sb; }

/* ── Auth ─────────────────────────────────────────────────── */
async function sbSignIn(email, password) {
  const { data, error } = await _sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function sbSignOut() {
  if (_sb) await _sb.auth.signOut();
}

async function sbGetSession() {
  if (!_sb) return null;
  const { data: { session } } = await _sb.auth.getSession();
  return session;
}

function sbOnAuthChange(cb) {
  if (!_sb) return;
  _sb.auth.onAuthStateChange((_event, session) => cb(session));
}

/* ── Products ─────────────────────────────────────────────── */
async function sbGetProducts() {
  if (!_sb) return null;
  const { data, error } = await _sb.from('products').select('*').order('id');
  if (error) { console.warn('Supabase products:', error.message); return null; }
  return data;
}

async function sbSaveProduct(product) {
  if (!_sb) throw new Error('Supabase not configured');
  const { id, ...fields } = product;
  fields.updated_at = new Date().toISOString();
  if (id) {
    const { data, error } = await _sb.from('products').update(fields).eq('id', id).select().single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await _sb.from('products').insert(fields).select().single();
    if (error) throw error;
    return data;
  }
}

async function sbDeleteProduct(id) {
  if (!_sb) throw new Error('Supabase not configured');
  const { error } = await _sb.from('products').delete().eq('id', id);
  if (error) throw error;
}

/* ── Contact ──────────────────────────────────────────────── */
async function sbGetContact() {
  if (!_sb) return null;
  const { data, error } = await _sb.from('contact').select('*').eq('id', 1).single();
  if (error) { console.warn('Supabase contact:', error.message); return null; }
  return data;
}

async function sbSaveContact(contact) {
  if (!_sb) throw new Error('Supabase not configured');
  const { error } = await _sb.from('contact')
    .upsert({ id: 1, ...contact, updated_at: new Date().toISOString() });
  if (error) throw error;
}

/* ── Settings ─────────────────────────────────────────────── */
async function sbGetSetting(key) {
  if (!_sb) return null;
  const { data } = await _sb.from('settings').select('value').eq('key', key).single();
  return data?.value ?? null;
}

async function sbSetSetting(key, value) {
  if (!_sb) return;
  const { error } = await _sb.from('settings')
    .upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) console.warn('Settings save:', error.message);
}

/* ── Image Upload ─────────────────────────────────────────── */
async function sbUploadImage(file, productId) {
  if (!_sb) throw new Error('Supabase not configured');
  const ext  = file.name.split('.').pop().toLowerCase();
  const path = `products/product-${productId}.${ext}`;
  const { error } = await _sb.storage.from('product-images')
    .upload(path, file, { cacheControl: '3600', upsert: true, contentType: file.type });
  if (error) throw error;
  const { data: { publicUrl } } = _sb.storage.from('product-images').getPublicUrl(path);
  return publicUrl;
}

/* ── Full sync on page load ───────────────────────────────── */
async function syncFromSupabase() {
  if (!_sb) return;
  try {
    const [products, contact, lastUpdate] = await Promise.all([
      sbGetProducts(),
      sbGetContact(),
      sbGetSetting('last_price_update'),
    ]);
    if (products)   saveProducts(products);
    if (contact)    saveContact(contact);
    if (lastUpdate && lastUpdate !== '—') localStorage.setItem('hw_last_update', lastUpdate);
  } catch (err) {
    console.warn('Supabase sync failed, using cached data:', err.message);
  }
}
