import test from 'node:test';
import assert from 'node:assert/strict';
import { includesTerm, normalizeIntent } from '../src/lib/intent/normalize-core.mjs';

test('normalizes Arabic alef variants and diacritics', () => {
  assert.equal(normalizeIntent('إِنجَازُ الصُّوَرِ'), 'انجاز الصور');
});

test('normalizes taa marbuta and tatweel', () => {
  assert.equal(normalizeIntent('صُورَةــــٌ جاهزة'), 'صوره جاهزه');
});

test('matches attached Arabic article and prepositions', () => {
  const normalized = normalizeIntent('جهز صورة المنتج للمتجر');
  assert.equal(includesTerm(normalized, 'منتج للمتجر'), true);
  assert.equal(includesTerm(normalized, 'المنتج للمتجر'), true);
  assert.equal(includesTerm(normalized, 'بالمنتجر'), false);
});

test('matches connected preposition forms', () => {
  const normalized = normalizeIntent('للموقع اجعل الصورة خفيفة');
  assert.equal(includesTerm(normalized, 'للموقع'), true);
  assert.equal(includesTerm(normalized, 'موقع'), true);
});

test('does not match an unrelated intent', () => {
  const normalized = normalizeIntent('جهز صورة المنتج للمتجر');
  assert.equal(includesTerm(normalized, 'صورة شخصية'), false);
});

test('matches complete phrases only at token boundaries', () => {
  assert.equal(includesTerm(normalizeIntent('image converter'), 'convert'), false);
  assert.equal(includesTerm(normalizeIntent('convert image format'), 'convert'), true);
});
