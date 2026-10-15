/** "마지막 백업: M/D HH:mm" line under the backup row (local time). */
export function formatLastBackup(iso: string | null | undefined): string {
  if (!iso) return '아직 백업하지 않았어요';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '아직 백업하지 않았어요';
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `마지막 백업: ${d.getMonth() + 1}/${d.getDate()} ${hh}:${mm}`;
}
