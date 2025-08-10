// Gestion des traductions simples
document.addEventListener('DOMContentLoaded', () => {
  const translationsReady = true; // traductions prêtes
  const switcher = document.getElementById('lang-switcher');
  const defaultLang = 'fr';
  const available = ['fr', 'en'];
  let lang = localStorage.getItem('lang') || defaultLang;
  if (!available.includes(lang)) lang = defaultLang;
  document.documentElement.lang = lang;

  if (switcher) {
    if (!translationsReady || available.length < 2) {
      switcher.classList.add('hidden');
    } else {
      switcher.classList.remove('hidden');
      const btns = switcher.querySelectorAll('button[data-lang]');
      btns.forEach(btn => {
        if (btn.dataset.lang === lang) {
          btn.classList.remove('opacity-50');
        }
        btn.addEventListener('click', () => {
          localStorage.setItem('lang', btn.dataset.lang);
          location.reload();
        });
      });
    }
  }

  fetch(`/translations/${lang}.json`)
    .then(res => res.json())
    .then(data => {
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const keys = el.dataset.i18n.split('.');
        let text = data;
        keys.forEach(k => { if (text) text = text[k]; });
        if (text) el.textContent = text;
      });
    })
    .catch(() => {
      if (switcher) switcher.classList.add('hidden');
    });
});

// Lecture en boucle de la vidéo héro
document.addEventListener('DOMContentLoaded', () => {
  const hero = document.getElementById('hero-video');
  if (!hero) return;
  hero.loop = true;
  hero.addEventListener('ended', () => {
    hero.currentTime = 0;
    hero.play();
  });
});

// Animation fade-up
document.querySelectorAll('.fade-up').forEach(el=>{
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){ entry.target.classList.add('animate'); }
    });
  },{threshold:.1});
  observer.observe(el);
});

// Menu mobile avec focus trap
document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!menuBtn || !mobileMenu) return;

  const focusableSelectors = 'a[href], button:not([disabled]), select, textarea, input, [tabindex]:not([tabindex="-1"])';
  let focusable = [];
  let firstEl, lastEl;

  const setFocusable = () => {
    focusable = Array.from(mobileMenu.querySelectorAll(focusableSelectors));
    firstEl = focusable[0];
    lastEl = focusable[focusable.length - 1];
  };

  const trapFocus = e => {
    if (e.key !== 'Tab') return;
    if (focusable.length === 0) return;
    if (e.shiftKey) {
      if (document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      }
    } else {
      if (document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }
  };

  const openMenu = () => {
    mobileMenu.classList.remove('hidden');
    menuBtn.setAttribute('aria-expanded', 'true');
    mobileMenu.setAttribute('aria-hidden', 'false');
    setFocusable();
    if (firstEl) firstEl.focus();
    document.addEventListener('keydown', trapFocus);
  };

  const closeMenu = () => {
    mobileMenu.classList.add('hidden');
    menuBtn.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.removeEventListener('keydown', trapFocus);
    menuBtn.focus();
  };

  menuBtn.addEventListener('click', () => {
    if (menuBtn.getAttribute('aria-expanded') === 'true') {
      closeMenu();
    } else {
      openMenu();
    }
  });

  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') {
      closeMenu();
    }
  });
});

/* -------------------------------------------------------
   Geek & Dragon – Vidéos séquentielles + audio dès geste
   ------------------------------------------------------- */

// Élément 100 % visible ?
function fullyVisible(el) {
  const r = el.getBoundingClientRect();
  return r.top >= 0 && r.left >= 0 &&
         r.bottom <= (innerHeight || document.documentElement.clientHeight) &&
         r.right  <= (innerWidth  || document.documentElement.clientWidth);
}

document.addEventListener('DOMContentLoaded', () => {

  /* ----- Vidéos et état ----- */
  const videos = ['video1', 'video2', 'video3']
    .map(id => document.getElementById(id))
    .filter(Boolean);
  let current = 0;          // index vidéo active
  let audioOK = false;      // passe à true après 1 geste

  /* ---------- Détection de n’importe quel geste ---------- */
  const enableAudio = () => {
    if (audioOK) return;
    audioOK = true;
    // Si une vidéo est en cours -> dé-mute
    const v = videos[current];
    if (v && !v.paused) { v.muted = false; updateBtn(v); }
  };
  // liste de gestes qui comptent comme « user activation »
  ['click','touchstart','keydown','wheel'].forEach(evt =>
    window.addEventListener(evt, enableAudio, { once:true, passive:true })
  );

  /* ---------- Bouton mute / unmute ---------- */
  function updateBtn(vid) {
    const b = document.querySelector(`.mute-btn[data-video="${vid.id}"]`);
    if (b) b.textContent = vid.muted ? '🔇' : '🔊';
  }
  document.querySelectorAll('.mute-btn').forEach(btn => {
    const vid = videos.find(v => v.id === btn.dataset.video);
    if (!vid) return;
    btn.addEventListener('click', e => {
      e.stopPropagation();
      vid.muted = !vid.muted;
      updateBtn(vid);
    });
  });

  /* ---------- Lecture séquentielle ---------- */
  function playSeq(idx) {
    const vid = videos[idx];
    if (!vid) return;

    // pause tout le reste
    videos.forEach((v,i)=>{ if (i!==idx){ v.pause(); v.currentTime=0; } });

    // Observateur : lance quand 100 % visible
    const io = new IntersectionObserver(ent=>{
      if (ent[0].isIntersecting && fullyVisible(vid)) {
        io.disconnect();
        start(vid);
      }
    }, { threshold: 1 });
    io.observe(vid);
  }

  function start(vid) {
    vid.muted = !audioOK;      // son si geste déjà fait
    vid.currentTime = 0;
    vid.play().then(()=>{
      if (audioOK) { vid.muted = false; }
      updateBtn(vid);
    }).catch(()=>{            // blocage → joue muet
      vid.muted = true;
      vid.play();
      updateBtn(vid);
    });

    vid.onended = () => {
      current++;
      if (current < videos.length) playSeq(current);
    };
  }

  /* ---------- Clic vidéo = play/pause manuels ---------- */
  videos.forEach((vid, idx) => {
    vid.addEventListener('click', () => {
      if (vid.paused) {
        if (!audioOK) enableAudio(); // active son au 1ᵉʳ geste
        current = idx;
        start(vid);
      } else {
        vid.pause();
      }
    });
  });

  /* ---------- Lance la première dès qu’elle apparaît ---------- */
  playSeq(current);
});



/* -------------------------------------------------------
   Geek & Dragon – boutique
   ------------------------------------------------------- */


// Gestion des sélecteurs de quantité sur la boutique
document.addEventListener('DOMContentLoaded', () => {
  const stock = window.stock || {};

  const updatePlus = (id) => {
    const max = stock[id];
    const qty = parseInt(document.getElementById('qty-' + id)?.textContent || '1', 10);
    const multiplier = parseInt(document.querySelector(`.multiplier-select[data-target="${id}"]`)?.value || '1', 10);
    const total = qty * multiplier;
    const plusBtn = document.querySelector(`.quantity-btn.plus[data-target="${id}"]`);
    const addBtn = document.querySelector(`.btn-shop[data-item-id="${id}"]`);
    const over = max != null && (max <= 0 || total >= max);
    const hidePrice = addBtn?.dataset.hidePrice !== undefined;
    const unitPrice = addBtn ? parseFloat(addBtn.dataset.itemPrice || '0') : 0;
    const priceText = unitPrice ? `Ajouter — ${unitPrice * total} $` : 'Ajouter';
    if (plusBtn) {
      const nextTotal = (qty + 1) * multiplier;
      plusBtn.disabled = max != null && (max <= 0 || nextTotal > max);
      plusBtn.title = plusBtn.disabled ? 'Stock insuffisant' : '';
    }
    if (addBtn) {
      addBtn.disabled = over;
      addBtn.title = over ? 'Stock insuffisant' : '';
      if (over) {
        addBtn.textContent = 'Stock insuffisant';
      } else {
        addBtn.textContent = hidePrice ? 'Ajouter' : priceText;
      }
    }
  };
  window.updatePlus = updatePlus;

  document.querySelectorAll('.quantity-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.target;
      const qtySpan = document.getElementById('qty-' + id);
      if (!qtySpan) return;
      let qty = parseInt(qtySpan.textContent, 10) || 1;
      const max = stock[id];
      const multiplier = parseInt(document.querySelector(`.multiplier-select[data-target="${id}"]`)?.value || '1', 10);
      if (btn.classList.contains('minus')) {
        qty = Math.max(1, qty - 1);
      } else if (max == null || (qty + 1) * multiplier <= max) {
        qty++;
      }
      qtySpan.textContent = qty;
      const addBtn = document.querySelector(`.btn-shop[data-item-id="${id}"]`);
      const total = qty * multiplier;
      if (addBtn) {
        addBtn.setAttribute('data-item-quantity', total.toString());
      }
      updatePlus(id);
    });
  });

  document.querySelectorAll('.quantity-selector').forEach(sel => {
    updatePlus(sel.dataset.id);
  });

  // Couverture des produits sans sélecteur de quantité
  document.querySelectorAll('.btn-shop[data-item-id]').forEach(btn => {
    const id = btn.dataset.itemId;
    if (!document.querySelector(`.quantity-selector[data-id="${id}"]`)) {
      updatePlus(id);
    }
  });

  document.querySelectorAll('.multiplier-select').forEach(sel => {
    const id = sel.dataset.target;
    const addBtn = document.querySelector(`.btn-shop[data-item-id="${id}"]`);
    const update = () => {
      const qty = parseInt(document.getElementById('qty-' + id)?.textContent || '1', 10);
      const mult = parseInt(sel.value, 10);
      if (addBtn) {
        addBtn.setAttribute('data-item-custom1-value', sel.value);
        addBtn.setAttribute('data-item-quantity', (qty * mult).toString());
      }
      updatePlus(id);
    };
    update();
    sel.addEventListener('change', update);
  });
});

// Initialisation des carrousels Swiper
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.swiper').forEach(sw => {
    if (sw.classList.contains('swiper-thumbs')) return;
    const container = sw.parentElement;
    const thumbsEl = container.querySelector('.swiper-thumbs');
    if (thumbsEl) {
      const thumbsSwiper = new Swiper(thumbsEl, {
        slidesPerView: 4,
        freeMode: true,
        watchSlidesProgress: true,
      });
      new Swiper(sw, {
        loop: true,
        autoplay: { delay: 5000 },
        pagination: { el: sw.querySelector('.swiper-pagination'), clickable: true },
        navigation: {
          nextEl: sw.querySelector('.swiper-button-next'),
          prevEl: sw.querySelector('.swiper-button-prev'),
        },
        thumbs: {
          swiper: thumbsSwiper,
        },
      });
    } else {
      new Swiper(sw, {
        loop: true,
        autoplay: { delay: 5000 },
        pagination: { el: sw.querySelector('.swiper-pagination'), clickable: true },
        navigation: {
          nextEl: sw.querySelector('.swiper-button-next'),
          prevEl: sw.querySelector('.swiper-button-prev'),
        },
      });
    }
  });
  if (window.Fancybox) {
    Fancybox.bind('[data-fancybox]', {
      backdrop: 'blur',
      dragToClose: true,
      closeButton: 'top',
      placeFocusBack: true,
      on: {
        close: () => history.back(),
      },
    });
  }
});


