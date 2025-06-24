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

// Este archivo define el componente principal de la aplicación.
// Aquí se integran los diferentes componentes y hooks para manejar la lógica de la aplicación.

// Importación de componentes y hooks necesarios para la funcionalidad de la aplicación.

export default function App() {
  // Uso del hook usePosts para manejar la lógica de las publicaciones.
  const { fetchPosts, uniqueAuthors, isLoading, error, allPosts, setAllPosts } =
    usePosts();

  // Uso del hook useModalActions para manejar las acciones relacionadas con el modal.
  const {
    handleOpenEditModal,
    handleOpenCreateModal,
    modalOpened,
    closeModal,
    editingPost,
  } = useModalActions();

  // Uso del hook usePostActions para manejar las acciones de los posts (crear, editar, eliminar).
  const { handleFormSubmit, handleDeletePost, isSubmitting } = usePostActions(
    setAllPosts,
    closeModal,
    editingPost,
  );

  // Uso del hook useFilters para manejar los filtros de las publicaciones.
  const { handleFilterChange, handleClearFilters, filteredPosts } =
    useFilters(allPosts);

  // Uso del hook useEnableNotifications para habilitar las notificaciones.
  const { handleEnableNotifications } = useEnableNotifications();

  // Renderizado condicional basado en el estado de carga y errores.
  if (isLoading) return <Loading />;

  if (error) return <Error fetchPosts={fetchPosts} error={error} />;

  // Renderizado principal del componente.
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
