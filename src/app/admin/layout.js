import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Calendar, Share2, PenTool, LogOut, Settings } from "lucide-react";

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-card border-r hidden md:block">
        <div className="p-6">
          <h2 className="font-bold text-lg tracking-tight text-primary">Admin Control</h2>
        </div>
        <nav className="px-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-sm font-medium">
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Link>
          <Link href="/admin/scheduler" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-sm font-medium">
            <Calendar className="h-4 w-4" /> Content Scheduler
          </Link>
          <Link href="/admin/social" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-sm font-medium">
            <Share2 className="h-4 w-4" /> Social Accounts
          </Link>
          <Link href="/admin/blog" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-sm font-medium">
            <PenTool className="h-4 w-4" /> Blog Editor
          </Link>
        </nav>
      </aside>

      {/* Admin Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8 pb-4 border-b">
          <h1 className="text-2xl font-bold tracking-tight">Welcome, {session.user.name}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">View Live Site</Link>
            <Link href="/api/auth/signout" className="hover:text-red-500 flex items-center gap-1">
              <LogOut className="h-4 w-4" /> Sign out
            </Link>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
