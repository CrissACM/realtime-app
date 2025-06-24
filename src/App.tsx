import { Button, Container, Group, Text, Title } from "@mantine/core";
import { Error } from "./components/Error";
import { Loading } from "./components/Loading";
import { PostFilters } from "./components/PostFilters";
import { PostList } from "./components/PostList";
import { PostModal } from "./components/PostModal";
import { useEnableNotifications } from "./hooks/useEnableNotifications";
import { useFilters } from "./hooks/useFilters";
import { useModalActions } from "./hooks/useModalAction";
import { usePostActions } from "./hooks/usePostActions";
import { usePosts } from "./hooks/usePosts";

export default function App() {
  const { fetchPosts, uniqueAuthors, isLoading, error, allPosts, setAllPosts } =
    usePosts();

  const {
    handleOpenEditModal,
    handleOpenCreateModal,
    modalOpened,
    closeModal,
    editingPost,
  } = useModalActions();

  const { handleFormSubmit, handleDeletePost, isSubmitting } = usePostActions(
    setAllPosts,
    closeModal,
    editingPost,
  );

  const { handleFilterChange, handleClearFilters, filteredPosts } =
    useFilters(allPosts);

  const { handleEnableNotifications } = useEnableNotifications();

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
