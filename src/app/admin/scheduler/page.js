"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2, Rocket, CheckCircle2, AlertCircle,
  FileText, Video, Hash, MessageSquare, Send, RefreshCw, Upload
} from "lucide-react";

const PIPELINE_STEPS = [
  { step: 1, label: "Generating Script", icon: FileText },
  { step: 2, label: "Script Ready", icon: FileText },
  { step: 3, label: "Caption & Hashtags", icon: Hash },
  { step: 4, label: "Building Video Scenes", icon: Video },
  { step: 5, label: "Video Ready", icon: Video },
];

const STATUS_COLORS = {
  queued: "text-yellow-500 bg-yellow-500/10 border-yellow-500/30",
  generating_script: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  generating_media: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  generating_video: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  ready: "text-green-500 bg-green-500/10 border-green-500/30",
  publishing: "text-purple-400 bg-purple-400/10 border-purple-400/30",
  published: "text-green-500 bg-green-500/10 border-green-500/30",
  failed: "text-red-500 bg-red-500/10 border-red-500/30",
};

export default function SchedulerPage() {
  // Form state
  const [form, setForm] = useState({
    topic: "",
    niche: "General",
    targetAudience: "Everyone",
    videoDuration: "60",
    platforms: ["tiktok"],
    postNow: true,
    scheduledFor: "",
  });

  // Pipeline state
  const [launching, setLaunching] = useState(false);
  const [activeJob, setActiveJob] = useState(null); // { jobId, status, step, ... }
  const [formError, setFormError] = useState("");
  const pollRef = useRef(null);

  // Queue state
  const [queue, setQueue] = useState([]);
  const [queueLoading, setQueueLoading] = useState(false);
  const [publishingJobId, setPublishingJobId] = useState(null);
  const [publishResults, setPublishResults] = useState({}); // { jobId: { results, error } }

  function handlePlatformToggle(p) {
    setForm((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(p)
        ? prev.platforms.filter((x) => x !== p)
        : [...prev.platforms, p],
    }));
  }

  async function handleLaunch() {
    if (!form.topic.trim()) {
      setFormError("Please enter a topic.");
      return;
    }
    if (form.platforms.length === 0) {
      setFormError("Select at least one platform.");
      return;
    }
    setFormError("");
    setLaunching(true);
    setActiveJob(null);

    try {
      const res = await fetch("/api/pipeline/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start");
      setActiveJob({ jobId: data.jobId, pipelineStatus: "queued", pipelineStep: 0 });
      startPolling(data.jobId);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setLaunching(false);
    }
  }

  function startPolling(jobId) {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/pipeline/status/${jobId}`);
        const data = await res.json();
        setActiveJob(data);
        if (["ready", "published", "failed"].includes(data.pipelineStatus)) {
          clearInterval(pollRef.current);
          fetchQueue();
        }
      } catch {
        // ignore
      }
    }, 3000);
  }

  useEffect(() => () => clearInterval(pollRef.current), []);

  async function fetchQueue() {
    setQueueLoading(true);
    try {
      const res = await fetch("/api/pipeline/queue");
      const data = await res.json();
      setQueue(data.jobs || []);
    } catch {
      // ignore
    } finally {
      setQueueLoading(false);
    }
  }

  async function publishJob(jobId) {
    setPublishingJobId(jobId);
    setPublishResults((prev) => ({ ...prev, [jobId]: null }));
    try {
      const res = await fetch("/api/pipeline/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const data = await res.json();
      setPublishResults((prev) => ({ ...prev, [jobId]: data }));
      fetchQueue(); // refresh queue to show updated status
    } catch (err) {
      setPublishResults((prev) => ({ ...prev, [jobId]: { error: err.message } }));
    } finally {
      setPublishingJobId(null);
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Content Pipeline</h2>
        <p className="text-muted-foreground">Enter a topic and let AI create the full content — script, video, caption — and post it for you.</p>
      </div>

      <Tabs defaultValue="launch" className="w-full">
        <TabsList>
          <TabsTrigger value="launch">🚀 Launch Pipeline</TabsTrigger>
          <TabsTrigger value="queue" onClick={fetchQueue}>📋 Queue & History</TabsTrigger>
        </TabsList>

        {/* ── LAUNCH TAB ── */}
        <TabsContent value="launch" className="mt-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Form */}
            <Card>
              <CardHeader>
                <CardTitle>New Pipeline Job</CardTitle>
                <CardDescription>AI will generate script → caption → hashtags → video → post.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic / Niche *</Label>
                  <Input
                    id="topic"
                    placeholder="e.g. 5 AI tools every creator must use"
                    value={form.topic}
                    onChange={(e) => setForm((p) => ({ ...p, topic: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="niche">Niche</Label>
                    <select
                      id="niche"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={form.niche}
                      onChange={(e) => setForm((p) => ({ ...p, niche: e.target.value }))}
                    >
                      {["General", "AI & Tech", "TikTok Growth", "Finance", "Health", "Motivation", "Fashion", "Food", "Travel"].map((n) => (
                        <option key={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Video Duration</Label>
                    <select
                      id="duration"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={form.videoDuration}
                      onChange={(e) => setForm((p) => ({ ...p, videoDuration: e.target.value }))}
                    >
                      <option value="30">30 seconds</option>
                      <option value="60">60 seconds</option>
                      <option value="90">90 seconds</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="audience">Target Audience</Label>
                  <Input
                    id="audience"
                    placeholder="e.g. Content creators, entrepreneurs"
                    value={form.targetAudience}
                    onChange={(e) => setForm((p) => ({ ...p, targetAudience: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Platforms *</Label>
                  <div className="flex gap-3">
                    {[
                      { id: "tiktok", label: "🎵 TikTok" },
                      { id: "instagram", label: "📸 Instagram" },
                      { id: "facebook", label: "📘 Facebook" },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handlePlatformToggle(p.id)}
                        className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                          form.platforms.includes(p.id)
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>When to Post</Label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, postNow: true }))}
                      className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                        form.postNow ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                      }`}
                    >
                      Post Now
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, postNow: false }))}
                      className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                        !form.postNow ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                      }`}
                    >
                      Schedule
                    </button>
                  </div>
                  {!form.postNow && (
                    <Input
                      type="datetime-local"
                      value={form.scheduledFor}
                      onChange={(e) => setForm((p) => ({ ...p, scheduledFor: e.target.value }))}
                      className="mt-2"
                    />
                  )}
                </div>

                {formError && (
                  <p className="text-sm text-red-500 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" /> {formError}
                  </p>
                )}

                <Button
                  className="w-full h-11 text-base"
                  onClick={handleLaunch}
                  disabled={launching}
                >
                  {launching ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Starting Pipeline...</>
                  ) : (
                    <><Rocket className="h-4 w-4 mr-2" /> Launch Pipeline</>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Progress Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Pipeline Progress</CardTitle>
                <CardDescription>Real-time status of the active job.</CardDescription>
              </CardHeader>
              <CardContent>
                {!activeJob ? (
                  <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm text-center gap-2">
                    <Rocket className="h-10 w-10 opacity-20" />
                    <p>Launch a pipeline to see progress here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className={`text-xs px-3 py-2 rounded-lg border font-medium flex items-center gap-2 ${STATUS_COLORS[activeJob.pipelineStatus] || ""}`}>
                      {["generating_script", "generating_media", "generating_video", "publishing"].includes(activeJob.pipelineStatus) && (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      )}
                      Status: <span className="capitalize">{activeJob.pipelineStatus?.replace(/_/g, " ")}</span>
                    </div>

                    <div className="space-y-3">
                      {[
                        { step: 1, label: "Script Generation", icon: FileText },
                        { step: 3, label: "Caption & Hashtags", icon: MessageSquare },
                        { step: 4, label: "Video Scene Building", icon: Video },
                        { step: 5, label: "Ready to Publish", icon: Send },
                      ].map(({ step, label, icon: Icon }) => {
                        const done = activeJob.pipelineStep >= step;
                        const active = activeJob.pipelineStep === step - 1 && !["ready", "failed", "published"].includes(activeJob.pipelineStatus);
                        return (
                          <div key={step} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                            done ? "border-green-500/40 bg-green-500/5" :
                            active ? "border-blue-400/40 bg-blue-400/5" :
                            "border-border bg-muted/10 opacity-50"
                          }`}>
                            <div className={`rounded-full p-1 ${done ? "text-green-500" : active ? "text-blue-400" : "text-muted-foreground"}`}>
                              {done ? <CheckCircle2 className="h-5 w-5" /> : active ? <Loader2 className="h-5 w-5 animate-spin" /> : <Icon className="h-5 w-5" />}
                            </div>
                            <span className="text-sm font-medium">{label}</span>
                          </div>
                        );
                      })}
                    </div>

                    {activeJob.pipelineStatus === "ready" && (
                      <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-sm text-green-500 font-medium">
                        ✅ Content is ready! Check Queue for details.
                      </div>
                    )}
                    {activeJob.pipelineStatus === "failed" && (
                      <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-500">
                        ❌ Error: {activeJob.pipelineError || "Something went wrong."}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── QUEUE TAB ── */}
        <TabsContent value="queue" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Pipeline Queue & History</CardTitle>
                <CardDescription>All your pipeline jobs — recent first.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={fetchQueue} disabled={queueLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${queueLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {queueLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : queue.length === 0 ? (
                <div className="text-center p-10 text-muted-foreground border rounded-lg bg-muted/10">
                  No pipeline jobs yet. Launch one from the Pipeline tab.
                </div>
              ) : (
                <div className="space-y-3">
                  {queue.map((job) => {
                    const isPublishing = publishingJobId === job._id;
                    const pubResult = publishResults[job._id];
                    return (
                      <div key={job._id} className="border rounded-xl p-4 hover:bg-muted/10 transition-colors space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1 min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">{job.topic}</p>
                            <p className="text-xs text-muted-foreground">
                              {job.platforms?.map((p) => p.platform).join(", ")} &bull; {formatDate(job.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <div className={`text-xs px-3 py-1.5 rounded-full border font-medium whitespace-nowrap ${STATUS_COLORS[job.pipelineStatus] || ""}`}>
                              {job.pipelineStatus?.replace(/_/g, " ")}
                            </div>
                            {job.pipelineStatus === "ready" && (
                              <Button
                                size="sm"
                                onClick={() => publishJob(job._id)}
                                disabled={isPublishing}
                                className="gap-1.5 whitespace-nowrap"
                              >
                                {isPublishing ? (
                                  <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Publishing...</>
                                ) : (
                                  <><Upload className="h-3.5 w-3.5" /> Publish Now</>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Per-platform status breakdown */}
                        {job.platforms?.length > 0 && (
                          <div className="flex gap-2 flex-wrap">
                            {job.platforms.map((p) => (
                              <span
                                key={p.platform}
                                className={`text-xs px-2 py-1 rounded-md border font-medium capitalize ${
                                  p.status === "published" ? "bg-green-500/10 text-green-500 border-green-500/30" :
                                  p.status === "failed" ? "bg-red-500/10 text-red-500 border-red-500/30" :
                                  p.status === "processing" ? "bg-blue-400/10 text-blue-400 border-blue-400/30" :
                                  "bg-muted text-muted-foreground border-border"
                                }`}
                              >
                                {p.platform}: {p.status}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Publish result feedback */}
                        {pubResult && (
                          <div className={`text-xs p-2 rounded-lg ${
                            pubResult.error ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"
                          }`}>
                            {pubResult.error ? (
                              `❌ ${pubResult.error}`
                            ) : (
                              pubResult.results?.map((r) =>
                                r.success
                                  ? `✅ ${r.platform}: Published (ID: ${r.postId})`
                                  : `❌ ${r.platform}: ${r.error}`
                              ).join(" | ")
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
