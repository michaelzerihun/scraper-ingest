import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChapterListItem } from "@/types/chapters";

interface Props {
  chapter: ChapterListItem;
}

export function ChapterCard({ chapter }: Props) {
  return (
    <Link href={`/chapter/${chapter.id}`}>
      <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/50 group">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-serif group-hover:text-primary transition-colors">
            {chapter.chapter_number}. {chapter.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Click to read full text & summary
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
