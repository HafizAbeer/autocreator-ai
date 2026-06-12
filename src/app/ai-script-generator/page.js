"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Copy, Check } from "lucide-react";

export default function ScriptGeneratorPage() {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [script, setScript] = useState("");
  
  const [formData, setFormData] = useState({
    topic: "",
    niche: "",
    targetAudience: "",
    duration: "60-second"
  });

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!formData.topic) return;
    
    setLoading(true);
    setScript("");
    
    try {
      const res = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.error) {
        alert("Error: " + data.error);
      } else if (data.script) {
        setScript(data.script);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">AI Script Generator</h1>
        <p className="text-lg text-muted-foreground">Generate highly engaging, hook-focused scripts for TikTok, Shorts, and Reels in seconds.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Content Details</CardTitle>
            <CardDescription>Enter details about your video to get started.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerate} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="topic">Topic / Idea</Label>
                <Textarea 
                  id="topic" 
                  placeholder="e.g., 3 ways to automate your business with AI" 
                  className="resize-none"
                  rows={3}
                  value={formData.topic}
                  onChange={(e) => setFormData({...formData, topic: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="niche">Niche</Label>
                  <Input 
                    id="niche" 
                    placeholder="e.g., Business, Tech" 
                    value={formData.niche}
                    onChange={(e) => setFormData({...formData, niche: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="audience">Target Audience</Label>
                  <Input 
                    id="audience" 
                    placeholder="e.g., Beginners, Founders" 
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading || !formData.topic}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : "Generate Script"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="flex flex-col h-full min-h-[400px]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Generated Script</CardTitle>
              <CardDescription>Your AI-written script will appear here.</CardDescription>
            </div>
            {script && (
              <Button variant="outline" size="icon" onClick={copyToClipboard} title="Copy to clipboard">
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            )}
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {script ? (
              <div className="flex-1 bg-muted/50 p-4 rounded-md whitespace-pre-wrap font-medium text-sm overflow-y-auto">
                {script}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center border-2 border-dashed rounded-md p-8 text-center text-muted-foreground">
                {loading ? "Writing your viral script..." : "Enter your topic and hit generate to see the magic happen."}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
