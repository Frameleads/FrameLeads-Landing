import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const publicRoutes = ["/", "/about", "/ai-inbox-triage", "/privacy", "/terms", "/audit"];
  return publicRoutes.map((path) => ({
    url: `https://frameleads.io${path}`,
    changeFrequency: path === "/" ? "weekly" : (path === "/about" || path === "/ai-inbox-triage") ? "monthly" : "yearly",
  }));
}
