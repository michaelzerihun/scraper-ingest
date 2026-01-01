import { Skeleton } from "./ui/skeleton";

export default function ChapterListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between border-b border-border py-8"
        >
          <div className="flex items-center gap-6">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-8 w-64" />
          </div>
          <Skeleton className="h-5 w-5 rounded-full" />
        </div>
      ))}
    </div>
  );
}
