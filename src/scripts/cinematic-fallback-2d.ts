import { getTunnelWorldTheme, type TunnelPhaseState } from '@/utils/tunnel-phases';

function hexToRgb(hex: number): [number, number, number] {
  return [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];
}

function lerpRgb(
  a: [number, number, number],
  b: [number, number, number],
  t: number
): [number, number, number] {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

function drawPolygonPortal(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  sides: number,
  rotation: number
): void {
  ctx.beginPath();
  if (sides >= 16) {
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
    return;
  }
  for (let i = 0; i <= sides; i++) {
    const theta = rotation + (i / sides) * Math.PI * 2;
    const x = cx + Math.cos(theta) * radius;
    const y = cy + Math.sin(theta) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
}

export function createCinematicCanvas2DRenderer(canvas: HTMLCanvasElement): {
  renderState: (state: TunnelPhaseState, pointerX?: number, pointerY?: number) => void;
  destroy: () => void;
} {
  const ctx = canvas.getContext('2d');
  let width = 1;
  let height = 1;

  const resize = () => {
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, canvas.clientWidth);
    height = Math.max(1, canvas.clientHeight);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  resize();
  window.addEventListener('resize', resize);

  const renderState = (state: TunnelPhaseState, pointerX = 0, pointerY = 0) => {
    if (!ctx) return;
    const worldFloat = state.showcaseProgress * 5;
    const idxA = Math.max(0, Math.min(5, Math.floor(worldFloat)));
    const idxB = Math.min(5, idxA + 1);
    const blend = worldFloat - idxA;
    const themeA = getTunnelWorldTheme(idxA);
    const themeB = getTunnelWorldTheme(idxB);

    const bg = lerpRgb(hexToRgb(themeA.bgHex), hexToRgb(themeB.bgHex), blend);
    const accent = lerpRgb(hexToRgb(themeA.accentHex), hexToRgb(themeB.accentHex), blend);

    ctx.fillStyle = `rgb(${bg[0]}, ${bg[1]}, ${bg[2]})`;
    ctx.fillRect(0, 0, width, height);

    const cx = width / 2 + pointerX * 26;
    const cy = height / 2 + pointerY * 18;
    const maxR = Math.hypot(width / 2, height / 2);
    const sides = themeA.ringSides;

    // Morphing polygon perspective portals
    const ringCount = 16;
    for (let i = 0; i < ringCount; i++) {
      const depth = (((i / ringCount + state.progress * 3.0) % 1) + 1) % 1;
      const radius = Math.max(10, Math.pow(depth, 1.75) * maxR * state.tunnelRadiusScale);
      const alpha = (depth * 0.56).toFixed(3);
      ctx.strokeStyle =
        i % 3 === 0
          ? `rgba(255, 255, 255, ${(depth * 0.42).toFixed(3)})`
          : `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, ${alpha})`;
      ctx.lineWidth = 1.4 + depth * 0.8;
      drawPolygonPortal(
        ctx,
        cx,
        cy,
        radius,
        sides,
        state.tunnelTwistRad * 0.18 + i * 0.14
      );
    }

    // Radiating hyper-warp speed streaks
    const streakCount = 48;
    const streakStretch = 16 + state.warpStreakScale * 26;
    for (let i = 0; i < streakCount; i++) {
      const angle = i * 1.18 + state.tunnelTwistRad * 0.25;
      const depth = (((i * 0.047 + state.progress * 2.6) % 1) + 1) % 1;
      const innerR = (34 + depth * maxR * 0.76) * state.tunnelRadiusScale;
      const outerR = innerR + streakStretch * depth;
      ctx.strokeStyle = `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, ${(depth * 0.65).toFixed(2)})`;
      ctx.lineWidth = 1.1 + depth * 1.1;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
      ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
      ctx.stroke();
    }

    // Central Celestial Gyro Core + dual tilted rings
    const baseOrbR = Math.min(width, height) * 0.078 * state.orbScale;
    ctx.save();
    ctx.translate(cx, cy);
    for (let g = 0; g < 2; g++) {
      ctx.save();
      ctx.rotate((g === 0 ? 1 : -1) * (state.progress * Math.PI * 2.6 + g * 0.9));
      ctx.strokeStyle =
        g === 0
          ? 'rgba(255, 255, 255, 0.55)'
          : `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, 0.62)`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, Math.max(18, baseOrbR * (1.7 + g * 0.45)), Math.max(8, baseOrbR * 0.55), 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();

    const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, Math.max(14, baseOrbR * 2.2));
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(0.32, `rgb(${accent[0]}, ${accent[1]}, ${accent[2]})`);
    grad.addColorStop(0.7, `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, 0.36)`);
    grad.addColorStop(1, `rgba(${bg[0]}, ${bg[1]}, ${bg[2]}, 0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(14, baseOrbR * 2.2), 0, Math.PI * 2);
    ctx.fill();
  };

  return {
    renderState,
    destroy: () => window.removeEventListener('resize', resize),
  };
}
