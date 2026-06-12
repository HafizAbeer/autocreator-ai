import Link from "next/link";
import { Sparkles, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-6xl px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl tracking-tight text-primary">AutoCreator AI</span>
          </Link>
          <nav className="hidden md:flex gap-6 ml-6">
            <Link href="/ai-script-generator" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Script Generator</Link>
            <Link href="/tiktok-video-generator" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Video Generator</Link>
            <Link href="/ai-thumbnail-generator" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Thumbnails</Link>
            <Link href="/blog" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            <Link href="/admin">
              <Button variant="ghost">Admin Login</Button>
            </Link>
            <Button>Get Started</Button>
          </div>
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
