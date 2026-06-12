"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Copy, Check } from "lucide-react";

export default function CaptionGeneratorPage() {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [captions, setCaptions] = useState("");
  
  const [formData, setFormData] = useState({
    topic: "",
    platform: "Instagram",
    tone: "engaging"
  });

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!formData.topic) return;
    
    setLoading(true);
    setCaptions("");
    
    try {
      const res = await fetch("/api/generate-captions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.captions) {
        setCaptions(data.captions);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(captions);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">AI Caption Generator</h1>
        <p className="text-lg text-muted-foreground">Generate compelling captions with strong CTAs to boost engagement.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Post Details</CardTitle>
            <CardDescription>Tell us about your post.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerate} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="topic">What is the post about?</Label>
                <Textarea 
                  id="topic" 
                  placeholder="e.g., A behind-the-scenes look at my new home office setup" 
                  className="resize-none"
                  rows={3}
                  value={formData.topic}
                  onChange={(e) => setFormData({...formData, topic: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <select 
                    id="platform"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.platform}
                    onChange={(e) => setFormData({...formData, platform: e.target.value})}
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Facebook">Facebook</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Twitter">Twitter/X</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tone">Tone</Label>
                  <select 
                    id="tone"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.tone}
                    onChange={(e) => setFormData({...formData, tone: e.target.value})}
                  >
                    <option value="engaging">Engaging & Fun</option>
                    <option value="professional">Professional</option>
                    <option value="educational">Educational</option>
                    <option value="controversial">Controversial/Spicy</option>
                  </select>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading || !formData.topic}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Writing...</> : "Generate Captions"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="flex flex-col h-full min-h-[400px]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Generated Captions</CardTitle>
              <CardDescription>Your options will appear here.</CardDescription>
            </div>
            {captions && (
              <Button variant="outline" size="icon" onClick={copyToClipboard}>
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            )}
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {captions ? (
              <div className="flex-1 bg-muted/50 p-4 rounded-md whitespace-pre-wrap font-medium text-sm overflow-y-auto">
                {captions}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center border-2 border-dashed rounded-md p-8 text-center text-muted-foreground">
                {loading ? "Writing the perfect caption..." : "Enter your topic and hit generate."}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
