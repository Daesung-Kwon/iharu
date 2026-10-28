/** Copy for the rarely used file backup area ('기기 옮기기'). */
export const DEVICE_MOVE_COPY = {
  section: '기기 옮기기',
  backup: '백업 파일 만들기',
  restore: '백업 파일 불러오기',
  resetPrompt: {
    title: '백업 파일을 먼저 만들까요?',
    body: '초기화하면 활동과 일정이 모두 지워져요. 백업 파일이 있으면 나중에 다시 불러올 수 있어요.',
    cancel: '취소',
    backupFirst: '백업 먼저',
    skip: '바로 초기화',
  },
} as const;
