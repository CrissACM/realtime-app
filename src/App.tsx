import { Button, Container, Group, Text, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Error } from "./components/Error";
import { Loading } from "./components/Loading";
import { PostFilters } from "./components/PostFilters";
import { PostList } from "./components/PostList";
import { PostModal } from "./components/PostModal";
import { useFilters } from "./hooks/useFilters";
import { useModalActions } from "./hooks/useModalAction";
import { usePostActions } from "./hooks/usePostActions";
import { usePosts } from "./hooks/usePosts";
import { requestNotificationPermission } from "./services/firebaseService";

export default function App() {
  const { fetchPosts, uniqueAuthors, isLoading, error, allPosts, setAllPosts } =
    usePosts();

  const {
    handleOpenEditModal,
    handleOpenCreateModal,
    modalOpened,
    closeModal,
  } = useModalActions();

  const { handleFormSubmit, handleDeletePost, isSubmitting, editingPost } =
    usePostActions(setAllPosts, closeModal);

  const { handleFilterChange, handleClearFilters, filteredPosts } =
    useFilters(allPosts);

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

  if (isLoading) return <Loading />;

  if (error) return <Error fetchPosts={fetchPosts} error={error} />;

  return (
    <Container py="xl" size="lg">
      <Title order={1} ta="center" mb="xl">
        Lista de Publicaciones
      </Title>

      {allPosts.length > 0 && (
        <PostFilters
          authors={uniqueAuthors}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />
      )}

      <Group>
        <Button onClick={handleOpenCreateModal} mb="lg">
          Agregar Nuevo Post
        </Button>

        <Button
          onClick={handleEnableNotifications}
          mb="lg"
          variant="outline"
          color="blue"
        >
          Activar Notificaciones Push
        </Button>
      </Group>

      {filteredPosts.length > 0 && (
        <PostList
          posts={filteredPosts}
          onEditPost={handleOpenEditModal}
          onDeletePost={handleDeletePost}
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

      <PostModal
        modalOpened={modalOpened}
        closeModal={closeModal}
        editingPost={editingPost}
        handleFormSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />
    </Container>
  );
}
