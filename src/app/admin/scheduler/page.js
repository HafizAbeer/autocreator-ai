"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Calendar as CalendarIcon, Clock } from "lucide-react";

export default function SchedulerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Content Scheduler</h2>
        <p className="text-muted-foreground">Queue and automate your social media posts.</p>
      </div>

      <Tabs defaultValue="schedule" className="w-full">
        <TabsList>
          <TabsTrigger value="schedule">Schedule New Post</TabsTrigger>
          <TabsTrigger value="queue">Queue Pipeline</TabsTrigger>
        </TabsList>
        <TabsContent value="schedule" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Scheduled Post</CardTitle>
              <CardDescription>Upload an asset or select from generated files to schedule.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
                  <Upload className="h-8 w-8 mb-4" />
                  <p>Drag and drop a video or image, or click to browse</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Platforms</Label>
                    <div className="flex flex-wrap gap-2">
                      {["TikTok", "Instagram", "Facebook"].map(platform => (
                        <div key={platform} className="flex items-center space-x-2 border p-2 rounded-md bg-background">
                          <input type="checkbox" id={platform} />
                          <label htmlFor={platform} className="text-sm cursor-pointer">{platform}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Caption</Label>
                    <textarea 
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Write your caption here..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><CalendarIcon className="h-4 w-4"/> Date</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Clock className="h-4 w-4"/> Time</Label>
                    <Input type="time" />
                  </div>
                </div>

                <Button className="w-full md:w-auto">Schedule Post</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="queue">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming & Past Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-8 text-muted-foreground border rounded-lg bg-muted/10">
                No posts scheduled yet. Your pipeline is empty.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
