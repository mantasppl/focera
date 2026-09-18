import { revalidatePath } from "next/cache";

export function revalidatePostPaths(slug: string) {
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/blog/preview/[slug]", "page");
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/content");
  revalidatePath("/admin/content/posts");
  revalidatePath("/admin/content/posts/[id]", "page");
}
