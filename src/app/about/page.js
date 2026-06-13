import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Target, Zap, Shield } from "lucide-react";

export const metadata = {
  title: "About Us - AutoCreator AI",
  description: "Learn more about AutoCreator AI, our mission, and how we empower creators with AI.",
};

export default function AboutPage() {
  return (
    <div className="container max-w-6xl mx-auto px-4 py-16 md:py-24">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-20">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
          Empowering Creators with <span className="text-primary">AI</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground">
          AutoCreator AI is built for the modern creator. Our mission is to eliminate the friction in content creation so you can focus on building your brand, engaging your audience, and scaling your influence.
        </p>
      </div>

      {/* Story Section */}
      <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Our Story</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Content creation is harder than ever. Between writing scripts, editing videos, designing thumbnails, and managing multiple platforms, creators are burning out. We noticed that while AI tools were emerging, they were fragmented and required constant context-switching.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            That's why we built <strong>AutoCreator AI</strong>. We wanted a single, unified platform where you could go from a simple idea to a fully produced, ready-to-publish piece of content in minutes, not hours.
          </p>
        </div>
        <div className="bg-muted/30 rounded-2xl p-8 border">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-primary">10x</h3>
              <p className="text-sm font-medium text-muted-foreground">Faster Creation</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-primary">5+</h3>
              <p className="text-sm font-medium text-muted-foreground">Integrated Tools</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-primary">24/7</h3>
              <p className="text-sm font-medium text-muted-foreground">AI Assistance</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-primary">∞</h3>
              <p className="text-sm font-medium text-muted-foreground">Creative Potential</p>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="mb-24">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-12">Our Core Values</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <ValueCard 
            icon={<Sparkles className="h-8 w-8 text-amber-500" />}
            title="Creativity First"
            description="AI should enhance human creativity, not replace it. We build tools that act as your ultimate co-creator."
          />
          <ValueCard 
            icon={<Zap className="h-8 w-8 text-blue-500" />}
            title="Radical Efficiency"
            description="Your time is your most valuable asset. We relentlessly optimize workflows to save you hours every day."
          />
          <ValueCard 
            icon={<Shield className="h-8 w-8 text-emerald-500" />}
            title="Privacy & Security"
            description="Your data and content ideas belong to you. We employ enterprise-grade security to keep your IP safe."
          />
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary/5 rounded-3xl p-8 md:p-16 text-center border">
        <h2 className="text-3xl font-bold tracking-tight mb-4">Ready to Transform Your Workflow?</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Join thousands of creators who are already using AutoCreator AI to scale their content production.
        </p>
        <Link href="/login">
          <Button size="lg" className="h-12 px-8 text-base">
            Get Started for Free <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

function ValueCard({ icon, title, description }) {
  return (
    <div className="flex flex-col p-6 bg-card border rounded-2xl">
      <div className="mb-4 p-3 bg-muted w-fit rounded-xl">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
