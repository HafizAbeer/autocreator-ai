import { AdBanner } from "@/components/ads/AdBanner";
import { notFound } from "next/navigation";
import { Blog } from "@/models/Blog";
import dbConnect from "@/lib/mongodb";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return {
    title: `${slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} - AutoCreator AI`,
    description: `Read our comprehensive guide on ${slug.replace(/-/g, ' ')}. Learn strategies for AI content automation and social media growth.`,
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  let post = null;
  try {
    await dbConnect();
    post = await Blog.findOne({ slug }).lean();
  } catch(e) {
    console.error(e);
  }

  // Fallback to mock content if not found in DB
  if (!post) {
    post = {
      title: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      content: `<p>This is a placeholder for the blog post content. The comprehensive guide on building your social media presence starts here.</p>
      <h2>Step 1: Ideation</h2>
      <p>Use our AI Script generator to craft compelling hooks.</p>
      <h2>Step 2: Video Creation</h2>
      <p>Generate highly engaging faceless videos in minutes instead of hours.</p>
      <h2>Step 3: Automation</h2>
      <p>Schedule your posts across TikTok, Instagram, and Facebook.</p>`,
      categories: ["AI Content", "Guides"],
      createdAt: new Date().toISOString()
    };
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <div className="flex justify-center gap-2 mb-4">
          {post.categories?.map((cat) => (
            <span key={cat} className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
              {cat}
            </span>
          ))}
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">{post.title}</h1>
        <p className="text-muted-foreground">
          Published on {new Date(post.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="my-8">
        <AdBanner dataAdSlot="in-content-top" className="h-[90px] md:h-[250px] w-full" />
      </div>

      <article 
        className="prose prose-lg dark:prose-invert max-w-none mb-12"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      <div className="my-12 pt-8 border-t">
        <AdBanner dataAdSlot="in-content-bottom" className="h-[90px] md:h-[250px] w-full" />
      </div>
    </div>
  );
}
