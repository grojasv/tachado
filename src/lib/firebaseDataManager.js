// Firebase Data Manager for real-time todo sync (Tachado)
// Handles all Firebase Realtime Database operations with offline support

import { ref, set, get, onValue, onDisconnect } from 'firebase/database';
import { database } from './firebase.js';

// Storage keys for localStorage fallback
const STORAGE_KEY = 'tachado-todos';

function getSessionRef(sessionId, dataType = '') {
  const basePath = `sessions/${sessionId}`;
  return dataType ? ref(database, `${basePath}/${dataType}`) : ref(database, basePath);
}

// Ensure we only write JSON-safe data types to Firebase
function serializeTodos(todos) {
  return (Array.isArray(todos) ? todos : []).map((t) => ({
    ...t,
    createdAt:
      typeof t.createdAt === 'number'
        ? t.createdAt
        : (t.createdAt instanceof Date
            ? t.createdAt.getTime()
            : Number(new Date(t.createdAt).getTime()))
  }));
}

export async function saveTodosToFirebase(sessionId, todos) {
  const todosRef = getSessionRef(sessionId, 'todos');
  await set(todosRef, serializeTodos(todos));
  const metadataRef = getSessionRef(sessionId, 'metadata');
  await set(metadataRef, { lastUpdated: Date.now(), version: '1.0' });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  return true;
}

// ---------- Silent autosave queue with debounce + retry ----------
const queueStateBySession = new Map();

function getQueueState(sessionId) {
  if (!queueStateBySession.has(sessionId)) {
    queueStateBySession.set(sessionId, {
      timer: null,
      pending: null,
      attempt: 0,
    });
  }
  return queueStateBySession.get(sessionId);
}

export function scheduleSaveTodos(sessionId, todos) {
  const state = getQueueState(sessionId);
  state.pending = serializeTodos(todos);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));

  // Debounce immediate bursts (typing, fast toggles, drag)
  if (state.timer) clearTimeout(state.timer);
  state.timer = setTimeout(() => tryFlush(sessionId), 300);
}

async function tryFlush(sessionId) {
  const state = getQueueState(sessionId);
  if (!state.pending) return;

  const backoffMs = Math.min(30000, 500 * Math.pow(2, state.attempt)); // 0.5s → 30s cap
  try {
    const todosRef = getSessionRef(sessionId, 'todos');
    await set(todosRef, state.pending);
    const metadataRef = getSessionRef(sessionId, 'metadata');
    await set(metadataRef, { lastUpdated: Date.now(), version: '1.0' });
    state.attempt = 0; // success, reset
  } catch (err) {
    state.attempt += 1;
    // Schedule retry with backoff
    state.timer = setTimeout(() => tryFlush(sessionId), backoffMs);
    return;
  }

  // Clear pending on success
  state.pending = null;
}

export async function loadTodosFromFirebase(sessionId) {
  try {
    const todosRef = getSessionRef(sessionId, 'todos');
    const snapshot = await get(todosRef);
    if (snapshot.exists()) {
      const todos = snapshot.val();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
      return todos;
    }
    return [];
  } catch (error) {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  }
}

export function setupTodosRealtimeListener(sessionId, onTodosChange) {
  const todosRef = getSessionRef(sessionId, 'todos');
  const unsubscribe = onValue(
    todosRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const todos = snapshot.val();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
        if (onTodosChange) onTodosChange(todos);
      }
    },
    () => {}
  );
  return () => unsubscribe();
}
