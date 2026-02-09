/**
 * Content reducer – deterministic decision tree for content level selection.
 *
 * Tries each content level top-down until the layout fits the target dimensions.
 * No AI, no heuristics – pure math.
 */

import type { ContentLevel, DesignSnapshot, FormatTarget } from './types';
import { computeLayout } from './layoutEngine';

interface ReductionResult {
  contentLevel: ContentLevel;
  warnings: string[];
}

/**
 * Determine the best content level for a given format target.
 *
 * Decision tree:
 * 1. FULL → fits? → use it
 * 2. REDUCED_NO_CTA → fits? → use it (warning: CTA removed)
 * 3. HEADLINE_ONLY → fits? → use it (warning: only headline + logo)
 * 4. target >= 300×300? → IMAGE_ONLY_LOGO (warning: image + logo only)
 * 5. else → SKIP
 */
export function determineContentLevel(
  target: FormatTarget,
  snapshot: DesignSnapshot,
): ReductionResult {
  const warnings: string[] = [];

  // 1. Try FULL
  const fullLayout = computeLayout(target.width, target.height, 'FULL', snapshot);
  if (fullLayout.fitsVertically) {
    return { contentLevel: 'FULL', warnings };
  }

  // 2. Try REDUCED_NO_CTA
  const reducedLayout = computeLayout(target.width, target.height, 'REDUCED_NO_CTA', snapshot);
  if (reducedLayout.fitsVertically) {
    warnings.push('CTA-Button entfernt: zu wenig Höhe');
    return { contentLevel: 'REDUCED_NO_CTA', warnings };
  }

  // 3. Try HEADLINE_ONLY
  const headlineLayout = computeLayout(target.width, target.height, 'HEADLINE_ONLY', snapshot);
  if (headlineLayout.fitsVertically) {
    warnings.push('Nur Headline + Logo: Text passt nicht komplett');
    return { contentLevel: 'HEADLINE_ONLY', warnings };
  }

  // 4. IMAGE_ONLY_LOGO if canvas is big enough
  if (target.width >= 300 && target.height >= 300) {
    warnings.push('Nur Bild + Logo: kein Text passt in dieses Format');
    return { contentLevel: 'IMAGE_ONLY_LOGO', warnings };
  }

  // 5. SKIP
  warnings.push('Format übersprungen: zu klein für jede Darstellung');
  return { contentLevel: 'SKIP', warnings };
}

/**
 * Run content reduction for all format targets.
 * Mutates the targets' contentLevel in place and returns warnings per target.
 */
export function reduceAllTargets(
  targets: FormatTarget[],
  snapshot: DesignSnapshot,
): Map<string, string[]> {
  const warningsMap = new Map<string, string[]>();

  for (const target of targets) {
    const result = determineContentLevel(target, snapshot);
    target.contentLevel = result.contentLevel;
    warningsMap.set(target.ratioId, result.warnings);
  }

  return warningsMap;
}
