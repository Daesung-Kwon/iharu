/**
 * Week-strip kept-day line.
 * Zero kept stays short and calm. A kept day stays a compliment.
 */
export function weekKeptSummary(kept: number): string {
  return kept > 0 ? `${kept}일 지켰어요` : '아직이에요';
}

/** Phone strip prefixes the week that contains today. */
export function weekKeptLine(kept: number, containsToday: boolean): string {
  const summary = weekKeptSummary(kept);
  return containsToday ? `이번 주 ${summary}` : summary;
}
