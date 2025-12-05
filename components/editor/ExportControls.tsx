'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import { toast } from 'sonner';

export function ExportControls() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Access export function from window (set by CanvasStage)
      const exportCanvas = (window as unknown as { exportCanvas?: () => Promise<Blob | null> }).exportCanvas;
      
      if (!exportCanvas) {
        throw new Error('Export function not available');
      }

      const blob = await exportCanvas();
      if (!blob) {
        throw new Error('Failed to export canvas');
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pixyo-export-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Image exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export image');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-4 border-t border-zinc-800">
      <Button
        variant="primary"
        className="w-full"
        onClick={handleExport}
        isLoading={isExporting}
      >
        📥 Export PNG
      </Button>
    </div>
  );
}



