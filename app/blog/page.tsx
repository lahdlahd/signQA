import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import PostCard from '@/components/PostCard';
import { getAllPosts } from '@/content/posts';
import { buildMetadata } from '@/lib/metadata';
import { siteConfig } from '@/lib/siteConfig';

export const metadata: Metadata = buildMetadata({
  title: 'Insights',
  description: 'Read the latest SEO, accessibility, and performance insights from the signQA team.',
  path: '/blog'
});

const listJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: `${siteConfig.name} Insights`,
  url: `${siteConfig.url}/blog`
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <>
      <JsonLd data={listJsonLd} />
      <h1>Insights from the signQA team</h1>
      <p>
        Stay ahead with the strategies we use to keep signQA discoverable, performant, and inclusive across every market.
      </p>
      <div className="grid">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </>
  );
}
