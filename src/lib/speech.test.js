import test from 'node:test';
import assert from 'node:assert/strict';

import { extractFinalTranscript, normalizeTranscript } from './speech.js';

test('normalizeTranscript collapses whitespace and trims the result', () => {
  assert.equal(normalizeTranscript('  hello   world  '), 'hello world');
});

test('extractFinalTranscript gathers only final recognition results', () => {
  const results = [
    { isFinal: false, 0: { transcript: 'hel' } },
    { isFinal: true, 0: { transcript: 'hello ' } },
    { isFinal: true, 0: { transcript: ' world' } },
  ];

  assert.equal(extractFinalTranscript(results), 'hello world');
});
