import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import { buildMetadata } from '@/lib/metadata';
import { siteConfig } from '@/lib/siteConfig';

export const metadata: Metadata = buildMetadata({
  title: 'About',
  description:
    'Meet the team behind signQA and learn how we combine linguistics, accessibility research, and AI to deliver trusted answers.',
  path: '/about'
});

const aboutJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: `${siteConfig.name} About`,
  description:
    'The signQA team brings together interpreters, researchers, and engineers to make sign language support instant for everyone.',
  url: `${siteConfig.url}/about`
};

export default function AboutPage() {
  return (
    <>
      <JsonLd data={aboutJsonLd} />
      <h1>About {siteConfig.name}</h1>
      <p>
        signQA is built by accessibility advocates who believe inclusive conversations should never have to wait. Our
        linguists, interpreters, and engineers train AI models with real-world feedback from Deaf and hard-of-hearing
        communities to keep answers accurate, respectful, and up to date.
      </p>
      <p>
        We maintain rigorous quality benchmarks, publish transparent release notes, and partner with organizations who
        share our commitment to accessibility-first design.
      </p>
      <h2 className="section-title">Our principles</h2>
      <ul>
        <li>Accessibility is non-negotiable: WCAG 2.2 AA compliance guides each release.</li>
        <li>Quality is measurable: we run automated and human evaluations on every response.</li>
        <li>Privacy is protected: conversations are encrypted, and customer data is never sold.</li>
      </ul>
    </>
  );
}
