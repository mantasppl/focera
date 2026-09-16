import { seoLandings } from "@/data/seo-landings";
import { categoryOrder, tools } from "@/data/tools";
import { listPublishedPosts } from "@/lib/content/store";
import { SITE_URL } from "@/lib/seo";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/tools`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/feedback`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categoryOrder.map(
    (category) => ({
      url: `${SITE_URL}/tools/${category}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    }),
  );

  const toolRoutes: MetadataRoute.Sitemap = tools
    .filter((tool) => tool.status === "ready")
    .map((tool) => ({
      url: `${SITE_URL}${tool.href}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

  const seoLandingRoutes: MetadataRoute.Sitemap = seoLandings.map((page) => ({
    url: `${SITE_URL}${page.href}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }));

  let postRoutes: MetadataRoute.Sitemap = [];
  try {
    const posts = await listPublishedPosts();
    postRoutes = posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt ? new Date(post.updatedAt) : now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error("[sitemap] published posts failed:", error);
  }

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...toolRoutes,
    ...seoLandingRoutes,
    ...postRoutes,
  ];
}
