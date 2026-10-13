import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const publicRoutes = ["/", "/privacy", "/terms", "/audit"];
  return publicRoutes.map((path) => ({
    url: `https://frameleads.io${path}`,
    changeFrequency: path === "/" ? "weekly" : "yearly",
  }));
}
