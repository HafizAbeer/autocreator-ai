"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SocialAccountsPage() {
  const accounts = [
    { name: "TikTok", connected: false, color: "bg-black text-white" },
    { name: "Instagram", connected: true, color: "bg-gradient-to-r from-purple-500 to-pink-500 text-white" },
    { name: "Facebook", connected: false, color: "bg-blue-600 text-white" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Social Accounts</h2>
        <p className="text-muted-foreground">Connect your accounts to enable auto-posting.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {accounts.map((acc) => (
          <Card key={acc.name}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                {acc.name}
                {acc.connected ? (
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">Connected</span>
                ) : (
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">Not Connected</span>
                )}
              </CardTitle>
              <CardDescription>Manage your {acc.name} access.</CardDescription>
            </CardHeader>
            <CardContent>
              {acc.connected ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Token is active. You can auto-post to this platform.</p>
                  <Button variant="destructive" size="sm">Disconnect</Button>
                </div>
              ) : (
                <Button className={acc.color}>Connect {acc.name}</Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
