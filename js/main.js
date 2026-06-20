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