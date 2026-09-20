export function normalizeTranscript(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

export function extractFinalTranscript(results = []) {
  if (!Array.isArray(results)) {
    return '';
  }

  const finalText = results
    .filter((result) => result && result.isFinal)
    .map((result) => normalizeTranscript(result?.[0]?.transcript ?? ''))
    .filter(Boolean)
    .join(' ');

  return normalizeTranscript(finalText);
}
