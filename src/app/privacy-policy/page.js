import Link from "next/link";

export const metadata = {
  title: "Privacy Policy - AutoCreator AI",
  description: "Learn how AutoCreator AI collects, uses, and protects your personal data.",
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "June 13, 2026";

  return (
    <div className="container max-w-4xl mx-auto px-4 py-16 md:py-24">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground text-lg">Last Updated: {lastUpdated}</p>
      </div>

      <div className="max-w-none text-foreground">
        <p className="text-lg leading-relaxed mb-8 text-muted-foreground">
          At <strong className="text-foreground">AutoCreator AI</strong> ("we," "our," or "us"), we are committed to protecting your privacy and ensuring that your personal data is handled safely and responsibly. This Privacy Policy outlines how we collect, use, disclose, and safeguard your information when you visit our website and use our AI-powered content automation services.
        </p>

        <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-6">1. Information We Collect</h2>
        <p className="text-lg leading-relaxed mb-4 text-muted-foreground">We may collect several types of information from and about users of our Platform, including:</p>
        <ul className="list-disc pl-6 mb-8 space-y-3 text-lg text-muted-foreground">
          <li><strong className="text-foreground">Personal Data:</strong> Email address, name, and login credentials when you register an account.</li>
          <li><strong className="text-foreground">Content Data:</strong> Scripts, text prompts, uploaded assets, and generated outputs (videos, thumbnails, captions) created during your use of our tools.</li>
          <li><strong className="text-foreground">Usage Data:</strong> Information about how you interact with our Platform, such as pages visited, tools used, and time spent.</li>
          <li><strong className="text-foreground">Third-Party Integrations:</strong> If you connect your social media accounts (e.g., TikTok, Instagram, Facebook), we collect authentication tokens and account analytics as permitted by those platforms to facilitate auto-posting.</li>
        </ul>

        <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-6">2. How We Use Your Information</h2>
        <p className="text-lg leading-relaxed mb-4 text-muted-foreground">We use the information we collect to:</p>
        <ul className="list-disc pl-6 mb-8 space-y-3 text-lg text-muted-foreground">
          <li>Provide, maintain, and improve the AutoCreator AI Platform.</li>
          <li>Process your inputs using third-party AI models (like OpenAI, Groq) to generate your requested content.</li>
          <li>Communicate with you regarding updates, support, and promotional offers.</li>
          <li>Publish content to your linked social media accounts automatically, only when explicitly authorized by you.</li>
        </ul>

        <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-6">3. AI Processing & Third-Party APIs</h2>
        <p className="text-lg leading-relaxed mb-8 text-muted-foreground">
          To provide our core services, your text prompts and scripts are processed using advanced AI models provided by our partners (e.g., Groq, OpenAI). We do not claim ownership over the generated content, and we ensure that our API agreements prevent third-party providers from using your private prompts to train their public models.
        </p>

        <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-6">4. Data Sharing and Disclosure</h2>
        <p className="text-lg leading-relaxed mb-4 text-muted-foreground">We do not sell your personal data. We may share your information only in the following circumstances:</p>
        <ul className="list-disc pl-6 mb-8 space-y-3 text-lg text-muted-foreground">
          <li><strong className="text-foreground">Service Providers:</strong> With trusted third-party vendors (hosting, database providers like MongoDB, analytics) who assist us in operating our Platform.</li>
          <li><strong className="text-foreground">Legal Requirements:</strong> If required to do so by law or in response to valid requests by public authorities.</li>
        </ul>

        <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-6">5. Data Security</h2>
        <p className="text-lg leading-relaxed mb-8 text-muted-foreground">
          We implement commercially reasonable security measures designed to protect your information from accidental loss and from unauthorized access, use, alteration, and disclosure. However, no transmission over the internet is completely secure, and we cannot guarantee the absolute security of your data.
        </p>

        <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-6">6. Your Data Rights</h2>
        <p className="text-lg leading-relaxed mb-8 text-muted-foreground">
          Depending on your location (e.g., GDPR, CCPA), you may have rights regarding your personal data, including the right to access, correct, delete, or restrict the processing of your information. To exercise these rights, please contact us.
        </p>

        <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-6">7. Changes to This Privacy Policy</h2>
        <p className="text-lg leading-relaxed mb-8 text-muted-foreground">
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
        </p>

        <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-6">8. Contact Us</h2>
        <p className="text-lg leading-relaxed mb-8 text-muted-foreground">
          If you have any questions about this Privacy Policy, please contact us at: <br/>
          <a href="mailto:support@autocreator.ai" className="text-primary font-medium hover:underline mt-2 inline-block">support@autocreator.ai</a>
        </p>
      </div>

      <div className="mt-16 pt-8 border-t flex justify-between items-center text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">← Back to Home</Link>
        <Link href="/terms" className="hover:text-foreground transition-colors">Read Terms of Service →</Link>
      </div>
    </div>
  );
}
