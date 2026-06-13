"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Sparkles, Menu, ChevronDown, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

const videoTools = [
  { href: "/tiktok-video-generator", label: "🎵 TikTok Video Generator" },
  { href: "/instagram-reel-generator", label: "📸 Instagram Reel Generator" },
  { href: "/facebook-video-generator", label: "📘 Facebook Video Generator" },
  { href: "/faceless-video-generator", label: "🎭 Faceless Video Generator" },
];

export function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-6xl px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl tracking-tight text-primary">AutoCreator AI</span>
          </Link>
          <nav className="hidden md:flex gap-6 ml-6 items-center">
            <Link href="/ai-script-generator" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Script Generator
            </Link>

            {/* Video Generator Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((p) => !p)}
                className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Video className="h-4 w-4" />
                Video Generator
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 rounded-xl border bg-card shadow-lg py-1 z-50">
                  {videoTools.map((tool) => (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      {tool.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/ai-thumbnail-generator" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Thumbnails
            </Link>
            <Link href="/blog" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Blog
            </Link>
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
