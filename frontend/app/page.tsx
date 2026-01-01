"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useChaptersList } from "@/hooks/useChapters";

export default function ChaptersPage() {
  const { data, isLoading, error } = useChaptersList();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">Book of Job</h1>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-destructive-foreground">
        Failed to load chapters: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold tracking-tight">Book of Job</h1>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {data?.map((chapter) => (
          <Link key={chapter.id} href={`/chapter/${chapter.id}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg line-clamp-2">
                  Chapter {chapter.chapter_number}: {chapter.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Click to view summary and content
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
