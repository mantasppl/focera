export type CommentSort = "top" | "newest";

export type PublicComment = {
  id: number;
  name: string;
  content: string;
  rating: number | null;
  likesCount: number;
  likedByMe: boolean;
  parentId: number | null;
  createdAt: string;
  isTop: boolean;
  /** Seeded / generated comment (shown as System in admin). */
  isSystem: boolean;
  replies: PublicComment[];
};

export type CommentListResult = {
  comments: PublicComment[];
  total: number;
  sort: CommentSort;
};
