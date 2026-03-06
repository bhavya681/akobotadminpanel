import { Suspense } from "react";
import { getAdminGallery } from "@/lib/api/admin-client";
import { GalleryGrid } from "./gallery-grid";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(String(params?.page ?? "1"), 10));
  const limit = Math.min(100, Math.max(1, parseInt(String(params?.limit ?? "24"), 10)));
  const contentType = params?.contentType as string | undefined;
  const isPrivate = params?.isPrivate as string | undefined;
  const sortBy = (params?.sortBy as "createdAt" | "rating") ?? "createdAt";
  const sortOrder = (params?.sortOrder as "asc" | "desc") ?? "desc";
  const fromDate = params?.fromDate as string | undefined;
  const toDate = params?.toDate as string | undefined;

  const { ok, data } = await getAdminGallery({
    page,
    limit,
    contentType: contentType as "image" | "video" | "image_to_image" | "llm" | undefined,
    isPrivate: isPrivate === "true" ? true : isPrivate === "false" ? false : undefined,
    sortBy,
    sortOrder,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  });

  const items = ok && data && !("message" in data) && "items" in data
    ? (data as { items: import("@/lib/api/admin-client").GalleryItem[] }).items
    : [];
  const total = ok && data && !("message" in data) && "total" in data
    ? (data as { total: number }).total
    : 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Gallery
        </h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          Manage user-generated content: images, videos, and AI outputs
        </p>
      </header>

      <Suspense
        fallback={
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-[var(--muted)] animate-pulse" />
            ))}
          </div>
        }
      >
        <GalleryGrid
          items={items}
          total={total}
          page={page}
          limit={limit}
          totalPages={totalPages}
          filters={{
            contentType: params?.contentType ? String(params.contentType) : undefined,
            isPrivate: params?.isPrivate ? String(params.isPrivate) : undefined,
            sortBy: params?.sortBy ? String(params.sortBy) : "createdAt",
            sortOrder: params?.sortOrder ? String(params.sortOrder) : "desc",
            fromDate: params?.fromDate ? String(params.fromDate) : undefined,
            toDate: params?.toDate ? String(params.toDate) : undefined,
            limit: params?.limit ? String(params.limit) : "24",
          }}
        />
      </Suspense>
    </div>
  );
}
