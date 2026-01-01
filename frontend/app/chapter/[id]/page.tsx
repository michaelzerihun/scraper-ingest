"use client";

import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useChapter } from "@/hooks/useChapters";

export default function ChapterDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, error } = useChapter(params.id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-3/4" />
        <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
          <Skeleton className="h-48" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center text-destructive-foreground">
        {error?.message || "Chapter not found"}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Button variant="ghost" className="gap-2" onClick={() => router.back()}>
        <ArrowLeft className="h-5 w-5" />
        Back to Chapters
      </Button>
      <h1 className="text-3xl font-bold tracking-tight">
        Chapter {data.chapter_number}: {data.title}
      </h1>
      <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
        <Card>
          <CardHeader>
            <CardTitle>AI-Generated Summary</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>{data.summary}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Full Chapter Content</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[60vh] pr-4">
              <div className="prose prose-neutral max-w-none dark:prose-invert">
                {data.content.split("\n\n").map((paragraph, idx) => (
                  <p key={idx} className="mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
