/**
 * Module Anti-mise en veille (Screen Wake Lock) pour PWA / Photobooth
 */
(function initPhotoboothWakeLock() {
  let wakeLock = null;

  // 1. Demande de maintien de l'écran allumé
  async function requestWakeLock() {
    // Vérification de la compatibilité du navigateur
    if ('wakeLock' in navigator) {
      try {
        wakeLock = await navigator.wakeLock.request('screen');
        console.log('✅ Photobooth : Écran verrouillé en mode allumé.');

        // Événement déclenché si l'OS coupe le verrou (changement d'appli, batterie critique, etc.)
        wakeLock.addEventListener('release', () => {
          console.warn('⚠️ Photobooth : Le verrou anti-veille a été relâché.');
          wakeLock = null;
        });
      } catch (err) {
        console.error(`❌ Photobooth : Erreur Wake Lock (${err.name}) : ${err.message}`);
      }
    } else {
      console.warn("⚠️ Ce navigateur ne supporte pas l'API Screen Wake Lock.");
    }
  }

  // 2. Tentative d'activation au chargement initial du DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', requestWakeLock);
  } else {
    requestWakeLock();
  }

  // 3. Déblocage sur première interaction
  // La plupart des navigateurs mobiles exigent un geste utilisateur pour autoriser le Wake Lock
  const triggerWakeLockOnInteraction = () => {
    if (!wakeLock) {
      requestWakeLock();
    }
    // Nettoyage des écouteurs une fois la première action passée
    ['pointerdown', 'touchstart', 'click'].forEach((event) => {
      document.removeEventListener(event, triggerWakeLockOnInteraction);
    });
  };

  ['pointerdown', 'touchstart', 'click'].forEach((event) => {
    document.addEventListener(event, triggerWakeLockOnInteraction, { passive: true });
  });

  // 4. Réactivation automatique au retour au premier plan
  // Si l'utilisateur bascule brièvement sur une autre application ou éteint/rallume l'écran
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      requestWakeLock();
    }
  });
})();
