/**
 * Today header geometry.
 *
 * At rest the card is the same stack as the fixed header it replaces:
 * title, week strip, weekly promise, and on iPad the date picker. Nothing
 * is added above 지금 일정, so the first screen does not move down.
 *
 * Scroll shrinks that card in a straight line to a one-line bar. The compact
 * title, the slim completion percent, and the 오늘 button stay. The week
 * strip, promise, date picker, and the detail progress card scroll away.
 * Collapse distance is the height delta, so the gap under the bar holds
 * still until the bar is compact. Further scrolling passes behind the bar.
 */

import { BrandAccent, SoftPopColors } from '../constants/theme';
import { Fonts } from '../constants/fonts';
import { MIN_TOUCH_TARGET } from '../hooks/layoutMetrics';
import {
  clamp01,
  collapseProgress,
  collapsingBarHeight,
  compactTitleIsPrimary,
  compactTitleOpacity,
  headerHeight,
  largeTitleOpacity,
  largeTitleScale,
  resolveCollapseProgress,
  sampleStops,
  type CollapseStop,
  type CollapsingHeaderMetrics,
} from '../hooks/collapsingHeader';

export const TODAY_LARGE_TITLE = '오늘의 일정';
export const TODAY_HISTORY_TITLE = '일정 이력';
export const TODAY_COMPACT_TITLE = '오늘';
export const TODAY_BUTTON_LABEL = '오늘';
export const TODAY_BUTTON_ICON = 'ih-today';
export const TODAY_HEADER_BORDER = 2;
export const TODAY_COMPACT_PADDING_V = 4;
/** Week strip is faint and non-interactive once the bar has nearly taken over. */
export const TODAY_ACCESSORY_FADE_AT = 0.75;
export const TODAY_DATE_PICKER_MARGIN_TOP = 20;

/**
 * Week strip leaves with its space. Opacity is still high while the strip is
 * mostly intact, then it is gone before the compact title becomes primary,
 * so the two fades do not sit on top of each other.
 */
export const TODAY_ACCESSORY_OPACITY_STOPS: readonly CollapseStop[] = [
  { at: 0, value: 1 },
  { at: 0.45, value: 0.2 },
  { at: 1, value: 0 },
];

const WEEK_NAV_BUTTON = 44;
const WEEK_NAV_MARGIN_BOTTOM = 4;
const WEEK_DAYS_FULL = 56;
const WEEK_DAYS_DENSE = 52;
const WEEK_MARGIN_FULL = 10;
const WEEK_MARGIN_DENSE = 6;
const WEEK_SUMMARY_MARGIN_TOP = 16;
const WEEK_SUMMARY_PADDING_TOP = 12;
const WEEK_SUMMARY_BORDER = 2;
const WEEK_SUMMARY_HEADER_LINE = 18;
const WEEK_SUMMARY_HEADER_GAP = 10;

const PROMISE_LINE = 20 + 18;
const PROMISE_MARGIN = 10;
const PROMISE_PAD = 8;
const PROMISE_MARGIN_DENSE = 12;
const PROMISE_PAD_DENSE = 12;

const DATE_CARD_BORDER = 2;
const DATE_CARD_PAD = 16;
const DATE_CAPTION_LINE = 16;
const DATE_NUMBER_LINE = 24;
const DATE_CARD_GAP = 4;
const DATE_PICKER_PAD = 16;

const TABLET_DATE_LINE = 24;
const TABLET_TITLE_GAP = 8;
const TABLET_BUTTON_MIN = 56;
const PAST_BADGE_BLOCK = 12 + 12 + 16;

export type TodayHeaderInput = {
  isPhone: boolean;
  isSmallPhone: boolean;
  isCompact: boolean;
  space: number;
  cardPad: number;
  cardRadius: number;
  titleSize: number;
  showPromise: boolean;
  showDatePicker: boolean;
  showPastBadge: boolean;
  showTodayButton: boolean;
};

export type TodayHeaderMetrics = CollapsingHeaderMetrics & {
  accessoryHeight: number;
  titleBlockHeight: number;
  listGap: number;
};

export function todayLargeTitle(isViewingToday: boolean): string {
  return isViewingToday ? TODAY_LARGE_TITLE : TODAY_HISTORY_TITLE;
}

/** One line: "오늘" on the current day, otherwise the short date. */
export function todayCompactTitle(isViewingToday: boolean, dateLabel: string): string {
  return isViewingToday ? TODAY_COMPACT_TITLE : dateLabel;
}

export function todayCompactTitleSize(titleSize: number): number {
  if (titleSize >= 28) return 20;
  return 17;
}

export function todayTitleLine(titleSize: number): number {
  return titleSize + 8;
}

export function todayCompletionLabel(rate: number): string {
  const safe = Number.isFinite(rate) ? rate : 0;
  return `${Math.round(safe)}%`;
}

/** In-progress percent is coral type. A finished day keeps the complete green. */
export function todayCompletionColor(rate: number): string {
  if (Number.isFinite(rate) && rate >= 100) return SoftPopColors.complete;
  return BrandAccent.text;
}

export function todayShowsCompletion(totalItems: number): boolean {
  return totalItems > 0;
}

export function todayAccessoryOpacity(progress: number): number {
  return sampleStops(progress, TODAY_ACCESSORY_OPACITY_STOPS);
}

export function todayAccessoryFaded(progress: number, fadeAt = TODAY_ACCESSORY_FADE_AT): boolean {
  return clamp01(progress) >= fadeAt;
}

/** What stays in the bar once the header has collapsed. */
export const TODAY_STICKY = {
  compactTitle: true,
  completion: true,
  todayButton: true,
} as const;

/** What leaves with the scroll. The detail progress card is below 지금 일정. */
export const TODAY_SCROLLS_AWAY = {
  largeTitle: true,
  weekStrip: true,
  weeklyPromise: true,
  datePicker: true,
  progressDetail: true,
} as const;

export function weekStripBlock(isPhone: boolean, dense: boolean): number {
  if (!isPhone) {
    return WEEK_SUMMARY_MARGIN_TOP
      + WEEK_SUMMARY_PADDING_TOP
      + WEEK_SUMMARY_BORDER
      + WEEK_SUMMARY_HEADER_LINE
      + WEEK_SUMMARY_HEADER_GAP
      + MIN_TOUCH_TARGET;
  }
  const marginTop = dense ? WEEK_MARGIN_DENSE : WEEK_MARGIN_FULL;
  const days = dense ? WEEK_DAYS_DENSE : WEEK_DAYS_FULL;
  return marginTop + WEEK_NAV_BUTTON + WEEK_NAV_MARGIN_BOTTOM + days;
}

export function promiseBlock(dense: boolean): number {
  if (dense) return PROMISE_MARGIN_DENSE + PROMISE_PAD_DENSE * 2 + PROMISE_LINE;
  return PROMISE_MARGIN + PROMISE_PAD * 2 + PROMISE_LINE;
}

/** HorizontalDatePicker border box, from its padding, caption, and date line. */
export function horizontalDatePickerHeight(): number {
  const card = DATE_CARD_BORDER * 2
    + DATE_CARD_PAD * 2
    + DATE_CAPTION_LINE
    + DATE_CARD_GAP
    + DATE_NUMBER_LINE;
  return DATE_PICKER_PAD * 2 + card;
}

export function todayListGap(isPhone: boolean, space: number): number {
  return isPhone ? space : 20;
}

function headerPadding(input: TodayHeaderInput): { top: number; bottom: number; horizontal: number } {
  if (input.isPhone) {
    return {
      top: input.cardPad,
      bottom: input.isSmallPhone ? 14 : 10,
      horizontal: input.cardPad,
    };
  }
  return {
    top: input.space,
    bottom: input.isCompact ? 12 : 20,
    horizontal: input.space,
  };
}

export function todayTitleBlockHeight(input: TodayHeaderInput): number {
  const line = todayTitleLine(input.titleSize);
  if (input.isPhone) {
    return input.showTodayButton ? Math.max(line, MIN_TOUCH_TARGET) : line;
  }
  const text = line + TABLET_TITLE_GAP + TABLET_DATE_LINE;
  return input.showTodayButton ? Math.max(text, TABLET_BUTTON_MIN) : text;
}

export function todayAccessoryHeight(input: TodayHeaderInput): number {
  let height = 0;
  if (input.showPastBadge) height += PAST_BADGE_BLOCK;
  if (input.showDatePicker) height += TODAY_DATE_PICKER_MARGIN_TOP + horizontalDatePickerHeight();
  height += weekStripBlock(input.isPhone, input.isSmallPhone);
  if (input.showPromise) height += promiseBlock(input.isSmallPhone);
  return height;
}

export function todayCollapsingMetrics(input: TodayHeaderInput): TodayHeaderMetrics {
  const padding = headerPadding(input);
  const titleBlockHeight = todayTitleBlockHeight(input);
  const accessoryHeight = todayAccessoryHeight(input);
  const expandedHeight = padding.top
    + titleBlockHeight
    + accessoryHeight
    + padding.bottom
    + TODAY_HEADER_BORDER * 2;
  const compactHeight = TODAY_COMPACT_PADDING_V * 2
    + MIN_TOUCH_TARGET
    + TODAY_HEADER_BORDER * 2;
  return {
    expandedHeight,
    compactHeight,
    paddingTop: padding.top,
    paddingBottom: padding.bottom,
    compactPaddingVertical: TODAY_COMPACT_PADDING_V,
    borderWidth: TODAY_HEADER_BORDER,
    paddingHorizontal: padding.horizontal,
    radius: input.cardRadius,
    insetTop: input.space,
    insetHorizontal: input.space,
    accessoryHeight,
    titleBlockHeight,
    listGap: todayListGap(input.isPhone, input.space),
  };
}

export function todayCollapseDistance(expandedHeight: number, compactHeight: number): number {
  return Math.max(1, expandedHeight - compactHeight);
}

/**
 * Short lists still need `distance` pt of travel, or the crossfade stops halfway.
 * The extra room is below the sections, so the first row stays where it is.
 */
export function todayScrollContentMinHeight(viewportHeight: number, distance: number): number {
  const viewport = Number.isFinite(viewportHeight) && viewportHeight > 0 ? viewportHeight : 0;
  const span = Number.isFinite(distance) && distance > 0 ? distance : 0;
  return viewport + span;
}

/** Scroll padding that parks the first section where the old header's margin did. */
export function todayListPadding(options: {
  space: number;
  expandedHeight: number;
  listGap: number;
  scrollEndPadding: number;
}) {
  return {
    paddingTop: options.space + options.expandedHeight + options.listGap,
    paddingHorizontal: options.space,
    paddingBottom: options.scrollEndPadding,
  };
}

export function todayRestingContentTop(space: number, expandedHeight: number, listGap: number): number {
  return space + expandedHeight + listGap;
}

/**
 * Space between the bottom of the full-bleed bar and the first section.
 * Positive means 지금 일정 is still below the bar.
 */
export function todayHeaderContentGap(options: {
  scrollY: number;
  space: number;
  expandedHeight: number;
  compactHeight: number;
  listGap: number;
  reduceMotion?: boolean;
}): number {
  const distance = options.expandedHeight - options.compactHeight;
  const y = Number.isFinite(options.scrollY) ? Math.max(0, options.scrollY) : 0;
  // Height tracks the finger even when Reduce Motion snaps the crossfade,
  // so the first section never slides under a still-tall card.
  void options.reduceMotion;
  const progress = distance <= 0 ? 0 : collapseProgress(y, distance);
  const barBottom = collapsingBarHeight(
    progress,
    options.space,
    options.expandedHeight,
    options.compactHeight,
  );
  const contentTop = todayRestingContentTop(options.space, options.expandedHeight, options.listGap) - y;
  return contentTop - barBottom;
}

export type TodayHeaderRenderState = ReturnType<typeof todayHeaderPresentation>;

/** What Today renders for a scroll offset. Compact state is progress 1. */
export function todayHeaderPresentation(
  scrollY: number,
  options: {
    reduceMotion: boolean;
    expandedHeight: number;
    compactHeight: number;
    accessoryHeight: number;
    titleSize: number;
    isViewingToday: boolean;
    dateLabel: string;
    totalItems: number;
    completionRate: number;
    showTodayButton: boolean;
  },
) {
  const distance = todayCollapseDistance(options.expandedHeight, options.compactHeight);
  const collapsed = options.expandedHeight <= options.compactHeight;
  const visual = collapsed
    ? 0
    : resolveCollapseProgress(scrollY, {
      reduceMotion: options.reduceMotion,
      distance,
    });
  const layout = collapsed ? 0 : collapseProgress(scrollY, distance);
  const compactPrimary = compactTitleIsPrimary(visual);
  const showCompletion = todayShowsCompletion(options.totalItems);
  const accessoryOpacity = todayAccessoryOpacity(visual);
  return {
    largeTitle: todayLargeTitle(options.isViewingToday),
    compactTitle: todayCompactTitle(options.isViewingToday, options.dateLabel),
    dateLabel: options.dateLabel,
    largeFontFamily: Fonts.jua,
    compactFontFamily: Fonts.jua,
    largeFontSize: options.titleSize,
    compactFontSize: todayCompactTitleSize(options.titleSize),
    progress: visual,
    layoutProgress: layout,
    height: headerHeight(layout, options.expandedHeight, options.compactHeight),
    accessoryHeight: options.accessoryHeight * (1 - clamp01(layout)),
    largeOpacity: largeTitleOpacity(visual),
    largeScale: largeTitleScale(visual),
    compactOpacity: compactTitleOpacity(visual),
    accessoryOpacity,
    completionOpacity: showCompletion ? compactTitleOpacity(visual) : 0,
    completionLabel: showCompletion ? todayCompletionLabel(options.completionRate) : null,
    completionColor: todayCompletionColor(options.completionRate),
    largeHeaderRole: compactPrimary ? null : 'header' as const,
    compactHeaderRole: 'header' as const,
    largeHidden: compactPrimary,
    compactHidden: !compactPrimary,
    completionHidden: !compactPrimary || !showCompletion,
    accessoryInteractive: accessoryOpacity > 0 && !todayAccessoryFaded(visual),
    showTodayButton: options.showTodayButton,
    todayButtonMinHeight: MIN_TOUCH_TARGET,
    sticky: TODAY_STICKY,
    scrollsAway: TODAY_SCROLLS_AWAY,
  };
}
