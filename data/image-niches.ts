import {
  flattenGroupedCategoryTools,
  groupCategoryTools,
  type CategoryNicheGroup,
} from "@/data/category-niches";
import { getToolsByCategory, type Tool } from "@/data/tools";

export type ImageNicheGroup = CategoryNicheGroup;

export function groupImageTools(tools: Tool[]): ImageNicheGroup[] {
  return groupCategoryTools("image", tools);
}

export function getGroupedImageTools(): ImageNicheGroup[] {
  return groupImageTools(getToolsByCategory("image"));
}

export function flattenGroupedImageTools(): Tool[] {
  return flattenGroupedCategoryTools("image");
}
