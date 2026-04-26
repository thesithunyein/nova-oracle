import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SearchX, Home } from "lucide-react";
import { NovaLogoFull } from "@/components/ui/nova-logo";

export default function NotFound() {
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
          <div className="w-16 h-16 rounded-full bg-accent/40 border border-border flex items-center justify-center mx-auto">
            <SearchX className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Page not found</h1>
          <p className="text-sm text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <Link href="/">
            <Button>
              <Home className="w-4 h-4" /> Back home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
