"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BlogEditorPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Blog Editor</h2>
          <p className="text-muted-foreground">Create and publish SEO-optimized articles.</p>
        </div>
        <div className="space-x-2">
          <Button variant="outline">Save Draft</Button>
          <Button>Publish</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Input placeholder="Post Title" className="text-2xl font-bold border-none px-0 shadow-none focus-visible:ring-0" />
              </div>
              <div className="space-y-2">
                <Textarea 
                  placeholder="Write your article here... (Markdown supported)" 
                  className="min-h-[500px] border-none px-0 shadow-none focus-visible:ring-0 resize-none text-base"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Publishing Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>URL Slug</Label>
                <Input placeholder="my-awesome-post" />
              </div>
              <div className="space-y-2">
                <Label>Categories</Label>
                <Input placeholder="e.g. TikTok, AI" />
              </div>
              <div className="space-y-2">
                <Label>Featured Image URL</Label>
                <Input placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>Meta Description</Label>
                <Textarea className="resize-none" rows={3} placeholder="SEO description..." />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
