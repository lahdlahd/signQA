import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/metadata';
import { siteConfig } from '@/lib/siteConfig';

export const metadata: Metadata = buildMetadata({
  title: 'Privacy',
  description: 'Learn how signQA protects and governs customer data across our platform.',
  path: '/privacy'
});

export default function PrivacyPage() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p>
        We respect every conversation. All interactions are encrypted in transit and at rest, and we purge personally
        identifiable data within 30 days unless contracts require otherwise.
      </p>
      <p>
        For enterprise customers, we sign Data Processing Agreements (DPAs), support regional hosting, and undergo annual
        accessibility and security audits.
      </p>
      <p>
        Contact <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a> to request data exports or
        deletions.
      </p>
    </>
  );
}
