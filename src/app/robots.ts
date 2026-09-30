import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/claim", "/api/"] },
    sitemap: "https://frameleads.io/sitemap.xml",
    host: "https://frameleads.io",
  };
}
