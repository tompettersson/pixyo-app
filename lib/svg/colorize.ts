/**
 * SVG Colorize Utility
 *
 * Generates colored variants of SVG logos:
 * - Original: Unchanged SVG content
 * - Dark: White version for dark backgrounds (#ffffff)
 * - Light: Black version for light backgrounds (#000000)
 */

export interface ColorizeResult {
  original: string; // Original SVG content
  dark: string; // White version (for dark backgrounds)
  light: string; // Black version (for light backgrounds)
}

/**
 * Values to preserve (not colorize)
 */
const PRESERVE_VALUES = ["none", "transparent", "inherit", "currentColor"];

/**
 * Check if a value should be preserved (not colorized)
 */
function shouldPreserve(value: string): boolean {
  const trimmed = value.trim().toLowerCase();
  // Preserve special values
  if (PRESERVE_VALUES.some((v) => trimmed === v.toLowerCase())) {
    return true;
  }
  // Preserve url() references (gradients, patterns, etc.)
  if (trimmed.startsWith("url(")) {
    return true;
  }
  // Preserve CSS variables (var(--color-name))
  if (trimmed.startsWith("var(")) {
    return true;
  }
  return false;
}

/**
 * Replace a color value with the target color, preserving alpha if present
 */
function replaceColor(value: string, targetColor: string): string {
  if (shouldPreserve(value)) {
    return value;
  }

  // Handle rgba with alpha
  const rgbaMatch = value.match(
    /rgba\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([\d.]+)\s*\)/i
  );
  if (rgbaMatch) {
    const alpha = rgbaMatch[1];
    if (targetColor === "#ffffff") {
      return `rgba(255, 255, 255, ${alpha})`;
    } else if (targetColor === "#000000") {
      return `rgba(0, 0, 0, ${alpha})`;
    }
  }

  // Handle hsla with alpha
  const hslaMatch = value.match(
    /hsla\s*\(\s*\d+\s*,\s*\d+%?\s*,\s*\d+%?\s*,\s*([\d.]+)\s*\)/i
  );
  if (hslaMatch) {
    const alpha = hslaMatch[1];
    if (targetColor === "#ffffff") {
      return `rgba(255, 255, 255, ${alpha})`;
    } else if (targetColor === "#000000") {
      return `rgba(0, 0, 0, ${alpha})`;
    }
  }

  return targetColor;
}

/**
 * Colorize inline attributes (fill="...", stroke="...")
 */
function colorizeInlineAttributes(svg: string, targetColor: string): string {
  let result = svg;

  // Replace fill attribute values
  result = result.replace(
    /(\bfill\s*=\s*["'])([^"']+)(["'])/gi,
    (match, prefix, value, suffix) => {
      if (shouldPreserve(value)) {
        return match;
      }
      return prefix + replaceColor(value, targetColor) + suffix;
    }
  );

  // Replace stroke attribute values
  result = result.replace(
    /(\bstroke\s*=\s*["'])([^"']+)(["'])/gi,
    (match, prefix, value, suffix) => {
      if (shouldPreserve(value)) {
        return match;
      }
      return prefix + replaceColor(value, targetColor) + suffix;
    }
  );

  // Replace stop-color attribute values (for gradients)
  result = result.replace(
    /(\bstop-color\s*=\s*["'])([^"']+)(["'])/gi,
    (match, prefix, value, suffix) => {
      if (shouldPreserve(value)) {
        return match;
      }
      return prefix + replaceColor(value, targetColor) + suffix;
    }
  );

  return result;
}

/**
 * Colorize CSS in <style> tags
 */
function colorizeCssStyles(svg: string, targetColor: string): string {
  // Match <style> tags and their content
  return svg.replace(
    /(<style[^>]*>)([\s\S]*?)(<\/style>)/gi,
    (match, openTag, cssContent, closeTag) => {
      let colorizedCss = cssContent;

      // Replace fill property values
      colorizedCss = colorizedCss.replace(
        /(\bfill\s*:\s*)([^;}\s]+)(\s*[;}])/gi,
        (cssMatch: string, prop: string, value: string, end: string) => {
          if (shouldPreserve(value)) {
            return cssMatch;
          }
          return prop + replaceColor(value, targetColor) + end;
        }
      );

      // Replace stroke property values
      colorizedCss = colorizedCss.replace(
        /(\bstroke\s*:\s*)([^;}\s]+)(\s*[;}])/gi,
        (cssMatch: string, prop: string, value: string, end: string) => {
          if (shouldPreserve(value)) {
            return cssMatch;
          }
          return prop + replaceColor(value, targetColor) + end;
        }
      );

      // Replace stop-color property values
      colorizedCss = colorizedCss.replace(
        /(\bstop-color\s*:\s*)([^;}\s]+)(\s*[;}])/gi,
        (cssMatch: string, prop: string, value: string, end: string) => {
          if (shouldPreserve(value)) {
            return cssMatch;
          }
          return prop + replaceColor(value, targetColor) + end;
        }
      );

      // Replace color property values (for text elements)
      colorizedCss = colorizedCss.replace(
        /(\bcolor\s*:\s*)([^;}\s]+)(\s*[;}])/gi,
        (cssMatch: string, prop: string, value: string, end: string) => {
          if (shouldPreserve(value)) {
            return cssMatch;
          }
          return prop + replaceColor(value, targetColor) + end;
        }
      );

      return openTag + colorizedCss + closeTag;
    }
  );
}

/**
 * Colorize inline style attributes (style="fill: ...; stroke: ...")
 */
function colorizeInlineStyles(svg: string, targetColor: string): string {
  return svg.replace(
    /(\bstyle\s*=\s*["'])([^"']+)(["'])/gi,
    (match, prefix, styleContent, suffix) => {
      let colorizedStyle = styleContent;

      // Replace fill property values
      colorizedStyle = colorizedStyle.replace(
        /(\bfill\s*:\s*)([^;]+)(;?)/gi,
        (styleMatch: string, prop: string, value: string, end: string) => {
          if (shouldPreserve(value.trim())) {
            return styleMatch;
          }
          return prop + replaceColor(value.trim(), targetColor) + end;
        }
      );

      // Replace stroke property values
      colorizedStyle = colorizedStyle.replace(
        /(\bstroke\s*:\s*)([^;]+)(;?)/gi,
        (styleMatch: string, prop: string, value: string, end: string) => {
          if (shouldPreserve(value.trim())) {
            return styleMatch;
          }
          return prop + replaceColor(value.trim(), targetColor) + end;
        }
      );

      // Replace stop-color property values
      colorizedStyle = colorizedStyle.replace(
        /(\bstop-color\s*:\s*)([^;]+)(;?)/gi,
        (styleMatch: string, prop: string, value: string, end: string) => {
          if (shouldPreserve(value.trim())) {
            return styleMatch;
          }
          return prop + replaceColor(value.trim(), targetColor) + end;
        }
      );

      // Replace color property values
      colorizedStyle = colorizedStyle.replace(
        /(\bcolor\s*:\s*)([^;]+)(;?)/gi,
        (styleMatch: string, prop: string, value: string, end: string) => {
          if (shouldPreserve(value.trim())) {
            return styleMatch;
          }
          return prop + replaceColor(value.trim(), targetColor) + end;
        }
      );

      return prefix + colorizedStyle + suffix;
    }
  );
}

/**
 * Apply all colorization transformations to an SVG
 */
function applySvgColorization(svg: string, targetColor: string): string {
  let result = svg;
  result = colorizeInlineAttributes(result, targetColor);
  result = colorizeCssStyles(result, targetColor);
  result = colorizeInlineStyles(result, targetColor);
  return result;
}

/**
 * Colorize an SVG into three variants: original, dark (white), and light (black)
 *
 * @param svgContent - The original SVG content as a string
 * @returns ColorizeResult with original, dark, and light SVG variants
 */
export function colorizeSvg(svgContent: string): ColorizeResult {
  return {
    original: svgContent,
    dark: applySvgColorization(svgContent, "#ffffff"),
    light: applySvgColorization(svgContent, "#000000"),
  };
}

/**
 * Sanitize SVG content by removing potentially dangerous elements and attributes
 *
 * Security considerations:
 * - Remove all script execution vectors
 * - Remove external resource loading
 * - Remove HTML embedding elements
 * - Preserve safe SVG structure for rendering
 *
 * @param svgContent - The SVG content to sanitize
 * @returns Sanitized SVG content
 */
export function sanitizeSvg(svgContent: string): string {
  let result = svgContent;

  // Remove <script> tags and their content (including self-closing)
  result = result.replace(/<script[\s\S]*?<\/script>/gi, "");
  result = result.replace(/<script[^>]*\/>/gi, "");

  // Remove event handler attributes (onclick, onload, onerror, onmouseover, etc.)
  // Match both quoted and unquoted attribute values
  result = result.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, "");
  result = result.replace(/\s+on\w+\s*=\s*[^\s>"']+/gi, "");

  // Remove javascript: and vbscript: URLs (in any attribute)
  result = result.replace(/javascript\s*:/gi, "blocked:");
  result = result.replace(/vbscript\s*:/gi, "blocked:");

  // Remove data: URLs that could contain executable content (keep image data URLs)
  result = result.replace(
    /href\s*=\s*["']data:(?!image\/)[^"']*["']/gi,
    'href=""'
  );
  result = result.replace(
    /xlink:href\s*=\s*["']data:(?!image\/)[^"']*["']/gi,
    'xlink:href=""'
  );

  // Remove <foreignObject> elements (can contain arbitrary HTML/XHTML)
  result = result.replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, "");
  result = result.replace(/<foreignObject[^>]*\/>/gi, "");

  // Remove <iframe> and <embed> elements
  result = result.replace(/<iframe[\s\S]*?<\/iframe>/gi, "");
  result = result.replace(/<iframe[^>]*\/>/gi, "");
  result = result.replace(/<embed[^>]*\/?>/gi, "");
  result = result.replace(/<object[\s\S]*?<\/object>/gi, "");
  result = result.replace(/<object[^>]*\/>/gi, "");

  // Remove <use> elements with external references (SSRF/data exfiltration risk)
  result = result.replace(/<use[^>]*(?:href|xlink:href)\s*=\s*["']https?:\/\/[^"']*["'][^>]*\/?>/gi, "");

  // Remove <image> elements with external references
  result = result.replace(/<image[^>]*(?:href|xlink:href)\s*=\s*["']https?:\/\/[^"']*["'][^>]*\/?>/gi, "");

  // Remove <a> elements with external links (but keep internal references)
  result = result.replace(/<a[^>]*(?:href|xlink:href)\s*=\s*["']https?:\/\/[^"']*["'][^>]*>/gi, "<g>");
  result = result.replace(/<\/a>/gi, "</g>");

  // Remove animate/set elements that could modify href attributes
  result = result.replace(/<(?:animate|set)[^>]*attributeName\s*=\s*["'](?:href|xlink:href)["'][^>]*\/?>/gi, "");

  // Remove CDATA sections (could hide malicious content)
  result = result.replace(/<!\[CDATA\[[\s\S]*?\]\]>/gi, "");

  return result;
}

/**
 * Validate that the content is a valid SVG
 *
 * @param content - The content to validate
 * @returns true if valid SVG, false otherwise
 */
export function isValidSvg(content: string): boolean {
  // Must contain an <svg> opening tag
  if (!/<svg[\s>]/i.test(content)) {
    return false;
  }

  // Must contain a closing </svg> tag
  if (!/<\/svg>/i.test(content)) {
    return false;
  }

  // Check for basic XML structure
  const svgMatch = content.match(/<svg[^>]*>/i);
  if (!svgMatch) {
    return false;
  }

  return true;
}
