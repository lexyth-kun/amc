import * as THREE from 'three';
import gsap from 'gsap';
import { detectRenderMode, getAdaptiveObjectBudget } from '@/utils/webgl-support';
import { mountHeroCanvas2DFallback } from './hero-fallback-2d';

const COLOR_CYCLE = [0xffffff, 0x38bdf8, 0x1a36ff] as const;

function createBeveledCrossGeometry(): THREE.ExtrudeGeometry {
  const armHalf = 0.24;
  const armLen = 0.78;
  const shape = new THREE.Shape();

  shape.moveTo(-armHalf, armLen);
  shape.lineTo(armHalf, armLen);
  shape.lineTo(armHalf, armHalf);
  shape.lineTo(armLen, armHalf);
  shape.lineTo(armLen, -armHalf);
  shape.lineTo(armHalf, -armHalf);
  shape.lineTo(armHalf, -armLen);
  shape.lineTo(-armHalf, -armLen);
  shape.lineTo(-armHalf, -armHalf);
  shape.lineTo(-armLen, -armHalf);
  shape.lineTo(-armLen, armHalf);
  shape.lineTo(-armHalf, armHalf);
  shape.closePath();

  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: 0.34,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: 0.08,
    bevelThickness: 0.08,
  });
  geom.center();
  return geom;
}

function pseudoCurlOffset(x: number, y: number, t: number): { dx: number; dy: number; dz: number } {
  return {
    dx: Math.sin(y * 0.8 + t * 0.75) * 0.16 + Math.cos(x * 0.6 - t * 0.45) * 0.08,
    dy: Math.cos(x * 0.75 + t * 0.85) * 0.18 + Math.sin(y * 0.55 + t * 0.5) * 0.08,
    dz: Math.sin((x + y) * 0.5 + t * 0.6) * 0.14,
  };
}

export function initHeroScene(): () => void {
  const canvas = document.getElementById('hero-canvas') as HTMLCanvasElement | null;
  if (!canvas) return () => {};

  const navWithMemory = navigator as Navigator & { deviceMemory?: number };
  const budget = getAdaptiveObjectBudget({
    viewportWidth: window.innerWidth,
    deviceMemoryGb: navWithMemory.deviceMemory,
    dpr: window.devicePixelRatio || 1,
  });

  const mode = detectRenderMode({
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  });

  canvas.dataset.renderMode = mode;

  if (mode === 'static') {
    return () => {};
  }

  if (mode === 'canvas2d') {
    return mountHeroCanvas2DFallback(canvas, budget.heroCrossCount);
  }

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
  } catch {
    canvas.dataset.renderMode = 'canvas2d';
    return mountHeroCanvas2DFallback(canvas, budget.heroCrossCount);
  }

  renderer.setPixelRatio(budget.maxDpr);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 60);
  camera.position.set(0, 0, 11.5);

  // Studio bright lighting for glossy crosses on white stage
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0xdbeafe, 1.85);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 2.2);
  dirLight.position.set(6, 9, 8);
  scene.add(dirLight);

  const skyPoint = new THREE.PointLight(0x38bdf8, 6.5, 22);
  skyPoint.position.set(-5, -5, 5);
  scene.add(skyPoint);

  const royalRim = new THREE.PointLight(0x1a36ff, 4.5, 20);
  royalRim.position.set(6, -3, 4);
  scene.add(royalRim);

  const worldGroup = new THREE.Group();
  scene.add(worldGroup);

  const crossGeom = createBeveledCrossGeometry();
  const orbGeom = new THREE.SphereGeometry(0.42, 24, 24);

  interface CrossNode {
    mesh: THREE.Mesh<THREE.ExtrudeGeometry, THREE.MeshPhysicalMaterial>;
    basePos: THREE.Vector3;
    rotVel: THREE.Vector3;
    phase: number;
    colorIndex: number;
  }

  const crossNodes: CrossNode[] = [];

  for (let i = 0; i < budget.heroCrossCount; i++) {
    // 50% white, 30% sky, 20% AMC blue per section 5.2
    const ratioRoll = i / budget.heroCrossCount;
    const colorIndex = ratioRoll < 0.5 ? 0 : ratioRoll < 0.8 ? 1 : 2;

    const material = new THREE.MeshPhysicalMaterial({
      color: COLOR_CYCLE[colorIndex],
      roughness: 0.15,
      metalness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      emissive: colorIndex === 0 ? 0xeaf3ff : 0x000000,
      emissiveIntensity: colorIndex === 0 ? 0.18 : 0,
    });

    const mesh = new THREE.Mesh(crossGeom, material);
    const angle = (i / budget.heroCrossCount) * Math.PI * 2 + 0.25;
    const ringRadiusX = (budget.isCompactDevice ? 2.6 : 4.6) + (i % 3) * 1.15;
    const ringRadiusY = (budget.isCompactDevice ? 3.2 : 2.9) + ((i + 1) % 3) * 0.75;
    const basePos = new THREE.Vector3(
      Math.cos(angle) * ringRadiusX,
      Math.sin(angle) * ringRadiusY,
      -2.4 + (i % 4) * 1.1
    );

    mesh.position.copy(basePos);
    const scale = (budget.isCompactDevice ? 0.58 : 0.72) + (i % 3) * 0.14;
    mesh.scale.setScalar(scale);
    mesh.rotation.set(i * 0.7, i * 1.1, i * 0.4);
    mesh.userData.crossIndex = i;

    worldGroup.add(mesh);
    crossNodes.push({
      mesh,
      basePos,
      rotVel: new THREE.Vector3(
        (i % 2 === 0 ? 1 : -1) * (0.16 + (i % 3) * 0.05),
        (i % 3 === 0 ? -1 : 1) * (0.2 + (i % 4) * 0.04),
        0.12
      ),
      phase: i * 0.92,
      colorIndex,
    });
  }

  const orbMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xbae6fd,
    roughness: 0.1,
    metalness: 0.02,
    transparent: true,
    opacity: 0.52,
    clearcoat: 1.0,
  });

  const orbs: { mesh: THREE.Mesh; basePos: THREE.Vector3; phase: number }[] = [];
  for (let j = 0; j < budget.heroOrbCount; j++) {
    const orb = new THREE.Mesh(orbGeom, orbMaterial);
    const theta = (j / budget.heroOrbCount) * Math.PI * 2 + 0.6;
    const basePos = new THREE.Vector3(
      Math.cos(theta) * (budget.isCompactDevice ? 2.2 : 3.9),
      Math.sin(theta) * 2.5,
      -3.2 + (j % 3) * 0.9
    );
    orb.position.copy(basePos);
    orb.scale.setScalar(0.65 + (j % 3) * 0.25);
    worldGroup.add(orb);
    orbs.push({ mesh: orb, basePos, phase: j * 1.3 });
  }

  let targetPointerX = 0;
  let targetPointerY = 0;
  let smoothPointerX = 0;
  let smoothPointerY = 0;

  const onPointerMove = (e: PointerEvent) => {
    targetPointerX = (e.clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
    targetPointerY = (e.clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
  };

  const onDeviceOrientation = (e: DeviceOrientationEvent) => {
    if (e.gamma == null || e.beta == null) return;
    targetPointerX = Math.max(-1, Math.min(1, e.gamma / 30));
    targetPointerY = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
  };

  const raycaster = new THREE.Raycaster();
  const pointerNdc = new THREE.Vector2();

  const onCanvasClick = (e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    pointerNdc.x = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
    pointerNdc.y = -((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 + 1;
    raycaster.setFromCamera(pointerNdc, camera);

    const hits = raycaster.intersectObjects(
      crossNodes.map((n) => n.mesh),
      false
    );
    if (!hits.length) return;

    const hitMesh = hits[0].object as THREE.Mesh<THREE.ExtrudeGeometry, THREE.MeshPhysicalMaterial>;
    const idx = hitMesh.userData.crossIndex as number | undefined;
    const node = idx !== undefined ? crossNodes[idx] : undefined;
    if (!node) return;

    node.colorIndex = (node.colorIndex + 1) % COLOR_CYCLE.length;
    node.mesh.material.color.setHex(COLOR_CYCLE[node.colorIndex]);
    node.mesh.material.emissive.setHex(node.colorIndex === 0 ? 0xeaf3ff : 0x000000);
    node.mesh.material.emissiveIntensity = node.colorIndex === 0 ? 0.18 : 0;

    const baseScale = node.mesh.scale.x;
    gsap.fromTo(
      node.mesh.scale,
      { x: baseScale, y: baseScale, z: baseScale },
      {
        x: baseScale * 1.25,
        y: baseScale * 1.25,
        z: baseScale * 1.25,
        duration: 0.24,
        yoyo: true,
        repeat: 1,
        ease: 'power2.out',
      }
    );
  };

  const resize = () => {
    const w = Math.max(1, canvas.clientWidth);
    const h = Math.max(1, canvas.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };

  let inViewport = true;
  let tabHidden = document.hidden;
  let rafId = 0;
  let prevTime = performance.now();

  const io = new IntersectionObserver(
    (entries) => {
      inViewport = Boolean(entries[0]?.isIntersecting);
    },
    { threshold: 0.02 }
  );
  io.observe(canvas);

  const onVis = () => {
    tabHidden = document.hidden;
  };

  const tick = (now: number) => {
    const dt = Math.min(0.05, (now - prevTime) * 0.001);
    prevTime = now;

    if (inViewport && !tabHidden) {
      const t = now * 0.001;
      smoothPointerX += (targetPointerX - smoothPointerX) * 0.05;
      smoothPointerY += (targetPointerY - smoothPointerY) * 0.05;

      const mobileScrollTilt = budget.isCompactDevice ? window.scrollY * 0.0004 : 0;
      worldGroup.rotation.y = smoothPointerX * 0.28;
      worldGroup.rotation.x = -smoothPointerY * 0.2 + mobileScrollTilt;

      for (const node of crossNodes) {
        const drift = pseudoCurlOffset(node.basePos.x, node.basePos.y, t + node.phase);
        node.mesh.position.set(
          node.basePos.x + drift.dx,
          node.basePos.y + drift.dy,
          node.basePos.z + drift.dz
        );
        node.mesh.rotation.x += node.rotVel.x * dt;
        node.mesh.rotation.y += node.rotVel.y * dt;
        node.mesh.rotation.z += node.rotVel.z * dt;
      }

      for (const orb of orbs) {
        orb.mesh.position.y = orb.basePos.y + Math.sin(t * 0.9 + orb.phase) * 0.26;
        orb.mesh.position.x = orb.basePos.x + Math.cos(t * 0.7 + orb.phase) * 0.18;
      }

      renderer.render(scene, camera);
    }

    rafId = requestAnimationFrame(tick);
  };

  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('deviceorientation', onDeviceOrientation, { passive: true });
  canvas.addEventListener('click', onCanvasClick);
  document.addEventListener('visibilitychange', onVis);
  rafId = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(rafId);
    io.disconnect();
    window.removeEventListener('resize', resize);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('deviceorientation', onDeviceOrientation);
    canvas.removeEventListener('click', onCanvasClick);
    document.removeEventListener('visibilitychange', onVis);
    crossGeom.dispose();
    orbGeom.dispose();
    orbMaterial.dispose();
    crossNodes.forEach((n) => n.mesh.material.dispose());
    renderer.dispose();
  };
}
