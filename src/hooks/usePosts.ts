import { notifications } from "@mantine/notifications";
import { useEffect, useMemo, useState } from "react";
import { broadcastChannelService } from "../services/broadcastChannelService";
import { postService } from "../services/postService";
import { socketService } from "../services/socketService";
import type { Post } from "../types/post";

// Este hook personalizado se utiliza para manejar la lógica relacionada con las publicaciones.
// Incluye la carga de publicaciones, manejo de errores, y actualización en tiempo real.

export function usePosts() {
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener las publicaciones desde el servicio.
  const fetchPosts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedPosts = await postService.getAllPosts();
      setAllPosts(fetchedPosts);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Error al cargar las publicaciones.");
      notifications.show({
        title: "Error",
        message: "No se pudieron cargar las publicaciones.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Efecto para cargar las publicaciones al montar el componente.
  useEffect(() => {
    fetchPosts();
  }, []);

  // Efecto para manejar eventos de socket relacionados con nuevas publicaciones y actualizaciones.
  useEffect(() => {
    const handleNewPostSocketEvent = (newPost: Post) => {
      if (!allPosts.some((p) => p.id === newPost.id)) {
        setAllPosts((prevPosts) => [...prevPosts, newPost]);
      }
    };

    const handlePostUpdatedSocketEvent = (updatedPost: Post) => {
      setAllPosts((prevPosts) =>
        prevPosts.map((p) => (p.id === updatedPost.id ? updatedPost : p)),
      );
    };

    // Suscripción a eventos de socket.
    const unsubscribeNewPostSocket = socketService.on(
      "new-post",
      handleNewPostSocketEvent,
    );

    const unsubscribePostUpdatedSocket = socketService.on(
      "post-updated",
      handlePostUpdatedSocketEvent,
    );

    const handleBroadcastMessage = (message: {
      type: string;
      payload: any;
    }) => {
      switch (message.type) {
        case "NEW_POST":
          if (!allPosts.some((p) => p.id === message.payload.id)) {
            setAllPosts((prevPosts) => [...prevPosts, message.payload]);
            notifications.show({
              title: "Sincronización",
              message: `Nuevo post \"${message.payload.title}\" agregado por otro usuario.`,
              color: "grape",
            });
          }
          break;
        case "UPDATED_POST":
          setAllPosts((prevPosts) =>
            prevPosts.map((p) =>
              p.id === message.payload.id ? message.payload : p,
            ),
          );
          notifications.show({
            title: "Sincronización",
            message: `Post \"${message.payload.title}\" actualizado por otro usuario.`,
            color: "grape",
          });
          break;
        case "DELETED_POST":
          setAllPosts((prevPosts) =>
            prevPosts.filter((p) => p.id !== message.payload.id),
          );
          notifications.show({
            title: "Sincronización",
            message: `Post eliminado por otro usuario.`,
            color: "grape",
          });
          break;
        default:
          break;
      }
    };

    const unsubscribeBroadcast = broadcastChannelService.subscribe(
      handleBroadcastMessage,
    );

    return () => {
      unsubscribeNewPostSocket();
      unsubscribePostUpdatedSocket();
      unsubscribeBroadcast();
    };
  }, [allPosts]);

  // Cálculo de autores únicos para los filtros.
  const uniqueAuthors = useMemo(
    () => Array.from(new Set(allPosts.map((post) => post.author))),
    [allPosts],
  );

  // Retorno de valores y funciones necesarias para el componente.
  return {
    fetchPosts,
    uniqueAuthors,
    isLoading,
    error,
    allPosts,
    setAllPosts,
  };
}
