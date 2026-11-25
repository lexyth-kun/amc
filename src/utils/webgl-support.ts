export type SceneRenderMode = 'webgl' | 'canvas2d' | 'static';

export interface DetectRenderModeOptions {
  prefersReducedMotion: boolean;
  createContext?: () => WebGLRenderingContext | WebGL2RenderingContext | null;
}

export interface AdaptiveBudgetInput {
  viewportWidth: number;
  deviceMemoryGb?: number;
  dpr?: number;
}

export interface AdaptiveObjectBudget {
  isCompactDevice: boolean;
  maxDpr: number;
  heroCrossCount: number;
  heroOrbCount: number;
  tunnelParticleCount: number;
}

export function detectRenderMode(options: DetectRenderModeOptions): SceneRenderMode {
  if (options.prefersReducedMotion) {
    return 'static';
  }

  try {
    const factory =
      options.createContext ??
      (() => {
        if (typeof document === 'undefined') return null;
        const probe = document.createElement('canvas');
        return (
          (probe.getContext('webgl2') as WebGL2RenderingContext | null) ??
          (probe.getContext('webgl') as WebGLRenderingContext | null)
        );
      });

    const ctx = factory();
    return ctx ? 'webgl' : 'canvas2d';
  } catch {
    return 'canvas2d';
  }
}

export function getAdaptiveObjectBudget(input: AdaptiveBudgetInput): AdaptiveObjectBudget {
  const isMobileWidth = input.viewportWidth < 768;
  const isLowMemory = typeof input.deviceMemoryGb === 'number' && input.deviceMemoryGb <= 4;
  const isCompactDevice = isMobileWidth || isLowMemory;
  const rawDpr = input.dpr ?? 1;

  return {
    isCompactDevice,
    maxDpr: Math.min(rawDpr, isCompactDevice ? 1.75 : 2),
    heroCrossCount: isCompactDevice ? 9 : 15,
    heroOrbCount: isCompactDevice ? 4 : 6,
    tunnelParticleCount: isCompactDevice ? 120 : 240,
  };
}
