/**
 * Scroll binding for a collapsing header.
 *
 * Opacity and scale read `motionProgress` (native driver, stepped when
 * Reduce Motion is on). Height and padding read `heightProgress` (JS
 * driver). The two nodes are never mixed on one view.
 *
 * `compactActive` flips only when the compact title becomes the one a
 * screen reader should land on, so scrolling does not re-render every frame.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import {
  COLLAPSE_SCROLL_THROTTLE,
  DEFAULT_COLLAPSE_DISTANCE,
  compactTitleIsPrimary,
  resolveCollapseProgress,
  scrollProgressStops,
} from './collapsingHeader';
import { useReduceMotion } from './useReduceMotion';

export function useCollapsingHeader(options?: { distance?: number }) {
  const distance = options?.distance ?? DEFAULT_COLLAPSE_DISTANCE;
  const reduceMotion = useReduceMotion();
  const reduceRef = useRef(reduceMotion);
  const distanceRef = useRef(distance);
  reduceRef.current = reduceMotion;
  distanceRef.current = distance;

  const nativeScrollY = useRef(new Animated.Value(0)).current;
  const heightProgress = useRef(new Animated.Value(0)).current;
  const lastY = useRef(0);
  const mounted = useRef(true);
  const compactRef = useRef(false);
  const [compactActive, setCompactActive] = useState(false);
  const publishRef = useRef<(scrollY: number) => void>(() => {});

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  publishRef.current = (scrollY: number) => {
    lastY.current = scrollY;
    const progress = resolveCollapseProgress(scrollY, {
      reduceMotion: reduceRef.current,
      distance: distanceRef.current,
    });
    heightProgress.setValue(progress);
    const primary = compactTitleIsPrimary(progress);
    if (primary !== compactRef.current && mounted.current) {
      compactRef.current = primary;
      setCompactActive(primary);
    }
  };

  useEffect(() => {
    const progress = resolveCollapseProgress(lastY.current, { reduceMotion, distance });
    heightProgress.setValue(progress);
    const primary = compactTitleIsPrimary(progress);
    compactRef.current = primary;
    setCompactActive(primary);
  }, [reduceMotion, distance, heightProgress]);

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
    onScroll,
    scrollEventThrottle: COLLAPSE_SCROLL_THROTTLE,
    heightProgress,
    motionProgress,
    compactActive,
    reduceMotion,
  };
}
