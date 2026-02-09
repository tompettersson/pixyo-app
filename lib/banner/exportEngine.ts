import type { BannerFormat } from './formats';

/**
 * Render a hidden DOM element to a canvas via html2canvas and return a blob.
 * The element should be the full-size banner rendered at actual dimensions.
 */
export async function renderBannerToBlob(
  containerId: string,
  scale: number = 2
): Promise<Blob | null> {
  const { default: html2canvas } = await import('html2canvas');
  const el = document.getElementById(containerId);
  if (!el) return null;

  const canvas = await html2canvas(el, {
    scale,
    useCORS: true,
    backgroundColor: null,
    logging: false,
  });

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob),
      'image/jpeg',
      0.92
    );
  });
}

/**
 * Download a single blob as a file.
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export a single banner from a rendered DOM container.
 */
export async function exportSingleBanner(
  containerId: string,
  banner: BannerFormat
): Promise<void> {
  const blob = await renderBannerToBlob(containerId);
  if (!blob) {
    console.error(`Failed to render banner ${banner.id}`);
    return;
  }
  const filename = `${banner.id}_${banner.name.replace(/\s+/g, '-').toLowerCase()}_${banner.width}x${banner.height}.jpg`;
  downloadBlob(blob, filename);
}

/**
 * Export all banners as a ZIP file.
 * @param renderFn - Function that renders each banner and returns a Blob
 * @param banners - Array of banner formats to export
 * @param onProgress - Progress callback (0-1)
 */
export async function exportAllBannersAsZip(
  renderFn: (banner: BannerFormat) => Promise<Blob | null>,
  banners: BannerFormat[],
  onProgress?: (progress: number) => void
): Promise<void> {
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();

  for (let i = 0; i < banners.length; i++) {
    const banner = banners[i];
    const blob = await renderFn(banner);
    if (blob) {
      const filename = `${banner.id}_${banner.name.replace(/\s+/g, '-').toLowerCase()}_${banner.width}x${banner.height}.jpg`;
      zip.file(filename, blob);
    }
    onProgress?.((i + 1) / banners.length);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(zipBlob, 'banner-set.zip');
}
