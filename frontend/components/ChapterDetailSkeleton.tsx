import { Skeleton } from "./ui/skeleton";

export default function ChapterDetailSkeleton() {
  return (
    <div className="space-y-12">
      <div className="space-y-4 text-center">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-12 w-3/4" />
        <div className="flex justify-center my-12">
          <Skeleton className="h-px w-24" />
        </div>
        <Skeleton className="h-6 w-1/2" />
      </div>
      <div className="space-y-6">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}
