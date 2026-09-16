import { revalidatePath } from "next/cache";

export function revalidatePostPaths(slug: string) {
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/sitemap.xml");
}
