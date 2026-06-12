import { notFound } from "next/navigation";
import { AdBanner } from "@/components/ads/AdBanner";
import VideoGeneratorClient from "./VideoGeneratorClient";

const seoTools = {
  "tiktok-video-generator": {
    title: "TikTok Video Generator | AutoCreator AI",
    heading: "AI TikTok Video Generator",
    description: "Turn text into viral TikTok videos instantly. Auto-generate captions, voiceovers, and dynamic editing tailored for the TikTok algorithm.",
    platform: "TikTok"
  },
  "instagram-reel-generator": {
    title: "Instagram Reel Generator | AutoCreator AI",
    heading: "AI Instagram Reel Generator",
    description: "Create highly engaging Instagram Reels with AI. Convert any script or topic into a ready-to-post vertical video.",
    platform: "Instagram Reels"

  },
  "facebook-video-generator": {
    title: "Facebook Video Generator | AutoCreator AI",
    heading: "AI Facebook Video Generator",
    description: "Generate engaging Facebook videos with captions and voiceovers automatically. Perfect for viral reach.",
    platform: "Facebook"
  },
  "faceless-video-generator": {
    title: "Faceless Video Generator | AutoCreator AI",
    heading: "Faceless Video Generator",
    description: "Start your faceless channel today. Use AI to generate scripts, voices, and visuals for entirely faceless videos.",
    platform: "Faceless Channels"
  },
  "social-media-content-generator": {
    title: "Social Media Content Generator | AutoCreator AI",
    heading: "Social Media Content Generator",
    description: "The ultimate AI platform for creating automated social media content.",
    platform: "Social Media"
  }
};

export async function generateMetadata({ params }) {
  const { tool } = await params;
  const seoData = seoTools[tool];
  
  if (!seoData) return {};
  
  return {
    title: seoData.title,
    description: seoData.description,
  };
}

export default async function ToolSeoPage({ params }) {
  const { tool } = await params;
  const seoData = seoTools[tool];

  if (!seoData) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Ad */}
      <div className="w-full bg-muted/10 py-4 border-b">
        <div className="container mx-auto px-4 flex justify-center">
          <AdBanner dataAdSlot="tool-header-ad" className="h-[90px] w-full max-w-[728px]" />
        </div>
      </div>

      <div className="flex-1">
        {/* The Generator UI Component */}
        <VideoGeneratorClient heading={seoData.heading} description={seoData.description} />

        {/* SEO Rich Text Content */}
        <article className="container max-w-4xl mx-auto px-4 py-16 prose prose-lg dark:prose-invert">
          <h2>How the {seoData.heading} Works</h2>
          <p>
            Creating high-quality content for {seoData.platform} shouldn't take hours. 
            Our AI-powered generator takes your idea and automatically writes the script, 
            generates a realistic voiceover, sources background visuals, and adds dynamic captions.
          </p>
          
          <h3>Why use AI for {seoData.platform}?</h3>
          <ul>
            <li><strong>Consistency:</strong> Post 3-5 times a day without burnout.</li>
            <li><strong>Algorithm Optimized:</strong> Scripts are designed with strong 3-second hooks.</li>
            <li><strong>Cost Effective:</strong> No need to hire video editors or voice actors.</li>
          </ul>

          <div className="my-8 flex justify-center">
            <AdBanner dataAdSlot="tool-content-ad" className="h-[250px] w-full" />
          </div>

          <h3>Frequently Asked Questions</h3>
          <h4>Do I need video editing experience?</h4>
          <p>Not at all. The platform handles all the editing, transitions, and caption timing automatically.</p>
          <h4>Can I monetize these videos?</h4>
          <p>Yes, the visuals and AI voices are commercially cleared, making them safe for monetization on {seoData.platform}.</p>
        </article>
      </div>
    </div>
  );
}
