export function normalizeTranscript(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

export function shouldKeepMicModeOnSpeechStart(currentMode, microphoneEnabled) {
  if (!microphoneEnabled) {
    return 'text';
  }

  return currentMode === 'mic' ? 'mic' : 'text';
}

export function extractFinalTranscript(results = []) {
  if (!Array.isArray(results)) {
    return '';
  }

  for (let index = results.length - 1; index >= 0; index -= 1) {
    const result = results[index];
    if (!result) {
      continue;
    }

    const alternatives = Object.keys(result)
      .filter((key) => key !== 'isFinal')
      .map((key) => result[key])
      .filter(Boolean);

    const transcript = alternatives
      .map((item) => normalizeTranscript(item?.transcript ?? ''))
      .find(Boolean);

    if (transcript) {
      return transcript;
    }
  }

  return '';
}
