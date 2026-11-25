import * as THREE from 'three';
import { computeTunnelPhaseState, type TunnelPhaseState } from '@/utils/tunnel-phases';
import { getAdaptiveObjectBudget } from '@/utils/webgl-support';
import { createCinematicCanvas2DRenderer } from './cinematic-fallback-2d';

const TUNNEL_LOGOS = [
  { name: 'ChatGPT', src: '/logo-chatgpt.webp' },
  { name: 'Claude', src: '/logo-claude.svg' },
  { name: 'Adobe', src: '/logo-adobe.webp' },
  { name: 'Canva', src: '/logo-canva.webp' },
  { name: 'Netflix', src: '/logo-netflix.webp' },
  { name: 'Spotify', src: '/logo-spotify.webp' },
  { name: 'MLBB', src: '/logo-mlbb.webp' },
];

export function mountCinematicVisualRenderer(): (progress: number) => void {
  const canvas = document.getElementById('cinematic-canvas') as HTMLCanvasElement | null;
  if (!canvas) return () => {};

  const navWithMemory = navigator as Navigator & { deviceMemory?: number };
  const budget = getAdaptiveObjectBudget({
    viewportWidth: window.innerWidth,
    deviceMemoryGb: navWithMemory.deviceMemory,
    dpr: window.devicePixelRatio || 1,
  });

  try {
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !budget.isCompactDevice,
      alpha: false,
      powerPreference: 'high-performance',
    });
    canvas.dataset.renderMode = 'webgl';
    renderer.setPixelRatio(budget.isCompactDevice ? 1 : budget.maxDpr);
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

    const orbGroup = new THREE.Group();
    const orbCoreGeom = new THREE.SphereGeometry(0.95, 24, 24);
    const orbCoreMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x38bdf8,
      emissiveIntensity: 1.4,
      roughness: 0.1,
    });
    orbGroup.add(new THREE.Mesh(orbCoreGeom, orbCoreMat));

    const orbAuraGeom = new THREE.SphereGeometry(1.42, 20, 20);
    const orbAuraMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.28,
    });
    orbGroup.add(new THREE.Mesh(orbAuraGeom, orbAuraMat));
    scene.add(orbGroup);

    const tunnelGroup = new THREE.Group();
    const ringGeom = new THREE.TorusGeometry(4.2, 0.032, 8, 44);
    const ringMeshes: THREE.Mesh[] = [];
    for (let i = 0; i < 22; i++) {
      const ringMat = new THREE.MeshBasicMaterial({
        color: i % 3 === 0 ? 0xffffff : i % 2 === 0 ? 0x38bdf8 : 0x1a36ff,
        transparent: true,
        opacity: 0.12,
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.position.z = 6 - i * 2.4;
      ring.rotation.z = i * 0.22;
      tunnelGroup.add(ring);
      ringMeshes.push(ring);
    }
    scene.add(tunnelGroup);

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
    scene.add(new THREE.Points(starGeom, starMat));

    let lastRenderedState: TunnelPhaseState = computeTunnelPhaseState(0);

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
        draw(lastRenderedState);
      };
      img.src = item.src;

      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0 });
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

    const draw = (state: TunnelPhaseState) => {
      lastRenderedState = state;
      camera.position.z = state.cameraZ;
      tunnelGroup.rotation.z = state.tunnelTwistRad * 0.25;
      tunnelGroup.scale.set(state.tunnelRadiusScale, state.tunnelRadiusScale, 1);

      const tunnelFade = rangeRatio(state.progress, 0.14, 0.26);
      ringMeshes.forEach((m) => {
        (m.material as THREE.MeshBasicMaterial).opacity = 0.08 + tunnelFade * 0.42;
      });
      const spriteFade = rangeRatio(state.progress, 0.2, 0.28);
      logoSprites.forEach((s) => {
        s.material.opacity = spriteFade * 0.96;
      });

      const orbDistanceAhead = 9.5 - rangeRatio(state.progress, 0.55, 0.8) * 6.8;
      orbGroup.position.set(
        0,
        Math.sin(state.progress * Math.PI * 4) * 0.18,
        state.cameraZ - orbDistanceAhead
      );
      orbGroup.scale.setScalar(state.orbScale * 0.52);
      orbCoreMat.emissiveIntensity = state.orbGlowIntensity;
      orbAuraMat.opacity = Math.min(0.85, 0.24 + state.progress * 0.55);

      renderer.render(scene, camera);
    };

    return (progress: number) => draw(computeTunnelPhaseState(progress));
  } catch {
    canvas.dataset.renderMode = 'canvas2d';
    const fallback = createCinematicCanvas2DRenderer(canvas);
    return (p: number) => fallback.renderState(computeTunnelPhaseState(p));
  }
}

function rangeRatio(val: number, min: number, max: number): number {
  return Math.max(0, Math.min(1, (val - min) / Math.max(0.0001, max - min)));
}
