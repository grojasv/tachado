// Session management for real-time multi-device sync (Tachado)
// Handles session ID generation, validation, and URL management

// Word lists for memorable session IDs (short, friendly, lowercase)
// Note: keep lists small to avoid large bundle size; extend as needed
const ADJECTIVES = [
  'brave', 'calm', 'chill', 'clever', 'cozy', 'crazy', 'curious', 'eager', 'fancy', 'fast',
  'funny', 'fuzzy', 'gentle', 'happy', 'jolly', 'jumpy', 'kind', 'lucky', 'mighty', 'neat',
  'noisy', 'peppy', 'proud', 'quick', 'quiet', 'silly', 'sleepy', 'smart', 'snug', 'swift',
  'tiny', 'witty'
];

const ANIMALS = [
  'ant', 'bear', 'bunny', 'cat', 'cow', 'crab', 'dog', 'dolphin', 'duck', 'eagle',
  'fox', 'frog', 'goose', 'koala', 'lion', 'llama', 'monkey', 'mouse', 'otter', 'owl',
  'panda', 'penguin', 'puppy', 'rabbit', 'seal', 'shark', 'sloth', 'snake', 'tiger', 'whale',
  'wolf', 'zebra'
];

function randomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

/**
 * Generates a unique, shareable session ID in the format:
 *   adjective-animal-###   e.g., "jumpy-frog-123"
 * Short, readable, and easy to say/type.
 */
export function generateSessionId() {
  const adjective = randomItem(ADJECTIVES);
  const animal = randomItem(ANIMALS);
  const number = Math.floor(Math.random() * 999) + 1; // 1..999
  return `${adjective}-${animal}-${number}`;
}

/**
 * Validates the friendly session ID format
 * - lowercase adjective
 * - lowercase animal
 * - 1–4 digit positive number
 */
export function isValidSessionId(sessionId) {
  if (!sessionId || typeof sessionId !== 'string') return false;
  const friendlyRegex = /^[a-z]+-[a-z]+-\d{1,4}$/;
  return friendlyRegex.test(sessionId);
}

/**
 * Gets the current session ID from URL parameters
 * @returns {string|null}
 */
export function getCurrentSessionId() {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session');
  if (sessionId && isValidSessionId(sessionId)) return sessionId;
  return null;
}

/**
 * Updates the browser URL with a new session ID
 */
export function updateUrlWithSession(sessionId) {
  if (!isValidSessionId(sessionId)) {
    console.error('Invalid session ID provided:', sessionId);
    return;
  }
  const newUrl = `${window.location.pathname}?session=${sessionId}`;
  window.history.pushState({ sessionId }, '', newUrl);
}

/** Clears the session from the URL (for local-only mode) */
export function clearSessionFromUrl() {
  window.history.pushState({}, document.title, window.location.pathname);
}

/**
 * Generates a shareable URL for the current session
 */
export function generateShareableUrl(sessionId) {
  if (!isValidSessionId(sessionId)) throw new Error('Invalid session ID provided');
  return `${window.location.origin}${window.location.pathname}?session=${sessionId}`;
}

/**
 * Gets or creates a session ID for the current app instance
 */
export function getOrCreateSessionId() {
  const urlSessionId = getCurrentSessionId();
  if (urlSessionId) return urlSessionId;
  const newSessionId = generateSessionId();
  updateUrlWithSession(newSessionId);
  return newSessionId;
}
