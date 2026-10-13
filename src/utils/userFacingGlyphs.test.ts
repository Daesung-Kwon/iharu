import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

/**
 * The app font (BMJUA) has no glyph for '·' (U+00B7) or '–' (U+2013), so they render as
 * tofu boxes. Use a comma or '~' in anything the user can see. Comments and tests are exempt.
 */
const BANNED = ['\u00B7', '\u2013'];
const SRC = join(__dirname, '..');

const sourceFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    if (!/\.(ts|tsx)$/.test(name) || /\.test\.tsx?$/.test(name)) return [];
    return [path];
  });

/** Drops block comments and `// ...` line comments (not `://` in URLs). */
const stripComments = (code: string): string =>
  code.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' ')).replace(/(^|[^:])\/\/.*$/gm, '$1');

test('no BMJUA-missing glyphs (· or –) in user-facing source text', () => {
  const hits: string[] = [];
  for (const file of sourceFiles(SRC)) {
    stripComments(readFileSync(file, 'utf8'))
      .split('\n')
      .forEach((line, i) => {
        if (BANNED.some(ch => line.includes(ch))) hits.push(`${relative(SRC, file)}:${i + 1}: ${line.trim()}`);
      });
  }
  assert.deepEqual(hits, []);
});

test('glyph scan ignores comments but catches strings', () => {
  assert.equal(stripComments("// Mon\u2013Sun\nconst a = 1; /* a\u00B7b */").includes('\u2013'), false);
  assert.equal(stripComments("const s = 'a\u00B7b'; // ok").includes('\u00B7'), true);
  assert.equal(stripComments("const u = 'https://x.y';"), "const u = 'https://x.y';");
});
