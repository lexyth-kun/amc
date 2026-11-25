import { initMotionCore } from './motion-core';
import { initHeaderAndMenu } from './header-menu';
import { initPreloader } from './preloader';

function boot(): void {
  initMotionCore();
  initHeaderAndMenu();

  initPreloader(() => {
    // Lazy-load Three.js Hero scene after preloader completes to keep initial JS lightweight
    void import('./hero-scene').then(({ initHeroScene }) => {
      initHeroScene();
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
