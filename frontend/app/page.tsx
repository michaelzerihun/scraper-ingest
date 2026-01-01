"use client";

import { useChaptersList } from "@/hooks/useChapters";
import { ChapterCard } from "@/components/ChapterCard";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen } from "lucide-react";

export default function Home() {
  const { data: chapters, isLoading, error } = useChaptersList();

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="flex items-center gap-3 mb-10">
          <BookOpen className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-serif font-bold">
            Morals on the Book of Job
          </h1>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-12 text-center text-destructive">
        Failed to load chapters: {error.message}
      </div>
    );
  }

  return (
    <div className="p-12 w-full ">
      <div className="flex items-center justify-center gap-3 mb-12">
        <BookOpen className="h-10 w-10 text-primary" />
        <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">
          Morals on the Book of Job
        </h1>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {chapters?.map((ch) => (
          <ChapterCard key={ch.id} chapter={ch} />
        ))}
      </div>
    </div>
  );
}
