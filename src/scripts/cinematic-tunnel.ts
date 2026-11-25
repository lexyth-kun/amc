import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { computeTunnelPhaseState, type TunnelPhaseState } from '@/utils/tunnel-phases';
import { detectRenderMode, getAdaptiveObjectBudget } from '@/utils/webgl-support';
import { createCinematicCanvas2DRenderer } from './cinematic-fallback-2d';

gsap.registerPlugin(ScrollTrigger);

const TUNNEL_LOGOS = [
  { name: 'ChatGPT', src: '/logo-chatgpt.webp' },
  { name: 'Claude', src: '/logo-claude.svg' },
  { name: 'Adobe', src: '/logo-adobe.webp' },
  { name: 'Canva', src: '/logo-canva.webp' },
  { name: 'Netflix', src: '/logo-netflix.webp' },
  { name: 'Spotify', src: '/logo-spotify.webp' },
  { name: 'MLBB', src: '/logo-mlbb.webp' },
];

export function initCinematicTunnel(): () => void {
  const section = document.getElementById('dunia-baru');
  const pinStage = document.getElementById('cinematic-pin-stage');
  const canvas = document.getElementById('cinematic-canvas') as HTMLCanvasElement | null;
  const phase1Wrap = document.getElementById('cinematic-phase1');
  const phase2Wrap = document.getElementById('cinematic-phase2');
  const whiteoutEl = document.getElementById('cinematic-whiteout');
  const phase4Copy = document.getElementById('cinematic-phase4-copy');

  if (!section || !pinStage || !canvas || !whiteoutEl || !phase4Copy) {
    return () => {};
  }

  const p1Words = Array.from(section.querySelectorAll<HTMLElement>('.cinematic-p1-word'));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reduced motion: disable pin/scrub and render clean static layout
  if (reduced) {
    pinStage.style.height = 'auto';
    pinStage.classList.add('py-20', 'flex-col', 'gap-12');
    canvas.style.display = 'none';
    whiteoutEl.style.position = 'relative';
    whiteoutEl.style.opacity = '1';
    whiteoutEl.style.pointerEvents = 'auto';
    whiteoutEl.classList.add('rounded-card', 'py-14', 'mt-8', 'mx-4');
    return () => {};
  }

  const navWithMemory = navigator as Navigator & { deviceMemory?: number };
  const budget = getAdaptiveObjectBudget({
    viewportWidth: window.innerWidth,
    deviceMemoryGb: navWithMemory.deviceMemory,
    dpr: window.devicePixelRatio || 1,
  });

  const mode = detectRenderMode({ prefersReducedMotion: false });
  canvas.dataset.renderMode = mode;

  const applyDomOverlayState = (state: TunnelPhaseState) => {
    if (phase1Wrap) {
      phase1Wrap.style.opacity = state.phase1Opacity.toFixed(3);
      phase1Wrap.style.transform = `translate3d(0, ${((1 - state.phase1WordProgress) * 18).toFixed(1)}px, 0)`;
    }

    p1Words.forEach((word, idx) => {
      const localStart = idx * 0.16;
      const localProgress = Math.max(0, Math.min(1, (state.phase1WordProgress - localStart) / 0.52));
      const yPct = (1 - localProgress) * 110;
      word.style.transform = `translate3d(0, ${yPct.toFixed(1)}%, 0)`;
    });

    if (phase2Wrap) {
      phase2Wrap.style.opacity = state.phase2Opacity.toFixed(3);
    }

    whiteoutEl.style.opacity = state.whiteoutOpacity.toFixed(3);
    whiteoutEl.style.pointerEvents = state.whiteoutOpacity > 0.85 ? 'auto' : 'none';

    const p4Y = (1 - state.phase4RevealProgress) * 36;
    phase4Copy.style.opacity = state.phase4RevealProgress.toFixed(3);
    phase4Copy.style.transform = `translate3d(0, ${p4Y.toFixed(1)}px, 0)`;

    if (state.whiteoutOpacity >= 0.95) {
      document.body.style.backgroundColor = '#FFFFFF';
    }
  };

  let renderVisualState: (state: TunnelPhaseState) => void;
  let cleanupRenderer: () => void;

  if (mode === 'canvas2d') {
    const fallback = createCinematicCanvas2DRenderer(canvas);
    renderVisualState = fallback.renderState;
    cleanupRenderer = fallback.destroy;
  } else {
    try {
      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(budget.maxDpr);
      renderer.setClearColor(0x061a3a, 1);

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x061a3a, 0.026);

      const camera = new THREE.PerspectiveCamera(56, 1, 0.1, 110);
      camera.position.set(0, 0, 14);

      const ambient = new THREE.AmbientLight(0x7dd3fc, 1.4);
      scene.add(ambient);

      const coreLight = new THREE.PointLight(0x38bdf8, 12, 48);
      coreLight.position.set(0, 0, 4);
      scene.add(coreLight);

      // Central AMC glowing orb (core + outer aura shell)
      const orbGroup = new THREE.Group();
      const orbCoreGeom = new THREE.SphereGeometry(0.95, 32, 32);
      const orbCoreMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        emissive: 0x38bdf8,
        emissiveIntensity: 1.4,
        roughness: 0.08,
        clearcoat: 1,
      });
      const orbCore = new THREE.Mesh(orbCoreGeom, orbCoreMat);
      orbGroup.add(orbCore);

      const orbAuraGeom = new THREE.SphereGeometry(1.42, 28, 28);
      const orbAuraMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.28,
      });
      const orbAura = new THREE.Mesh(orbAuraGeom, orbAuraMat);
      orbGroup.add(orbAura);
      scene.add(orbGroup);

      // Sky-blue perspective light tunnel rings
      const tunnelGroup = new THREE.Group();
      const ringGeom = new THREE.TorusGeometry(4.2, 0.032, 8, 48);
      const ringMeshes: THREE.Mesh[] = [];
      for (let i = 0; i < 22; i++) {
        const ringMat = new THREE.MeshBasicMaterial({
          color: i % 3 === 0 ? 0xffffff : i % 2 === 0 ? 0x38bdf8 : 0x1a36ff,
          transparent: true,
          opacity: 0.42,
        });
        const ring = new THREE.Mesh(ringGeom, ringMat);
        ring.position.z = 6 - i * 2.4;
        ring.rotation.z = i * 0.22;
        tunnelGroup.add(ring);
        ringMeshes.push(ring);
      }
      scene.add(tunnelGroup);

      // Starfield particle points (reduced 50% on mobile via budget.tunnelParticleCount)
      const starPositions = new Float32Array(budget.tunnelParticleCount * 3);
      for (let i = 0; i < budget.tunnelParticleCount; i++) {
        const angle = (i * 2.39996) % (Math.PI * 2);
        const radius = 2.4 + ((i * 7) % 10) * 1.1;
        starPositions[i * 3] = Math.cos(angle) * radius;
        starPositions[i * 3 + 1] = Math.sin(angle) * radius;
        starPositions[i * 3 + 2] = 12 - (i / budget.tunnelParticleCount) * 62;
      }
      const starGeom = new THREE.BufferGeometry();
      starGeom.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      const starMat = new THREE.PointsMaterial({
        color: 0xbae6fd,
        size: budget.isCompactDevice ? 0.14 : 0.11,
        transparent: true,
        opacity: 0.85,
      });
      const stars = new THREE.Points(starGeom, starMat);
      scene.add(stars);

      // Rounded squircle CanvasTexture helper so product icons look sleek in 3D space
      const logoSprites: THREE.Sprite[] = [];
      TUNNEL_LOGOS.forEach((item, idx) => {
        const iconCanvas = document.createElement('canvas');
        iconCanvas.width = 128;
        iconCanvas.height = 128;
        const ictx = iconCanvas.getContext('2d');
        const tex = new THREE.CanvasTexture(iconCanvas);
        tex.colorSpace = THREE.SRGBColorSpace;

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          if (!ictx) return;
          ictx.clearRect(0, 0, 128, 128);
          ictx.save();
          ictx.beginPath();
          ictx.roundRect(8, 8, 112, 112, 26);
          ictx.clip();
          ictx.fillStyle = '#FFFFFF';
          ictx.fillRect(8, 8, 112, 112);
          ictx.drawImage(img, 8, 8, 112, 112);
          ictx.restore();

          ictx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
          ictx.lineWidth = 4;
          ictx.beginPath();
          ictx.roundRect(8, 8, 112, 112, 26);
          ictx.stroke();
          tex.needsUpdate = true;
          renderer.render(scene, camera);
        };
        img.src = item.src;

        const mat = new THREE.SpriteMaterial({
          map: tex,
          transparent: true,
          opacity: 0,
        });
        const sprite = new THREE.Sprite(mat);
        const theta = (idx / TUNNEL_LOGOS.length) * Math.PI * 2 + 0.4;
        const r = budget.isCompactDevice ? 2.15 : 2.95;
        sprite.position.set(Math.cos(theta) * r, Math.sin(theta) * r, -9 - idx * 3.8);
        sprite.scale.setScalar(budget.isCompactDevice ? 1.05 : 1.35);
        tunnelGroup.add(sprite);
        logoSprites.push(sprite);
      });

      const resize = () => {
        const w = Math.max(1, canvas.clientWidth);
        const h = Math.max(1, canvas.clientHeight);
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      resize();
      window.addEventListener('resize', resize);

      renderVisualState = (state: TunnelPhaseState) => {
        camera.position.z = state.cameraZ;
        tunnelGroup.rotation.z = state.tunnelTwistRad * 0.25;
        tunnelGroup.scale.set(state.tunnelRadiusScale, state.tunnelRadiusScale, 1);

        // Serene starry space in Phase 1, then glowing tunnel & flying logos ignite entering Phase 2
        const tunnelFade = rangeRatio(state.progress, 0.14, 0.26);
        ringMeshes.forEach((m) => {
          (m.material as THREE.MeshBasicMaterial).opacity = 0.08 + tunnelFade * 0.42;
        });
        const spriteFade = rangeRatio(state.progress, 0.2, 0.28);
        logoSprites.forEach((s) => {
          s.material.opacity = spriteFade * 0.96;
        });

        const orbDistanceAhead = 9.5 - rangeRatio(state.progress, 0.55, 0.8) * 6.8;
        orbGroup.position.set(0, Math.sin(state.progress * Math.PI * 4) * 0.18, state.cameraZ - orbDistanceAhead);
        orbGroup.scale.setScalar(state.orbScale * 0.52);
        orbCoreMat.emissiveIntensity = state.orbGlowIntensity;
        orbAuraMat.opacity = Math.min(0.85, 0.24 + state.progress * 0.55);

        renderer.render(scene, camera);
      };

      cleanupRenderer = () => {
        window.removeEventListener('resize', resize);
        orbCoreGeom.dispose();
        orbCoreMat.dispose();
        orbAuraGeom.dispose();
        orbAuraMat.dispose();
        ringGeom.dispose();
        ringMeshes.forEach((m) => (m.material as THREE.Material).dispose());
        starGeom.dispose();
        starMat.dispose();
        logoSprites.forEach((s) => {
          s.material.map?.dispose();
          s.material.dispose();
        });
        renderer.dispose();
      };
    } catch {
      canvas.dataset.renderMode = 'canvas2d';
      const fallback = createCinematicCanvas2DRenderer(canvas);
      renderVisualState = fallback.renderState;
      cleanupRenderer = fallback.destroy;
    }
  }

  const updateAll = (progress: number) => {
    const state = computeTunnelPhaseState(progress);
    applyDomOverlayState(state);
    renderVisualState(state);
  };

  updateAll(0);

  const st = ScrollTrigger.create({
    trigger: section,
    pin: pinStage,
    start: 'top top',
    end: '+=300%',
    scrub: 1.5,
    onUpdate: (self) => {
      updateAll(self.progress);
    },
  });

  return () => {
    st.kill();
    cleanupRenderer();
  };
}

function rangeRatio(val: number, min: number, max: number): number {
  return Math.max(0, Math.min(1, (val - min) / Math.max(0.0001, max - min)));
}
