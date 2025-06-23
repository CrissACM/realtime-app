export type PostStatus = "draft" | "published" | "archived";

export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  status: PostStatus;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
}
