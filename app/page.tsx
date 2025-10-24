import dynamic from 'next/dynamic';
import JsonLd from '@/components/JsonLd';
import PostCard from '@/components/PostCard';
import { getAllPosts } from '@/content/posts';
import { siteConfig } from '@/lib/siteConfig';
import { homepageJsonLd } from '@/lib/structuredData';

const Hero = dynamic(() => import('@/components/Hero'), {
  loading: () => (
    <section className="hero">
      <div>
        <h1>Loading inclusive experiences…</h1>
        <p>Preparing the latest accessibility insights for you.</p>
      </div>
    </section>
  )
});

const PerformanceMetrics = dynamic(() => import('@/components/PerformanceMetrics'), {
  ssr: false,
  loading: () => null
});

export const revalidate = 60;

export default function HomePage() {
  const posts = getAllPosts();

  return (
    <>
      <JsonLd data={homepageJsonLd()} />
      <Hero
        title="The fastest path to confident sign language support"
        description={siteConfig.tagline}
        imageUrl="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80&sat=-35"
      />

      <section>
        <h2 className="section-title">SEO-first architecture that scales</h2>
        <div className="grid">
          <div className="card">
            <h3>Canonical routing</h3>
            <p>
              Predictable, crawlable URLs backed by automatic canonical tags ensure every signQA answer is the
              authoritative source engines index.
            </p>
          </div>
          <div className="card">
            <h3>Structured data</h3>
            <p>
              JSON-LD schemas describe questions, answers, and video references so that search engines understand
              context and reward precision.
            </p>
          </div>
          <div className="card">
            <h3>Performance by default</h3>
            <p>
              Code-splitting, image optimization, and smart caching policies keep the experience fast across global
              bandwidth conditions.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="section-title">Latest insights</h2>
        <div className="grid">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>

      <PerformanceMetrics />
    </>
  );
}
