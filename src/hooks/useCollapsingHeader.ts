/**
 * Scroll binding for a collapsing header.
 *
 * Opacity and scale read `motionProgress` (native driver, stepped when
 * Reduce Motion is on). Height and padding read `heightProgress` (JS
 * driver). The two nodes are never mixed on one view.
 *
 * `compactActive` flips only when the compact title becomes the one a
 * screen reader should land on, so scrolling does not re-render every frame.
 *
 * `fadeAt` is optional. When it is set, `faded` flips once progress reaches
 * that point (Today uses it so a fading week strip stops taking taps).
 * Activity omits it, and the hook then never stores an extra flag.
 *
 * `snapLayout` defaults to true: Reduce Motion snaps height as well as
 * opacity. Today passes false so a tall card keeps tracking the finger
 * (no hole, no overlap) while the crossfade still snaps.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, NativeScrollEvent, NativeSyntheticEvent, ScrollView } from 'react-native';
import {
  COLLAPSE_SCROLL_THROTTLE,
  DEFAULT_COLLAPSE_DISTANCE,
  collapseProgress,
  collapseReleaseHasMomentum,
  collapseSnapAnimated,
  collapseSnapTarget,
  compactTitleIsPrimary,
  resolveCollapseProgress,
  scrollProgressStops,
} from './collapsingHeader';
import { useReduceMotion } from './useReduceMotion';

export function useCollapsingHeader(options?: {
  distance?: number;
  fadeAt?: number;
  snapLayout?: boolean;
}) {
  const distance = options?.distance ?? DEFAULT_COLLAPSE_DISTANCE;
  const fadeAt = options?.fadeAt;
  const snapLayout = options?.snapLayout !== false;
  const reduceMotion = useReduceMotion();
  const reduceRef = useRef(reduceMotion);
  const distanceRef = useRef(distance);
  const fadeAtRef = useRef(fadeAt);
  const snapLayoutRef = useRef(snapLayout);
  reduceRef.current = reduceMotion;
  distanceRef.current = distance;
  fadeAtRef.current = fadeAt;
  snapLayoutRef.current = snapLayout;

  const nativeScrollY = useRef(new Animated.Value(0)).current;
  const heightProgress = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  const lastY = useRef(0);
  const mounted = useRef(true);
  const compactRef = useRef(false);
  const fadedRef = useRef(false);
  const [compactActive, setCompactActive] = useState(false);
  const [faded, setFaded] = useState(false);
  const publishRef = useRef<(scrollY: number) => void>(() => {});

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const syncFlags = (progress: number) => {
    const primary = compactTitleIsPrimary(progress);
    if (primary !== compactRef.current && mounted.current) {
      compactRef.current = primary;
      setCompactActive(primary);
    }
    const gate = fadeAtRef.current;
    if (gate == null || !Number.isFinite(gate)) return;
    const nextFaded = progress >= gate;
    if (nextFaded !== fadedRef.current && mounted.current) {
      fadedRef.current = nextFaded;
      setFaded(nextFaded);
    }
  };

  const readProgress = (scrollY: number, reduce: boolean, span: number) => {
    const visual = resolveCollapseProgress(scrollY, { reduceMotion: reduce, distance: span });
    const layout = !reduce || snapLayoutRef.current
      ? visual
      : collapseProgress(scrollY, span);
    return { visual, layout };
  };

  publishRef.current = (scrollY: number) => {
    lastY.current = scrollY;
    const { visual, layout } = readProgress(scrollY, reduceRef.current, distanceRef.current);
    heightProgress.setValue(layout);
    syncFlags(visual);
  };

  useEffect(() => {
    const { visual, layout } = readProgress(lastY.current, reduceMotion, distance);
    heightProgress.setValue(layout);
    const primary = compactTitleIsPrimary(visual);
    compactRef.current = primary;
    setCompactActive(primary);
    const gate = fadeAtRef.current;
    if (gate != null && Number.isFinite(gate)) {
      const nextFaded = visual >= gate;
      fadedRef.current = nextFaded;
      setFaded(nextFaded);
    }
  }, [reduceMotion, distance, fadeAt, snapLayout, heightProgress]);

  const snapSettledOffset = useCallback((scrollY: number) => {
    const target = collapseSnapTarget(scrollY, distanceRef.current);
    if (target == null) return;
    const animated = collapseSnapAnimated(reduceRef.current);
    scrollRef.current?.scrollTo({ y: target, animated });
    if (!animated) {
      nativeScrollY.setValue(target);
      publishRef.current(target);
    }
  }, [nativeScrollY]);

  const onScrollEndDrag = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (collapseReleaseHasMomentum(event.nativeEvent.velocity?.y)) return;
    snapSettledOffset(event.nativeEvent.contentOffset.y);
  }, [snapSettledOffset]);

  const onMomentumScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    snapSettledOffset(event.nativeEvent.contentOffset.y);
  }, [snapSettledOffset]);

  const onScroll = useMemo(
    () =>
      Animated.event(
        [{ nativeEvent: { contentOffset: { y: nativeScrollY } } }],
        {
          useNativeDriver: true,
          listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            publishRef.current(event.nativeEvent.contentOffset.y);
          },
        },
      ),
    [nativeScrollY],
  );

  const motionProgress = useMemo(() => {
    const { inputRange, outputRange } = scrollProgressStops(distance, reduceMotion);
    return nativeScrollY.interpolate({
      inputRange,
      outputRange,
      extrapolate: 'clamp',
    });
  }, [nativeScrollY, distance, reduceMotion]);

  return {
    scrollRef,
    onScroll,
    onScrollEndDrag,
    onMomentumScrollEnd,
    scrollEventThrottle: COLLAPSE_SCROLL_THROTTLE,
    heightProgress,
    motionProgress,
    compactActive,
    /** True once scroll progress has reached `fadeAt`. Stays false when `fadeAt` is omitted. */
    faded,
    reduceMotion,
  };
}
