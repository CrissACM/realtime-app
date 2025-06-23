import { Button, Group, Select } from "@mantine/core";
import { useState } from "react";
import type { PostStatus } from "../types/post";

interface PostFiltersProps {
  authors: string[]; // Lista de autores únicos para el select de autor
  onFilterChange: (filters: { author: string; status: string }) => void;
  onClearFilters: () => void;
}

export function PostFilters({
  authors,
  onFilterChange,
  onClearFilters,
}: PostFiltersProps) {
  const [selectedAuthor, setSelectedAuthor] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const handleAuthorChange = (value: string | null) => {
    const newAuthor = value || "";
    setSelectedAuthor(newAuthor);
    onFilterChange({ author: newAuthor, status: selectedStatus });
  };

  const handleStatusChange = (value: string | null) => {
    const newStatus = value || "";
    setSelectedStatus(newStatus);
    onFilterChange({ author: selectedAuthor, status: newStatus });
  };

  const handleClear = () => {
    setSelectedAuthor("");
    setSelectedStatus("");
    onClearFilters();
  };

  const statii: PostStatus[] = ["draft", "published", "archived"];

  const authorOptions = [
    { value: "", label: "Todos los autores" },
    ...authors.map((author) => ({ value: author, label: author })),
  ];

  const statusOptions = [
    { value: "", label: "Todos los estados" },
    ...statii.map((status) => ({
      value: status,
      label: status.charAt(0).toUpperCase() + status.slice(1),
    })),
  ];

  return (
    <Group align="flex-end" mb="lg">
      <Select
        label="Filtrar por Autor"
        placeholder="Selecciona un autor"
        data={authorOptions}
        value={selectedAuthor}
        onChange={handleAuthorChange}
        clearable
        className="min-w-[200px] flex-1"
      />
      <Select
        label="Filtrar por Estado"
        placeholder="Selecciona un estado"
        data={statusOptions}
        value={selectedStatus}
        onChange={handleStatusChange}
        clearable
        className="min-w-[200px] flex-1"
      />
      <Button onClick={handleClear} variant="outline" mt="xl">
        Limpiar Filtros
      </Button>
    </Group>
  );
}
