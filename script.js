let animationObserver = new IntersectionObserver((entries)=> {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("show")
        }else{        
            entry.target.classList.remove("show")
        }
    })
}, {
    threshold : 1
})

document.querySelectorAll(".scroll-animation").forEach(Element => animationObserver.observe(Element))


function showMailPopup() {
    navigator.clipboard.writeText('winey.monteur@gmail.com')
    document.querySelector(".info").classList.add("show-info")
    setTimeout(() => {
        document.querySelector(".info").classList.remove("show-info")
    }, 1500);
}



/* =============================================
   CAROUSEL AVIS CLIENTS — carousel-avis.js
   Tous les querySelector sont scoped aux IDs
   rc- et aux classes .rc- uniquement.
============================================= */

(function () {
  'use strict';

  /* ── Star renderer ── */
  function starSVG(type) {
    const base = `<svg class="rc-star ${type}" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">`;
    const pathFull  = `<path d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.49L10 14.27l-4.94 2.43.94-5.49-4-3.9 5.53-.8L10 1.5z"`;
    if (type === 'full') {
      return base + pathFull + ` class="front"/></svg>`;
    } else if (type === 'half') {
      return base
        + pathFull + ` class="back"/>`
        + `<path d="M10 1.5v12.77l-4.94 2.43.94-5.49-4-3.9 5.53-.8L10 1.5z" class="front"/>`
        + `</svg>`;
    } else {
      return base + pathFull + ` class="front"/></svg>`;
    }
  }

  document.querySelectorAll('.rc-stars[data-rating]').forEach(function (el) {
    const rating = parseFloat(el.dataset.rating);
    let html = '';
    for (let i = 1; i <= 5; i++) {
      if (rating >= i)           html += starSVG('full');
      else if (rating >= i - 0.5) html += starSVG('half');
      else                        html += starSVG('empty');
    }
    el.innerHTML = html;
  });

  /* ── Fix vidéos sans src : affiche le placeholder ── */
  document.querySelectorAll('.rc-card__video video').forEach(function (v) {
    const isEmpty = !v.currentSrc || v.currentSrc === window.location.href;
    if (isEmpty) {
      v.style.display = 'none';
      const ph = v.closest('.rc-card__video').querySelector('.rc-video-placeholder');
      if (ph) ph.style.display = 'flex';
    }
  });

  /* ── Carousel ── */
  const track   = document.getElementById('rc-track');
  const dotsEl  = document.getElementById('rc-dots');
  const prevBtn = document.getElementById('rc-prev');
  const nextBtn = document.getElementById('rc-next');

  if (!track || !dotsEl || !prevBtn || !nextBtn) return;

  let current  = 0;
  let autoplay = null;

  function getVisible() {
    const w = window.innerWidth;
    if (w >= 1100) return 3;
    if (w >= 700)  return 2;
    return 1;
  }

  function getCardWidth() {
    const card = track.querySelector('.rc-card');
    if (!card) return 0;
    const gap = parseFloat(getComputedStyle(track).gap) || 20;
    return card.offsetWidth + gap;
  }

  function getTotal() {
    return track.children.length;
  }

  function getMaxIndex() {
    return Math.max(0, getTotal() - getVisible());
  }

  function buildDots() {
    dotsEl.innerHTML = '';
    const count = getMaxIndex() + 1;
    for (let i = 0; i < count; i++) {
      const btn = document.createElement('button');
      btn.className = 'rc-dot' + (i === current ? ' active' : '');
      btn.setAttribute('aria-label', 'Page ' + (i + 1));
      btn.addEventListener('click', function () { goTo(i); resetAuto(); });
      dotsEl.appendChild(btn);
    }
  }

  function goTo(idx) {
    current = Math.max(0, Math.min(idx, getMaxIndex()));
    track.style.transform = 'translateX(-' + (current * getCardWidth()) + 'px)';
    dotsEl.querySelectorAll('.rc-dot').forEach(function (d, i) {
      d.classList.toggle('active', i === current);
    });
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current >= getMaxIndex();
  }

  prevBtn.addEventListener('click', function () { goTo(current - 1); resetAuto(); });
  nextBtn.addEventListener('click', function () { goTo(current + 1); resetAuto(); });

  /* ── Swipe / drag ── */
  let startX     = 0;
  let isDragging = false;

  track.addEventListener('pointerdown', function (e) {
    startX     = e.clientX;
    isDragging = true;
  });

  track.addEventListener('pointerup', function (e) {
    if (!isDragging) return;
    isDragging = false;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 40) {
      dx < 0 ? goTo(current + 1) : goTo(current - 1);
    }
    resetAuto();
  });

  track.addEventListener('pointercancel', function () {
    isDragging = false;
  });

  /* ── Autoplay ── */
  function startAuto() {
    autoplay = setInterval(function () {
      goTo(current < getMaxIndex() ? current + 1 : 0);
    }, 7000);
  }

  function resetAuto() {
    clearInterval(autoplay);
    startAuto();
  }

  /* ── Resize ── */
  window.addEventListener('resize', function () {
    buildDots();
    goTo(Math.min(current, getMaxIndex()));
  });

  /* ── Init ── */
  buildDots();
  goTo(0);
  startAuto();

})();

// Auto yt video

let player;

// 1️⃣ Crée le player YouTube
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '360',
    width: '640',
    videoId: 'PO-BS5-K4io', // mets ton ID YouTube
    playerVars: {
      mute: 1,          // autoplay possible seulement si muet
      autoplay: 0,      // pas de play direct
      playsinline: 1,   // iOS inline
    },
    events: {
      'onReady': onPlayerReady
    }
  });
}

// 2️⃣ Quand le player est prêt
function onPlayerReady(event) {
  const iframe = event.target.getIframe();

  let isPlaying = false;

  // 3️⃣ Intersection Observer pour jouer/pause selon visibilité
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !isPlaying) {
        isPlaying = true;
        player.playVideo(); // play propre
      }
      if (!entry.isIntersecting && isPlaying) {
        isPlaying = false;
        player.pauseVideo(); // pause propre
      }
    });
  }, { threshold: 0.6 }); // visible à 60%

  observer.observe(iframe);
}

const popup = document.getElementById('video-popup');
const iframe = document.getElementById('popup-iframe');
const closeBtn = document.getElementById('popup-close');

// récupère tous les boutons
document.querySelectorAll('.rc-play-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    // récupère l'URL de la vidéo depuis un data attribute
    // exemple : <button class="rc-play-btn" data-video="https://www.youtube.com/embed/ID">Voir la vidéo</button>
    const videoURL = btn.getAttribute('data-video');

    iframe.src = videoURL + "?autoplay=1&mute=1"; // autoplay + mute pour que ça marche partout
    popup.style.display = "flex"; // ouvre le popup
  });
});

// fermer popup
closeBtn.addEventListener('click', () => {
  iframe.src = ""; // reset pour stopper la vidéo
  popup.style.display = "none";
});

// optionnel : fermer si clique hors de la vidéo
popup.addEventListener('click', e => {
  if(e.target === popup){
    iframe.src = "";
    popup.style.display = "none";
  }
});