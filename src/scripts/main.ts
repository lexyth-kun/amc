import { initMotionCore } from './motion-core';
import { initHeaderAndMenu } from './header-menu';
import { initPreloader } from './preloader';
import { initMilestoneBInteractions } from './ui-interactions';

function boot(): void {
  initMotionCore();
  initHeaderAndMenu();
  initMilestoneBInteractions();

  initPreloader(() => {
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
