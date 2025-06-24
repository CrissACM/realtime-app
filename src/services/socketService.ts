import type { Post } from "../types/post";

// Tipos para los eventos simulados
type SocketEvent = "new-post" | "post-updated";

// Callbacks que los componentes pueden registrar
type NewPostListener = (post: Post) => void;
type PostUpdatedListener = (post: Post) => void;

// Almacenamiento para los listeners
const listeners: {
  "new-post": NewPostListener[];
  "post-updated": PostUpdatedListener[];
} = {
  "new-post": [],
  "post-updated": [],
};

// --- SIMULACIÓN DEL SERVIDOR WEBSOCKET ---

/**
 * Simula la emisión de un evento 'new-post' desde el "servidor"
 * a todos los clientes conectados cuando un nuevo post es creado por CUALQUIER usuario.
 */
export const simulateNewPostEvent = (newPost: Post): void => {
  console.log("[Socket SIM] Emitting new-post:", newPost);
  listeners["new-post"].forEach((listener) => listener(newPost));
};

/**
 * Simula la emisión de un evento 'post-updated' desde el "servidor".
 */
export const simulatePostUpdatedEvent = (updatedPost: Post): void => {
  console.log("[Socket SIM] Emitting post-updated:", updatedPost);
  listeners["post-updated"].forEach((listener) => listener(updatedPost));
};
// --- FIN DE LA SIMULACIÓN DEL SERVIDOR ---

// --- API DEL CLIENTE WEBSOCKET (lo que usarían los componentes) ---

const connect = () => {
  console.log('[Socket SIM] "Connected" to simulated WebSocket.');
};

const disconnect = () => {
  console.log('[Socket SIM] "Disconnected" from simulated WebSocket.');
};

const on = (
  event: SocketEvent,
  callback: NewPostListener | PostUpdatedListener,
): (() => void) => {
  if (event === "new-post") {
    listeners["new-post"].push(callback as NewPostListener);
  } else if (event === "post-updated") {
    listeners["post-updated"].push(callback as PostUpdatedListener);
  }
  console.log(`[Socket SIM] Listener registered for "${event}"`);

  return () => {
    console.log(`[Socket SIM] Listener deregistered for "${event}"`);
    if (event === "new-post") {
      listeners["new-post"] = listeners["new-post"].filter(
        (l) => l !== callback,
      );
    } else if (event === "post-updated") {
      listeners["post-updated"] = listeners["post-updated"].filter(
        (l) => l !== callback,
      );
    }
  };
};

connect();

export const socketService = {
  connect,
  disconnect,
  on,
  simulateNewPostEvent,
  simulatePostUpdatedEvent,
};
