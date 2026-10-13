/**
 * Pure layout math for TimelineViewV2: places schedule items at their true minute offset
 * (not only on 30-minute slot boundaries) and splits overlapping items into side-by-side lanes.
 */

export type TimelineGrid = {
  startHour: number;
  endHour: number;
  slotMinutes: number;
  slotHeight: number;
};

export type TimelineItemInput = {
  id: string;
  startTime: string; // "HH:mm"
  endTime?: string; // "HH:mm", may exceed 24:00 (e.g. "24:10") when it runs past midnight
  durationMinutes?: number; // fallback when endTime is missing or not after startTime
};

export type TimelineBlockLayout = {
  id: string;
  top: number;
  height: number;
  startMin: number;
  endMin: number;
  lane: number;
  laneCount: number;
};

export const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

/** y offset of a minute-of-day inside the grid. */
export const minuteToY = (minute: number, grid: TimelineGrid): number =>
  ((minute - grid.startHour * 60) / grid.slotMinutes) * grid.slotHeight;

/** Start/end in minutes, clamped to the visible grid. `null` when nothing is visible. */
export const getItemSpan = (
  item: TimelineItemInput,
  grid: TimelineGrid,
): { startMin: number; endMin: number } | null => {
  const gridStart = grid.startHour * 60;
  const gridEnd = grid.endHour * 60;
  const start = toMinutes(item.startTime);
  let end = item.endTime ? toMinutes(item.endTime) : NaN;
  if (!(end > start)) end = start + (item.durationMinutes ?? 0);
  const startMin = Math.max(start, gridStart);
  const endMin = Math.min(end, gridEnd);
  if (!(endMin > startMin)) return null;
  return { startMin, endMin };
};

/**
 * Position and height for every visible item. Overlapping items share their cluster's width:
 * each gets the first free lane, and every item in a cluster gets that cluster's lane count.
 */
export const layoutTimelineItems = (
  items: TimelineItemInput[],
  grid: TimelineGrid,
): TimelineBlockLayout[] => {
  const spans = items
    .map(item => ({ item, span: getItemSpan(item, grid) }))
    .filter((x): x is { item: TimelineItemInput; span: { startMin: number; endMin: number } } => x.span !== null)
    .sort((a, b) => a.span.startMin - b.span.startMin || b.span.endMin - a.span.endMin);

  const result: TimelineBlockLayout[] = [];
  let cluster: TimelineBlockLayout[] = [];
  let clusterEnd = -Infinity;
  let laneEnds: number[] = [];

  const closeCluster = () => {
    const count = laneEnds.length;
    cluster.forEach(block => { block.laneCount = count; });
    result.push(...cluster);
    cluster = [];
    laneEnds = [];
  };

  for (const { item, span } of spans) {
    if (span.startMin >= clusterEnd && cluster.length > 0) closeCluster();
    let lane = laneEnds.findIndex(end => end <= span.startMin);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(span.endMin);
    } else {
      laneEnds[lane] = span.endMin;
    }
    clusterEnd = cluster.length === 0 ? span.endMin : Math.max(clusterEnd, span.endMin);
    cluster.push({
      id: item.id,
      top: minuteToY(span.startMin, grid),
      height: minuteToY(span.endMin, grid) - minuteToY(span.startMin, grid),
      startMin: span.startMin,
      endMin: span.endMin,
      lane,
      laneCount: 1,
    });
  }
  if (cluster.length > 0) closeCluster();
  return result;
};

/** Slot index (0-based) whose time range overlaps [startMin, endMin). */
export const slotOverlapsSpan = (slotStartMin: number, slotMinutes: number, startMin: number, endMin: number) =>
  slotStartMin < endMin && slotStartMin + slotMinutes > startMin;
