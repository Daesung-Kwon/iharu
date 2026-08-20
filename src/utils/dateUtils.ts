/**
 * 로컬 타임존 기준 날짜 헬퍼
 */

import { format } from 'date-fns';

export const toLocalDateString = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};
