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
 function initFiltrageFreelances() {
  const selectCategorie = document.getElementById('filtre-categorie');
  const selectPays      = document.getElementById('filtre-pays');
  const inputBudget     = document.getElementById('filtre-budget');
  const btnFiltrer      = document.getElementById('btn-filtrer');
  const btnReset        = document.getElementById('btn-reinitialiser');
  const liste           = document.getElementById('freelances-liste');
  const titre           = document.getElementById('resultats-titre');
  const aucunResultat    = document.getElementById('aucun-resultat');

  if (!liste || !selectCategorie) return; // pas sur freelances.html

  const cartes = Array.from(liste.querySelectorAll('article'));

  function appliquerFiltres() {
    const categorie = selectCategorie.value;
    const pays = selectPays.value;
    const budgetMax = inputBudget.value ? parseFloat(inputBudget.value) : null;

    let visibles = 0;

    cartes.forEach(carte => {
      const carteCategorie = carte.dataset.categorie;
      const cartePays = carte.dataset.pays;
      const carteBudget = parseFloat(carte.dataset.budget);

      const matchCategorie = !categorie || carteCategorie === categorie;
      const matchPays = !pays || cartePays === pays;
      const matchBudget = budgetMax === null || isNaN(budgetMax) || carteBudget <= budgetMax;

      const estVisible = matchCategorie && matchPays && matchBudget;

      if (estVisible) {
        carte.style.display = '';
        carte.classList.remove('carte-cachee');
        visibles++;
      } else {
        carte.style.display = 'none';
        carte.classList.add('carte-cachee');
      }
    });

    if (titre) {
      const pluriel = visibles > 1 ? 's' : '';
      titre.textContent = `Résultats — ${visibles} freelance${pluriel} trouvé${pluriel}`;
    }

    if (aucunResultat) {
      aucunResultat.hidden = visibles !== 0;
    }
  }

  if (btnFiltrer) {
    btnFiltrer.addEventListener('click', appliquerFiltres);
  }

  // Filtrage en temps réel
  selectCategorie.addEventListener('change', appliquerFiltres);
  selectPays.addEventListener('change', appliquerFiltres);
  inputBudget.addEventListener('input', appliquerFiltres);

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      selectCategorie.value = '';
      selectPays.value = '';
      inputBudget.value = '';
      appliquerFiltres();
    });
  }
}

/* -------------------------------------------------------
   2. VALIDATION DU FORMULAIRE DE CONTACT
   ------------------------------------------------------- */
function initValidationFormulaire() {
  const form = document.getElementById('contact-form');
  if (!form) return; // pas sur contact.html

  const champNom       = document.getElementById('nom');
  const champEmail     = document.getElementById('email');
  const champTelephone = document.getElementById('telephone');
  const champSujet     = document.getElementById('sujet');
  const champMessage   = document.getElementById('message');
  const champRgpd      = document.getElementById('rgpd');
  const successBox     = document.getElementById('form-success');

  const MESSAGE_MIN_LENGTH = 20;
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const TEL_REGEX = /^[\d\s+\-().]{8,20}$/;

  function afficherErreur(champId, message) {
    const errorEl = document.getElementById(`error-${champId}`);
    const inputEl = document.getElementById(champId);
    if (errorEl) errorEl.textContent = message;
    if (inputEl) inputEl.classList.add('input-error');
  }

  function effacerErreur(champId) {
    const errorEl = document.getElementById(`error-${champId}`);
    const inputEl = document.getElementById(champId);
    if (errorEl) errorEl.textContent = '';
    if (inputEl) inputEl.classList.remove('input-error');
  }

  function effacerToutesLesErreurs() {
    ['nom', 'email', 'telephone', 'sujet', 'message', 'rgpd'].forEach(effacerErreur);
  }

  function validerFormulaire() {
    effacerToutesLesErreurs();
    let estValide = true;

    // --- Nom ---
    const nomValeur = champNom.value.trim();
    if (nomValeur.length === 0) {
      afficherErreur('nom', 'Le nom complet est requis.');
      estValide = false;
    } else if (nomValeur.length < 2) {
      afficherErreur('nom', 'Le nom doit contenir au moins 2 caractères.');
      estValide = false;
    }

    // --- Email (regex) ---
    const emailValeur = champEmail.value.trim();
    if (emailValeur.length === 0) {
      afficherErreur('email', "L'adresse email est requise.");
      estValide = false;
    } else if (!EMAIL_REGEX.test(emailValeur)) {
      afficherErreur('email', 'Veuillez saisir une adresse email valide (ex: nom@domaine.com).');
      estValide = false;
    }

    // --- Téléphone (optionnel) ---
    const telValeur = champTelephone.value.trim();
    if (telValeur.length > 0 && !TEL_REGEX.test(telValeur)) {
      afficherErreur('telephone', 'Veuillez saisir un numéro de téléphone valide.');
      estValide = false;
    }

    // --- Sujet ---
    if (champSujet.value === '') {
      afficherErreur('sujet', 'Veuillez choisir un sujet.');
      estValide = false;
    }

    // --- Message (min 20 caractères) ---
    const messageValeur = champMessage.value.trim();
    if (messageValeur.length === 0) {
      afficherErreur('message', 'Le message est requis.');
      estValide = false;
    } else if (messageValeur.length < MESSAGE_MIN_LENGTH) {
      afficherErreur(
        'message',
        `Le message doit contenir au moins ${MESSAGE_MIN_LENGTH} caractères (actuellement ${messageValeur.length}).`
      );
      estValide = false;
    }

    // --- RGPD ---
    if (!champRgpd.checked) {
      afficherErreur('rgpd', 'Vous devez accepter la politique de confidentialité.');
      estValide = false;
    }

    return estValide;
  }

  // Validation en temps réel au blur
  [champNom, champEmail, champTelephone, champSujet, champMessage].forEach(champ => {
    champ.addEventListener('blur', () => {
      const id = champ.id;
      effacerErreur(id);

      if (id === 'nom') {
        const v = champ.value.trim();
        if (v.length === 0) afficherErreur('nom', 'Le nom complet est requis.');
        else if (v.length < 2) afficherErreur('nom', 'Le nom doit contenir au moins 2 caractères.');
      }

      if (id === 'email') {
        const v = champ.value.trim();
        if (v.length === 0) afficherErreur('email', "L'adresse email est requise.");
        else if (!EMAIL_REGEX.test(v)) afficherErreur('email', 'Veuillez saisir une adresse email valide (ex: nom@domaine.com).');
      }

      if (id === 'telephone') {
        const v = champ.value.trim();
        if (v.length > 0 && !TEL_REGEX.test(v)) afficherErreur('telephone', 'Veuillez saisir un numéro de téléphone valide.');
      }

      if (id === 'sujet') {
        if (champ.value === '') afficherErreur('sujet', 'Veuillez choisir un sujet.');
      }

      if (id === 'message') {
        const v = champ.value.trim();
        if (v.length === 0) afficherErreur('message', 'Le message est requis.');
        else if (v.length < MESSAGE_MIN_LENGTH) {
          afficherErreur('message', `Le message doit contenir au moins ${MESSAGE_MIN_LENGTH} caractères (actuellement ${v.length}).`);
        }
      }
    });
  });

  // Soumission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (successBox) successBox.hidden = true;

    const valide = validerFormulaire();

    if (valide) {
      if (successBox) {
        successBox.hidden = false;
        successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      form.reset();
      effacerToutesLesErreurs();
    } else {
      const premiereErreur = form.querySelector('.input-error');
      if (premiereErreur) {
        premiereErreur.scrollIntoView({ behavior: 'smooth', block: 'center' });
        premiereErreur.focus();
      }
    }
  });
}

/* -------------------------------------------------------
   3. INITIALISATION
   ------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  initFiltrageFreelances();
  initValidationFormulaire();
});