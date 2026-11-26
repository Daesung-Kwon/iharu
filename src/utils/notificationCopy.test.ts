import test from 'node:test';
import assert from 'node:assert/strict';
import { formatActivityStartBody } from './notificationCopy';

test('activity reminder body drops the target emoji and stays a sentence', () => {
  assert.equal(
    formatActivityStartBody('숙제하기', '시작까지 10분 남았어요'),
    '숙제하기 시작까지 10분 남았어요!',
  );
  assert.equal(
    formatActivityStartBody('피아노', '지금 시작할 시간이에요'),
    '피아노 지금 시작할 시간이에요!',
  );
  assert.equal(formatActivityStartBody('숙제하기', '시작까지 10분 남았어요').includes('🎯'), false);
});
