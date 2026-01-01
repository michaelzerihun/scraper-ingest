// hooks/useChapters.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { getChapterById, getChapters } from "@/lib/api/chapters";
import { Chapter, ChapterListItem } from "@/types/chapters";

export const chapterKeys = {
  all: ["chapters"] as const,
  list: () => [...chapterKeys.all, "list"] as const,
  detail: (id: string) => [...chapterKeys.all, "detail", id] as const,
};

export function useChaptersList() {
  return useQuery<ChapterListItem[], Error>({
    queryKey: chapterKeys.list(),
    queryFn: getChapters,
  });
}

export function useChapter(id: string) {
  return useQuery<Chapter, Error>({
    queryKey: chapterKeys.detail(id),
    queryFn: () => getChapterById(id),
    enabled: !!id,
  });
}
