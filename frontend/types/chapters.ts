// types/chapters.ts
export interface ChapterListItem {
  id: string;
  chapter_number: number;
  title: string;
}

export interface Chapter extends ChapterListItem {
  summary: string;
  content: string;
}
