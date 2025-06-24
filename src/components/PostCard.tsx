import { ActionIcon, Badge, Card, Group, Text } from "@mantine/core";
import { TbPencil, TbTrash } from "react-icons/tb";
import type { Post, PostStatus } from "../types/post";

interface PostCardProps {
  post: Post;
  onEdit: (post: Post) => void;
  onDelete: (postId: string) => void;
}

const statusColors: Record<PostStatus, string> = {
  published: "green",
  draft: "yellow",
  archived: "blue",
};

export function PostCard({ post, onEdit, onDelete }: PostCardProps) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group justify="space-between" mt="md" mb="xs">
        <Text fw={500} size="lg">
          {post.title}
        </Text>
        <Badge color={statusColors[post.status]} variant="light">
          {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
        </Badge>
      </Group>

      <Text size="sm" c="dimmed" lineClamp={3}>
        {post.content}
      </Text>

      <Text size="xs" c="dimmed" mt="sm">
        Autor: {post.author}
      </Text>
      <Text size="xs" c="dimmed">
        Creado: {new Date(post.createdAt).toLocaleDateString()}
      </Text>
      {post.createdAt !== post.updatedAt && (
        <Text size="xs" c="dimmed">
          Actualizado: {new Date(post.updatedAt).toLocaleDateString()}
        </Text>
      )}

      <Group justify="flex-end" mt="md">
        <ActionIcon
          variant="subtle"
          color="blue"
          onClick={() => onEdit(post)}
          title="Editar Post"
        >
          <TbPencil size={18} />
        </ActionIcon>
        <ActionIcon
          variant="subtle"
          color="red"
          onClick={() => onDelete(post.id)}
          title="Eliminar Post"
        >
          <TbTrash size={18} />
        </ActionIcon>
      </Group>
    </Card>
  );
}
