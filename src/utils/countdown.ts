export interface CountdownParts {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  isExpired: boolean;
}

function pad2(n: number): string {
  return String(Math.max(0, Math.floor(n))).padStart(2, '0');
}

export function computeCountdownParts(endsAtIso: string, nowMs = Date.now()): CountdownParts {
  const endMs = new Date(endsAtIso).getTime();
  if (Number.isNaN(endMs) || nowMs >= endMs) {
    return {
      days: '00',
      hours: '00',
      minutes: '00',
      seconds: '00',
      isExpired: true,
    };
  }

  const totalSec = Math.floor((endMs - nowMs) / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  return {
    days: pad2(days),
    hours: pad2(hours),
    minutes: pad2(minutes),
    seconds: pad2(seconds),
    isExpired: false,
  };
}
