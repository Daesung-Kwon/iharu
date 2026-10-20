/**
 * Line under the backup row (local time). The share sheet never says whether the
 * file was really saved, so this is when the backup file was made, not "saved".
 */
export function formatLastBackup(iso: string | null | undefined): string {
  if (!iso) return '아직 백업하지 않았어요';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '아직 백업하지 않았어요';
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `마지막 백업 파일 만든 날: ${d.getMonth() + 1}/${d.getDate()} ${hh}:${mm}`;
}

/** After the share sheet closes: honest, since it may have been cancelled. */
export const BACKUP_SHARE_CLOSED_MESSAGE = '백업 파일을 만들었어요. 저장할 곳을 골랐다면 완료예요';
