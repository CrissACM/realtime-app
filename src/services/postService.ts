import type { Post, PostStatus } from "../types/post";
import {
  simulateNewPostEvent,
  simulatePostUpdatedEvent,
} from "./socketService";

const POSTS_STORAGE_KEY = "react_technical_test_posts";

// Función para obtener los posts desde localStorage
const getPostsFromStorage = (): Post[] => {
  const storedPosts = localStorage.getItem(POSTS_STORAGE_KEY);
  return storedPosts ? JSON.parse(storedPosts) : [];
};

// Función para guardar los posts en localStorage
const savePostsToStorage = (posts: Post[]): void => {
  localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
};

// Datos iniciales (solo si no hay nada en localStorage)
const initializeMockData = () => {
  let posts = getPostsFromStorage();
  if (posts.length === 0) {
    posts = [
      {
        id: crypto.randomUUID(),
        title: "Primer Post de Prueba",
        content: "Este es el contenido del primer post. ¡Hola mundo!",
        author: "Admin User",
        status: "published",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Ayer
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: crypto.randomUUID(),
        title: "Otro Post Interesante",
        content: "Aquí hablamos sobre React y TypeScript.",
        author: "Jane Doe",
        status: "draft",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        title: "Manejo de Estado en Frontend",
        content: "Explorando diferentes estrategias para el manejo de estado.",
        author: "Admin User",
        status: "archived",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Hace dos días
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
    savePostsToStorage(posts);
  }
};

// Inicializar los datos si es necesario
initializeMockData();

// API del servicio
export const postService = {
  // Obtener todos los posts
  async getAllPosts(): Promise<Post[]> {
    // Simular una pequeña demora de red
    await new Promise((resolve) => setTimeout(resolve, 300));
    return getPostsFromStorage();
  },

  // Obtener un post por ID
  async getPostById(id: string): Promise<Post | undefined> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const posts = getPostsFromStorage();
    return posts.find((post) => post.id === id);
  },

  // Crear un nuevo post
  async createPost(
    postData: Omit<Post, "id" | "createdAt" | "updatedAt">,
  ): Promise<Post> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const posts = getPostsFromStorage();
    const newPost: Post = {
      ...postData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updatedPosts = [...posts, newPost];
    savePostsToStorage(updatedPosts);
    simulateNewPostEvent(newPost);
    return newPost;
  },

  // Actualizar un post existente
  async updatePost(
    id: string,
    updates: Partial<Omit<Post, "id" | "createdAt">>,
  ): Promise<Post | null> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    let posts = getPostsFromStorage();
    const postIndex = posts.findIndex((post) => post.id === id);

    if (postIndex === -1) {
      return null; // O lanzar un error
    }

    const updatedPost = {
      ...posts[postIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    posts[postIndex] = updatedPost;
    savePostsToStorage(posts);
    simulatePostUpdatedEvent(updatedPost);
    return updatedPost;
  },

  // Eliminar un post
  async deletePost(id: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    let posts = getPostsFromStorage();
    const initialLength = posts.length;
    posts = posts.filter((post) => post.id !== id);

    if (posts.length < initialLength) {
      savePostsToStorage(posts);
      return true;
    }
    return false;
  },
};

// Exportar el tipo PostStatus también para usarlo en filtros, etc.
export type { PostStatus };
