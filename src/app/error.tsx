"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import { NovaLogoFull } from "@/components/ui/nova-logo";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("NovaPay app error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center">
          <Link href="/">
            <NovaLogoFull size={28} />
          </Link>
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="text-sm text-muted-foreground">
            NovaPay hit an unexpected error. Try refreshing — if it persists, let us know.
          </p>
          {error?.digest && (
            <p className="text-xs font-mono text-muted-foreground bg-accent/40 rounded-md px-3 py-2 inline-block">
              {error.digest}
            </p>
          )}
          <div className="flex flex-wrap gap-2 justify-center">
            <Button onClick={() => reset()}>
              <RefreshCcw className="w-4 h-4" /> Try again
            </Button>
            <Link href="/">
              <Button variant="outline">
                <Home className="w-4 h-4" /> Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
