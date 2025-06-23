// src/services/socketService.ts

import type { Post } from "../types/post";

// Tipos para los eventos que simularemos
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
// Esta parte simula un servidor emitiendo eventos.
// En una app real, esto estaría en un backend.

/**
 * Simula la emisión de un evento 'new-post' desde el "servidor".
 * En una aplicación real, el servidor WebSocket enviaría este evento
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

// No necesitamos una conexión real para la simulación, pero mantenemos la estructura.
// let socket: any = null; // En una app real: import { io, Socket } from 'socket.io-client'; let socket: Socket;

const connect = () => {
  // En una app real:
  // if (socket && socket.connected) return;
  // socket = io('URL_DEL_SERVIDOR_WEBSOCKET');
  // socket.on('connect', () => console.log('WebSocket connected'));
  // socket.on('disconnect', () => console.log('WebSocket disconnected'));
  // socket.on('new-post', (post: Post) => {
  //   listeners['new-post'].forEach(listener => listener(post));
  // });
  // socket.on('post-updated', (post: Post) => {
  //   listeners['post-updated'].forEach(listener => listener(post));
  // });
  console.log('[Socket SIM] "Connected" to simulated WebSocket.');
};

const disconnect = () => {
  // En una app real:
  // if (socket) socket.disconnect();
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

  // Devolver una función para desregistrar el listener (cleanup)
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

// Inicializar la "conexión" al cargar el servicio
connect();

export const socketService = {
  connect,
  disconnect,
  on,
  // Exponemos las funciones de simulación para que otras partes de la app
  // (como el postService) puedan simular eventos del servidor.
  simulateNewPostEvent,
  simulatePostUpdatedEvent,
};
