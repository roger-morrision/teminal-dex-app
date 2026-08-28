import fs from 'fs';
import path from 'path';
import { hydrationSafeDimensions, STATIC_WEB_DIMENSIONS } from '@/lib/use-hydrated-window-dimensions';

describe('static web hydration boundary', () => {
  it('uses one deterministic first-render viewport and adopts the real viewport afterward', () => {
    const actual = { width: 1024, height: 768, scale: 2, fontScale: 1.5 };
    expect(hydrationSafeDimensions(actual, false)).toBe(STATIC_WEB_DIMENSIONS);
    expect(hydrationSafeDimensions(actual, true)).toBe(actual);
  });

  it('keeps responsive Whales and chart surfaces behind the hydration-safe hook', () => {
    const whales = fs.readFileSync(path.join(process.cwd(), 'app/(tabs)/whales.tsx'), 'utf8');
    const chart = fs.readFileSync(path.join(process.cwd(), 'src/components/PriceChart.tsx'), 'utf8');
    expect(whales).toContain('useHydratedWindowDimensions()');
    expect(chart).toContain('useHydratedWindowDimensions()');
    expect(whales).not.toContain('useWindowDimensions } from "react-native"');
    expect(chart).not.toContain("useWindowDimensions } from 'react-native'");
  });
});
