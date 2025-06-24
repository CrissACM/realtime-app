import { notifications } from "@mantine/notifications";
import { useState } from "react";
import type { PostFormData } from "../components/PostForm";
import { broadcastChannelService } from "../services/broadcastChannelService";
import { postService } from "../services/postService";
import type { Post } from "../types/post";

export function usePostActions(
  setAllPosts: React.Dispatch<React.SetStateAction<Post[]>>,
  closeModal: () => void,
  editingPost: Post | undefined,
) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (data: PostFormData) => {
    setIsSubmitting(true);
    try {
      if (editingPost) {
        const updatedPost = await postService.updatePost(editingPost.id, data);
        if (updatedPost) {
          broadcastChannelService.postMessage({
            type: "UPDATED_POST",
            payload: updatedPost,
          });
          notifications.show({
            title: "Post Actualizado",
            message: `\"${updatedPost.title}\" ha sido actualizado correctamente.`,
            color: "blue",
          });
        }
      } else {
        const newPost = await postService.createPost(data);
        broadcastChannelService.postMessage({
          type: "NEW_POST",
          payload: newPost,
        });
        notifications.show({
          title: "Post Creado",
          message: `\"${newPost.title}\" ha sido creado correctamente.`,
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
      setIsSubmitting(true);
      try {
        const success = await postService.deletePost(postId);

        if (success) {
          setAllPosts((prevPosts) => prevPosts.filter((p) => p.id !== postId));

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

  return { handleFormSubmit, handleDeletePost, isSubmitting };
}
