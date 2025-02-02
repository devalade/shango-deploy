import { type KamalConfig } from './types.ts';
import deepmerge from 'deepmerge';

export function mergeConfigurations(
  existing: KamalConfig,
  updated: Partial<KamalConfig>
): KamalConfig {
  // Custom merge arrays function to handle server lists
  const mergeArrays = (target: any[], source: any[]) => {
    return [...new Set([...target, ...source])];
  };

  return deepmerge(existing, updated, {
    arrayMerge: mergeArrays
  });
}
