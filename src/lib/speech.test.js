import test from 'node:test';
import assert from 'node:assert/strict';

import {
  extractFinalTranscript,
  normalizeTranscript,
  shouldKeepMicModeOnSpeechStart,
} from './speech.js';

test('normalizeTranscript collapses whitespace and trims the result', () => {
  assert.equal(normalizeTranscript('  hello   world  '), 'hello world');
});

test('extractFinalTranscript uses the latest visible recognition result, including interim speech', () => {
  const results = [
    { isFinal: false, 0: { transcript: 'hel' } },
    { isFinal: false, 0: { transcript: 'hello' } },
    { isFinal: true, 0: { transcript: ' hello world' } },
  ];

  assert.equal(extractFinalTranscript(results), 'hello world');
});

test('speech start keeps the mic mode active when the user is already in mic input mode', () => {
  assert.equal(shouldKeepMicModeOnSpeechStart('mic', true), 'mic');
  assert.equal(shouldKeepMicModeOnSpeechStart('text', true), 'text');
  assert.equal(shouldKeepMicModeOnSpeechStart('mic', false), 'text');
});
