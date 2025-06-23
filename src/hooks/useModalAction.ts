import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import type { Post } from "../types/post";

export function useModalActions() {
  const [editingPost, setEditingPost] = useState<Post | undefined>(undefined);

  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);

  const handleOpenCreateModal = () => {
    setEditingPost(undefined);
    openModal();
  };

  const handleOpenEditModal = (post: Post) => {
    setEditingPost(post);
    openModal();
  };

  return {
    handleOpenCreateModal,
    handleOpenEditModal,
    modalOpened,
    closeModal,
    editingPost,
  };
}
