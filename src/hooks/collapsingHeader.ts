/**
 * Scroll-linked collapsing header math.
 *
 * Progress is 0 when the header is fully expanded and 1 when it is the
 * compact bar. Values are clamped: pulling past the top does not stretch
 * the header, and there is no spring overshoot.
 *
 * Height has to be interpolated on the JS driver. Opacity and scale use the
 * same stops through a native-driver node (see useCollapsingHeader).
 */

export const DEFAULT_COLLAPSE_DISTANCE = 56;
/** Reduce Motion jumps from expanded to compact at the halfway point. */
export const REDUCE_MOTION_SNAP_AT = 0.5;
/** Large title scale once the header is fully compact. Linear, no bounce. */
export const LARGE_TITLE_SCALE_END = 0.86;
/** How often the JS scroll listener runs. Native opacity still tracks the frame. */
export const COLLAPSE_SCROLL_THROTTLE = 16;

export type CollapseStop = { readonly at: number; readonly value: number };

/** Large title stays put, then fades out across one short handoff. */
export const LARGE_TITLE_OPACITY_STOPS: readonly CollapseStop[] = [
  { at: 0, value: 1 },
  { at: 0.62, value: 1 },
  { at: 0.82, value: 0 },
  { at: 1, value: 0 },
];

/** Compact title fades in over that same handoff, so the bar is never blank. */
export const COMPACT_TITLE_OPACITY_STOPS: readonly CollapseStop[] = [
  { at: 0, value: 0 },
  { at: 0.55, value: 0 },
  { at: 0.82, value: 1 },
  { at: 1, value: 1 },
];

/** Subtitle leaves before the title handoff, so the two fades do not stack. */
export const SUBTITLE_OPACITY_STOPS: readonly CollapseStop[] = [
  { at: 0, value: 1 },
  { at: 0.5, value: 0 },
  { at: 1, value: 0 },
];

export type CollapsingHeaderMetrics = {
  expandedHeight: number;
  compactHeight: number;
  paddingTop: number;
  paddingBottom: number;
  compactPaddingVertical: number;
  borderWidth: number;
  paddingHorizontal: number;
  radius: number;
  /** Card offset from the top of the full-bleed bar (already inside the safe area). */
  insetTop: number;
  insetHorizontal: number;
};

export function clamp01(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

/**
 * Where a resting finger should land if it stopped inside the collapse.
 * `null` means the offset is already on an end (or past it) and should stay.
 * The exact midpoint finishes the collapse, since neither end is nearer.
 */
export function collapseSnapTarget(scrollY: number, distance: number): number | null {
  if (!Number.isFinite(scrollY) || !Number.isFinite(distance) || distance <= 0) return null;
  if (scrollY <= 0 || scrollY >= distance) return null;
  const toStart = scrollY;
  const toEnd = distance - scrollY;
  return toEnd < toStart ? distance : toStart < toEnd ? 0 : distance;
}

/** A drag release with no velocity has no momentum scroll after it. */
export function collapseReleaseHasMomentum(velocityY: number | null | undefined): boolean {
  if (velocityY == null || !Number.isFinite(velocityY)) return false;
  return velocityY !== 0;
}

/** Reduce Motion jumps. Everyone else gets one short scroll animation. */
export function collapseSnapAnimated(reduceMotion: boolean): boolean {
  return !reduceMotion;
}

/** 0 at rest, 1 after `distance` pt of downward scroll. */
export function collapseProgress(
  scrollY: number,
  distance = DEFAULT_COLLAPSE_DISTANCE,
): number {
  if (!Number.isFinite(scrollY) || scrollY <= 0) return 0;
  if (!Number.isFinite(distance) || distance <= 0) return 1;
  if (scrollY >= distance) return 1;
  return scrollY / distance;
}

/**
 * Continuous progress, or 0/1 when Reduce Motion is on.
 * The snap is a direct set, not a timed animation.
 */
export function resolveCollapseProgress(
  scrollY: number,
  options: {
    reduceMotion: boolean;
    distance?: number;
    snapAt?: number;
  },
): number {
  const raw = collapseProgress(scrollY, options.distance);
  if (!options.reduceMotion) return raw;
  const snapAt = options.snapAt ?? REDUCE_MOTION_SNAP_AT;
  return raw >= snapAt ? 1 : 0;
}

/**
 * Maps scroll offset (pt) to 0..1 for the native-driver node.
 * Reduce Motion is a step at the snap point. Input points stay strictly
 * increasing so Animated.interpolate will accept them.
 */
export function scrollProgressStops(
  distance: number,
  reduceMotion: boolean,
  snapAt = REDUCE_MOTION_SNAP_AT,
): { inputRange: number[]; outputRange: number[] } {
  const span = Number.isFinite(distance) && distance > 0 ? distance : 1;
  if (!reduceMotion) {
    return { inputRange: [0, span], outputRange: [0, 1] };
  }
  const eps = Math.min(0.001, span / 4);
  let mid = span * snapAt;
  if (mid <= 0) mid = eps;
  if (mid >= span) mid = span - eps;
  const points = [0, mid, Math.min(span, mid + eps), span];
  const inputRange: number[] = [];
  for (const point of points) {
    const prev = inputRange.length ? inputRange[inputRange.length - 1] : -Infinity;
    inputRange.push(inputRange.length === 0 ? point : Math.max(point, prev + eps));
  }
  return { inputRange, outputRange: [0, 0, 1, 1] };
}

/** Piecewise linear sample. Matches Animated.interpolate between the same stops. */
export function sampleStops(progress: number, stops: readonly CollapseStop[]): number {
  const p = clamp01(progress);
  const first = stops[0];
  if (!first) return 0;
  if (p <= first.at) return first.value;
  for (let i = 1; i < stops.length; i++) {
    const prev = stops[i - 1];
    const next = stops[i];
    if (p <= next.at) {
      const span = next.at - prev.at;
      if (span <= 0) return next.value;
      const t = (p - prev.at) / span;
      return prev.value + (next.value - prev.value) * t;
    }
  }
  return stops[stops.length - 1].value;
}

export function stopRanges(stops: readonly CollapseStop[]): {
  inputRange: number[];
  outputRange: number[];
} {
  return {
    inputRange: stops.map(stop => stop.at),
    outputRange: stops.map(stop => stop.value),
  };
}

export function largeTitleOpacity(progress: number): number {
  return sampleStops(progress, LARGE_TITLE_OPACITY_STOPS);
}

export function compactTitleOpacity(progress: number): number {
  return sampleStops(progress, COMPACT_TITLE_OPACITY_STOPS);
}

export function subtitleOpacity(progress: number): number {
  return sampleStops(progress, SUBTITLE_OPACITY_STOPS);
}

export function largeTitleScale(progress: number): number {
  const p = clamp01(progress);
  return 1 + (LARGE_TITLE_SCALE_END - 1) * p;
}

export function headerHeight(progress: number, expanded: number, compact: number): number {
  const p = clamp01(progress);
  return expanded + (compact - expanded) * p;
}

/** Full-bleed bar: the top inset plus the card. Content scrolls behind this. */
export function collapsingBarHeight(
  progress: number,
  insetTop: number,
  expanded: number,
  compact: number,
): number {
  return insetTop + headerHeight(progress, expanded, compact);
}

/** True once the compact title is at least as visible as the large one. */
export function compactTitleIsPrimary(progress: number): boolean {
  const p = clamp01(progress);
  if (p <= 0) return false;
  if (p >= 1) return true;
  return compactTitleOpacity(p) >= largeTitleOpacity(p);
}
