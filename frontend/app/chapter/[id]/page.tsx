"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useChapter } from "@/hooks/useChapters";
import { ArrowLeft, BookOpen, Clock, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChapterDetailSkeleton from "@/components/ChapterDetailSkeleton";
import ChapterDetailError from "@/components/ChapterDetailError";

export default function ChapterPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { data: chapter, isLoading, error } = useChapter(id);

  if (error) {
    return <ChapterDetailError />;
  }

  return (
    <main className="min-h-screen bg-background font-serif selection:bg-accent/30 pb-32 flex flex-col items-center">
      <nav className="sticky top-0 z-10 w-full flex items-center justify-between border-b border-border/50 bg-background/80 px-6 py-4 backdrop-blur-md">
        <Link
          href="/"
          className="group flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back
        </Link>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-4 text-xs font-medium tracking-widest uppercase text-muted-foreground/60">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" /> 8 min read
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-3 w-3" /> Ch.{" "}
              {chapter?.chapter_number || ".."}
            </span>
          </div>
          <div className="h-4 w-px bg-border/50 hidden md:block" />
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </nav>

      <article className="w-full md:w-[66%] px-6 pt-24 md:pt-32">
        {isLoading ? (
          <ChapterDetailSkeleton />
        ) : chapter ? (
          <>
            <header className="mb-16 text-center space-y-6 flex flex-col items-center">
              <div className="font-mono text-sm tracking-[0.2em] uppercase text-accent font-semibold italic">
                Chapter {chapter.chapter_number}
              </div>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-6xl text-balance leading-[1.1]">
                {chapter.title}
              </h1>
              <div className="h-px w-24 bg-border/50" />
              <p className="max-w-xl text-lg italic text-muted-foreground leading-relaxed">
                &quot;{chapter.summary}&quot;
              </p>
            </header>

            <div className="prose prose-neutral dark:prose-invert max-w-none">
              {chapter.content.split("\n\n").map((paragraph, index) => (
                <p
                  key={index}
                  className="mb-8 text-xl leading-[1.8] text-foreground/90 font-light first-letter:text-5xl first-letter:font-bold first-letter:mr-3 first-letter:float-left first-letter:mt-1 first-letter:text-primary"
                >
                  {paragraph.trim()}
                </p>
              ))}
            </div>

            <div className="mt-24 pt-12 border-t border-border flex justify-between items-center w-full">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Previous
              </p>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Next
              </p>
            </div>
          </>
        ) : null}
      </article>
    </main>
  );
}
