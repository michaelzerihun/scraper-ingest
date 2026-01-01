import { ChapterListItem, Chapter } from "@/types/chapters";
import { api } from "./client";

export const getChapters = async (): Promise<ChapterListItem[]> => {
  const { data } = await api.get("/api/chapters");
  return data;
};

export const getChapterById = async (id: string): Promise<Chapter> => {
  const { data } = await api.get(`/api/chapters/${id}`);
  return data;
};
