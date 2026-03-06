"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import type { GalleryItem } from "@/lib/api/admin-client";
import { updateGalleryItemAction, deleteGalleryItemAction } from "@/app/admin/actions";

function MoreVerticalIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  );
}

const CONTENT_TYPE_LABELS: Record<string, string> = {
  image: "Image",
  video: "Video",
  image_to_image: "Image to Image",
  llm: "LLM",
};

interface GalleryGridProps {
  items: GalleryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters: {
    contentType?: string;
    isPrivate?: string;
    sortBy?: string;
    sortOrder?: string;
    fromDate?: string;
    toDate?: string;
    limit?: string;
  };
}

export function GalleryGrid({
  items,
  total,
  page,
  limit,
  totalPages,
  filters,
}: GalleryGridProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdownId(null);
      }
    }
    if (openDropdownId) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [openDropdownId]);

  const buildUrl = (updates: Record<string, string | undefined>, resetPage = true) => {
    const p = new URLSearchParams();
    Object.entries({ ...filters, ...updates }).forEach(([k, v]) => {
      if (v === undefined || v === "") return;
      p.set(k, v);
    });
    if (resetPage) p.set("page", "1");
    return `/admin/gallery?${p.toString()}`;
  };

  const handleTogglePrivate = async (item: GalleryItem) => {
    const id = item._id;
    if (!id) return;
    setOpenDropdownId(null);
    setLoading(id);
    try {
      const result = await updateGalleryItemAction(id, { isPrivate: !item.isPrivate });
      if (result.ok) router.refresh();
      else alert(result.error ?? "Failed to update.");
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (item: GalleryItem) => {
    const id = item._id;
    if (!id) return;
    if (!confirm("Delete this gallery item? This cannot be undone.")) return;
    setOpenDropdownId(null);
    setLoading(id);
    try {
      const result = await deleteGalleryItemAction(id);
      if (result.ok) router.refresh();
      else alert(result.error ?? "Failed to delete.");
    } finally {
      setLoading(null);
    }
  };

  const inputClass =
    "rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] transition-colors focus:border-[var(--ring)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/20";

  return (
    <div className="space-y-6">
      {/* Filters */}
      <form className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
            Type
          </label>
          <select
            value={filters.contentType ?? ""}
            onChange={(e) => router.push(buildUrl({ contentType: e.target.value || undefined }))}
            className={inputClass}
          >
            <option value="">All</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
            <option value="image_to_image">Image to Image</option>
            <option value="llm">LLM</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
            Privacy
          </label>
          <select
            value={filters.isPrivate ?? ""}
            onChange={(e) => router.push(buildUrl({ isPrivate: e.target.value || undefined }))}
            className={inputClass}
          >
            <option value="">All</option>
            <option value="true">Private</option>
            <option value="false">Public</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
            Sort
          </label>
          <select
            value={filters.sortBy ?? "createdAt"}
            onChange={(e) => router.push(buildUrl({ sortBy: e.target.value }))}
            className={inputClass}
          >
            <option value="createdAt">Date</option>
            <option value="rating">Rating</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
            Order
          </label>
          <select
            value={filters.sortOrder ?? "desc"}
            onChange={(e) => router.push(buildUrl({ sortOrder: e.target.value }))}
            className={inputClass}
          >
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
            Per page
          </label>
          <select
            value={filters.limit ?? "24"}
            onChange={(e) => router.push(buildUrl({ limit: e.target.value }))}
            className={inputClass}
          >
            <option value="12">12</option>
            <option value="24">24</option>
            <option value="48">48</option>
            <option value="96">96</option>
          </select>
        </div>
      </form>

      {/* Grid */}
      {items.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-12 text-center text-[var(--muted-foreground)]">
          No gallery items found
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {items.map((item) => {
              const id = item._id ?? "";
              const isBusy = loading === id;
              const mediaUrl = item.thumbnailUrl ?? item.url ?? "";
              const isVideo = item.contentType === "video";

              return (
                <div
                  key={id}
                  className="group relative rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-sm transition-all hover:shadow-md"
                >
                  <div className="aspect-square bg-[var(--muted)] relative">
                    {!mediaUrl ? (
                      <div className="w-full h-full flex items-center justify-center text-[var(--muted-foreground)] text-sm">
                        No preview
                      </div>
                    ) : isVideo ? (
                      <video
                        src={item.url}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      <img
                        src={mediaUrl}
                        alt={item.prompt ?? "Gallery item"}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    )}
                    {item.isPrivate && (
                      <span className="absolute top-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
                        Private
                      </span>
                    )}
                    <span className="absolute top-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
                      {CONTENT_TYPE_LABELS[item.contentType] ?? item.contentType}
                    </span>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <p className="text-xs text-white line-clamp-2 truncate">
                        {item.prompt ?? "No prompt"}
                      </p>
                      {item.user?.username && (
                        <p className="text-xs text-white/80 mt-0.5">@{item.user.username}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2">
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString()
                        : "—"}
                    </span>
                    <div className="relative" ref={openDropdownId === id ? dropdownRef : undefined}>
                      <button
                        type="button"
                        onClick={() => setOpenDropdownId(openDropdownId === id ? null : id)}
                        disabled={isBusy}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-50"
                        aria-label="Actions"
                      >
                        <MoreVerticalIcon />
                      </button>
                      {openDropdownId === id && (
                        <div
                          className="absolute right-0 top-full z-50 mt-1 min-w-[160px] rounded-lg border border-[var(--border)] bg-[var(--card)] py-1 shadow-lg"
                          role="menu"
                        >
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--muted)]"
                            role="menuitem"
                          >
                            <EyeIcon />
                            View full
                          </a>
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => handleTogglePrivate(item)}
                            disabled={isBusy}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-amber-600 dark:text-amber-400 transition-colors hover:bg-[var(--muted)] disabled:opacity-50"
                          >
                            <LockIcon />
                            {isBusy
                              ? "..."
                              : item.isPrivate
                                ? "Make public"
                                : "Make private"}
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => handleDelete(item)}
                            disabled={isBusy}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 transition-colors hover:bg-[var(--muted)] disabled:opacity-50"
                          >
                            <TrashIcon />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-[var(--muted-foreground)]">
                Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
              </p>
              <div className="flex items-center gap-2">
                <Link
                  href={page > 1 ? buildUrl({ page: String(page - 1) }, false) : "#"}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    page <= 1
                      ? "cursor-not-allowed text-[var(--muted-foreground)] opacity-50 pointer-events-none"
                      : "text-[var(--foreground)] hover:bg-[var(--muted)]"
                  }`}
                >
                  ← Previous
                </Link>
                <span className="text-sm text-[var(--muted-foreground)] px-2">
                  Page {page} of {totalPages}
                </span>
                <Link
                  href={page < totalPages ? buildUrl({ page: String(page + 1) }, false) : "#"}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    page >= totalPages
                      ? "cursor-not-allowed text-[var(--muted-foreground)] opacity-50 pointer-events-none"
                      : "text-[var(--foreground)] hover:bg-[var(--muted)]"
                  }`}
                >
                  Next →
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
