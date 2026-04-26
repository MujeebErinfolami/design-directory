import { prisma } from "@/lib/prisma";

export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export async function uniqueSlug(
  base: string,
  table: "designerProfile" | "agencyProfile" | "project" | "blogPost"
): Promise<string> {
  const slug = toSlug(base);
  const exists = await (prisma[table] as any).findUnique({ where: { slug } });
  if (!exists) return slug;
  return `${slug}-${Math.random().toString(36).slice(2, 6)}`;
}
