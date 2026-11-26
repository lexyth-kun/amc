import * as THREE from 'three';
import gsap from 'gsap';
import { getAdaptiveObjectBudget } from '@/utils/webgl-support';
import { mountHeroCanvas2DFallback } from './hero-fallback-2d';

const COLOR_CYCLE = [0xffffff, 0x7dd3fc, 0x38bdf8, 0x0284c7] as const;

type HeroIconKind = 'robot' | 'editing' | 'gamepad' | 'buzzer' | 'streaming' | 'shield';
const ICON_KINDS: HeroIconKind[] = [
  'robot',
  'editing',
  'gamepad',
  'buzzer',
  'streaming',
  'shield',
];

function createRoundedRectShape(w: number, h: number, r: number): THREE.Shape {
  const s = new THREE.Shape();
  const hw = w / 2;
  const hh = h / 2;
  s.moveTo(-hw + r, -hh);
  s.lineTo(hw - r, -hh);
  s.quadraticCurveTo(hw, -hh, hw, -hh + r);
  s.lineTo(hw, hh - r);
  s.quadraticCurveTo(hw, hh, hw - r, hh);
  s.lineTo(-hw + r, hh);
  s.quadraticCurveTo(-hw, hh, -hw, hh - r);
  s.lineTo(-hw, -hh + r);
  s.quadraticCurveTo(-hw, -hh, -hw + r, -hh);
  return s;
}

function createGamepadShape(): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(-0.48, 0.34);
  s.lineTo(0.48, 0.34);
  s.quadraticCurveTo(0.76, 0.34, 0.80, -0.02);
  s.quadraticCurveTo(0.82, -0.44, 0.56, -0.48);
  s.quadraticCurveTo(0.38, -0.50, 0.28, -0.22);
  s.lineTo(-0.28, -0.22);
  s.quadraticCurveTo(-0.38, -0.50, -0.56, -0.48);
  s.quadraticCurveTo(-0.82, -0.44, -0.80, -0.02);
  s.quadraticCurveTo(-0.76, 0.34, -0.48, 0.34);
  return s;
}

function createShieldShape(): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(0, 0.64);
  s.lineTo(0.54, 0.42);
  s.lineTo(0.50, -0.08);
  s.quadraticCurveTo(0.44, -0.48, 0, -0.68);
  s.quadraticCurveTo(-0.44, -0.48, -0.50, -0.08);
  s.lineTo(-0.54, 0.42);
  s.closePath();
  return s;
}

function createPlayTriangleGeometry(size: number, depth: number): THREE.ExtrudeGeometry {
  const tri = new THREE.Shape();
  tri.moveTo(-size * 0.42, size * 0.52);
  tri.lineTo(size * 0.58, 0);
  tri.lineTo(-size * 0.42, -size * 0.52);
  tri.closePath();
  const g = new THREE.ExtrudeGeometry(tri, {
    depth,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.025,
    bevelThickness: 0.025,
  });
  g.center();
  return g;
}

function buildServiceIconGroup(
  kind: HeroIconKind,
  mainMat: THREE.Material,
  detailMat: THREE.Material,
  compact: boolean,
  disposables: THREE.BufferGeometry[]
): THREE.Group {
  const group = new THREE.Group();
  const seg = compact ? 2 : 3;
  const extrudeOpts = {
    depth: 0.30,
    bevelEnabled: true,
    bevelSegments: seg,
    steps: 1,
    bevelSize: 0.06,
    bevelThickness: 0.06,
  };

  const track = <T extends THREE.BufferGeometry>(g: T): T => {
    disposables.push(g);
    return g;
  };

  if (kind === 'robot') {
    const headGeom = track(new THREE.ExtrudeGeometry(createRoundedRectShape(1.16, 0.88, 0.24), extrudeOpts));
    headGeom.center();
    group.add(new THREE.Mesh(headGeom, mainMat));

    const stemGeom = track(new THREE.CylinderGeometry(0.05, 0.05, 0.30, 10));
    const stem = new THREE.Mesh(stemGeom, detailMat);
    stem.position.set(0, 0.60, 0);
    group.add(stem);

    const tipGeom = track(new THREE.SphereGeometry(0.12, 14, 14));
    const tip = new THREE.Mesh(tipGeom, detailMat);
    tip.position.set(0, 0.78, 0);
    group.add(tip);

    const earGeom = track(new THREE.CylinderGeometry(0.11, 0.11, 0.14, 12));
    for (const side of [-1, 1]) {
      const ear = new THREE.Mesh(earGeom, detailMat);
      ear.rotation.z = Math.PI / 2;
      ear.position.set(side * 0.68, 0, 0);
      group.add(ear);
    }

    const visorGeom = track(new THREE.BoxGeometry(0.84, 0.32, 0.46));
    const visor = new THREE.Mesh(visorGeom, detailMat);
    visor.position.set(0, 0.05, 0);
    group.add(visor);

    const eyeGeom = track(new THREE.SphereGeometry(0.095, 12, 12));
    for (const zSide of [-1, 1]) {
      for (const xSide of [-0.21, 0.21]) {
        const eye = new THREE.Mesh(eyeGeom, mainMat);
        eye.position.set(xSide, 0.05, zSide * 0.23);
        group.add(eye);
      }
    }
  } else if (kind === 'editing') {
    // Video / Creative Studio Clapper & Timeline Play Frame
    const bodyGeom = track(new THREE.ExtrudeGeometry(createRoundedRectShape(1.18, 0.96, 0.20), extrudeOpts));
    bodyGeom.center();
    group.add(new THREE.Mesh(bodyGeom, mainMat));

    const topBarGeom = track(new THREE.BoxGeometry(1.14, 0.20, 0.45));
    const topBar = new THREE.Mesh(topBarGeom, detailMat);
    topBar.position.set(0, 0.36, 0);
    group.add(topBar);

    const playGeom = track(createPlayTriangleGeometry(0.46, 0.48));
    const play = new THREE.Mesh(playGeom, detailMat);
    play.position.set(0.03, -0.09, 0);
    group.add(play);
  } else if (kind === 'gamepad') {
    // Top Up Game Controller
    const padGeom = track(new THREE.ExtrudeGeometry(createGamepadShape(), extrudeOpts));
    padGeom.center();
    group.add(new THREE.Mesh(padGeom, mainMat));

    const dpadH = track(new THREE.BoxGeometry(0.32, 0.10, 0.48));
    const dpadV = track(new THREE.BoxGeometry(0.10, 0.32, 0.48));
    const dH = new THREE.Mesh(dpadH, detailMat);
    const dV = new THREE.Mesh(dpadV, detailMat);
    dH.position.set(-0.34, 0.04, 0);
    dV.position.set(-0.34, 0.04, 0);
    group.add(dH, dV);

    const btnGeom = track(new THREE.CylinderGeometry(0.068, 0.068, 0.48, 12));
    const btnOffsets: [number, number][] = [
      [0.34, 0.14],
      [0.34, -0.06],
      [0.24, 0.04],
      [0.44, 0.04],
    ];
    for (const [bx, by] of btnOffsets) {
      const btn = new THREE.Mesh(btnGeom, detailMat);
      btn.rotation.x = Math.PI / 2;
      btn.position.set(bx, by, 0);
      group.add(btn);
    }
  } else if (kind === 'buzzer') {
    // Social Media Buzzer Megaphone + Acoustic Wave Ring
    const coneGeom = track(new THREE.CylinderGeometry(0.46, 0.16, 0.96, 18));
    const cone = new THREE.Mesh(coneGeom, mainMat);
    cone.rotation.z = -Math.PI / 2;
    cone.position.set(0.04, 0.12, 0);
    group.add(cone);

    const rimGeom = track(new THREE.TorusGeometry(0.45, 0.06, 10, 22));
    const rim = new THREE.Mesh(rimGeom, detailMat);
    rim.rotation.y = Math.PI / 2;
    rim.position.set(0.52, 0.12, 0);
    group.add(rim);

    const backCapGeom = track(new THREE.SphereGeometry(0.18, 14, 14));
    const backCap = new THREE.Mesh(backCapGeom, detailMat);
    backCap.position.set(-0.46, 0.12, 0);
    group.add(backCap);

    const handleGeom = track(new THREE.CylinderGeometry(0.09, 0.08, 0.48, 12));
    const handle = new THREE.Mesh(handleGeom, detailMat);
    handle.rotation.z = 0.24;
    handle.position.set(-0.24, -0.24, 0);
    group.add(handle);

    const waveGeom = track(new THREE.TorusGeometry(0.32, 0.04, 8, 18, Math.PI * 0.72));
    const wave = new THREE.Mesh(waveGeom, detailMat);
    wave.rotation.z = -Math.PI * 0.36;
    wave.position.set(0.68, 0.12, 0);
    group.add(wave);
  } else if (kind === 'streaming') {
    // Streaming & Music App Tile
    const tileGeom = track(new THREE.ExtrudeGeometry(createRoundedRectShape(1.06, 1.06, 0.28), extrudeOpts));
    tileGeom.center();
    group.add(new THREE.Mesh(tileGeom, mainMat));

    const ringGeom = track(new THREE.TorusGeometry(0.32, 0.055, 10, 24));
    for (const zSide of [-1, 1]) {
      const r = new THREE.Mesh(ringGeom, detailMat);
      r.position.set(0, 0, zSide * 0.22);
      group.add(r);
    }

    const playGeom = track(createPlayTriangleGeometry(0.36, 0.48));
    const play = new THREE.Mesh(playGeom, detailMat);
    play.position.set(0.04, 0, 0);
    group.add(play);
  } else {
    // VPN / Security Shield
    const shieldGeom = track(new THREE.ExtrudeGeometry(createShieldShape(), extrudeOpts));
    shieldGeom.center();
    group.add(new THREE.Mesh(shieldGeom, mainMat));

    const coreGeom = track(new THREE.OctahedronGeometry(0.22, 0));
    const core = new THREE.Mesh(coreGeom, detailMat);
    core.scale.set(1, 1.1, 2.0);
    core.position.set(0, 0.02, 0);
    group.add(core);
  }

  return group;
}

function pseudoCurlOffset(x: number, y: number, t: number): { dx: number; dy: number; dz: number } {
  return {
    dx: Math.sin(y * 0.8 + t * 0.75) * 0.16 + Math.cos(x * 0.6 - t * 0.45) * 0.08,
    dy: Math.cos(x * 0.75 + t * 0.85) * 0.18 + Math.sin(y * 0.55 + t * 0.5) * 0.08,
    dz: Math.sin((x + y) * 0.5 + t * 0.6) * 0.14,
  };
}

function isSoftwareContext(gl: WebGLRenderingContext | WebGL2RenderingContext): boolean {
  try {
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    if (!dbg) return false;
    const rendererStr = String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '').toLowerCase();
    return rendererStr.includes('swiftshader') || rendererStr.includes('llvmpipe') || rendererStr.includes('software');
  } catch {
    return false;
  }
}

export function initHeroScene(): () => void {
  const canvas = document.getElementById('hero-canvas') as HTMLCanvasElement | null;
  if (!canvas) return () => {};

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    canvas.dataset.renderMode = 'static';
    return () => {};
  }

  const navWithMemory = navigator as Navigator & { deviceMemory?: number };
  const budget = getAdaptiveObjectBudget({
    viewportWidth: window.innerWidth,
    deviceMemoryGb: navWithMemory.deviceMemory,
    dpr: window.devicePixelRatio || 1,
  });

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !budget.isCompactDevice,
      alpha: true,
      powerPreference: 'high-performance',
    });
  } catch {
    canvas.dataset.renderMode = 'canvas2d';
    return mountHeroCanvas2DFallback(canvas, budget.heroCrossCount);
  }

  const softwareGl = isSoftwareContext(renderer.getContext());
  if (budget.isCompactDevice && softwareGl) {
    renderer.dispose();
    canvas.dataset.renderMode = 'canvas2d';
    return mountHeroCanvas2DFallback(canvas, budget.heroCrossCount);
  }

  canvas.dataset.renderMode = 'webgl';
  renderer.setPixelRatio(softwareGl || budget.isCompactDevice ? 1 : budget.maxDpr);
  if (!softwareGl) {
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 60);
  camera.position.set(0, 0, 11.5);

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0xbae6fd, 1.95);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 2.25);
  dirLight.position.set(6, 9, 8);
  scene.add(dirLight);

  const skyPoint = new THREE.PointLight(0x38bdf8, 7.0, 24);
  skyPoint.position.set(-5, -5, 5);
  scene.add(skyPoint);

  const skyRim = new THREE.PointLight(0x0284c7, 4.8, 22);
  skyRim.position.set(6, -3, 4);
  scene.add(skyRim);

  const worldGroup = new THREE.Group();
  scene.add(worldGroup);

  const disposables: THREE.BufferGeometry[] = [];
  const orbGeom = new THREE.SphereGeometry(
    0.40,
    budget.isCompactDevice || softwareGl ? 14 : 24,
    budget.isCompactDevice || softwareGl ? 14 : 24
  );
  disposables.push(orbGeom);

  type IconMat = THREE.MeshPhysicalMaterial | THREE.MeshPhongMaterial;
  interface IconNode {
    group: THREE.Group;
    mainMat: IconMat;
    detailMat: IconMat;
    basePos: THREE.Vector3;
    rotVel: THREE.Vector3;
    phase: number;
    colorIndex: number;
  }

  const iconNodes: IconNode[] = [];
  const isSimple = budget.isCompactDevice || softwareGl;

  const createMat = (hex: number, isWhite: boolean): IconMat =>
    isSimple
      ? new THREE.MeshPhongMaterial({
          color: hex,
          specular: 0xffffff,
          shininess: 105,
          emissive: isWhite ? 0xe0f2fe : 0x000000,
          emissiveIntensity: isWhite ? 0.22 : 0,
        })
      : new THREE.MeshPhysicalMaterial({
          color: hex,
          roughness: 0.16,
          metalness: 0.08,
          clearcoat: 1.0,
          clearcoatRoughness: 0.08,
          emissive: isWhite ? 0xe0f2fe : 0x000000,
          emissiveIntensity: isWhite ? 0.18 : 0,
        });

  for (let i = 0; i < budget.heroCrossCount; i++) {
    const ratioRoll = i / budget.heroCrossCount;
    const colorIndex = ratioRoll < 0.36 ? 0 : ratioRoll < 0.65 ? 1 : ratioRoll < 0.86 ? 2 : 3;
    const detailHex = colorIndex === 3 ? 0xe0f2fe : colorIndex === 0 ? 0x0284c7 : 0x082f49;

    const mainMat = createMat(COLOR_CYCLE[colorIndex], colorIndex === 0);
    const detailMat = createMat(detailHex, false);
    const kind = ICON_KINDS[i % ICON_KINDS.length];
    const group = buildServiceIconGroup(kind, mainMat, detailMat, isSimple, disposables);

    const angle = (i / budget.heroCrossCount) * Math.PI * 2 + 0.22;
    const ringRadiusX = (budget.isCompactDevice ? 2.6 : 4.65) + (i % 3) * 1.12;
    const ringRadiusY = (budget.isCompactDevice ? 3.2 : 2.95) + ((i + 1) % 3) * 0.72;
    const basePos = new THREE.Vector3(
      Math.cos(angle) * ringRadiusX,
      Math.sin(angle) * ringRadiusY,
      -2.4 + (i % 4) * 1.05
    );

    group.position.copy(basePos);
    const scale = (budget.isCompactDevice ? 0.56 : 0.72) + (i % 3) * 0.12;
    group.scale.setScalar(scale);
    group.rotation.set(i * 0.45, i * 0.75, (i % 2 === 0 ? 1 : -1) * 0.22);
    group.traverse((child) => {
      child.userData.iconIndex = i;
    });

    worldGroup.add(group);
    iconNodes.push({
      group,
      mainMat,
      detailMat,
      basePos,
      rotVel: new THREE.Vector3(
        (i % 2 === 0 ? 1 : -1) * (0.14 + (i % 3) * 0.04),
        (i % 3 === 0 ? -1 : 1) * (0.24 + (i % 4) * 0.04),
        0.08
      ),
      phase: i * 0.92,
      colorIndex,
    });
  }

  const orbMaterial = isSimple
    ? new THREE.MeshPhongMaterial({
        color: 0xbae6fd,
        specular: 0xffffff,
        shininess: 90,
        transparent: true,
        opacity: 0.52,
      })
    : new THREE.MeshStandardMaterial({
        color: 0xbae6fd,
        roughness: 0.12,
        metalness: 0.02,
        transparent: true,
        opacity: 0.52,
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
  let activeUntil = performance.now() + 1200;

  const markActive = () => {
    activeUntil = performance.now() + 1400;
  };

  const onPointerMove = (e: PointerEvent) => {
    targetPointerX = (e.clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
    targetPointerY = (e.clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
    markActive();
  };

  const onDeviceOrientation = (e: DeviceOrientationEvent) => {
    if (e.gamma == null || e.beta == null) return;
    targetPointerX = Math.max(-1, Math.min(1, e.gamma / 30));
    targetPointerY = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
    markActive();
  };

  const raycaster = new THREE.Raycaster();
  const pointerNdc = new THREE.Vector2();

  const onCanvasClick = (e: MouseEvent) => {
    markActive();
    const rect = canvas.getBoundingClientRect();
    pointerNdc.x = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
    pointerNdc.y = -((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 + 1;
    raycaster.setFromCamera(pointerNdc, camera);

    const hits = raycaster.intersectObjects(
      iconNodes.map((n) => n.group),
      true
    );
    if (!hits.length) return;

    const idx = hits[0].object.userData.iconIndex as number | undefined;
    const node = idx !== undefined ? iconNodes[idx] : undefined;
    if (!node) return;

    node.colorIndex = (node.colorIndex + 1) % COLOR_CYCLE.length;
    node.mainMat.color.setHex(COLOR_CYCLE[node.colorIndex]);
    node.mainMat.emissive.setHex(node.colorIndex === 0 ? 0xe0f2fe : 0x000000);
    node.mainMat.emissiveIntensity = node.colorIndex === 0 ? 0.18 : 0;
    const nextDetailHex = node.colorIndex === 3 ? 0xe0f2fe : node.colorIndex === 0 ? 0x0284c7 : 0x082f49;
    node.detailMat.color.setHex(nextDetailHex);

    const baseScale = node.group.scale.x;
    gsap.fromTo(
      node.group.scale,
      { x: baseScale, y: baseScale, z: baseScale },
      {
        x: baseScale * 1.24,
        y: baseScale * 1.24,
        z: baseScale * 1.24,
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
  let lastRenderTime = 0;

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
    rafId = requestAnimationFrame(tick);
    const userPaused = Boolean((window as Window & { __amcHeroPaused?: boolean }).__amcHeroPaused);
    if (!inViewport || tabHidden || userPaused) return;

    const minInterval = softwareGl ? 90 : now < activeUntil ? 15 : 42;
    const elapsed = now - lastRenderTime;
    if (elapsed < minInterval) return;
    const dt = Math.min(0.06, elapsed * 0.001);
    lastRenderTime = now;

    const t = now * 0.001;
    smoothPointerX += (targetPointerX - smoothPointerX) * 0.07;
    smoothPointerY += (targetPointerY - smoothPointerY) * 0.07;

    const mobileScrollTilt = budget.isCompactDevice ? window.scrollY * 0.0004 : 0;
    worldGroup.rotation.y = smoothPointerX * 0.28;
    worldGroup.rotation.x = -smoothPointerY * 0.2 + mobileScrollTilt;

    for (const node of iconNodes) {
      const drift = pseudoCurlOffset(node.basePos.x, node.basePos.y, t + node.phase);
      node.group.position.set(
        node.basePos.x + drift.dx,
        node.basePos.y + drift.dy,
        node.basePos.z + drift.dz
      );
      node.group.rotation.x += node.rotVel.x * dt;
      node.group.rotation.y += node.rotVel.y * dt;
      node.group.rotation.z += node.rotVel.z * dt;
    }

    for (const orb of orbs) {
      orb.mesh.position.y = orb.basePos.y + Math.sin(t * 0.9 + orb.phase) * 0.26;
      orb.mesh.position.x = orb.basePos.x + Math.cos(t * 0.7 + orb.phase) * 0.18;
    }

    renderer.render(scene, camera);
  };

  resize();
  renderer.render(scene, camera);
  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('scroll', markActive, { passive: true });
  window.addEventListener('deviceorientation', onDeviceOrientation, { passive: true });
  canvas.addEventListener('click', onCanvasClick);
  document.addEventListener('visibilitychange', onVis);
  rafId = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(rafId);
    io.disconnect();
    window.removeEventListener('resize', resize);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('scroll', markActive);
    window.removeEventListener('deviceorientation', onDeviceOrientation);
    canvas.removeEventListener('click', onCanvasClick);
    document.removeEventListener('visibilitychange', onVis);
    disposables.forEach((g) => g.dispose());
    orbMaterial.dispose();
    iconNodes.forEach((n) => {
      n.mainMat.dispose();
      n.detailMat.dispose();
    });
    renderer.dispose();
  };
}
