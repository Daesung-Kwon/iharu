/**
 * Activity reminder body for the OS notification.
 * The tray cannot draw an in-app icon, so the sentence stays plain text.
 */
export function formatActivityStartBody(
  activityName: string | undefined,
  leadLabel: string,
): string {
  return `${activityName} ${leadLabel}!`;
}
