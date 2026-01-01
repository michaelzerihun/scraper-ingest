"use client";

import Link from "next/link";
import { useChaptersList } from "@/hooks/useChapters";
import { ArrowRight } from "lucide-react";
import ChapterListSkeleton from "@/components/ChapterListSkeleton";
import ChapterListError from "@/components/ChapterListError";

export default function ChaptersPage() {
  const { data: chapters, isLoading, error } = useChaptersList();

  return (
    <main className="min-h-screen bg-background font-serif selection:bg-accent/30">
      <div className="mx-auto max-w-3xl px-6 py-24 md:py-32">
        <header className="mb-20 space-y-6">
          <div className="flex items-center gap-4 text-xs font-medium tracking-widest uppercase text-muted-foreground">
            <span className="h-px w-8 bg-border" />
            Table of Contents
          </div>
          <h1 className="text-balance text-5xl font-light tracking-tight text-foreground md:text-7xl">
            The Untold <br />
            <span className="italic font-normal">Story of Light</span>
          </h1>
          <p className="max-w-md text-lg leading-relaxed text-muted-foreground">
            A journey through the remnants of a world that once was, explored
            chapter by chapter.
          </p>
        </header>

        {error && <ChapterListError />}

        <nav className="space-y-2">
          {isLoading ? (
            <ChapterListSkeleton />
          ) : (
            chapters?.map((chapter) => (
              <Link
                key={chapter.id}
                href={`/chapter/${chapter.id}`}
                className="group flex items-baseline justify-between border-b border-border py-8 transition-colors hover:border-primary"
              >
                <div className="flex items-baseline gap-6">
                  <span className="font-mono text-sm text-muted-foreground opacity-50 transition-opacity group-hover:opacity-100">
                    {chapter.chapter_number.toString().padStart(2, "0")}
                  </span>
                  <h2 className="text-2xl font-medium tracking-tight text-foreground group-hover:text-primary md:text-3xl">
                    {chapter.title}
                  </h2>
                </div>
                <ArrowRight className="h-5 w-5 -translate-x-2 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
              </Link>
            ))
          )}
        </nav>
      </div>
    </main>
  );
}
