import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t bg-muted/20">
      <div className="container mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <Link href="/" className="font-bold text-xl tracking-tight text-primary">AutoCreator AI</Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              Your complete AI content automation platform. Generate scripts, videos, thumbnails, and automate your social media pipeline.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Tools</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/ai-script-generator" className="hover:text-foreground">AI Script Generator</Link></li>
              <li><Link href="/tiktok-video-generator" className="hover:text-foreground">TikTok Video Generator</Link></li>
              <li><Link href="/ai-thumbnail-generator" className="hover:text-foreground">Thumbnail Generator</Link></li>
              <li><Link href="/ai-caption-generator" className="hover:text-foreground">Caption Generator</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/blog" className="hover:text-foreground">Blog</Link></li>
              <li><Link href="/about" className="hover:text-foreground">About</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground flex flex-col md:flex-row justify-between items-center">
          <p>© {new Date().getFullYear()} AutoCreator AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
