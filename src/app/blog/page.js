import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdBanner } from "@/components/ads/AdBanner";
import { Blog } from "@/models/Blog";
import dbConnect from "@/lib/mongodb";

// Mocking some initial blog posts if DB is empty
const mockPosts = [
  {
    _id: "1",
    title: "How to Build a Faceless TikTok Channel in 2026",
    slug: "how-to-build-faceless-tiktok-channel",
    excerpt: "Learn the exact strategies and AI tools needed to scale a faceless TikTok channel to 100k followers in 3 months.",
    categories: ["TikTok Growth", "Faceless Channels"],
    createdAt: new Date().toISOString(),
  },
  {
    _id: "2",
    title: "Top 5 AI Tools for Content Creators",
    slug: "top-5-ai-tools-for-creators",
    excerpt: "A comprehensive review of the best AI content automation tools that will save you 20 hours a week.",
    categories: ["AI Content Creation", "Creator Economy"],
    createdAt: new Date().toISOString(),
  }
];

export const metadata = {
  title: "Blog - AutoCreator AI",
  description: "Learn the best strategies for AI content creation, social media automation, and growing faceless channels.",
};

export default async function BlogListingPage() {
  // Fetch from DB, fallback to mock if empty
  let posts = [];
  try {
    await dbConnect();
    const dbPosts = await Blog.find({ isPublished: true }).sort({ createdAt: -1 }).lean();
    posts = dbPosts.length > 0 ? dbPosts : mockPosts;
  } catch (error) {
    posts = mockPosts; // fallback if DB isn't setup
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Content Creator Blog</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Expert guides, strategies, and tutorials on AI content creation, TikTok growth, and social media automation.
        </p>
      </div>

      <div className="mb-10">
        <AdBanner dataAdSlot="header-ad" className="h-[90px] md:h-[120px] w-full" />
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {posts.map((post) => (
            <Card key={post._id.toString()} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex gap-2 mb-2">
                  {post.categories?.map((cat) => (
                    <span key={cat} className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
                      {cat}
                    </span>
                  ))}
                </div>
                <CardTitle className="text-2xl hover:text-primary transition-colors">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </CardTitle>
                <CardDescription>
                  {new Date(post.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{post.excerpt}</p>
                <div className="mt-4">
                  <Link href={`/blog/${post.slug}`} className="font-medium text-primary hover:underline">
                    Read more →
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-foreground cursor-pointer">AI Content Creation</li>
                <li className="hover:text-foreground cursor-pointer">TikTok Growth</li>
                <li className="hover:text-foreground cursor-pointer">Instagram Growth</li>
                <li className="hover:text-foreground cursor-pointer">Faceless Channels</li>
              </ul>
            </CardContent>
          </Card>

          <div className="sticky top-24">
            <AdBanner dataAdSlot="sidebar-ad" className="h-[600px] w-full bg-muted/10 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
