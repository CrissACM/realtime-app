import { Center, Loader, Modal } from "@mantine/core";
import { Suspense, lazy } from "react";
import type { Post } from "../types/post";
import type { PostFormData } from "./PostForm";

interface PostModalProps {
  modalOpened: boolean;
  closeModal: () => void;
  editingPost: Post | undefined;
  handleFormSubmit: (data: PostFormData) => Promise<void>;
  isSubmitting: boolean;
}

const LazyPostForm = lazy(() => import("./PostForm"));

export function PostModal({
  modalOpened,
  closeModal,
  editingPost,
  handleFormSubmit,
  isSubmitting,
}: PostModalProps) {
  return (
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
          onCancel={closeModal}
          isSubmitting={isSubmitting}
        />
      </Suspense>
    </Modal>
  );
}
