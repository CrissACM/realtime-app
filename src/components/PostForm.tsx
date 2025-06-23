// src/features/posts/components/PostForm.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Group,
  Select,
  Stack,
  TextInput,
  Textarea,
} from "@mantine/core";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import type { Post } from "../types/post";

// Esquema de validación con Zod
const postSchema = z.object({
  title: z
    .string()
    .nonempty({ message: "El titulo no puede estar vacío" })
    .min(3, { message: "El titulo debe tener al menos 3 caracteres" })
    .max(100, { message: "El titulo debe tener máximo 100 caracteres" }),
  content: z
    .string()
    .nonempty({ message: "El contenido no puede estar vacío" })
    .min(10, { message: "El contenido debe tener al menos 10 caracteres" }),
  author: z
    .string()
    .nonempty({ message: "El autor no puede estar vacío" })
    .min(2, { message: "El autor debe tener al menos 2 caracteres" })
    .max(50, { message: "El autor debe tener máximo 50 caracteres" }),
  status: z.enum(["draft", "published", "archived"], {
    errorMap: () => ({ message: "Debes seleccionar un estado" }),
  }),
});

// Tipo para los datos del formulario, inferido del esquema Zod
export type PostFormData = z.infer<typeof postSchema>;

interface PostFormProps {
  initialData?: Post; // Post existente para edición
  onSubmit: (data: PostFormData) => Promise<void>; // Hacerla async para manejar estados de carga
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function PostForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}: PostFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
      author: initialData?.author || "",
      status: initialData?.status || "draft",
    },
  });

  const submitForm = async (data: PostFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(submitForm)}>
      <Stack>
        <TextInput
          label="Título"
          placeholder="Título del post"
          {...register("title")}
          error={errors.title?.message}
          data-autofocus // Para enfocar al abrir el modal
        />
        <Textarea
          label="Contenido"
          placeholder="Escribe el contenido aquí..."
          {...register("content")}
          error={errors.content?.message}
          autosize
          minRows={4}
        />
        <TextInput
          label="Autor"
          placeholder="Nombre del autor"
          {...register("author")}
          error={errors.author?.message}
        />
        <Controller
          name="status"
          control={control}
          aria-label="Estado"
          render={({ field }) => (
            <Select
              label="Estado"
              placeholder="Selecciona un estado"
              data={[
                { value: "draft", label: "Borrador (Draft)" },
                { value: "published", label: "Publicado (Published)" },
                { value: "archived", label: "Archivado (archived)" },
              ]}
              value={field.value}
              onChange={field.onChange}
              error={errors.status?.message}
              required
            />
          )}
        />
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {initialData ? "Actualizar Post" : "Crear Post"}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
