import {
  findSphereAtPoint,
  stepSphereParticlePhysics,
  type SphereBody,
  type SpherePointerState,
} from '@/utils/about-interactive';

const SPHERE_PALETTES: Record<
  SphereBody['tone'],
  { hi: string; mid: string; shadow: string; rim: string; glow: string }
> = {
  pearl: {
    hi: '#FFFFFF',
    mid: '#F0F9FF',
    shadow: '#BAE6FD',
    rim: '#7DD3FC',
    glow: 'rgba(14, 165, 233, 0.14)',
  },
  light: {
    hi: '#FFFFFF',
    mid: '#BAE6FD',
    shadow: '#38BDF8',
    rim: '#0EA5E9',
    glow: 'rgba(14, 165, 233, 0.18)',
  },
  sky: {
    hi: '#F0F9FF',
    mid: '#7DD3FC',
    shadow: '#0284C7',
    rim: '#0369A1',
    glow: 'rgba(2, 132, 199, 0.22)',
  },
  deep: {
    hi: '#BAE6FD',
    mid: '#38BDF8',
    shadow: '#0369A1',
    rim: '#082F49',
    glow: 'rgba(8, 47, 73, 0.24)',
  },
};

interface SphereInstance {
  setPaused: (paused: boolean) => void;
}

function mountInteractiveSphereCanvas(canvas: HTMLCanvasElement): SphereInstance | null {
  const ctx = canvas.getContext('2d');
  const stage = canvas.closest<HTMLElement>('[data-spheres-stage]') ?? canvas.parentElement;
  if (!ctx || !stage) return null;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < 768;
  const density = canvas.dataset.spheresDensity === 'cta' ? 'cta' : 'hero';
  const count =
    density === 'cta'
      ? isMobile
        ? 10
        : 18
      : isMobile
        ? 13
        : 24;

  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let visible = true;
  let paused = false;
  let rafId = 0;
  let lastTime = performance.now();

  const spheres: SphereBody[] = [];
  const pointer: SpherePointerState = {
    x: -9999,
    y: -9999,
    vx: 0,
    vy: 0,
    active: false,
    grabbedIndex: null,
  };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(320, rect.width);
    height = Math.max(320, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const seed = () => {
    spheres.length = 0;
    const tones: SphereBody['tone'][] = ['pearl', 'light', 'sky', 'light', 'deep', 'pearl'];
    for (let i = 0; i < count; i++) {
      const radius = isMobile
        ? 16 + ((i * 11) % 20)
        : 22 + ((i * 17) % 34);
      // Distribute organically with richer clusters around right/perimeter so headline stays super readable
      const angle = (i / count) * Math.PI * 2 + 0.35;
      const ringBias = i % 3 === 0 ? 0.42 : 0.28 + (i % 5) * 0.04;
      const x = Math.max(
        radius + 12,
        Math.min(width - radius - 12, width * (0.52 + Math.cos(angle) * ringBias))
      );
      const y = Math.max(
        radius + 12,
        Math.min(height - radius - 12, height * (0.5 + Math.sin(angle) * ringBias))
      );
      spheres.push({
        x,
        y,
        vx: ((i % 2 === 0 ? 1 : -1) * (0.25 + (i % 4) * 0.12)),
        vy: ((i % 3 === 0 ? -1 : 1) * (0.2 + (i % 3) * 0.12)),
        radius,
        mass: (radius / 26) * (radius / 26),
        tone: tones[i % tones.length],
        phase: (i * 1.17) % (Math.PI * 2),
      });
    }
  };

  const drawSphere = (s: SphereBody, isGrabbed: boolean) => {
    const pal = SPHERE_PALETTES[s.tone];
    const r = isGrabbed ? s.radius * 1.07 : s.radius;

    // 1. Soft ambient drop shadow
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(s.x + r * 0.14, s.y + r * 0.22, r * 0.92, r * 0.88, 0, 0, Math.PI * 2);
    ctx.fillStyle = pal.glow;
    ctx.fill();

    // 2. Main 3D studio-lit sphere body
    const gx = s.x - r * 0.34;
    const gy = s.y - r * 0.36;
    const grad = ctx.createRadialGradient(gx, gy, r * 0.06, s.x, s.y, r);
    grad.addColorStop(0, pal.hi);
    grad.addColorStop(0.38, pal.mid);
    grad.addColorStop(0.78, pal.shadow);
    grad.addColorStop(1, pal.rim);

    ctx.beginPath();
    ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // 3. Subtle bottom-right bounce rim light
    const rimGrad = ctx.createRadialGradient(
      s.x + r * 0.36,
      s.y + r * 0.42,
      r * 0.05,
      s.x + r * 0.2,
      s.y + r * 0.2,
      r * 0.9
    );
    rimGrad.addColorStop(0, 'rgba(255, 255, 255, 0.36)');
    rimGrad.addColorStop(0.55, 'rgba(125, 211, 252, 0.06)');
    rimGrad.addColorStop(1, 'rgba(125, 211, 252, 0)');
    ctx.fillStyle = rimGrad;
    ctx.fill();

    // 4. Crisp top-left glossy specular highlight
    ctx.beginPath();
    ctx.ellipse(
      s.x - r * 0.32,
      s.y - r * 0.34,
      r * 0.22,
      r * 0.13,
      -Math.PI / 4,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
    ctx.fill();

    // 5. Crisp subtle glass rim outline (+ cyan active grab ring)
    ctx.beginPath();
    ctx.arc(s.x, s.y, r - 0.5, 0, Math.PI * 2);
    ctx.strokeStyle = isGrabbed ? 'rgba(2, 132, 199, 0.85)' : 'rgba(255, 255, 255, 0.55)';
    ctx.lineWidth = isGrabbed ? 2.5 : 1;
    ctx.stroke();

    if (isGrabbed) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, r + 6, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    ctx.restore();
  };

  const render = (now: number) => {
    const dt = Math.min(2, Math.max(0.4, (now - lastTime) / 16.667));
    lastTime = now;

    if (!reduced && !paused) {
      stepSphereParticlePhysics(spheres, pointer, { width, height }, dt);
      pointer.vx *= 0.82;
      pointer.vy *= 0.82;
    }

    ctx.clearRect(0, 0, width, height);
    // Draw non-grabbed spheres first, grabbed sphere on top
    for (let i = 0; i < spheres.length; i++) {
      if (i !== pointer.grabbedIndex) {
        drawSphere(spheres[i], false);
      }
    }
    if (pointer.grabbedIndex !== null && spheres[pointer.grabbedIndex]) {
      drawSphere(spheres[pointer.grabbedIndex], true);
    }

    if (!reduced && visible && !paused) {
      rafId = window.requestAnimationFrame(render);
    }
  };

  const getLocalPos = (clientX: number, clientY: number) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const markInteractiveMoved = () => {
    if (canvas.dataset.spheresMoved !== 'true') {
      canvas.dataset.spheresMoved = 'true';
    }
  };

  resize();
  seed();
  canvas.dataset.sphereCount = String(spheres.length);
  render(performance.now());

  if (reduced) {
    return { setPaused: () => {} };
  }

  stage.addEventListener('pointerdown', (e) => {
    const target = e.target as HTMLElement | null;
    if (target?.closest('a, button, input, select, textarea, [role="button"]')) {
      return;
    }
    const pos = getLocalPos(e.clientX, e.clientY);
    pointer.x = pos.x;
    pointer.y = pos.y;
    pointer.vx = 0;
    pointer.vy = 0;
    pointer.active = true;

    const hit = findSphereAtPoint(spheres, pos.x, pos.y);
    if (hit !== null) {
      pointer.grabbedIndex = hit;
      stage.classList.add('is-grabbing');
      markInteractiveMoved();
      if (paused) render(performance.now());
    } else {
      // Gentle radial impulse ripple from tap point so clicking anywhere nudges nearby spheres
      for (const s of spheres) {
        const dx = s.x - pos.x;
        const dy = s.y - pos.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 1 && dist < 240) {
          const impulse = ((240 - dist) / 240) * 6.5;
          s.vx += (dx / dist) * impulse;
          s.vy += (dy / dist) * impulse;
        }
      }
      markInteractiveMoved();
    }
  });

  stage.addEventListener(
    'pointermove',
    (e) => {
      const pos = getLocalPos(e.clientX, e.clientY);
      if (pointer.active) {
        pointer.vx = Math.max(-28, Math.min(28, pos.x - pointer.x));
        pointer.vy = Math.max(-28, Math.min(28, pos.y - pointer.y));
        if (Math.hypot(pointer.vx, pointer.vy) > 1.5) {
          markInteractiveMoved();
        }
      }
      pointer.x = pos.x;
      pointer.y = pos.y;
      pointer.active = true;
    },
    { passive: true }
  );

  const releaseGrab = () => {
    if (pointer.grabbedIndex !== null) {
      pointer.grabbedIndex = null;
      stage.classList.remove('is-grabbing');
    }
  };

  window.addEventListener('pointerup', releaseGrab);
  window.addEventListener('pointercancel', releaseGrab);
  stage.addEventListener('pointerleave', () => {
    pointer.active = false;
    releaseGrab();
  });

  const io = new IntersectionObserver(
    (entries) => {
      visible = Boolean(entries[0]?.isIntersecting);
      if (visible && !paused) {
        lastTime = performance.now();
        window.cancelAnimationFrame(rafId);
        rafId = window.requestAnimationFrame(render);
      } else {
        window.cancelAnimationFrame(rafId);
      }
    },
    { threshold: 0.04 }
  );
  io.observe(canvas);

  window.addEventListener('resize', () => {
    resize();
    if (paused) render(performance.now());
  });

  rafId = window.requestAnimationFrame(render);

  return {
    setPaused: (nextPaused: boolean) => {
      paused = nextPaused;
      if (!paused && visible) {
        lastTime = performance.now();
        window.cancelAnimationFrame(rafId);
        rafId = window.requestAnimationFrame(render);
      } else if (paused) {
        window.cancelAnimationFrame(rafId);
      }
    },
  };
}

export function initAboutFluidParticles(): void {
  const canvases = Array.from(
    document.querySelectorAll<HTMLCanvasElement>('[data-about-spheres]')
  );
  if (!canvases.length) return;

  const instances = canvases
    .map((canvas) => mountInteractiveSphereCanvas(canvas))
    .filter((inst): inst is SphereInstance => Boolean(inst));

  const pauseBtn = document.getElementById('about-particles-pause');
  let paused = false;
  pauseBtn?.addEventListener('click', () => {
    paused = !paused;
    pauseBtn.setAttribute('aria-pressed', paused ? 'true' : 'false');
    pauseBtn.textContent = paused ? 'Putar Bola 3D' : 'Jeda Bola 3D';
    for (const inst of instances) {
      inst.setPaused(paused);
    }
  });
}
