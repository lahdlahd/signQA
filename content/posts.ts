export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  heroImage: string;
  tags: string[];
  readingTime: string;
}

export const posts: Post[] = [
  {
    slug: 'measuring-core-web-vitals-for-accessible-experiences',
    title: 'Measuring Core Web Vitals for Accessible Experiences',
    excerpt:
      'Understand how Core Web Vitals impact accessibility and what we learned while optimizing signQA for lightning-fast interactions.',
    content:
      "<p>Core Web Vitals give us a shared vocabulary to measure performance. For signQA, we focus on fast Time to First Byte (TTFB) so answers can stream in real-time, CLS to keep the UI stable for signers, and INP to guarantee responsive interactions. We adopted granular loading states, server-side streaming, and image preloading tailored for sign language content to keep experiences snappy.</p><p>We also added automated lab and field monitoring so regressions are caught early.</p>",
    author: 'Amelia Sparks',
    publishedAt: '2024-05-10T08:30:00.000Z',
    updatedAt: '2024-09-01T12:00:00.000Z',
    heroImage:
      'https://images.unsplash.com/photo-1529158062015-cad636e69505?auto=format&fit=crop&w=1200&q=80&sat=-25',
    tags: ['performance', 'core web vitals', 'accessibility'],
    readingTime: '5 min read'
  },
  {
    slug: 'structured-data-for-sign-language-resources',
    title: 'Structured Data for Sign Language Resources',
    excerpt:
      'Leverage JSON-LD structured data to help search engines understand sign language questions, answers, and learning pathways.',
    content:
      "<p>Search crawlers thrive on context. We map each signQA exchange to the QAPage and VideoObject schema types, giving engines the right signals to feature authoritative results. With JSON-LD we describe answer accuracy, freshness, and visual references so the right audiences find inclusive resources.</p><p>We also keep our schema generation resilient through validation tooling and monitoring.</p>",
    author: 'Dmitri Howard',
    publishedAt: '2024-04-02T09:15:00.000Z',
    updatedAt: '2024-07-20T15:45:00.000Z',
    heroImage:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80&sat=-50',
    tags: ['seo', 'structured data', 'json-ld'],
    readingTime: '6 min read'
  }
];

export function getAllPosts(): Post[] {
  return posts;
}

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((post) => post.slug === slug);
}
