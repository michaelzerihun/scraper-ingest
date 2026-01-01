"use client";

import { useParams, useRouter } from "next/navigation";
import { useChapter } from "@/hooks/useChapters";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpenText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ChapterDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: chapter, isLoading, error } = useChapter(id);

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          <Skeleton className="h-12 w-3/4" />
          <div className="grid md:grid-cols-3 gap-8">
            <Skeleton className="h-64" />
            <Skeleton className="h-[70vh] md:col-span-2" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !chapter) {
    return (
      <div className="container py-12 text-center text-destructive">
        {error?.message || "Chapter not found"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-serif font-semibold truncate">
              {chapter.chapter_number}. {chapter.title}
            </h1>
          </div>
        </div>
      </header>

      <main className="container py-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-[320px_1fr] gap-12">
            {/* Summary sidebar */}
            <aside className="space-y-6">
              <Card className="border-primary/20">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <BookOpenText className="h-5 w-5" />
                    AI Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground leading-relaxed">
                  <ScrollArea className="h-[75vh]">
                    {chapter.summary}
                  </ScrollArea>
                </CardContent>
              </Card>
            </aside>

            {/* Main reading area */}
            <article className="prose prose-neutral dark:prose-invert max-w-none">
              <h2 className="text-3xl font-serif font-bold mb-8 border-b pb-4">
                Full Chapter Text
              </h2>
              <ScrollArea className="h-[80vh]">
                <div className="leading-8 text-lg [&>p]:mb-6">
                  {chapter.content.split("\n\n").map((paragraph, idx) => (
                    <p key={idx} className="text-foreground/90">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </ScrollArea>
            </article>
          </div>
        </div>
      </main>
    </div>
  );
}
