/* ============================================================
   Hardware House — Product & Contact Data (localStorage)
   ============================================================ */

const DEFAULT_PRODUCTS = [
  /* ── Aluminium Sections ── */
  { id:1,  cat:'sections',    name_en:'Aluminium Angle',        name_hi:'एल्युमिनियम एंगल',
    desc_en:'Structural L-shaped aluminium angle profiles available in multiple sizes for fabrication and construction.',
    desc_hi:'निर्माण और फैब्रिकेशन के लिए विभिन्न आकारों में L-आकार की एल्युमिनियम एंगल प्रोफाइल।',
    price:'₹185/kg', featured:true },

  { id:2,  cat:'sections',    name_en:'Aluminium Channels',     name_hi:'एल्युमिनियम चैनल',
    desc_en:'Standard C and U channel profiles for industrial, window, and architectural applications.',
    desc_hi:'औद्योगिक, खिड़की और वास्तुशिल्प अनुप्रयोगों के लिए मानक C और U चैनल प्रोफाइल।',
    price:'₹190/kg', featured:true },

  { id:3,  cat:'sections',    name_en:'Aluminium Pipes',        name_hi:'एल्युमिनियम पाइप',
    desc_en:'Round and square hollow aluminium pipes in multiple wall thickness and diameter options.',
    desc_hi:'कई दीवार मोटाई और व्यास विकल्पों में गोल और चौकोर खोखले एल्युमिनियम पाइप।',
    price:'₹195/kg', featured:true },

  { id:4,  cat:'sections',    name_en:'Aluminium Flat Bars',    name_hi:'एल्युमिनियम फ्लैट बार',
    desc_en:'Flat bar profiles in various widths and thicknesses for general-purpose use and fabrication.',
    desc_hi:'सामान्य उपयोग और फैब्रिकेशन के लिए विभिन्न चौड़ाई और मोटाई में फ्लैट बार प्रोफाइल।',
    price:'₹182/kg', featured:true },

  { id:5,  cat:'sections',    name_en:'Aluminium T-Section',    name_hi:'एल्युमिनियम T-सेक्शन',
    desc_en:'T-shaped profiles for joining, edge trimming, and structural connections.',
    desc_hi:'जोड़ने, किनारे ट्रिमिंग और संरचनात्मक कनेक्शन के लिए T-आकार की प्रोफाइल।',
    price:'₹188/kg', featured:false },

  { id:6,  cat:'sections',    name_en:'Aluminium Square Bar',   name_hi:'एल्युमिनियम स्क्वायर बार',
    desc_en:'Solid square aluminium bars for machining, custom fabrication, and engineering projects.',
    desc_hi:'मशीनिंग, कस्टम फैब्रिकेशन और इंजीनियरिंग प्रोजेक्ट के लिए ठोस चौकोर एल्युमिनियम बार।',
    price:'₹192/kg', featured:false },

  /* ── Aluminium Sheets ── */
  { id:7,  cat:'sheets',      name_en:'Plain Aluminium Sheet',  name_hi:'सादी एल्युमिनियम शीट',
    desc_en:'Smooth plain sheets in 0.5 mm–6 mm thickness, ideal for cladding, roofing, and panels.',
    desc_hi:'क्लैडिंग, छत और पैनल के लिए आदर्श, 0.5 mm–6 mm मोटाई में चिकनी सादी एल्युमिनियम शीट।',
    price:'₹210/kg', featured:false },

  { id:8,  cat:'sheets',      name_en:'Chequered Plate',        name_hi:'चेकर्ड प्लेट',
    desc_en:'Anti-slip chequered aluminium plates for flooring, ramps, and industrial use.',
    desc_hi:'फर्श, रैम्प और औद्योगिक उपयोग के लिए एंटी-स्लिप चेकर्ड एल्युमिनियम प्लेट।',
    price:'₹225/kg', featured:false },

  { id:9,  cat:'sheets',      name_en:'Aluminium Coil',         name_hi:'एल्युमिनियम कोइल',
    desc_en:'Aluminium coils for roll forming, industrial manufacturing, and custom orders.',
    desc_hi:'रोल फॉर्मिंग, औद्योगिक निर्माण और कस्टम ऑर्डर के लिए एल्युमिनियम कोइल।',
    price:'Contact for Price', featured:false },

  /* ── Aluminium Hardware ── */
  { id:10, cat:'hardware',    name_en:'Aluminium Bolts & Nuts', name_hi:'एल्युमिनियम बोल्ट और नट',
    desc_en:'Aluminium and SS fasteners in all standard sizes for structural and panel connections.',
    desc_hi:'संरचनात्मक और पैनल कनेक्शन के लिए सभी मानक आकारों में एल्युमिनियम और SS फास्टनर।',
    price:'₹450/kg', featured:false },

  { id:11, cat:'hardware',    name_en:'Aluminium Brackets',     name_hi:'एल्युमिनियम ब्रैकेट',
    desc_en:'L-brackets, corner brackets, and custom mounting brackets for aluminium structures.',
    desc_hi:'एल्युमिनियम संरचनाओं के लिए L-ब्रैकेट, कॉर्नर ब्रैकेट और कस्टम माउंटिंग ब्रैकेट।',
    price:'₹380/kg', featured:false },

  /* ── Hardware Accessories ── */
  { id:12, cat:'accessories', name_en:'Hinges & Handles',       name_hi:'हिंज और हैंडल',
    desc_en:'Quality aluminium and SS hinges, door handles, window stays, and cabinet pulls.',
    desc_hi:'गुणवत्तापूर्ण एल्युमिनियम और SS हिंज, दरवाजे के हैंडल, खिड़की स्टे और कैबिनेट पुल।',
    price:'Contact for Price', featured:false },

  { id:13, cat:'accessories', name_en:'Glass Channels & Clips', name_hi:'ग्लास चैनल और क्लिप',
    desc_en:'U-channels and clips for glass fitting in windows, doors, and glass partitions.',
    desc_hi:'खिड़कियों, दरवाजों और ग्लास विभाजन में कांच की फिटिंग के लिए U-चैनल और क्लिप।',
    price:'₹165/kg', featured:false },
];

const DEFAULT_CONTACT = {
  phone1:    '0731-4040490',
  phone2:    '0731-2369678',
  email:     'hardwarehouse1972@gmail.com',
  address:   '22, Jawahar Marg, Opp. Saifee Hotel, Indore – 7 (M.P.)',
  hours:     'Monday to Saturday: 9:00 AM – 7:00 PM',
  whatsapp:  '919827013786',
};

/* ── storage helpers ── */
function getProducts() {
  try {
    const s = localStorage.getItem('hw_products');
    return s ? JSON.parse(s) : DEFAULT_PRODUCTS;
  } catch { return DEFAULT_PRODUCTS; }
}

function saveProducts(arr) {
  localStorage.setItem('hw_products', JSON.stringify(arr));
}

function getContact() {
  try {
    const s = localStorage.getItem('hw_contact');
    return s ? JSON.parse(s) : DEFAULT_CONTACT;
  } catch { return DEFAULT_CONTACT; }
}

function saveContact(obj) {
  localStorage.setItem('hw_contact', JSON.stringify(obj));
}

function getLastUpdate() {
  return localStorage.getItem('hw_last_update') || '—';
}

function markPricesUpdated() {
  const now = new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
  localStorage.setItem('hw_last_update', now);
  return now;
}

function getCurrentLang() { return localStorage.getItem('hw_lang') || 'en'; }
function setLang(l)       { localStorage.setItem('hw_lang', l); }
