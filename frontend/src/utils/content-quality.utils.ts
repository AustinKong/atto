import type { ContentQualityCategory, ContentQualitySection } from '@/types/application.types';

export const CONTENT_QUALITY_THRESHOLDS = {
  highSignal: 0.8,
  lowSignal: 0.5,
  neutral: 0.3,
  lowNoise: 0.1,
} as const;

export function getContentQualityCategory(score: number): ContentQualityCategory {
  if (score >= CONTENT_QUALITY_THRESHOLDS.highSignal) return 'highSignal';
  if (score >= CONTENT_QUALITY_THRESHOLDS.lowSignal) return 'lowSignal';
  if (score >= CONTENT_QUALITY_THRESHOLDS.neutral) return 'neutral';
  if (score >= CONTENT_QUALITY_THRESHOLDS.lowNoise) return 'lowNoise';
  return 'highNoise';
}

export type ContentQualityCounts = {
  highSignal: number;
  lowSignal: number;
  neutral: number;
  lowNoise: number;
  highNoise: number;
};

export type ContentQualityDatum = {
  section: string;
  highSignal: number;
  lowSignal: number;
  neutral: number;
  lowNoise: number;
  highNoise: number;
};

export function countContentQualityCategories(section: ContentQualitySection): ContentQualityCounts {
  const counts: ContentQualityCounts = {
    highSignal: 0,
    lowSignal: 0,
    neutral: 0,
    lowNoise: 0,
    highNoise: 0,
  };

  for (const scoreRow of section.scores) {
    counts[getContentQualityCategory(scoreRow.score)] += 1;
  }

  return counts;
}

export function labelForContentQualityKey(key: string): string {
  if (key === 'highSignal') return 'High signal';
  if (key === 'neutral') return 'Neutral';
  if (key === 'lowSignal') return 'Low signal';
  if (key === 'lowNoise') return 'Low noise';
  return 'High noise';
}

export function colorForContentQualityKey(key: string): string {
  if (key === 'highSignal') {
    return '#2f855a';
  }
  if (key === 'neutral') {
    return '#a0aec0';
  }
  if (key === 'lowSignal') {
    return '#68d391';
  }
  if (key === 'lowNoise') {
    return '#c53030';
  }
  return '#9b2c2c';
}

export function getContentQualityMaxMagnitude(data: ContentQualityDatum[]): number {
  let maxMagnitude = 1;
  for (const row of data) {
    const positiveMagnitude = row.highSignal + row.lowSignal + row.neutral;
    const negativeMagnitude = Math.abs(row.lowNoise + row.highNoise);
    maxMagnitude = Math.max(maxMagnitude, positiveMagnitude, negativeMagnitude);
  }
  return maxMagnitude;
}
