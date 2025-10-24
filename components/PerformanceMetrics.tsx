'use client';

import { useEffect, useState } from 'react';
import type { MetricRating } from '@/types/performance';

interface MetricState {
  label: string;
  value: string;
  rating: MetricRating;
}

const formatMetric = (value: number) => `${Math.round(value)} ms`;

export default function PerformanceMetrics() {
  const [metrics, setMetrics] = useState<MetricState[]>([]);

  useEffect(() => {
    const entries: MetricState[] = [];

    async function measure() {
      const { onCLS, onINP, onLCP } = await import('web-vitals/attribution');

      onLCP((metric) => {
        entries.push({
          label: 'Largest Contentful Paint',
          value: formatMetric(metric.value),
          rating: metric.rating
        });
        setMetrics([...entries]);
      });

      onCLS((metric) => {
        entries.push({
          label: 'Cumulative Layout Shift',
          value: metric.value.toFixed(3),
          rating: metric.rating
        });
        setMetrics([...entries]);
      });

      onINP((metric) => {
        entries.push({
          label: 'Interaction to Next Paint',
          value: formatMetric(metric.value),
          rating: metric.rating
        });
        setMetrics([...entries]);
      });
    }

    measure().catch(() => {
      // graceful fallback if browser API not available
    });
  }, []);

  if (!metrics.length) {
    return null;
  }

  return (
    <section aria-live="polite" aria-label="Live Core Web Vitals readings" className="card" style={{ marginTop: '3rem' }}>
      <h2 className="section-title">Live Core Web Vitals</h2>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {metrics.map((metric) => (
          <li key={metric.label} style={{ marginBottom: '0.75rem' }}>
            <strong>{metric.label}:</strong> {metric.value} ({metric.rating})
          </li>
        ))}
      </ul>
    </section>
  );
}
