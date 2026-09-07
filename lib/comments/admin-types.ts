export type CommentOverviewStats = {
  total: number;
  roots: number;
  replies: number;
  userComments: number;
  systemComments: number;
  totalLikes: number;
  newToday: number;
  newThisWeek: number;
  toolsWithComments: number;
  averageRating: number;
};

export type ToolCommentSummary = {
  toolId: string;
  toolName: string;
  total: number;
  roots: number;
  replies: number;
  systemCount: number;
  userCount: number;
  likes: number;
  averageRating: number;
};

export type AdminCommentItem = {
  id: number;
  toolId: string;
  toolName: string;
  name: string;
  email: string | null;
  content: string;
  rating: number | null;
  likesCount: number;
  parentId: number | null;
  createdAt: string;
  isSystem: boolean;
  replyCount: number;
};

export type AdminCommentKind = "all" | "user" | "system" | "replies" | "roots";
