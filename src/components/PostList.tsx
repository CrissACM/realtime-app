// src/features/posts/components/PostList.tsx
import type { Post } from "../types/post";
import { PostCard } from "./PostCard";
import { SimpleGrid, Text } from "@mantine/core";

interface PostListProps {
  posts: Post[];
  onEditPost: (post: Post) => void;
  onDeletePost: (postId: string) => void;
  isLoading?: boolean; // Opcional para mostrar un estado de carga
}

export function PostList({
  posts,
  onEditPost,
  onDeletePost,
  isLoading,
}: PostListProps) {
  if (isLoading) {
    return <Text>Cargando publicaciones...</Text>; // O un Spinner de Mantine
  }

  if (!posts || posts.length === 0) {
    return <Text>No hay publicaciones para mostrar.</Text>;
  }

  return (
    <SimpleGrid
      cols={{ base: 1, sm: 2, lg: 3 }}
      spacing="lg"
      verticalSpacing="lg"
    >
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onEdit={onEditPost}
          onDelete={onDeletePost}
        />
      ))}
    </SimpleGrid>
  );
}
