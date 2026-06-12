"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Download, PlayCircle, Settings, RefreshCw } from "lucide-react";

// ─── Scene Player ─────────────────────────────────────────────────────────────
function ScenePlayer({ scenes }) {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [done, setDone] = useState(false);

  // Guard: make sure scenes is valid
  if (!scenes || scenes.length === 0) return null;

  const currentScene = scenes[currentIndex] || scenes[0];

  const goToScene = useCallback(
    (index) => {
      if (index >= scenes.length) {
        setDone(true);
        return;
      }
      setDone(false);
      setCurrentIndex(index);
    },
    [scenes.length]
  );

  // Auto-advance after scene duration
  useEffect(() => {
    if (done) return;
    if (!scenes[currentIndex]) return;

    const duration = (scenes[currentIndex].duration || 4) * 1000;

    // Play video
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }

    // Play audio
    if (audioRef.current && scenes[currentIndex].audioUrl) {
      audioRef.current.src = scenes[currentIndex].audioUrl;
      audioRef.current.load();
      audioRef.current.play().catch(() => {});
    }

    // Schedule next scene
    timerRef.current = setTimeout(() => {
      goToScene(currentIndex + 1);
    }, duration);

    return () => clearTimeout(timerRef.current);
  }, [currentIndex, done, goToScene, scenes]);

  const restart = () => {
    clearTimeout(timerRef.current);
    setDone(false);
    setCurrentIndex(0);
  };

  return (
    <div className="relative w-full max-w-[280px] mx-auto select-none">
      {/* Video Frame */}
      <div className="relative aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
        {currentScene.videoUrl ? (
          <video
            ref={videoRef}
            key={currentScene.videoUrl}
            src={currentScene.videoUrl}
            className="w-full h-full object-cover"
            muted
            loop
            playsInline
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <p className="text-white/40 text-xs text-center px-4">
              No footage found for:<br /><span className="font-bold">{currentScene.keyword}</span>
            </p>
          </div>
        )}

        {/* Dark gradient overlay at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

        {/* Caption */}
        <div className="absolute bottom-8 left-0 right-0 px-4 flex justify-center">
          <p className="text-white text-sm font-bold text-center leading-snug drop-shadow-lg">
            {currentScene.text}
          </p>
        </div>

        {/* Scene counter badge */}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-mono">
          {done ? "✓ Done" : `${currentIndex + 1} / ${scenes.length}`}
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((currentIndex + (done ? 1 : 0)) / scenes.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Hidden audio */}
      <audio ref={audioRef} className="hidden" />

      {/* Controls */}
      <div className="mt-4 flex gap-2 justify-center">
        <Button variant="outline" size="sm" onClick={restart} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Replay
        </Button>
        <Button
          size="sm"
          className="gap-2"
          onClick={() =>
            alert(
              "Video Download:\nTo save this video, use a screen recorder (e.g. OBS or Windows Game Bar [Win+G]) while it plays. Full canvas-based export will be added in a future update!"
            )
          }
        >
          <Download className="h-4 w-4" /> Download
        </Button>
      </div>

      {/* Scene list */}
      <div className="mt-4 space-y-1 max-h-[140px] overflow-y-auto pr-1">
        {scenes.map((s, i) => (
          <button
            key={i}
            onClick={() => { clearTimeout(timerRef.current); setDone(false); setCurrentIndex(i); }}
            className={`w-full text-left px-3 py-2 rounded-md text-xs transition-all duration-150 ${
              i === currentIndex && !done
                ? "bg-primary text-primary-foreground font-semibold"
                : "bg-muted/50 hover:bg-muted text-muted-foreground"
            }`}
          >
            <span className="font-bold mr-2">Scene {i + 1}:</span>{s.text}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Generator Component ─────────────────────────────────────────────────
export default function VideoGeneratorClient({ heading, description }) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [scenes, setScenes] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    topic: "",
    script: "",
    duration: "30",
  });

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!formData.topic && !formData.script) return;

    setLoading(true);
    setScenes(null);
    setError(null);
    setProgress(10);
    setProgressText("AI is writing scene breakdown...");

    try {
      setProgress(30);
      const res = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      setProgress(75);
      setProgressText("Fetching stock videos & building audio...");

      const data = await res.json();
      setProgress(100);

      if (data.error) {
        setError(data.error);
      } else if (data.scenes && data.scenes.length > 0) {
        setScenes(data.scenes);
      } else {
        setError("No scenes were generated. Please try again with a different topic.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">{heading}</h1>
        <p className="text-lg text-muted-foreground">{description}</p>
      </div>

      <div className="grid md:grid-cols-5 gap-8">
        {/* ── Form ── */}
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Video Configuration</CardTitle>
              <CardDescription>
                Enter a topic or paste your script. AI will write scenes, find matching stock
                footage, and add voiceover automatically.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerate} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <input
                    id="topic"
                    type="text"
                    placeholder="e.g. 5 ways to make money online"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="script">Custom Script <span className="text-muted-foreground font-normal">(Optional — overrides topic)</span></Label>
                  <Textarea
                    id="script"
                    placeholder="Paste your own script here..."
                    className="resize-none min-h-[100px]"
                    value={formData.script}
                    onChange={(e) => setFormData({ ...formData, script: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Target Duration</Label>
                  <select
                    id="duration"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  >
                    <option value="15">~15 seconds</option>
                    <option value="30">~30 seconds</option>
                    <option value="60">~60 seconds</option>
                  </select>
                </div>

                {error && (
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md text-sm">
                    ❌ {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || (!formData.topic && !formData.script)}
                >
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                  ) : (
                    "🎬 Generate Video"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* How it works */}
          <div className="mt-5 grid grid-cols-3 gap-3 text-center text-sm">
            {[
              { icon: "🧠", label: "AI writes scenes" },
              { icon: "🎬", label: "Pexels stock footage" },
              { icon: "🔊", label: "AI voiceover" },
            ].map((item) => (
              <div key={item.label} className="bg-muted/30 rounded-lg p-3 border">
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className="text-muted-foreground text-xs">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Preview ── */}
        <div className="md:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-primary" /> Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center">
              {loading ? (
                <div className="w-full text-center">
                  <div className="relative w-full aspect-[9/16] max-w-[200px] mx-auto bg-muted/50 rounded-2xl flex flex-col items-center justify-center border border-dashed">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                    <p className="text-xs font-medium px-4 text-center">{progressText}</p>
                    <div className="w-3/4 bg-secondary h-2 rounded-full mt-4 overflow-hidden">
                      <div
                        className="bg-primary h-full transition-all duration-700"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{progress}%</p>
                  </div>
                </div>
              ) : scenes ? (
                <ScenePlayer scenes={scenes} />
              ) : (
                <div className="w-full h-[360px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground p-6 text-center bg-muted/20">
                  <Settings className="h-12 w-12 mb-4 opacity-20" />
                  <p className="font-medium">Your AI video will appear here</p>
                  <p className="text-xs mt-2 opacity-60">
                    Real stock footage + AI voiceover,<br />assembled automatically for free
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
