import { useMemo, useState } from "react";
import type { Post, PostStatus } from "../types/post";

export function useFilters(allPosts: Post[]) {
  const [activeFilters, setActiveFilters] = useState<{
    author: string;
    status: string;
  }>({
    author: "",
    status: "",
  });

  const filteredPosts = useMemo(() => {
    return allPosts.filter((post) => {
      const authorMatch = activeFilters.author
        ? post.author === activeFilters.author
        : true;
      const statusMatch = activeFilters.status
        ? post.status === (activeFilters.status as PostStatus)
        : true;
      return authorMatch && statusMatch;
    });
  }, [allPosts, activeFilters]);

  const handleFilterChange = (filters: { author: string; status: string }) => {
    setActiveFilters(filters);
  };

  const handleClearFilters = () => {
    setActiveFilters({ author: "", status: "" });
  };

  return {
    filteredPosts,
    activeFilters,
    handleFilterChange,
    handleClearFilters,
    allPosts,
  };
}
