'use client';

import Script from 'next/script';
import { siteConfig } from '@/lib/siteConfig';

const plausibleEndpoint = 'https://plausible.io/js/script.js';

export default function Analytics() {
  if (!siteConfig.plausibleDomain) {
    return null;
  }

  return (
    <>
      <Script
        defer
        data-domain={siteConfig.plausibleDomain}
        src={plausibleEndpoint}
        strategy="afterInteractive"
      />
      <Script id="plausible-init" strategy="afterInteractive">
        {`window.plausible = window.plausible || function(){(window.plausible.q=window.plausible.q||[]).push(arguments)}`}
      </Script>
    </>
  );
}
