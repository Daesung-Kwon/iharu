import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DEVICE_MOVE_COPY } from './deviceMove';

const screen = readFileSync(join(process.cwd(), 'src/screens/ProfileScreen.tsx'), 'utf8');

test('reset asks to make a backup first, with a skip path', () => {
  assert.equal(DEVICE_MOVE_COPY.resetPrompt.title, '백업 파일을 먼저 만들까요?');
  assert.match(screen, /P\.backupFirst[^\n]*handleBackup/);
  assert.match(screen, /P\.skip[^\n]*confirmReset/);
});

test('기기 옮기기 sits below 정보 in Settings', () => {
  const info = screen.indexOf('>정보</Text>');
  const move = screen.indexOf('{DEVICE_MOVE_COPY.section}');
  assert.ok(info > 0 && move > info);
  assert.ok(!screen.includes('>데이터 관리<'));
});
