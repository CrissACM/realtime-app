import { notifications } from "@mantine/notifications";
import { useEffect, useMemo, useState } from "react";
import { broadcastChannelService } from "../services/broadcastChannelService";
import { postService } from "../services/postService";
import { socketService } from "../services/socketService";
import type { Post } from "../types/post";

export function usePosts() {
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    const handleNewPostSocketEvent = (newPost: Post) => {
      if (!allPosts.some((p) => p.id === newPost.id)) {
        setAllPosts((prevPosts) => [...prevPosts, newPost]);
        notifications.show({
          title: "Nuevo Post Remoto",
          message: `Un nuevo post \"${newPost.title}\" ha sido agregado por otro usuario.`,
          color: "teal",
        });
      }
    };

    const handlePostUpdatedSocketEvent = (updatedPost: Post) => {
      setAllPosts((prevPosts) =>
        prevPosts.map((p) => (p.id === updatedPost.id ? updatedPost : p)),
      );
      notifications.show({
        title: "Post Actualizado Remotamente",
        message: `El post \"${updatedPost.title}\" ha sido actualizado por otro usuario.`,
        color: "cyan",
      });
    };

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
              message: `Nuevo post \"${message.payload.title}\" agregado en otra pestaña.`,
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
            message: `Post \"${message.payload.title}\" actualizado en otra pestaña.`,
            color: "grape",
          });
          break;
        case "DELETED_POST":
          setAllPosts((prevPosts) =>
            prevPosts.filter((p) => p.id !== message.payload.id),
          );
          notifications.show({
            title: "Sincronización",
            message: `Post eliminado en otra pestaña.`,
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

  const uniqueAuthors = useMemo(() => {
    const authors = new Set(allPosts.map((post) => post.author));
    return Array.from(authors);
  }, [allPosts]);

  return { allPosts, isLoading, error, fetchPosts, uniqueAuthors, setAllPosts };
}
