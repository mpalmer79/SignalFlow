// A quiet, premium background motion for the landing hero: one or two thin
// navy signal waves that drift slowly across the page, like a system signal
// moving through it. Pure inline SVG and CSS, no library, no canvas, no
// network, no image. It is decorative, sits behind the hero content, never
// blocks clicks, and is hidden on small screens. The drift is defined in
// app/globals.css and is disabled under prefers-reduced-motion.

const MID = 100;
const PERIOD = 360;
// The SVG is twice the viewport width so the keyframe can translate it by half
// its width for a seamless loop. The wave period divides one screen width
// (1440), so each loop lands on an identical phase.
const SCREEN = 1440;
const TOTAL = SCREEN * 2;

// Build a smooth, repeating wave path. One cubic per period gives a calm,
// sine-like line with no sharp corners.
function buildWave(amplitude: number, offsetY: number): string {
  const baseline = MID + offsetY;
  let d = `M0 ${baseline}`;
  for (let x = 0; x < TOTAL; x += PERIOD) {
    d +=
      ` C ${x + PERIOD / 4} ${baseline - amplitude},` +
      ` ${x + (PERIOD * 3) / 4} ${baseline + amplitude},` +
      ` ${x + PERIOD} ${baseline}`;
  }
  return d;
}

const PRIMARY_WAVE = buildWave(16, 0);
const ECHO_WAVE = buildWave(11, 18);

export function SignalWaveBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden md:block"
    >
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
        <svg
          className="signal-wave block h-[200px] w-[200%] text-foreground"
          viewBox={`0 0 ${TOTAL} 200`}
          fill="none"
          preserveAspectRatio="none"
          focusable="false"
        >
          <path
            d={PRIMARY_WAVE}
            stroke="currentColor"
            strokeOpacity={0.14}
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={ECHO_WAVE}
            stroke="currentColor"
            strokeOpacity={0.08}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </div>
  );
}
