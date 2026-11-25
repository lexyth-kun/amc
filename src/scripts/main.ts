import { initMotionCore } from './motion-core';
import { initHeaderAndMenu } from './header-menu';
import { initPreloader } from './preloader';
import { initMilestoneBInteractions } from './ui-interactions';

function boot(): void {
  initMotionCore();
  initHeaderAndMenu();
  initMilestoneBInteractions();

  initPreloader(() => {
    void Promise.all([import('./hero-scene'), import('./cinematic-tunnel')]).then(
      ([{ initHeroScene }, { initCinematicTunnel }]) => {
        initHeroScene();
        initCinematicTunnel();
      }
    );
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
