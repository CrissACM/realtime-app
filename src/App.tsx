import {
  Button,
  Center,
  Container,
  Loader,
  Modal,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { PostFilters } from "./components/PostFilters";
import { PostList } from "./components/PostList";
import { postService } from "./services/postService";

import type { PostFormData } from "./components/PostForm";
import { broadcastChannelService } from "./services/broadcastChannelService";
import { requestNotificationPermission } from "./services/firebaseService";
import { socketService } from "./services/socketService";
import type { Post, PostStatus } from "./types/post";

const ALL_POST_STATUSES: PostStatus[] = ["draft", "published"];

export default function App() {
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<{
    author: string;
    status: string;
  }>({
    author: "",
    status: "",
  });

  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [editingPost, setEditingPost] = useState<Post | undefined>(undefined);

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

  // Fetch inicial de posts
  useEffect(() => {
    fetchPosts();
  }, []);

  // Listeners para WebSocket y BroadcastChannel
  useEffect(() => {
    const handleNewPostSocketEvent = (newPost: Post) => {
      console.log("[HomePage] WebSocket event: new-post received", newPost);
      if (!allPosts.some((p) => p.id === newPost.id)) {
        // Evitar duplicados si esta pestaña lo originó
        setAllPosts((prevPosts) => [...prevPosts, newPost]);
        notifications.show({
          title: "Nuevo Post Remoto",
          message: `Un nuevo post "${newPost.title}" ha sido agregado por otro usuario.`,
          color: "teal",
        });
      }
    };

    const handlePostUpdatedSocketEvent = (updatedPost: Post) => {
      console.log(
        "[HomePage] WebSocket event: post-updated received",
        updatedPost,
      );
      setAllPosts((prevPosts) =>
        prevPosts.map((p) => (p.id === updatedPost.id ? updatedPost : p)),
      );
      notifications.show({
        title: "Post Actualizado Remotamente",
        message: `El post "${updatedPost.title}" ha sido actualizado por otro usuario.`,
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
      console.log("[HomePage] BroadcastChannel message received", message);

      switch (message.type) {
        case "NEW_POST":
          if (!allPosts.some((p) => p.id === message.payload.id)) {
            // Evitar duplicados
            setAllPosts((prevPosts) => [...prevPosts, message.payload]);
            notifications.show({
              title: "Sincronización",
              message: `Nuevo post "${message.payload.title}" agregado en otra pestaña.`,
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
            message: `Post "${message.payload.title}" actualizado en otra pestaña.`,
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
  }, [allPosts]); // allPosts como dependencia para la lógica anti-duplicados

  const uniqueAuthors = useMemo(() => {
    const authors = new Set(allPosts.map((post) => post.author));
    return Array.from(authors);
  }, [allPosts]);

  const filteredPosts = useMemo(() => {
    return allPosts.filter((post) => {
      const authorMatch = activeFilters.author
        ? post.author === activeFilters.author
        : true;
      const statusMatch = activeFilters.status
        ? post.status === (activeFilters.status as PostStatus)
        : true;
      return authorMatch && statusMatch;
    });
  }, [allPosts, activeFilters]);

  const handleFilterChange = (filters: { author: string; status: string }) => {
    setActiveFilters(filters);
  };

  const handleClearFilters = () => {
    setActiveFilters({ author: "", status: "" });
  };

  const handleOpenCreateModal = () => {
    setEditingPost(undefined);
    openModal();
  };

  const handleOpenEditModal = (post: Post) => {
    setEditingPost(post);
    openModal();
  };

  const handleFormSubmit = async (data: PostFormData) => {
    setIsSubmitting(true);
    try {
      if (editingPost) {
        const updatedPost = await postService.updatePost(editingPost.id, data);
        if (updatedPost) {
          // El estado local se actualiza a través del listener de WebSocket
          // que es simulado por postService.updatePost
          broadcastChannelService.postMessage({
            type: "UPDATED_POST",
            payload: updatedPost,
          });
          notifications.show({
            title: "Post Actualizado",
            message: `"${updatedPost.title}" ha sido actualizado correctamente.`,
            color: "blue",
          });
        }
      } else {
        const newPost = await postService.createPost(data);
        // El estado local se actualiza a través del listener de WebSocket
        // que es simulado por postService.createPost
        broadcastChannelService.postMessage({
          type: "NEW_POST",
          payload: newPost,
        });
        notifications.show({
          title: "Post Creado",
          message: `"${newPost.title}" ha sido creado correctamente.`,
          color: "green",
        });
      }
      closeModal();
    } catch (err) {
      console.error("Error submitting form:", err);
      notifications.show({
        title: "Error al Guardar",
        message: "No se pudo guardar la publicación.",
        color: "red",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este post?")) {
      setIsSubmitting(true); // Podríamos usar un estado de carga específico para eliminar
      try {
        const success = await postService.deletePost(postId);
        if (success) {
          setAllPosts((prevPosts) => prevPosts.filter((p) => p.id !== postId)); // Actualización directa para la pestaña actual
          broadcastChannelService.postMessage({
            type: "DELETED_POST",
            payload: { id: postId },
          });
          notifications.show({
            title: "Post Eliminado",
            message: "La publicación ha sido eliminada correctamente.",
            color: "green",
          });
        } else {
          notifications.show({
            title: "Error",
            message: "No se pudo eliminar la publicación.",
            color: "red",
          });
        }
      } catch (err) {
        console.error("Error deleting post:", err);
        notifications.show({
          title: "Error",
          message: "Ocurrió un error al eliminar la publicación.",
          color: "red",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleEnableNotifications = async () => {
    const token = await requestNotificationPermission();
    if (token) {
      notifications.show({
        title: "Notificaciones Activadas",
        message: "Estás listo para recibir notificaciones push.",
        color: "green",
      });
    } else {
      notifications.show({
        title: "Permiso Denegado",
        message: "No se pudo activar las notificaciones.",
        color: "red",
      });
    }
  };

  const LazyPostForm = lazy(() => import("./components/PostForm"));

  if (isLoading) {
    return (
      <Container py="xl">
        <Center>
          <Loader size="xl" />
        </Center>
      </Container>
    );
  }

  if (error) {
    return (
      <Container py="xl">
        <Center>
          <Text color="red">{error}</Text>
          <Button onClick={fetchPosts} ml="md">
            Reintentar
          </Button>
        </Center>
      </Container>
    );
  }

  return (
    <Container py="xl" size="lg">
      <Title order={1} ta="center" mb="xl">
        Lista de Publicaciones
      </Title>

      {allPosts.length > 0 && (
        <PostFilters
          authors={uniqueAuthors}
          statii={ALL_POST_STATUSES}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />
      )}

      <Button onClick={handleOpenCreateModal} mb="lg">
        Agregar Nuevo Post
      </Button>

      <Button
        onClick={handleEnableNotifications}
        mb="lg"
        ml="md"
        variant="outline"
        color="blue"
      >
        Activar Notificaciones Push
      </Button>

      {filteredPosts.length > 0 && (
        <PostList
          posts={filteredPosts}
          onEditPost={handleOpenEditModal}
          onDeletePost={handleDeletePost}
          // Pasa los iconos si tu PostList y PostCard los esperan
          // editIcon={<TbPencil size={18} />}
          // deleteIcon={<TbTrash size={18} />}
        />
      )}

      {!isLoading && (
        <>
          {allPosts.length === 0 && (
            <Text ta="center" mt="lg">
              No hay publicaciones para mostrar. ¡Intenta agregar una!
            </Text>
          )}
          {allPosts.length > 0 && filteredPosts.length === 0 && (
            <Text ta="center" mt="lg">
              No hay publicaciones que coincidan con los filtros aplicados.
            </Text>
          )}
        </>
      )}

      <Modal
        opened={modalOpened}
        onClose={() => {
          if (!isSubmitting) closeModal();
        }}
        title={editingPost ? "Editar Publicación" : "Crear Nueva Publicación"}
        size="md"
        overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
        closeOnClickOutside={!isSubmitting}
        closeOnEscape={!isSubmitting}
      >
        <Suspense
          fallback={
            <Center>
              <Loader />
            </Center>
          }
        >
          <LazyPostForm
            initialData={editingPost}
            onSubmit={handleFormSubmit}
            onCancel={() => closeModal()}
            isSubmitting={isSubmitting}
          />
        </Suspense>
      </Modal>
    </Container>
  );
}
