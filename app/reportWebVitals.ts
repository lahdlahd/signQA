import type { NextWebVitalsMetric } from 'next/app';

const analyticsEndpoint = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT ?? '/api/web-vitals';

export function reportWebVitals(metric: NextWebVitalsMetric) {
  if (typeof window === 'undefined') {
    return;
  }

  if (typeof window.plausible === 'function') {
    window.plausible(metric.name, {
      props: {
        id: metric.id,
        value: metric.value,
        label: metric.label
      }
    });
  }

  // send to custom endpoint when available
  if (analyticsEndpoint) {
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      id: metric.id,
      label: metric.label
    });

    const url = analyticsEndpoint.startsWith('http')
      ? analyticsEndpoint
      : `${window.location.origin}${analyticsEndpoint}`;

    if (!navigator.sendBeacon || !navigator.sendBeacon(url, body)) {
      fetch(url, {
        method: 'POST',
        body,
        keepalive: true,
        headers: {
          'Content-Type': 'application/json'
        }
      }).catch(() => {
        // ignore network errors in vitals reporting
      });
    }
  }
}

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, unknown> }) => void;
  }
}
