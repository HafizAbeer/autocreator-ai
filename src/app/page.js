import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Video, FileText, Image as ImageIcon, MessageSquare, Hash } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-24 md:py-32 lg:py-40 border-b bg-gradient-to-b from-background to-muted/20 flex flex-col items-center text-center px-4">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 max-w-4xl">
          Create, Schedule, and Automate Your Content Pipeline with <span className="text-primary">AI</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl">
          The all-in-one platform to generate scripts, highly engaging videos, clickable thumbnails, and viral captions.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/ai-script-generator">
            <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base">
              Try Script Generator <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/tiktok-video-generator">
            <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 text-base">
              Explore Tools
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-24 px-4 flex flex-col items-center">
        <div className="container max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Powerful AI Tools at Your Fingertips</h2>
            <p className="text-muted-foreground text-lg">Generate every piece of content you need for social media growth.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<FileText className="h-10 w-10 text-blue-500" />}
              title="AI Script Generator"
              description="Instantly generate highly engaging, hook-focused scripts for TikTok, Facebook, and Reels."
              href="/ai-script-generator"
            />
            <FeatureCard 
              icon={<Video className="h-10 w-10 text-rose-500" />}
              title="Faceless Video Generator"
              description="Turn scripts or prompts into ready-to-post vertical videos with auto-captions and voiceovers."
              href="/tiktok-video-generator"
            />
            <FeatureCard 
              icon={<ImageIcon className="h-10 w-10 text-emerald-500" />}
              title="Thumbnail Generator"
              description="Design click-worthy thumbnails that maximize your CTR and viewer retention."
              href="/ai-thumbnail-generator"
            />
            <FeatureCard 
              icon={<MessageSquare className="h-10 w-10 text-purple-500" />}
              title="Caption Generator"
              description="Write compelling captions with powerful calls-to-action to boost engagement."
              href="/ai-caption-generator"
            />
            <FeatureCard 
              icon={<Hash className="h-10 w-10 text-orange-500" />}
              title="Hashtag Generator"
              description="Discover trending and niche-specific hashtags to increase your organic reach."
              href="/ai-hashtag-generator"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description, href }) {
  return (
    <Link href={href} className="group flex flex-col p-6 bg-card border rounded-2xl hover:border-primary/50 transition-colors shadow-sm hover:shadow-md">
      <div className="mb-4 p-3 bg-muted w-fit rounded-xl group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4 flex-1">{description}</p>
      <div className="flex items-center text-primary font-medium mt-auto group-hover:underline">
        Try it out <ArrowRight className="ml-1 h-4 w-4" />
      </div>
    </Link>
  );
}
