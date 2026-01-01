import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export default function ChapterDetailError() {
  const router = useRouter();
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background font-serif">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription className="mt-2 space-y-4">
          <p>We couldn&apos;t find the chapter you&apos;re looking for.</p>
          <div className="flex gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/")}
            >
              Go back
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => window.location.reload()}
            >
              <RefreshCcw className="mr-2 h-4 w-4" /> Retry
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </main>
  );
}
