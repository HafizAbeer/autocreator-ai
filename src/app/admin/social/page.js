"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, XCircle, LinkIcon, Unlink } from "lucide-react";

const PLATFORMS = [
  {
    id: "tiktok",
    name: "TikTok",
    description: "Post short-form videos directly to your TikTok account.",
    color: "bg-black hover:bg-zinc-800 text-white",
    icon: "🎵",
  },
  {
    id: "instagram",
    name: "Instagram",
    description: "Publish Reels and videos to your Instagram business account.",
    color: "bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white",
    icon: "📸",
  },
  {
    id: "facebook",
    name: "Facebook",
    description: "Share videos and Reels to your Facebook Page automatically.",
    color: "bg-blue-600 hover:bg-blue-700 text-white",
    icon: "📘",
  },
];

export default function SocialAccountsPage() {
  const [accounts, setAccounts] = useState({ tiktok: false, instagram: false, facebook: false });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [tokenModal, setTokenModal] = useState(null); // platform id or null
  const [tokenInput, setTokenInput] = useState("");
  const [accountIdInput, setAccountIdInput] = useState("");
  const [feedback, setFeedback] = useState({}); // { platform: { type: "success"|"error", msg } }

  // Fetch connection status from DB
  useEffect(() => {
    fetchStatus();
  }, []);

  async function fetchStatus() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/social");
      const data = await res.json();
      if (data.accounts) setAccounts(data.accounts);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  async function handleConnect(platformId) {
    if (!tokenInput.trim()) return;
    setActionLoading((prev) => ({ ...prev, [platformId]: true }));
    try {
      const res = await fetch("/api/admin/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: platformId,
          accessToken: tokenInput.trim(),
          accountId: accountIdInput.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAccounts((prev) => ({ ...prev, [platformId]: true }));
        setFeedback((prev) => ({ ...prev, [platformId]: { type: "success", msg: data.message } }));
        setTokenModal(null);
        setTokenInput("");
        setAccountIdInput("");
      } else {
        setFeedback((prev) => ({ ...prev, [platformId]: { type: "error", msg: data.error } }));
      }
    } catch {
      setFeedback((prev) => ({ ...prev, [platformId]: { type: "error", msg: "Connection failed." } }));
    } finally {
      setActionLoading((prev) => ({ ...prev, [platformId]: false }));
      setTimeout(() => setFeedback((prev) => ({ ...prev, [platformId]: null })), 4000);
    }
  }

  async function handleDisconnect(platformId) {
    setActionLoading((prev) => ({ ...prev, [platformId]: true }));
    try {
      const res = await fetch("/api/admin/social", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: platformId }),
      });
      const data = await res.json();
      if (data.success) {
        setAccounts((prev) => ({ ...prev, [platformId]: false }));
        setFeedback((prev) => ({ ...prev, [platformId]: { type: "success", msg: data.message } }));
      } else {
        setFeedback((prev) => ({ ...prev, [platformId]: { type: "error", msg: data.error } }));
      }
    } catch {
      setFeedback((prev) => ({ ...prev, [platformId]: { type: "error", msg: "Disconnect failed." } }));
    } finally {
      setActionLoading((prev) => ({ ...prev, [platformId]: false }));
      setTimeout(() => setFeedback((prev) => ({ ...prev, [platformId]: null })), 4000);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading accounts...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Social Accounts</h2>
        <p className="text-muted-foreground">Connect your accounts to enable auto-posting from the pipeline.</p>
      </div>

      {/* Token Entry Modal */}
      {tokenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card border rounded-2xl p-8 w-full max-w-md shadow-2xl space-y-5">
            <h3 className="text-xl font-bold">
              Connect {PLATFORMS.find((p) => p.id === tokenModal)?.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              Enter your API Access Token from the platform's developer portal. This token is stored securely in your database.
            </p>
            <div className="space-y-2">
              <Label htmlFor="token">Access Token</Label>
              <Input
                id="token"
                type="password"
                placeholder="Paste your access token here..."
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountId">Account / Page ID <span className="text-muted-foreground">(optional)</span></Label>
              <Input
                id="accountId"
                placeholder="e.g. your page ID or user ID"
                value={accountIdInput}
                onChange={(e) => setAccountIdInput(e.target.value)}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                className="flex-1"
                onClick={() => handleConnect(tokenModal)}
                disabled={!tokenInput.trim() || actionLoading[tokenModal]}
              >
                {actionLoading[tokenModal] ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Connecting...</>
                ) : (
                  <><LinkIcon className="h-4 w-4 mr-2" /> Save & Connect</>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setTokenModal(null);
                  setTokenInput("");
                  setAccountIdInput("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {PLATFORMS.map((platform) => {
          const isConnected = accounts[platform.id];
          const isLoading = actionLoading[platform.id];
          const fb = feedback[platform.id];

          return (
            <Card key={platform.id} className={`transition-all ${isConnected ? "border-green-500/40" : ""}`}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <span className="text-2xl">{platform.icon}</span>
                    {platform.name}
                  </span>
                  {isConnected ? (
                    <span className="flex items-center gap-1 text-xs px-2 py-1 bg-green-500/10 text-green-500 border border-green-500/30 rounded-full font-medium">
                      <CheckCircle2 className="h-3 w-3" /> Connected
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs px-2 py-1 bg-muted text-muted-foreground rounded-full font-medium">
                      <XCircle className="h-3 w-3" /> Not Connected
                    </span>
                  )}
                </CardTitle>
                <CardDescription>{platform.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {fb && (
                  <p className={`text-xs px-3 py-2 rounded-md ${fb.type === "success" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                    {fb.msg}
                  </p>
                )}

                {isConnected ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      ✅ Token is active. This platform is ready for auto-posting.
                    </p>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDisconnect(platform.id)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Disconnecting...</>
                      ) : (
                        <><Unlink className="h-4 w-4 mr-2" /> Disconnect</>
                      )}
                    </Button>
                  </div>
                ) : (
                  <Button
                    className={platform.color}
                    onClick={() => setTokenModal(platform.id)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <LinkIcon className="h-4 w-4 mr-2" />
                    )}
                    Connect {platform.name}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="bg-muted/30 border rounded-xl p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-1">How to get your Access Token?</p>
        <ul className="space-y-1 list-disc pl-4">
          <li><strong>TikTok:</strong> Go to <a href="https://developers.tiktok.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">developers.tiktok.com</a> → Your App → Content Posting API</li>
          <li><strong>Instagram/Facebook:</strong> Go to <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">developers.facebook.com</a> → Graph API Explorer → Generate token</li>
        </ul>
      </div>
    </div>
  );
}
