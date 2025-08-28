// script.js — Logiciel de données, rendu et édition
// - Charge les données depuis data.json (si disponible) sinon utilise DEFAULT_DATA
// - Présentation (index.html) et Éditeur (edit.html) partagent le même moteur
// - Aucune dépendance externe, commentaires en français

// Données par défaut (peuvent être écrasées par localStorage ou import JSON)
const DEFAULT_DATA = {
  company: { name: "EDS Québec", email: "contact@edsquebec.com", phone: "819 323 7859" },
  product: { name: "Li-CUBE PRO™", variant: "24V 105Ah" },
  hero: {
    title: "Remplacez le Ni-Cd : divisez vos coûts sur 20 ans.",
    subtitle: "Batterie LFP industrielle — cycles élevés, charge rapide, zéro maintenance, monitoring."
  },
  images: {
    company: "images/edsQuebec.png",
    logo: "images/logo edsquebec.png",
    product: "images/Li-CUBE PRO.png",
    competitor: "images/NiCd.png",
    madeInQc: "images/logo-fabrique-BqFMdtDT.png"
  },
  badges: {
    madeInQuebec: true,
    certifications: ["UN38.3", "CSA", "UL1973", "UL9540A"]
  },
  marketing: {
    bullets: [
      "4× plus de cycles, 1/3 du poids.",
      "Zéro maintenance. Zéro surprise.",
      "Charge rapide 1–2 h, disponibilité accrue.",
      "Monitoring complet: GPS, alertes, cloud local.",
      "Boîtier métal IP65, usage industriel.",
      "Conçu pour le Canada: −40 °C à +55 °C.",
      "TCO imbattable sur 20 ans.",
      "Installation simple, rétrofit rapide.",
      "Sécurité avancée: BMS multi-protections.",
      "Fabrication locale, service proche."
    ],
    whyNow: ["Coûts cachés Ni-Cd", "Conformité environnementale", "Monitoring & data"]
  },
  pages: {
    vente: {
      hero: {
        title: "Investissez dans une énergie qui performe.",
        subtitle: "Réduisez vos coûts sur 20 ans avec Li‑CUBE PRO™."
      },
      marketing: {
        bullets: [
          "ROI accéléré: moins de remplacements, plus d’activité.",
          "Puissance stable et sûre pour l’industrie.",
          "Boîtier métal IP65: robuste et durable.",
          "Poids réduit: efficacité logistique accrue.",
          "Sécurité BMS: protections multi‑niveaux.",
          "Fabrication locale et service rapide.",
          "Pilotage par la donnée (télémétrie).",
          "Intégration facile sur votre flotte.",
          "Coût par cycle imbattable.",
          "Remplacement Ni‑Cd sans compromis."
        ],
        whyNow: ["Optimisez votre TCO", "Sécurisez vos opérations", "Gagnez en disponibilité"]
      }
    },
    location: {
      hero: {
        title: "Passez à la performance sans immobiliser de capital.",
        subtitle: "Location simple et prévisible, support local inclus."
      },
      marketing: {
        bullets: [
          "Mensualités prévisibles, zéro surprise.",
          "Disponibilité maximale: maintenance planifiée.",
          "Mise à niveau facile selon vos besoins.",
          "Pilotage par la donnée: décisions plus rapides.",
          "Charge rapide: plus d’opérations par jour.",
          "Fabrication locale: délais réduits.",
          "Sécurité et conformité industrielles.",
          "Installation et intégration simplifiées.",
          "Accompagnement par nos équipes.",
          "Alternative moderne au Ni‑Cd."
        ],
        whyNow: ["Simplifiez vos budgets", "Accélérez sans risque", "Montez en performance"]
      }
    }
  },
  pricing: {
    sale: { priceMinCad: 5000, priceMaxCad: 5500, monitoringMonthlyCad: 25 },
    rental: { monthlyMinCad: 150, monthlyMaxCad: 200, installationFeeCad: 500 }
  },
  features: {
    lfpAdvantages: [
      "Durée de vie ≥ 8000 cycles à 80 % DOD",
      "Charge 1–2 h (≈ 100 A)",
      "Zéro maintenance (équilibrage & BMS)",
      "Connectivité (Bluetooth/Wi‑Fi/GPRS)",
      "Poids réduit, densité énergétique élevée",
      "Boîtier métal, IP65",
      "Auto-chauffage pour le froid canadien",
      "TCO très compétitif",
      "Sécurité: OVP/UVP/OCP/OTP/court-circuit",
      "Fabrication locale et SAV" 
    ],
    nicdWeaknesses: [
      "3 remplacements sur 20 ans",
      "Poids élevé (~80 kg)",
      "Charge lente (8–12 h)",
      "Maintenance régulière (électrolyte, visites)",
      "Aucune connectivité native",
      "DOD utile ≈ 60 %",
      "TCO élevé (matériel + maintenance)",
      "Cadmium (impact environnemental)",
      "Encombrement plus important"
    ]
  },
  comparison: {
    li: {
      energyWh: 2520,
      lifetimeCycles: 8000,
      replacements20y: 0,
      massWhPerKg: 110,
      volWhPerL: 161,
      dodUsefulPercent: 96,
      fastChargeHours: 2,
      maintenanceVisitsPerYear: 0,
      weightKg: 23,
      tcoPurchaseCad: 11000,
      tcoRentalCad: 42000,
      connectivityScore: 1
    },
    nicd: {
      energyWh: 2400,
      lifetimeCycles: 2500,
      replacements20y: 3,
      massWhPerKg: 30,
      volWhPerL: 27,
      dodUsefulPercent: 60,
      fastChargeHours: 10,
      maintenanceVisitsPerYear: 2,
      weightKg: 80,
      tcoPurchaseCad: 60000,
      tcoRentalCad: 60000,
      connectivityScore: 0
    },
    labels: {
      energyWh: "Énergie (Wh)",
      lifetimeCycles: "Durée de vie (cycles)",
      weightKg: "Poids (kg)",
      dodUsefulPercent: "Profondeur de décharge utile (%)",
      fastChargeHours: "Temps de charge (h)",
      maintenanceVisitsPerYear: "Visites de maintenance/an",
      volWhPerL: "Densité volumique (Wh/L)",
      replacements20y: "Remplacements sur 20 ans",
      tcoPurchaseCad: "TCO achat 20 ans (CAD)",
      tcoRentalCad: "TCO location 20 ans (CAD)",
      connectivityScore: "Connectivité (score)"
    }
  },
  legal: { disclaimer: "Caractéristiques et valeurs indicatives susceptibles d’évolution." }
};

const STORAGE_KEY = 'edsquebec_li_cube_pro_data_v1';

// Utilitaires
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const deepClone = (v) => JSON.parse(JSON.stringify(v));
const byId = (id) => document.getElementById(id);

async function tryLoadDataJson() {
  // Tente de charger data.json (même origine). Si échec (ex: file://), bascule sur DEFAULT_DATA.
  try {
    const res = await fetch('data.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('data.json non disponible');
    const json = await res.json();
    return json;
  } catch (e) {
    return deepClone(DEFAULT_DATA);
  }
}

function loadLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function saveLocal(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
function resetLocal() { localStorage.removeItem(STORAGE_KEY); }

function mergeData(base, override) {
  // Fusion superficielle sûre (pour ce projet)
  const out = deepClone(base);
  if (!override) return out;
  return Object.assign(out, override, {
    company: Object.assign({}, base.company, override.company || {}),
    product: Object.assign({}, base.product, override.product || {}),
    hero: Object.assign({}, base.hero, override.hero || {}),
    images: Object.assign({}, base.images, override.images || {}),
    badges: Object.assign({}, base.badges, override.badges || {}),
    marketing: Object.assign({}, base.marketing, override.marketing || {}),
    pages: {
      vente: {
        hero: Object.assign({}, base.pages?.vente?.hero, override.pages?.vente?.hero || {}),
        marketing: Object.assign({}, base.pages?.vente?.marketing, override.pages?.vente?.marketing || {})
      },
      location: {
        hero: Object.assign({}, base.pages?.location?.hero, override.pages?.location?.hero || {}),
        marketing: Object.assign({}, base.pages?.location?.marketing, override.pages?.location?.marketing || {})
      }
    },
    pricing: {
      sale: Object.assign({}, base.pricing?.sale, override.pricing?.sale || {}),
      rental: Object.assign({}, base.pricing?.rental, override.pricing?.rental || {})
    },
    features: Object.assign({}, base.features, override.features || {}),
    comparison: {
      li: Object.assign({}, base.comparison.li, (override.comparison||{}).li || {}),
      nicd: Object.assign({}, base.comparison.nicd, (override.comparison||{}).nicd || {}),
      labels: Object.assign({}, base.comparison.labels, (override.comparison||{}).labels || {})
    },
    legal: Object.assign({}, base.legal, override.legal || {})
  });
}

function validateData(d) {
  // Contrôles légers pour les numériques
  const numPaths = [
    'comparison.li.energyWh','comparison.nicd.energyWh',
    'comparison.li.lifetimeCycles','comparison.nicd.lifetimeCycles',
    'comparison.li.weightKg','comparison.nicd.weightKg',
    'comparison.li.dodUsefulPercent','comparison.nicd.dodUsefulPercent',
    'comparison.li.fastChargeHours','comparison.nicd.fastChargeHours',
    'comparison.li.replacements20y','comparison.nicd.replacements20y',
    'comparison.li.volWhPerL','comparison.nicd.volWhPerL',
    'comparison.li.tcoPurchaseCad','comparison.nicd.tcoPurchaseCad',
    'comparison.li.tcoRentalCad','comparison.nicd.tcoRentalCad',
    'comparison.li.connectivityScore','comparison.nicd.connectivityScore'
  ];
  for (const p of numPaths) {
    const parts = p.split('.');
    let ref = d;
    for (const k of parts) ref = ref[k];
    if (typeof ref !== 'number' || Number.isNaN(ref) || ref < 0) {
      throw new Error(`Valeur invalide: ${p}`);
    }
  }
  return d;
}

function applyVariant(data, variant) {
  if (!variant) return data;
  const v = (data.pages && data.pages[variant]) || {};
  const merged = mergeData(data, {
    hero: v.hero || {},
    marketing: v.marketing || {}
  });
  merged._variant = variant;
  return merged;
}

function normalizePair(a, b, invert=false) {
  // Normalise deux valeurs vers [0..1]. Si invert=true, plus petit est meilleur (ex: temps de charge)
  const max = Math.max(a, b) || 1;
  let va = a / max, vb = b / max;
  if (invert) { va = 1 - va; vb = 1 - vb; }
  return [Math.max(0, Math.min(1, va)), Math.max(0, Math.min(1, vb))];
}

function formatCurrency(n) {
  try { return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(n); }
  catch { return `${n} CAD`; }
}

function renderPresentation(root, data) {
  root.innerHTML = '';

  // Héros
  const hero = document.createElement('section');
  hero.className = 'section hero'; hero.id = 'hero';
  hero.innerHTML = `
    <div class="grid">
      <div>
        <div class="kicker">${data.product.name} — ${data.product.variant || ''}</div>
        <h1>${data.hero.title}</h1>
        <p class="subtitle">${data.hero.subtitle || ''}</p>
        <div class="badges">
          ${data.badges.madeInQuebec ? `<span class="badge"><img src="${data.images.madeInQc}" alt="Fabriqué au Québec" loading="lazy"/>Fabriqué au Québec</span>` : ''}
          ${(data.badges.certifications||[]).map(c=>`<span class="badge">${c}</span>`).join('')}
        </div>
        
      </div>
      <div>
        <img src="${data.images.product}" alt="${data.product.name}" loading="lazy"/>
      </div>
    </div>`;
  root.appendChild(hero);

  // Bénéfices "coup de poing"
  const benefits = document.createElement('section');
  benefits.className = 'section'; benefits.id = 'benefits';
  benefits.innerHTML = `
    <h2>Bénéfices coup de poing</h2>
    <div class="cards">
      ${(data.marketing.bullets||[]).map(b=>`<div class="card">${b}</div>`).join('')}
    </div>`;
  root.appendChild(benefits);

  // Pourquoi maintenant ?
  const why = document.createElement('section');
  why.className = 'section'; why.id = 'why';
  why.innerHTML = `
    <h2>Pourquoi maintenant ?</h2>
    <div class="cards">
      ${(data.marketing.whyNow||[]).map(b=>`<div class=card>${b}</div>`).join('')}
    </div>`;
  root.appendChild(why);

  // Comparatif interactif
  const cmp = document.createElement('section');
  cmp.className = 'section'; cmp.id = 'compare';
  const L = data.comparison.labels;
  const li = data.comparison.li; const ni = data.comparison.nicd;
  const metrics = [
    ['energyWh', false],
    ['lifetimeCycles', false],
    ['weightKg', true],
    ['dodUsefulPercent', false],
    ['fastChargeHours', true],
    ['maintenanceVisitsPerYear', true],
    ['volWhPerL', false],
    ['replacements20y', true],
    ['tcoPurchaseCad', true],
    ['tcoRentalCad', true],
    ['connectivityScore', false]
  ];
  const metricHtml = metrics.map(([k, invert]) => {
    const [va, vb] = normalizePair(li[k], ni[k], invert);
    const fmt = (key, val) => (key.includes('tco') ? formatCurrency(val) : val);
    return `
      <div class="metric" role="group" aria-label="${L[k]}">
        <h4>${L[k]}</h4>
        <div class="labelline"><span>Li-CUBE PRO™</span><span>${fmt(k, li[k])}</span></div>
        <div class="bar" aria-hidden="true"><div class="fill" style="width:${Math.round(va*100)}%"></div></div>
        <div class="labelline"><span>Ni-Cd</span><span>${fmt(k, ni[k])}</span></div>
        <div class="bar" aria-hidden="true"><div class="fill alt ${invert? 'neg':''}" style="width:${Math.round(vb*100)}%"></div></div>
      </div>`;
  }).join('');
  cmp.innerHTML = `
    <h2>Comparatif</h2>
    <div class="compare-grid">${metricHtml}</div>`;
  root.appendChild(cmp);

  // Conçu pour le Canada
  const ca = document.createElement('section');
  ca.className = 'section'; ca.id = 'canada';
  ca.innerHTML = `
    <h2>Conçu pour le Canada</h2>
    <div class="cards">
      ${[
        "Résistant aux conditions climatiques exigeantes",
        "Auto‑chauffage intégré",
        "Service local et SAV rapide"
      ].map(x=>`<div class='card'>${x}</div>`).join('')}
    </div>`;
  root.appendChild(ca);

  // Tarification par variante
  const v = data._variant;
  if (v === 'vente' && data.pricing?.sale) {
    const p = data.pricing.sale;
    const sec = document.createElement('section');
    sec.className = 'section';
    sec.innerHTML = `
      <h2>Tarification — Achat</h2>
      <div class="cards">
        <div class="card"><strong>Prix d’achat</strong><br>${formatCurrency(p.priceMinCad)} à ${formatCurrency(p.priceMaxCad)} (selon options)</div>
        <div class="card"><strong>Monitoring (option)</strong><br>${formatCurrency(p.monitoringMonthlyCad)}/mois</div>
      </div>`;
    root.appendChild(sec);
  } else if (v === 'location' && data.pricing?.rental) {
    const r = data.pricing.rental;
    const sec = document.createElement('section');
    sec.className = 'section';
    sec.innerHTML = `
      <h2>Tarification — Location</h2>
      <div class="cards">
        <div class="card"><strong>Mensualité</strong><br>${formatCurrency(r.monthlyMinCad)} à ${formatCurrency(r.monthlyMaxCad)}/mois</div>
        <div class="card"><strong>Installation</strong><br>${formatCurrency(r.installationFeeCad)} (frais uniques)</div>
      </div>`;
    root.appendChild(sec);
  }

  // Mention légale (facultative)
  if (data.legal?.disclaimer) {
    const legal = document.createElement('section');
    legal.className = 'section';
    legal.innerHTML = `<p style="color:var(--muted)">${data.legal.disclaimer}</p>`;
    root.appendChild(legal);
  }

  // Entrées progressives des sections
  revealSections(root);
}

function setupPreziLikeTransitions(container) {
  // Zoom léger au scroll + parallax sur images principales
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      const y = window.scrollY;
      const scale = 1 - Math.min(0.015, y / 10000);
      container.style.transform = `scale(${scale.toFixed(3)})`;
      const heroImg = container.querySelector('#hero img');
      if (heroImg) heroImg.style.transform = `translateY(${Math.round(y*0.03)}px)`;
      ticking = false;
    });
  }, { passive: true });
}

function revealSections(container) {
  const sections = container.querySelectorAll('.section');
  sections.forEach(s => s.classList.add('reveal'));
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) e.target.classList.add('in');
    }
  }, { threshold: 0.15 });
  sections.forEach(s => io.observe(s));
}

function mountPreview(previewEl, data) {
  // Monte la même présentation dans un conteneur dédié (éditeur)
  const root = document.createElement('div');
  root.className = 'story';
  renderPresentation(root, data);
  previewEl.innerHTML = '';
  previewEl.appendChild(root);
}

function bindForm(form, data, onChange) {
  // Mappe quelques champs (y compris tableaux via textarea)
  const set = (name, value) => {
    const path = name.split('.');
    let ref = data;
    for (let i=0;i<path.length-1;i++) ref = ref[path[i]] || (ref[path[i]]={});
    ref[path[path.length-1]] = value;
  };
  const get = (name) => {
    const path = name.split('.');
    let ref = data; for (const k of path) ref = ref?.[k];
    return ref;
  };

  // Préremplissage
  [...form.elements].forEach(el => {
    if (!el.name) return;
    const v = get(el.name);
    if (typeof v === 'boolean' && el.type === 'checkbox') el.checked = v;
    else if (Array.isArray(v) && el.tagName === 'TEXTAREA') el.value = v.join('\n');
    else if (typeof v !== 'object' && v != null) el.value = v;
  });

  form.addEventListener('input', (e) => {
    const t = e.target;
    if (!t.name) return;
    let val = t.value;
    if (t.type === 'number') val = Number(val);
    if (t.type === 'checkbox') val = t.checked;
    if (t.tagName === 'TEXTAREA' && (t.name.includes('bullets') || t.name.includes('Advantages') || t.name.includes('Weaknesses') || t.name.includes('certifications') || t.name.includes('whyNow'))){
      val = t.value.split('\n').map(s=>s.trim()).filter(Boolean);
    }
    set(t.name, val);
    onChange(data);
  });
}

function wireEditorActions({ data, onData, form, previewEl }) {
  byId('save-btn').addEventListener('click', () => {
    try { validateData(data); saveLocal(data); alert('Enregistré dans le navigateur.'); }
    catch (e) { alert(e.message); }
  });
  byId('export-btn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'data.json'; a.click(); URL.revokeObjectURL(a.href);
  });
  byId('import-input').addEventListener('change', async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const text = await file.text();
    try {
      const json = JSON.parse(text);
      validateData(json);
      const merged = mergeData(DEFAULT_DATA, json);
      saveLocal(merged);
      location.reload();
    } catch (err) { alert('Fichier JSON invalide.'); }
  });
  byId('reset-btn').addEventListener('click', async () => {
    if (!confirm('Réinitialiser aux valeurs par défaut ?')) return;
    resetLocal();
    location.reload();
  });
}

const App = {
  async initPresentation({ mountId, variant }) {
    const root = byId(mountId);
    const src = await tryLoadDataJson();
    const local = loadLocal();
    let data = mergeData(src, local);
    data = applyVariant(data, variant);
    validateData(data);
    renderPresentation(root, data);
    setupPreziLikeTransitions(root);
    // Ajuste le nom de marque dans la nav + footer
    const brand = document.getElementById('brand-name');
    const foot = document.getElementById('footer-company');
    if (brand) brand.textContent = data.company.name || 'EDS Québec';
    if (foot) foot.textContent = data.company.name || 'EDS Québec';
    const small = document.querySelector('.site-footer small');
    if (small && (data.company.email || data.company.phone)) {
      const parts = [];
      if (data.company.email) parts.push(data.company.email);
      if (data.company.phone) parts.push(data.company.phone);
      small.insertAdjacentHTML('beforeend', ` — ${parts.join(' • ')}`);
    }
  },

  async initEditor({ formId, previewId, variant }) {
    const form = byId(formId);
    const previewEl = byId(previewId);
    const src = await tryLoadDataJson();
    const local = loadLocal();
    let data = mergeData(src, local);
    data = applyVariant(data, variant);
    validateData(data);

    const onChange = (d) => { mountPreview(previewEl, applyVariant(d, variant)); };
    bindForm(form, data, onChange);
    wireEditorActions({ data, onData: onChange, form, previewEl });
    mountPreview(previewEl, data);
  }
};

window.App = App;
