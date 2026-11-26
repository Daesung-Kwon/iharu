import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  IH_ICON_INK,
  IH_ICON_NAMES,
  IH_ICONS,
  IhIconNode,
  resolveIhIconName,
} from './ihIconPaths';
import {
  CELEBRATION_MOOD,
  HARU_BODY,
  HARU_COLORS,
  HARU_FACES,
  HARU_MOODS,
  HARU_RAY,
} from './haruSunGeometry';
import { CELEBRATION_COPY, CELEBRATION_MASCOT_SIZE } from '../../constants/celebration';
import { SETTINGS_ROW_ICONS, TabIcons } from '../../constants/systemIcons';

const SVG_DIR = join(__dirname, '../../../assets/icons/ih');

function pathData(nodes: IhIconNode[]): string[] {
  const found: string[] = [];
  const walk = (list: IhIconNode[]) => {
    for (const node of list) {
      if (node.tag === 'path' && node.attrs.d) found.push(node.attrs.d);
      if (node.children) walk(node.children);
    }
  };
  walk(nodes);
  return found;
}

function mentionsCurrentColor(nodes: IhIconNode[]): boolean {
  return JSON.stringify(nodes).includes('currentColor');
}

test('the icon module covers every shipped svg', () => {
  const files = readdirSync(SVG_DIR).filter(name => name.endsWith('.svg')).sort();
  const fromModule = IH_ICON_NAMES.map(name => `${name}.svg`).sort();
  assert.equal(files.length, 59);
  assert.equal(IH_ICON_NAMES.length, 59);
  assert.deepEqual(files, fromModule);
});

test('generated paths match the raw svg files and keep currentColor ink', () => {
  assert.equal(IH_ICON_INK, '#2D3436');
  for (const name of IH_ICON_NAMES) {
    const svg = readFileSync(join(SVG_DIR, `${name}.svg`), 'utf8');
    assert.equal(mentionsCurrentColor(IH_ICONS[name]), true, name);
    assert.match(svg, /currentColor/);
    assert.match(svg, /viewBox="0 0 24 24"/);
    for (const d of pathData(IH_ICONS[name])) {
      assert.equal(svg.includes(d), true, `${name} ${d}`);
    }
  }
});

test('icon names resolve with or without the ih- prefix', () => {
  assert.equal(resolveIhIconName('ih-homework'), 'ih-homework');
  assert.equal(resolveIhIconName('homework'), 'ih-homework');
  assert.equal(resolveIhIconName('  ih-pin  '), 'ih-pin');
  assert.equal(resolveIhIconName('nope'), null);
  assert.equal(resolveIhIconName(''), null);
  assert.equal(resolveIhIconName(null), null);
});

test('tabs and the 14 settings rows use real ih icons', () => {
  assert.equal(SETTINGS_ROW_ICONS.length, 14);
  assert.equal(new Set(SETTINGS_ROW_ICONS).size, 14);
  for (const name of SETTINGS_ROW_ICONS) {
    assert.equal(resolveIhIconName(name), name);
  }
  for (const pair of Object.values(TabIcons)) {
    assert.equal(resolveIhIconName(pair.outline), pair.outline);
    assert.equal(resolveIhIconName(pair.fill), pair.fill);
    assert.equal(pair.fill, `${pair.outline}-fill`);
  }
});

test('하루 해님 cheer face keeps the locked colors and smile', () => {
  assert.equal(HARU_COLORS.body, '#FFD25E');
  assert.equal(HARU_COLORS.outline, '#F2A93B');
  assert.equal(HARU_COLORS.ray, '#FFB547');
  assert.equal(HARU_COLORS.cheek, '#FF9B9B');
  assert.equal(HARU_COLORS.ink, '#2D3436');
  assert.equal(HARU_BODY.r, 38);
  assert.equal(HARU_BODY.strokeWidth, 3);
  assert.equal(HARU_RAY.angles.length, 8);
  assert.equal(CELEBRATION_MOOD, 'cheer');
  assert.deepEqual([...HARU_MOODS], ['happy', 'cheer', 'support', 'sleepy', 'surprise']);

  const cheer = HARU_FACES.cheer;
  const cheeks = cheer.filter(shape => shape.tag === 'circle');
  assert.equal(cheeks.length, 2);
  for (const cheek of cheeks) {
    if (cheek.tag !== 'circle') continue;
    assert.equal(cheek.fill, '#FF9B9B');
    assert.equal(cheek.opacity, 0.7);
  }
  const eyes = cheer.find(shape => shape.tag === 'path' && shape.d.startsWith('M46'));
  const mouth = cheer.find(shape => shape.tag === 'path' && shape.d.startsWith('M55'));
  assert.ok(eyes && eyes.tag === 'path');
  assert.equal(eyes.d, 'M46 64q6-7 12 0M70 64q6-7 12 0');
  assert.equal(eyes.stroke, '#2D3436');
  assert.equal(eyes.strokeWidth, 4);
  assert.ok(mouth && mouth.tag === 'path');
  assert.equal(mouth.d, 'M55 72h18q-1 10-9 10t-9-10z');
  assert.equal(mouth.fill, '#2D3436');
});

test('celebration copy has no emoji and the mascot is about 120pt', () => {
  assert.equal(CELEBRATION_MASCOT_SIZE, 120);
  const text = Object.values(CELEBRATION_COPY).join('\n');
  assert.equal(text.includes('🎉'), false);
  assert.equal(text.includes('💪'), false);
  assert.equal(CELEBRATION_COPY.title, '완벽해요!');
  assert.equal(CELEBRATION_COPY.message, '오늘의 모든 일정을 완료했어요!');
  assert.equal(CELEBRATION_COPY.sub, '정말 수고했어요! 내일도 화이팅!');
});
