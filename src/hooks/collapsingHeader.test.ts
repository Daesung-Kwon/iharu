import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  COLLAPSE_SCROLL_THROTTLE,
  COMPACT_TITLE_OPACITY_STOPS,
  LARGE_TITLE_OPACITY_STOPS,
  LARGE_TITLE_SCALE_END,
  REDUCE_MOTION_SNAP_AT,
  SUBTITLE_OPACITY_STOPS,
  collapseProgress,
  collapseReleaseHasMomentum,
  collapseSnapAnimated,
  collapseSnapTarget,
  collapsingBarHeight,
  compactTitleIsPrimary,
  compactTitleOpacity,
  headerHeight,
  largeTitleOpacity,
  largeTitleScale,
  resolveCollapseProgress,
  sampleStops,
  scrollProgressStops,
  stopRanges,
  subtitleOpacity,
} from './collapsingHeader';

function sampleLinear(x: number, input: readonly number[], output: readonly number[]): number {
  if (x <= input[0]) return output[0];
  const last = input.length - 1;
  if (x >= input[last]) return output[last];
  for (let i = 1; i < input.length; i++) {
    if (x <= input[i]) {
      const span = input[i] - input[i - 1];
      const t = span === 0 ? 0 : (x - input[i - 1]) / span;
      return output[i - 1] + (output[i] - output[i - 1]) * t;
    }
  }
  return output[last];
}

describe('collapseProgress', () => {
  it('is 0 at rest, 1 at the end of the distance, and clamps overscroll', () => {
    assert.equal(collapseProgress(0, 40), 0);
    assert.equal(collapseProgress(-12, 40), 0);
    assert.equal(collapseProgress(20, 40), 0.5);
    assert.equal(collapseProgress(40, 40), 1);
    assert.equal(collapseProgress(80, 40), 1);
  });

  it('treats a non-finite offset as expanded', () => {
    assert.equal(collapseProgress(Number.NaN, 40), 0);
    assert.equal(collapseProgress(Number.POSITIVE_INFINITY, 40), 0);
  });

  it('does not bounce past the ends as scroll increases', () => {
    let previous = 0;
    for (let y = 0; y <= 50; y += 1) {
      const next = collapseProgress(y, 40);
      assert.ok(next >= previous);
      assert.ok(next <= 1);
      previous = next;
    }
  });
});

describe('collapseSnapTarget', () => {
  const distance = 180;

  it('picks the nearer end and finishes the collapse on a tie', () => {
    assert.equal(collapseSnapTarget(1, distance), 0);
    assert.equal(collapseSnapTarget(distance / 2 - 0.1, distance), 0);
    assert.equal(collapseSnapTarget(distance / 2, distance), distance);
    assert.equal(collapseSnapTarget(distance / 2 + 0.1, distance), distance);
    assert.equal(collapseSnapTarget(distance - 1, distance), distance);
  });

  it('leaves the ends and anything outside the collapse alone', () => {
    assert.equal(collapseSnapTarget(0, distance), null);
    assert.equal(collapseSnapTarget(-12, distance), null);
    assert.equal(collapseSnapTarget(distance, distance), null);
    assert.equal(collapseSnapTarget(distance + 40, distance), null);
    assert.equal(collapseSnapTarget(Number.NaN, distance), null);
    assert.equal(collapseSnapTarget(20, 0), null);
    assert.equal(collapseSnapTarget(20, Number.NaN), null);
  });

  it('treats a zero release velocity as no momentum, and skips the animation when Reduce Motion is on', () => {
    assert.equal(collapseReleaseHasMomentum(undefined), false);
    assert.equal(collapseReleaseHasMomentum(null), false);
    assert.equal(collapseReleaseHasMomentum(0), false);
    assert.equal(collapseReleaseHasMomentum(-0), false);
    assert.equal(collapseReleaseHasMomentum(0.4), true);
    assert.equal(collapseReleaseHasMomentum(-1.2), true);
    assert.equal(collapseReleaseHasMomentum(Number.NaN), false);
    assert.equal(collapseSnapAnimated(false), true);
    assert.equal(collapseSnapAnimated(true), false);
  });
});

describe('resolveCollapseProgress', () => {
  it('tracks scroll when motion is allowed', () => {
    assert.equal(resolveCollapseProgress(0, { reduceMotion: false, distance: 40 }), 0);
    assert.equal(resolveCollapseProgress(10, { reduceMotion: false, distance: 40 }), 0.25);
    assert.equal(resolveCollapseProgress(40, { reduceMotion: false, distance: 40 }), 1);
  });

  it('snaps to 0 or 1 at the halfway point when Reduce Motion is on', () => {
    const distance = 40;
    const snap = distance * REDUCE_MOTION_SNAP_AT;
    assert.equal(REDUCE_MOTION_SNAP_AT, 0.5);
    assert.equal(resolveCollapseProgress(snap - 0.01, { reduceMotion: true, distance }), 0);
    assert.equal(resolveCollapseProgress(snap, { reduceMotion: true, distance }), 1);
    assert.equal(resolveCollapseProgress(distance, { reduceMotion: true, distance }), 1);
    assert.equal(resolveCollapseProgress(0, { reduceMotion: true, distance }), 0);
    for (let y = 0; y <= distance; y += 1) {
      const progress = resolveCollapseProgress(y, { reduceMotion: true, distance });
      assert.ok(progress === 0 || progress === 1);
    }
  });
});

describe('scrollProgressStops', () => {
  it('stays strictly increasing for the distances Activity uses', () => {
    for (const distance of [1, 16, 20, 44, 56]) {
      for (const reduceMotion of [false, true]) {
        const { inputRange, outputRange } = scrollProgressStops(distance, reduceMotion);
        assert.equal(outputRange.length, inputRange.length);
        for (let i = 1; i < inputRange.length; i++) {
          assert.ok(inputRange[i] > inputRange[i - 1], `${distance} ${reduceMotion} ${inputRange}`);
        }
      }
    }
  });

  it('matches the snap, with only a sub-point step at the threshold', () => {
    const distance = 40;
    const { inputRange, outputRange } = scrollProgressStops(distance, true);
    const mid = distance * REDUCE_MOTION_SNAP_AT;
    assert.equal(sampleLinear(0, inputRange, outputRange), 0);
    assert.equal(sampleLinear(mid, inputRange, outputRange), 0);
    assert.equal(sampleLinear(mid + 0.01, inputRange, outputRange), 1);
    assert.equal(sampleLinear(distance, inputRange, outputRange), 1);
  });

  it('is linear from 0 to 1 when motion is allowed', () => {
    const { inputRange, outputRange } = scrollProgressStops(40, false);
    assert.deepEqual(inputRange, [0, 40]);
    assert.deepEqual(outputRange, [0, 1]);
    assert.equal(sampleLinear(10, inputRange, outputRange), 0.25);
  });
});

describe('title interpolation', () => {
  it('keeps the large title fully visible until its fade, then hides it', () => {
    const fade = LARGE_TITLE_OPACITY_STOPS;
    assert.equal(largeTitleOpacity(0), 1);
    assert.equal(largeTitleOpacity(fade[1].at), 1);
    assert.equal(largeTitleOpacity(fade[2].at), 0);
    assert.equal(largeTitleOpacity(1), 0);
    const mid = (fade[1].at + fade[2].at) / 2;
    assert.equal(largeTitleOpacity(mid), 0.5);
  });

  it('fades the compact title in over the same handoff', () => {
    const fade = COMPACT_TITLE_OPACITY_STOPS;
    assert.equal(compactTitleOpacity(0), 0);
    assert.equal(compactTitleOpacity(fade[1].at), 0);
    assert.equal(compactTitleOpacity(fade[2].at), 1);
    assert.equal(compactTitleOpacity(1), 1);
  });

  it('drops the subtitle before the titles overlap', () => {
    assert.equal(subtitleOpacity(0), 1);
    assert.equal(subtitleOpacity(SUBTITLE_OPACITY_STOPS[1].at), 0);
    assert.equal(subtitleOpacity(1), 0);
    for (let step = 0; step <= 100; step += 1) {
      const progress = step / 100;
      const large = largeTitleOpacity(progress);
      const compact = compactTitleOpacity(progress);
      if (large > 0 && compact > 0) {
        assert.equal(subtitleOpacity(progress), 0, `subtitle still up at ${progress}`);
      }
    }
  });

  it('scales the large title down in a straight line', () => {
    assert.equal(largeTitleScale(0), 1);
    assert.equal(largeTitleScale(1), LARGE_TITLE_SCALE_END);
    assert.equal(largeTitleScale(0.5), 1 + (LARGE_TITLE_SCALE_END - 1) * 0.5);
    assert.ok(LARGE_TITLE_SCALE_END < 1);
    assert.ok(LARGE_TITLE_SCALE_END > 0.5);
  });

  it('gives the header role to the compact title once it is the stronger one, and stays there', () => {
    assert.equal(compactTitleIsPrimary(0), false);
    assert.equal(compactTitleIsPrimary(1), true);
    assert.equal(compactTitleIsPrimary(LARGE_TITLE_OPACITY_STOPS[1].at), false);
    let seenPrimary = false;
    for (let step = 0; step <= 100; step += 1) {
      const primary = compactTitleIsPrimary(step / 100);
      if (seenPrimary) assert.equal(primary, true);
      if (primary) seenPrimary = true;
    }
    assert.equal(seenPrimary, true);
  });

  it('exposes the same stops Animated.interpolate uses', () => {
    const ranges = stopRanges(LARGE_TITLE_OPACITY_STOPS);
    assert.deepEqual(ranges.inputRange, LARGE_TITLE_OPACITY_STOPS.map(stop => stop.at));
    assert.deepEqual(ranges.outputRange, LARGE_TITLE_OPACITY_STOPS.map(stop => stop.value));
    assert.equal(sampleStops(0.72, LARGE_TITLE_OPACITY_STOPS), largeTitleOpacity(0.72));
    assert.equal(COLLAPSE_SCROLL_THROTTLE, 16);
  });
});

describe('header height', () => {
  it('lerps the card and the full-bleed bar without overshoot', () => {
    assert.equal(headerHeight(0, 72, 56), 72);
    assert.equal(headerHeight(1, 72, 56), 56);
    assert.equal(headerHeight(0.5, 72, 56), 64);
    assert.equal(collapsingBarHeight(0, 12, 72, 56), 84);
    assert.equal(collapsingBarHeight(1, 12, 72, 56), 68);
    assert.equal(headerHeight(-1, 72, 56), 72);
    assert.equal(headerHeight(2, 72, 56), 56);
  });
});
