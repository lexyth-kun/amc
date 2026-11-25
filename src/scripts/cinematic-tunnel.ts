import * as THREE from 'three';
import { computeTunnelPhaseState, type TunnelPhaseState } from '@/utils/tunnel-phases';
import { getAdaptiveObjectBudget } from '@/utils/webgl-support';
import { createCinematicCanvas2DRenderer } from './cinematic-fallback-2d';

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
    renderer.setClearColor(0x082f49, 1);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x082f49, 0.022);

    const camera = new THREE.PerspectiveCamera(56, 1, 0.1, 130);
    camera.position.set(0, 0, 16);

    const ambient = new THREE.AmbientLight(0x7dd3fc, 1.5);
    scene.add(ambient);

    const coreLight = new THREE.PointLight(0x38bdf8, 12, 54);
    coreLight.position.set(0, 0, 4);
    scene.add(coreLight);

    // Radiant central Sky Blue AMC orb
    const orbGroup = new THREE.Group();
    const orbCoreGeom = new THREE.SphereGeometry(0.98, 28, 28);
    const orbCoreMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x38bdf8,
      emissiveIntensity: 1.5,
      roughness: 0.08,
    });
    orbGroup.add(new THREE.Mesh(orbCoreGeom, orbCoreMat));

    const orbAuraGeom = new THREE.SphereGeometry(1.52, 24, 24);
    const orbAuraMat = new THREE.MeshBasicMaterial({
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0.34,
    });
    orbGroup.add(new THREE.Mesh(orbAuraGeom, orbAuraMat));
    scene.add(orbGroup);

    // Pure luminous Sky Blue light-ring tunnel (no ghost duplicate sprites)
    const tunnelGroup = new THREE.Group();
    const ringGeom = new THREE.TorusGeometry(4.5, 0.032, 8, 48);
    const ringMeshes: THREE.Mesh[] = [];
    for (let i = 0; i < 36; i++) {
      const ringMat = new THREE.MeshBasicMaterial({
        color: i % 3 === 0 ? 0xffffff : i % 2 === 0 ? 0x7dd3fc : 0x38bdf8,
        transparent: true,
        opacity: 0.12,
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.position.z = 8 - i * 2.6;
      ring.rotation.z = i * 0.2;
      tunnelGroup.add(ring);
      ringMeshes.push(ring);
    }
    scene.add(tunnelGroup);

    const starPositions = new Float32Array(budget.tunnelParticleCount * 3);
    for (let i = 0; i < budget.tunnelParticleCount; i++) {
      const angle = (i * 2.39996) % (Math.PI * 2);
      const radius = 2.6 + ((i * 7) % 10) * 1.1;
      starPositions[i * 3] = Math.cos(angle) * radius;
      starPositions[i * 3 + 1] = Math.sin(angle) * radius;
      starPositions[i * 3 + 2] = 14 - (i / budget.tunnelParticleCount) * 96;
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
      camera.position.z = state.cameraZ;
      tunnelGroup.rotation.z = state.tunnelTwistRad * 0.22;
      tunnelGroup.scale.set(state.tunnelRadiusScale, state.tunnelRadiusScale, 1);

      const tunnelFade = rangeRatio(state.progress, 0.1, 0.2);
      ringMeshes.forEach((m) => {
        (m.material as THREE.MeshBasicMaterial).opacity = 0.09 + tunnelFade * 0.44;
      });

      const orbDistanceAhead = 11 - rangeRatio(state.progress, 0.76, 0.9) * 8.2;
      orbGroup.position.set(
        0,
        Math.sin(state.progress * Math.PI * 5) * 0.16,
        state.cameraZ - orbDistanceAhead
      );
      orbGroup.scale.setScalar(state.orbScale * 0.54);
      orbCoreMat.emissiveIntensity = state.orbGlowIntensity;
      orbAuraMat.opacity = Math.min(0.85, 0.26 + state.progress * 0.54);

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
