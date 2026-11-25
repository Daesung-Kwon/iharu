/**
 * Activity header geometry.
 *
 * The card stays the same size at rest as the fixed header it replaces.
 * Collapse distance equals the height delta, so while the bar is shrinking
 * the gap under it does not change. Further scrolling carries the list
 * behind the bar. The list's bottom padding is the shared scroll-end inset.
 */

import { BrandAccent } from '../constants/theme';
import { Fonts } from '../constants/fonts';
import { MIN_TOUCH_TARGET } from '../hooks/layoutMetrics';
import {
  collapsingBarHeight,
  compactTitleIsPrimary,
  compactTitleOpacity,
  headerHeight,
  largeTitleOpacity,
  largeTitleScale,
  resolveCollapseProgress,
  subtitleOpacity,
  type CollapsingHeaderMetrics,
} from '../hooks/collapsingHeader';

export const ACTIVITY_TITLE = '활동 관리';
export const ACTIVITY_ADD_LABEL = '활동 추가';
export const ACTIVITY_ADD_ICON = 'ih-add-circle';
export const ACTIVITY_ADD_ICON_SIZE = 20;
/** Former stylesheet marginBottom under the card. */
export const ACTIVITY_HEADER_LIST_MARGIN = 12;
export const ACTIVITY_HEADER_BORDER_WIDTH = 2;
export const ACTIVITY_COMPACT_PADDING_V = 4;

export function activityCompactTitleSize(titleSize: number): number {
  if (titleSize >= 28) return 20;
  return 17;
}

export function activityHeaderType(titleSize: number) {
  return {
    title: ACTIVITY_TITLE,
    addLabel: ACTIVITY_ADD_LABEL,
    addIcon: ACTIVITY_ADD_ICON,
    addIconSize: ACTIVITY_ADD_ICON_SIZE,
    addColor: BrandAccent.strong,
    addMinTouch: MIN_TOUCH_TARGET,
    largeFontSize: titleSize,
    compactFontSize: activityCompactTitleSize(titleSize),
    largeFontFamily: Fonts.jua,
    compactFontFamily: Fonts.jua,
  };
}

export function activityCollapsingMetrics(layout: {
  space: number;
  titleSize: number;
  isCompact: boolean;
  cardRadius: number;
}): CollapsingHeaderMetrics {
  const borderWidth = ACTIVITY_HEADER_BORDER_WIDTH;
  const paddingTop = layout.space;
  const paddingBottom = layout.isCompact ? 12 : 20;
  const titleLine = layout.titleSize + 8;
  const inner = Math.max(titleLine, MIN_TOUCH_TARGET);
  const expandedHeight = paddingTop + inner + paddingBottom + borderWidth * 2;
  const compactHeight = ACTIVITY_COMPACT_PADDING_V * 2 + MIN_TOUCH_TARGET + borderWidth * 2;
  return {
    expandedHeight,
    compactHeight,
    paddingTop,
    paddingBottom,
    compactPaddingVertical: ACTIVITY_COMPACT_PADDING_V,
    borderWidth,
    paddingHorizontal: layout.space,
    radius: layout.cardRadius,
    insetTop: layout.space,
    insetHorizontal: layout.space,
  };
}

/** Old list top padding (space) plus the card's old marginBottom. */
export function activityListGap(space: number): number {
  return ACTIVITY_HEADER_LIST_MARGIN + space;
}

export function activityScrollPaddingTop(space: number, expandedHeight: number): number {
  return space + expandedHeight + activityListGap(space);
}

export function activityListPadding(options: {
  space: number;
  expandedHeight: number;
  scrollEndPadding: number;
}) {
  return {
    paddingTop: activityScrollPaddingTop(options.space, options.expandedHeight),
    paddingHorizontal: options.space,
    paddingBottom: options.scrollEndPadding,
  };
}

/**
 * Space between the bottom of the full-bleed bar and the first list row.
 * Positive means the row is still below the bar. Negative means it has
 * scrolled behind the bar.
 */
export function activityHeaderContentGap(options: {
  scrollY: number;
  space: number;
  expandedHeight: number;
  compactHeight: number;
  reduceMotion?: boolean;
}): number {
  const distance = options.expandedHeight - options.compactHeight;
  const y = Number.isFinite(options.scrollY) ? Math.max(0, options.scrollY) : 0;
  const progress = distance <= 0
    ? 0
    : resolveCollapseProgress(y, {
      reduceMotion: !!options.reduceMotion,
      distance,
    });
  const barBottom = collapsingBarHeight(
    progress,
    options.space,
    options.expandedHeight,
    options.compactHeight,
  );
  const contentTop = activityScrollPaddingTop(options.space, options.expandedHeight) - y;
  return contentTop - barBottom;
}

export type ActivityHeaderPresentation = ReturnType<typeof activityHeaderPresentation>;

/** What Activity renders for a scroll offset. Compact state is progress 1. */
export function activityHeaderPresentation(
  scrollY: number,
  options: {
    reduceMotion: boolean;
    expandedHeight: number;
    compactHeight: number;
    titleSize: number;
  },
) {
  const distance = options.expandedHeight - options.compactHeight;
  const progress = distance <= 0
    ? 0
    : resolveCollapseProgress(scrollY, {
      reduceMotion: options.reduceMotion,
      distance,
    });
  const type = activityHeaderType(options.titleSize);
  const compactPrimary = compactTitleIsPrimary(progress);
  return {
    ...type,
    progress,
    height: headerHeight(progress, options.expandedHeight, options.compactHeight),
    largeOpacity: largeTitleOpacity(progress),
    largeScale: largeTitleScale(progress),
    compactOpacity: compactTitleOpacity(progress),
    subtitleOpacity: subtitleOpacity(progress),
    largeHeaderRole: compactPrimary ? null : 'header' as const,
    compactHeaderRole: 'header' as const,
    largeHidden: compactPrimary,
    compactHidden: !compactPrimary,
    addVisible: true,
    showSubtitle: false,
  };
}
