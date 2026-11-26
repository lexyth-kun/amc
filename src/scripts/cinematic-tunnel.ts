import * as THREE from 'three';
import {
  computeTunnelPhaseState,
  getTunnelWorldTheme,
  type TunnelPhaseState,
} from '@/utils/tunnel-phases';
import { getAdaptiveObjectBudget } from '@/utils/webgl-support';
import { createCinematicCanvas2DRenderer } from './cinematic-fallback-2d';

export type CinematicVisualRenderFn = (
  progress: number,
  pointerX?: number,
  pointerY?: number
) => void;

const WORLD_COUNT = 6;

export function mountCinematicVisualRenderer(): CinematicVisualRenderFn {
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

    const initialTheme = getTunnelWorldTheme(0);
    const liveBgColor = new THREE.Color(initialTheme.bgHex);
    const liveAccentColor = new THREE.Color(initialTheme.accentHex);
    const colorA = new THREE.Color();
    const colorB = new THREE.Color();
    const whiteColor = new THREE.Color(0xffffff);
    const tempColor = new THREE.Color();

    renderer.setClearColor(liveBgColor, 1);

    const scene = new THREE.Scene();
    const fog = new THREE.FogExp2(initialTheme.bgHex, 0.02);
    scene.fog = fog;

    const camera = new THREE.PerspectiveCamera(56, 1, 0.1, 140);
    camera.position.set(0, 0, 16);

    const ambient = new THREE.AmbientLight(0x7dd3fc, 1.45);
    scene.add(ambient);

    const coreLight = new THREE.PointLight(initialTheme.accentHex, 14, 62);
    coreLight.position.set(0, 0, 4);
    scene.add(coreLight);

    // Sculptural Lusion Celestial Gyro Core
    const orbGroup = new THREE.Group();
    const orbCoreGeom = new THREE.SphereGeometry(0.92, 32, 32);
    const orbCoreMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: initialTheme.accentHex,
      emissiveIntensity: 1.5,
      roughness: 0.08,
      metalness: 0.15,
    });
    orbGroup.add(new THREE.Mesh(orbCoreGeom, orbCoreMat));

    const orbAuraGeom = new THREE.SphereGeometry(1.48, 24, 24);
    const orbAuraMat = new THREE.MeshBasicMaterial({
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    orbGroup.add(new THREE.Mesh(orbAuraGeom, orbAuraMat));

    const gyroMatA = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.62,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const gyroRingA = new THREE.Mesh(new THREE.TorusGeometry(1.88, 0.026, 8, 64), gyroMatA);
    gyroRingA.rotation.set(Math.PI * 0.34, 0.25, 0);
    orbGroup.add(gyroRingA);

    const gyroMatB = new THREE.MeshBasicMaterial({
      color: initialTheme.accentHex,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const gyroRingB = new THREE.Mesh(new THREE.TorusGeometry(2.38, 0.022, 8, 64), gyroMatB);
    gyroRingB.rotation.set(-Math.PI * 0.28, -0.4, Math.PI * 0.18);
    orbGroup.add(gyroRingB);

    const cageMat = new THREE.MeshBasicMaterial({
      color: initialTheme.accentHex,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const energyCage = new THREE.Mesh(new THREE.IcosahedronGeometry(2.72, 1), cageMat);
    orbGroup.add(energyCage);

    scene.add(orbGroup);

    // Multi-geometry architectural portals across all 6 themed zones along Z
    const tunnelGroup = new THREE.Group();
    const geomBySides = new Map<number, THREE.TorusGeometry>();
    const getRingGeom = (sides: number): THREE.TorusGeometry => {
      const existing = geomBySides.get(sides);
      if (existing) return existing;
      const tubularSegments = sides >= 32 ? 48 : sides;
      const g = new THREE.TorusGeometry(4.65, sides <= 6 ? 0.04 : 0.034, 8, tubularSegments);
      geomBySides.set(sides, g);
      return g;
    };

    const portalCount = 46;
    const portalMeshes: { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; zoneIdx: number; index: number }[] = [];
    for (let i = 0; i < portalCount; i++) {
      const z = 12 - i * 2.35;
      // Align portal geometry zone with camera look-ahead depth (cameraZ - 11) for each world
      const zoneIdx =
        z > -20
          ? 0
          : z > -31
            ? 1
            : z > -41
              ? 2
              : z > -51
                ? 3
                : z > -61
                  ? 4
                  : 5;
      const zoneTheme = getTunnelWorldTheme(zoneIdx);
      const isPrimary = i % 3 === 0;
      const mat = new THREE.MeshBasicMaterial({
        color: isPrimary ? 0xffffff : zoneTheme.accentHex,
        transparent: true,
        opacity: 0.14,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(getRingGeom(zoneTheme.ringSides), mat);
      mesh.position.z = z;
      mesh.rotation.z = i * 0.22 + (zoneTheme.ringSides === 4 ? Math.PI / 4 : 0);
      tunnelGroup.add(mesh);
      portalMeshes.push({ mesh, mat, zoneIdx, index: i });
    }

    // 4 continuous luminous helical guide rails weaving through the entire 6-world wormhole
    const railMat = new THREE.LineBasicMaterial({
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0.26,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    for (let r = 0; r < 4; r++) {
      const railPts: THREE.Vector3[] = [];
      const steps = 96;
      const baseAngle = (r / 4) * Math.PI * 2;
      for (let s = 0; s <= steps; s++) {
        const frac = s / steps;
        const z = 12 - frac * 102;
        const theta = baseAngle + frac * Math.PI * 3.2;
        const rad = 4.78 + Math.sin(frac * Math.PI * 6 + r) * 0.24;
        railPts.push(new THREE.Vector3(Math.cos(theta) * rad, Math.sin(theta) * rad, z));
      }
      const railGeom = new THREE.BufferGeometry().setFromPoints(railPts);
      tunnelGroup.add(new THREE.Line(railGeom, railMat));
    }

    scene.add(tunnelGroup);

    // Starlight dust field
    const starCount = budget.tunnelParticleCount;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const angle = (i * 2.39996) % (Math.PI * 2);
      const radius = 2.4 + ((i * 7) % 11) * 1.05;
      starPositions[i * 3] = Math.cos(angle) * radius;
      starPositions[i * 3 + 1] = Math.sin(angle) * radius;
      starPositions[i * 3 + 2] = 15 - (i / starCount) * 104;
    }
    const starGeom = new THREE.BufferGeometry();
    starGeom.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xbae6fd,
      size: budget.isCompactDevice ? 0.13 : 0.105,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    scene.add(new THREE.Points(starGeom, starMat));

    // Dynamic 3D hyper-warp speed streaks (Z-length stretches with state.warpStreakScale)
    const streakCount = budget.isCompactDevice ? 56 : 128;
    const streakBase = new Float32Array(streakCount * 3);
    const streakPositions = new Float32Array(streakCount * 6);
    for (let i = 0; i < streakCount; i++) {
      const angle = (i * 1.6180339 * Math.PI * 2) % (Math.PI * 2);
      const radius = 3.2 + ((i * 13) % 9) * 0.72;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = 12 - (i / streakCount) * 100;
      streakBase[i * 3] = x;
      streakBase[i * 3 + 1] = y;
      streakBase[i * 3 + 2] = z;

      const idx6 = i * 6;
      streakPositions[idx6] = x;
      streakPositions[idx6 + 1] = y;
      streakPositions[idx6 + 2] = z;
      streakPositions[idx6 + 3] = x;
      streakPositions[idx6 + 4] = y;
      streakPositions[idx6 + 5] = z - 1.1;
    }
    const streakGeom = new THREE.BufferGeometry();
    const streakPosAttr = new THREE.BufferAttribute(streakPositions, 3);
    streakGeom.setAttribute('position', streakPosAttr);
    const streakMat = new THREE.LineBasicMaterial({
      color: 0xbae6fd,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    scene.add(new THREE.LineSegments(streakGeom, streakMat));

    const resize = () => {
      const w = Math.max(1, canvas.clientWidth);
      const h = Math.max(1, canvas.clientHeight);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = (state: TunnelPhaseState, pointerX = 0, pointerY = 0) => {
      const clampedPx = Math.max(-1, Math.min(1, pointerX));
      const clampedPy = Math.max(-1, Math.min(1, pointerY));

      // Smoothly morph atmosphere palette across all 6 worlds
      const worldFloat = state.showcaseProgress * (WORLD_COUNT - 1);
      const idxA = Math.max(0, Math.min(WORLD_COUNT - 1, Math.floor(worldFloat)));
      const idxB = Math.min(WORLD_COUNT - 1, idxA + 1);
      const blend = worldFloat - idxA;

      const themeA = getTunnelWorldTheme(idxA);
      const themeB = getTunnelWorldTheme(idxB);

      colorA.setHex(themeA.bgHex);
      colorB.setHex(themeB.bgHex);
      liveBgColor.copy(colorA).lerp(colorB, blend);

      colorA.setHex(themeA.accentHex);
      colorB.setHex(themeB.accentHex);
      liveAccentColor.copy(colorA).lerp(colorB, blend);

      renderer.setClearColor(liveBgColor, 1);
      fog.color.copy(liveBgColor);
      coreLight.color.copy(liveAccentColor);
      orbCoreMat.emissive.copy(liveAccentColor);
      orbAuraMat.color.copy(liveAccentColor);
      gyroMatB.color.copy(liveAccentColor);
      cageMat.color.copy(liveAccentColor);
      railMat.color.copy(liveAccentColor);
      streakMat.color.copy(tempColor.copy(liveAccentColor).lerp(whiteColor, 0.45));

      // Interactive camera flight, subtle bank-roll, and warp FOV acceleration
      const targetFov = 55 + Math.min(12, (state.warpStreakScale - 1) * 2.1);
      if (Math.abs(camera.fov - targetFov) > 0.08) {
        camera.fov = targetFov;
        camera.updateProjectionMatrix();
      }
      camera.position.set(clampedPx * 0.85, -clampedPy * 0.55, state.cameraZ);
      camera.lookAt(clampedPx * 0.22, -clampedPy * 0.14, state.cameraZ - 14);
      camera.rotation.z += -clampedPx * 0.045;

      tunnelGroup.rotation.z = state.tunnelTwistRad * 0.24;
      tunnelGroup.scale.set(state.tunnelRadiusScale, state.tunnelRadiusScale, 1);

      const tunnelFade = rangeRatio(state.progress, 0.08, 0.19);
      for (let i = 0; i < portalMeshes.length; i++) {
        const entry = portalMeshes[i];
        const dist = Math.abs(entry.mesh.position.z - (state.cameraZ - 12));
        const proximityBoost = Math.max(0, 1 - dist / 24) * 0.28;
        entry.mat.opacity = 0.08 + tunnelFade * 0.36 + proximityBoost;
        const pulse = 1 + Math.sin(state.progress * Math.PI * 10 + entry.index * 0.6) * 0.035;
        entry.mesh.scale.setScalar(pulse);
      }

      // Elongate 3D hyper-warp streaks during wave surges & Phase 3 vortex
      const streakLength = 0.75 + state.warpStreakScale * 1.15;
      for (let i = 0; i < streakCount; i++) {
        const idx3 = i * 3;
        const idx6 = i * 6;
        const z = streakBase[idx3 + 2];
        streakPositions[idx6 + 2] = z;
        streakPositions[idx6 + 5] = z - streakLength;
      }
      streakPosAttr.needsUpdate = true;
      streakMat.opacity = Math.min(0.82, 0.22 + (state.warpStreakScale - 1) * 0.15);

      // Animate Celestial Gyro Core
      const orbDistanceAhead = 11.4 - rangeRatio(state.progress, 0.76, 0.9) * 8.4;
      orbGroup.position.set(
        clampedPx * 0.38,
        Math.sin(state.progress * Math.PI * 6) * 0.18 - clampedPy * 0.26,
        state.cameraZ - orbDistanceAhead
      );
      orbGroup.scale.setScalar(state.orbScale * 0.52);
      orbCoreMat.emissiveIntensity = state.orbGlowIntensity;
      orbAuraMat.opacity = Math.min(0.84, 0.24 + state.progress * 0.52);

      gyroRingA.rotation.x = Math.PI * 0.34 + state.progress * Math.PI * 4.2 + clampedPy * 0.3;
      gyroRingA.rotation.y = 0.25 + state.progress * Math.PI * 3.1 + clampedPx * 0.35;
      gyroRingB.rotation.x = -Math.PI * 0.28 - state.progress * Math.PI * 3.4;
      gyroRingB.rotation.y = -0.4 + state.progress * Math.PI * 5.2 - clampedPx * 0.3;

      energyCage.rotation.x = state.progress * Math.PI * 2.2;
      energyCage.rotation.y = -state.progress * Math.PI * 3.0;
      const cageScale = 1 + rangeRatio(state.progress, 0.76, 0.9) * 0.7;
      energyCage.scale.setScalar(cageScale);
      cageMat.opacity = Math.min(0.55, 0.18 + (state.warpStreakScale - 1) * 0.08);

      renderer.render(scene, camera);
    };

    return (progress: number, pointerX = 0, pointerY = 0) =>
      draw(computeTunnelPhaseState(progress), pointerX, pointerY);
  } catch {
    canvas.dataset.renderMode = 'canvas2d';
    const fallback = createCinematicCanvas2DRenderer(canvas);
    return (p: number, px = 0, py = 0) => fallback.renderState(computeTunnelPhaseState(p), px, py);
  }
}

function rangeRatio(val: number, min: number, max: number): number {
  return Math.max(0, Math.min(1, (val - min) / Math.max(0.0001, max - min)));
}
