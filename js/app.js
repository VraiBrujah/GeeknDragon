// Animation fade-up
document.querySelectorAll('.fade-up').forEach(el=>{
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){ entry.target.classList.add('animate'); }
    });
  },{threshold:.1});
  observer.observe(el);
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
  const videos = [
    document.getElementById('video1'),
    document.getElementById('video2'),
    document.getElementById('video3')
  ];
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
    const vid = document.getElementById(btn.dataset.video);
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
    const plusBtn = document.querySelector(`.quantity-btn.plus[data-target="${id}"]`);
    if (plusBtn) {
      plusBtn.disabled = max != null && qty >= max;
    }
  };

  document.querySelectorAll('.quantity-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.target;
      const qtySpan = document.getElementById('qty-' + id);
      if (!qtySpan) return;
      let qty = parseInt(qtySpan.textContent, 10) || 1;
      const max = stock[id];
      if (btn.classList.contains('minus')) {
        qty = Math.max(1, qty - 1);
      } else if (max == null || qty < max) {
        qty++;
      }
      qtySpan.textContent = qty;
      const addBtn = document.querySelector(`.btn-shop[data-item-id="${id}"]`);
      if (addBtn) {
        addBtn.setAttribute('data-item-quantity', qty.toString());
      }
      updatePlus(id);
    });
  });

  document.querySelectorAll('.quantity-selector').forEach(sel => {
    updatePlus(sel.dataset.id);
  });

  document.querySelectorAll('.multiplier-select').forEach(sel => {
    const id = sel.dataset.target;
    const addBtn = document.querySelector(`.btn-shop[data-item-id="${id}"]`);
    const update = () => {
      if (addBtn) {
        addBtn.setAttribute('data-item-custom1-value', sel.value);
      }
    };
    update();
    sel.addEventListener('change', update);
  });
});

// Slider: navigation et zoom
function initSlider(selector) {
  document.querySelectorAll(selector).forEach(slider => {
    const slides = Array.from(slider.querySelectorAll('.slide-frame .slide'));
    if (!slides.length) return;
    let index = 0;

    const show = (i) => {
      slides[index].classList.remove('active');
      index = (i + slides.length) % slides.length;
      slides[index].classList.add('active');
    };

    const prev = slider.querySelector('.slide-prev');
    const next = slider.querySelector('.slide-next');
    prev && prev.addEventListener('click', () => show(index - 1));
    next && next.addEventListener('click', () => show(index + 1));

    slides.forEach(img => {
      img.addEventListener('click', () => {
        img.classList.toggle('zoomed');
      });
    });

    slides[0].classList.add('active');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initSlider('.slider');
});
