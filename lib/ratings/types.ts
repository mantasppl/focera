export type RatingOverviewStats = {
  total: number;
  withComments: number;
  average: number;
};

export type ToolRatingSummary = {
  toolId: string;
  toolName: string;
  count: number;
  average: number;
  withComments: number;
  stars: Record<1 | 2 | 3 | 4 | 5, number>;
};

export type RatingListItem = {
  id: number;
  toolId: string;
  toolName: string;
  stars: number;
  comment: string | null;
  createdAt: string;
};
