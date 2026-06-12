"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Download, RefreshCw, Sparkles, ImageOff } from "lucide-react";

// Gradient overlays for each style
const GRADIENTS = [
  "from-red-900/80 via-black/60 to-black/80",
  "from-blue-900/70 via-black/50 to-black/70",
  "from-purple-900/80 via-black/60 to-black/80",
];

const TEXT_COLORS = ["text-red-400", "text-blue-400", "text-purple-400"];

function ThumbnailCard({ concept, index, onDownload }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <Card className="overflow-hidden group hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300">
      {/* Thumbnail Preview */}
      <div className="relative aspect-video bg-gray-900 overflow-hidden">

        {/* Background Photo */}
        {concept.photoUrl && !imgError ? (
          <img
            src={concept.photoUrl}
            alt={concept.title}
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        ) : null}

        {/* Loading state */}
        {!imgLoaded && !imgError && concept.photoUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        )}

        {/* No photo fallback */}
        {(!concept.photoUrl || imgError) && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-950 flex items-center justify-center">
            <ImageOff className="h-8 w-8 text-gray-600" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t ${GRADIENTS[index % 3]}`} />

        {/* Overlay Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <p className={`text-xs font-semibold uppercase tracking-widest mb-2 ${TEXT_COLORS[index % 3]}`}>
            {concept.emotion}
          </p>
          <h3 className="text-white font-black text-2xl md:text-3xl uppercase leading-tight drop-shadow-2xl" style={{textShadow: "2px 2px 8px rgba(0,0,0,0.9)"}}>
            {concept.overlayText}
          </h3>
        </div>

        {/* Keyword badge */}
        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
          📷 {concept.keyword}
        </div>
      </div>

      {/* Card Footer */}
      <CardContent className="pt-3 pb-3 flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm">{concept.title}</p>
          <p className="text-xs text-muted-foreground">Emotion: <span className="font-medium text-primary">{concept.emotion}</span></p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 shrink-0"
          onClick={() => onDownload(concept, index)}
        >
          <Download className="h-3.5 w-3.5" /> Save
        </Button>
      </CardContent>
    </Card>
  );
}

export default function ThumbnailGeneratorPage() {
  const [loading, setLoading] = useState(false);
  const [concepts, setConcepts] = useState(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    videoTitle: "",
    niche: "",
    style: "Viral/Eye-catching",
  });

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!formData.videoTitle) return;

    setLoading(true);
    setConcepts(null);
    setError("");

    try {
      const res = await fetch("/api/generate-thumbnail-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else if (data.concepts) {
        setConcepts(data.concepts);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (concept, index) => {
    if (concept.photoUrl) {
      window.open(concept.photoUrl, "_blank");
    } else {
      alert("No image to download for this thumbnail.");
    }
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
          AI Thumbnail Generator
        </h1>
        <p className="text-lg text-muted-foreground">
          AI picks the perfect stock photo + bold text overlay for your video thumbnail.
        </p>
      </div>

      {/* Form */}
      <Card className="max-w-2xl mx-auto mb-10">
        <CardHeader>
          <CardTitle>Video Details</CardTitle>
          <CardDescription>Enter your video title and style to generate click-worthy thumbnails.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="videoTitle">Video Title *</Label>
              <Input
                id="videoTitle"
                placeholder="e.g. I Made $10,000 in 30 Days with AI"
                value={formData.videoTitle}
                onChange={(e) => setFormData({ ...formData, videoTitle: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="niche">Niche (Optional)</Label>
                <Input
                  id="niche"
                  placeholder="e.g. Finance, Tech, Lifestyle"
                  value={formData.niche}
                  onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="style">Style</Label>
                <select
                  id="style"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.style}
                  onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                >
                  <option value="Viral/Eye-catching">Viral / Eye-catching</option>
                  <option value="Minimalist/Clean">Minimalist / Clean</option>
                  <option value="Dark/Dramatic">Dark / Dramatic</option>
                  <option value="Bright/Colorful">Bright / Colorful</option>
                  <option value="Cinematic">Cinematic</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md text-sm">
                ❌ {error}
              </div>
            )}

            <Button type="submit" className="w-full gap-2" disabled={loading || !formData.videoTitle}>
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Generating Thumbnails...</>
              ) : (
                <><Sparkles className="h-4 w-4" /> Generate 3 Thumbnails</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Generated thumbnails */}
      {concepts && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Generated Thumbnails</h2>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleGenerate}>
              <RefreshCw className="h-4 w-4" /> Regenerate
            </Button>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {concepts.map((concept, i) => (
              <ThumbnailCard
                key={i}
                concept={concept}
                index={i}
                onDownload={handleDownload}
              />
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-6">
            Photos from Pexels · Free to use commercially
          </p>
        </div>
      )}
    </div>
  );
}
