import { useSyncExternalStore } from 'react';
import { useWindowDimensions, type ScaledSize } from 'react-native';

export const STATIC_WEB_DIMENSIONS: ScaledSize = {
  width: 390,
  height: 844,
  scale: 1,
  fontScale: 1,
};

export function hydrationSafeDimensions(dimensions: ScaledSize, hydrated: boolean) {
  return hydrated ? dimensions : STATIC_WEB_DIMENSIONS;
}

export function useIsHydrated() {
  return useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
}

/** Keeps static HTML and the first browser render identical, then becomes responsive. */
export function useHydratedWindowDimensions() {
  const dimensions = useWindowDimensions();
  const hydrated = useIsHydrated();
  return hydrationSafeDimensions(dimensions, hydrated);
}
