const THEME_KEY = 'afritalent-theme';

function applyTheme(theme) {
  if (theme === 'light') {
    document.body.classList.add('light-mode');
    document.body.classList.remove('dark-mode');
  } else {
    document.body.classList.remove('light-mode');
    document.body.classList.add('dark-mode');
  }
  updateToggleBtn(theme);
}

function updateToggleBtn(theme) {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  if (theme === 'light') {
    btn.innerHTML = '🌙 Mode sombre';
    btn.setAttribute('aria-label', 'Activer le mode sombre');
  } else {
    btn.innerHTML = '☀️ Mode clair';
    btn.setAttribute('aria-label', 'Activer le mode clair');
  }
}

function toggleTheme() {
  const current = localStorage.getItem(THEME_KEY) || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
}

// Appliquer le thème sauvegardé dès le chargement (avant même le DOM complet)
(function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) || 'dark';
  applyTheme(saved);
})();

/* -------------------------------------------------------
   2. NAVBAR DYNAMIQUE AU SCROLL
      - Fond opaque + ombre après 80px
      - Effet shrink (taille réduite)
   ------------------------------------------------------- */
const navbar = document.querySelector('.navbar');

function handleNavbarScroll() {
  if (!navbar) return;
  if (window.scrollY > 80) {
    navbar.classList.add('navbar--scrolled');
  } else {
    navbar.classList.remove('navbar--scrolled');
  }
}

/* -------------------------------------------------------
   3. BOUTON RETOUR EN HAUT
   ------------------------------------------------------- */
function createBackToTopBtn() {
  const btn = document.createElement('button');
  btn.id = 'backToTop';
  btn.innerHTML = '↑';
  btn.setAttribute('aria-label', 'Retour en haut de page');
  document.body.appendChild(btn);
  return btn;
}

const backToTopBtn = createBackToTopBtn();

function handleBackToTop() {
  if (window.scrollY > 400) {
    backToTopBtn.classList.add('visible');
  } else {
    backToTopBtn.classList.remove('visible');
  }
}

backToTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* -------------------------------------------------------
   4. ÉCOUTEURS D'ÉVÉNEMENTS
   ------------------------------------------------------- */
window.addEventListener('scroll', () => {
  handleNavbarScroll();
  handleBackToTop();
}, { passive: true });

document.addEventListener('DOMContentLoaded', () => {

  // Bouton toggle thème dans la navbar
  const themeBtn = document.getElementById('themeToggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', toggleTheme);
  }

  // Lancer les vérifications initiales (cas où la page est déjà scrollée au chargement)
  handleNavbarScroll();
  handleBackToTop();

  // Fermer le menu mobile au clic sur un lien
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  const navCollapse = document.getElementById('navMain');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navCollapse && navCollapse.classList.contains('show')) {
        const bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
        if (bsCollapse) bsCollapse.hide();
      }
    });
  });
})

function animateCounter(el) {
  const rawText = el.textContent.trim();

  // Extraire la partie numérique et le suffixe (+, %, etc.)
  const match = rawText.match(/^([\d\s]+)([^\d\s]*)$/);
  if (!match) return; // format non reconnu (ex: décimal géré ailleurs)

  const numericPart = match[1].replace(/\s/g, '');
  const suffix = match[2] || '';
  const target = parseInt(numericPart, 10);

  if (isNaN(target)) return;

  const duration = 1800; // ms
  const startTime = performance.now();

  function formatNumber(num) {
    return num.toLocaleString('fr-FR');
  }

  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing "ease-out" pour ralentir en fin de course
    const eased = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.floor(eased * target);

    el.textContent = formatNumber(currentValue) + suffix;

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = formatNumber(target) + suffix;
    }
  }

  requestAnimationFrame(tick);
}

/**
 * Gère les compteurs au format décimal type "4,9 ★" ou "4,9%"
 */
function animateDecimalCounter(el) {
  const rawText = el.textContent.trim();
  const match = rawText.match(/^(\d+),(\d+)(.*)$/);
  if (!match) return;

  const intPart = parseInt(match[1], 10);
  const decPart = match[2];
  const suffix = match[3] || '';
  const target = parseFloat(`${intPart}.${decPart}`);

  const duration = 1800;
  const startTime = performance.now();

  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const currentValue = (eased * target).toFixed(decPart.length);

    el.textContent = currentValue.replace('.', ',') + suffix;

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = target.toFixed(decPart.length).replace('.', ',') + suffix;
    }
  }

  requestAnimationFrame(tick);
}

function initCounters() {
  const counterSelectors = [
    '.hero__stat-num',
    '.chiffres strong'
  ];

  const counterEls = document.querySelectorAll(counterSelectors.join(', '));
  if (counterEls.length === 0) return;

  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;

        if (el.dataset.counted === 'true') return;
        el.dataset.counted = 'true';

        const text = el.textContent.trim();

        if (/^\d+,\d+/.test(text)) {
          animateDecimalCounter(el);
        } else {
          animateCounter(el);
        }

        observer.unobserve(el);
      }
    });
  }, {
    threshold: 0.4,
    rootMargin: '0px 0px -50px 0px'
  });

  counterEls.forEach(el => counterObserver.observe(el));
}

/* -------------------------------------------------------
   2. FADE-IN DES SECTIONS AU SCROLL
   ------------------------------------------------------- */
function initFadeInSections() {
  const fadeEls = document.querySelectorAll('.fade-in-section');
  if (fadeEls.length === 0) return;

  const fadeObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -60px 0px'
  });

  fadeEls.forEach(el => fadeObserver.observe(el));
}

/* -------------------------------------------------------
   3. INITIALISATION
   ------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  initCounters();
  initFadeInSections();
});