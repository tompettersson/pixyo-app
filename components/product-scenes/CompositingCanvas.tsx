'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useProductScenesStore } from '@/store/useProductScenesStore';

// Lazy load react-konva
let Stage: typeof import('react-konva').Stage | null = null;
let Layer: typeof import('react-konva').Layer | null = null;
let KonvaImage: typeof import('react-konva').Image | null = null;
let Rect: typeof import('react-konva').Rect | null = null;

if (typeof window !== 'undefined') {
  const konvaModule = require('react-konva');
  Stage = konvaModule.Stage;
  Layer = konvaModule.Layer;
  KonvaImage = konvaModule.Image;
  Rect = konvaModule.Rect;
}

interface CompositingCanvasProps {
  width: number;
  height: number;
  scale: number;
  onExport?: (dataUrl: string) => void;
}

export function CompositingCanvas({ width, height, scale, onExport }: CompositingCanvasProps) {
  const stageRef = useRef<any>(null);

  const compositing = useProductScenesStore((state) => state.compositing);
  const setProductTransform = useProductScenesStore((state) => state.setProductTransform);

  const [backgroundImg, setBackgroundImg] = useState<HTMLImageElement | null>(null);
  const [productImg, setProductImg] = useState<HTMLImageElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Load background image
  useEffect(() => {
    if (!compositing.generatedBackground) {
      setBackgroundImg(null);
      return;
    }

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = compositing.generatedBackground;
    img.onload = () => setBackgroundImg(img);
    img.onerror = () => setBackgroundImg(null);
  }, [compositing.generatedBackground]);

  // Load product image (with removed background)
  useEffect(() => {
    if (!compositing.productWithoutBg) {
      setProductImg(null);
      return;
    }

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = compositing.productWithoutBg;
    img.onload = () => setProductImg(img);
    img.onerror = () => setProductImg(null);
  }, [compositing.productWithoutBg]);

  // Calculate product dimensions and position
  const productDimensions = useMemo(() => {
    if (!productImg) return null;

    const { x, y, scale: productScale, rotation } = compositing.productTransform;

    // Calculate product size maintaining aspect ratio
    const aspectRatio = productImg.width / productImg.height;
    const maxDimension = Math.min(width, height) * productScale;

    let productWidth: number;
    let productHeight: number;

    if (aspectRatio > 1) {
      productWidth = maxDimension;
      productHeight = maxDimension / aspectRatio;
    } else {
      productHeight = maxDimension;
      productWidth = maxDimension * aspectRatio;
    }

    // Calculate position (x, y are relative 0-1)
    const posX = x * width - productWidth / 2;
    const posY = y * height - productHeight / 2;

    return {
      x: posX,
      y: posY,
      width: productWidth,
      height: productHeight,
      rotation,
      centerX: x * width,
      centerY: y * height,
    };
  }, [productImg, compositing.productTransform, width, height]);

  // Handle product drag
  const handleDragEnd = useCallback((e: any) => {
    const node = e.target;
    const newX = (node.x() + (productDimensions?.width || 0) / 2) / width;
    const newY = (node.y() + (productDimensions?.height || 0) / 2) / height;

    setProductTransform({
      x: Math.max(0, Math.min(1, newX)),
      y: Math.max(0, Math.min(1, newY)),
    });
    setIsDragging(false);
  }, [productDimensions, width, height, setProductTransform]);

  // Export canvas as image
  const handleExport = useCallback(() => {
    if (!stageRef.current || !onExport) return;

    const dataUrl = stageRef.current.toDataURL({
      pixelRatio: 2, // High resolution
      mimeType: 'image/png',
    });

    onExport(dataUrl);
  }, [onExport]);

  // Export at full resolution for harmonization
  const exportFullResolution = useCallback(() => {
    if (!stageRef.current) return null;

    // Export at native resolution (not scaled)
    // pixelRatio compensates for the canvas scale
    const pixelRatio = 1 / scale;
    return stageRef.current.toDataURL({
      pixelRatio: Math.max(pixelRatio, 2), // At least 2x, or more if scaled down
      mimeType: 'image/png',
    });
  }, [scale]);

  // Export layout image (product on neutral background) for position reference
  // This shows Google exactly where the product should be placed
  const exportLayoutImage = useCallback(() => {
    if (!stageRef.current || !productImg) return null;

    // Temporarily hide the background image to show neutral background
    const stage = stageRef.current;

    // Create a temporary canvas with neutral background + product
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return null;

    // Draw neutral studio background
    const gradient = ctx.createLinearGradient(width / 2, 0, width / 2, height);
    gradient.addColorStop(0, '#e8e8e8');
    gradient.addColorStop(0.6, '#d4d4d4');
    gradient.addColorStop(1, '#c0c0c0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw subtle floor shadow
    const floorGradient = ctx.createLinearGradient(width / 2, height * 0.85, width / 2, height);
    floorGradient.addColorStop(0, 'rgba(0,0,0,0)');
    floorGradient.addColorStop(1, 'rgba(0,0,0,0.05)');
    ctx.fillStyle = floorGradient;
    ctx.fillRect(0, height * 0.85, width, height * 0.15);

    // Draw product at current position
    if (productDimensions) {
      ctx.drawImage(
        productImg,
        productDimensions.x,
        productDimensions.y,
        productDimensions.width,
        productDimensions.height
      );
    }

    return tempCanvas.toDataURL('image/png');
  }, [width, height, productImg, productDimensions]);

  // Expose export functions globally
  useEffect(() => {
    if (stageRef.current) {
      (stageRef.current as any).exportImage = handleExport;
    }
    // Global function for harmonization
    (window as any).__exportCompositeFullRes = exportFullResolution;
    // Global function for layout image (product positioning)
    (window as any).__exportLayoutImage = exportLayoutImage;
    return () => {
      delete (window as any).__exportCompositeFullRes;
      delete (window as any).__exportLayoutImage;
    };
  }, [handleExport, exportFullResolution, exportLayoutImage]);

  if (!Stage || !Layer || !KonvaImage || !Rect) {
    return (
      <div
        className="flex items-center justify-center bg-zinc-900 rounded-xl"
        style={{ width: width * scale, height: height * scale }}
      >
        <p className="text-zinc-500 text-sm">Lade Canvas...</p>
      </div>
    );
  }

  const hasContent = backgroundImg || productImg;

  return (
    <div className="relative">
      <Stage
        ref={stageRef}
        width={width * scale}
        height={height * scale}
        scaleX={scale}
        scaleY={scale}
        className="rounded-xl overflow-hidden"
        style={{ background: '#1a1a1a' }}
      >
        {/* Background Layer */}
        <Layer>
          {backgroundImg ? (
            <KonvaImage
              image={backgroundImg}
              x={0}
              y={0}
              width={width}
              height={height}
            />
          ) : (
            /* Neutral studio background - helps user visualize placement */
            <>
              {/* Base gradient - light gray studio feel */}
              <Rect
                x={0}
                y={0}
                width={width}
                height={height}
                fillLinearGradientStartPoint={{ x: width / 2, y: 0 }}
                fillLinearGradientEndPoint={{ x: width / 2, y: height }}
                fillLinearGradientColorStops={[
                  0, '#e8e8e8',
                  0.6, '#d4d4d4',
                  1, '#c0c0c0'
                ]}
              />
              {/* Subtle floor line */}
              <Rect
                x={0}
                y={height * 0.85}
                width={width}
                height={height * 0.15}
                fillLinearGradientStartPoint={{ x: width / 2, y: 0 }}
                fillLinearGradientEndPoint={{ x: width / 2, y: height * 0.15 }}
                fillLinearGradientColorStops={[
                  0, 'rgba(0,0,0,0)',
                  1, 'rgba(0,0,0,0.05)'
                ]}
              />
            </>
          )}
        </Layer>

        {/* Shadow Layer */}
        {productImg && productDimensions && compositing.shadowIntensity > 0 && (
          <Layer>
            {/* Elliptical shadow under product */}
            <Rect
              x={productDimensions.x + productDimensions.width * 0.1}
              y={productDimensions.y + productDimensions.height - compositing.shadowOffsetY}
              width={productDimensions.width * 0.8}
              height={productDimensions.height * 0.15}
              fillRadialGradientStartPoint={{ x: productDimensions.width * 0.4, y: productDimensions.height * 0.075 }}
              fillRadialGradientEndPoint={{ x: productDimensions.width * 0.4, y: productDimensions.height * 0.075 }}
              fillRadialGradientStartRadius={0}
              fillRadialGradientEndRadius={productDimensions.width * 0.5}
              fillRadialGradientColorStops={[
                0, `rgba(0,0,0,${compositing.shadowIntensity})`,
                1, 'rgba(0,0,0,0)'
              ]}
              filters={[]}
              // Note: For better shadows, we'd use blur filter, but it's expensive
              // In production, consider pre-rendering the shadow
            />
          </Layer>
        )}

        {/* Product Layer - THE ORIGINAL, UNCHANGED */}
        {productImg && productDimensions && (
          <Layer>
            <KonvaImage
              image={productImg}
              x={productDimensions.x}
              y={productDimensions.y}
              width={productDimensions.width}
              height={productDimensions.height}
              rotation={productDimensions.rotation}
              offsetX={0}
              offsetY={0}
              draggable={true}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={handleDragEnd}
              // Visual feedback during drag
              opacity={isDragging ? 0.8 : 1}
              // Smooth scaling
              imageSmoothingEnabled={true}
            />
          </Layer>
        )}

        {/* Lighting Overlay Layer */}
        {compositing.lightingOverlay > 0 && (
          <Layer>
            <Rect
              x={0}
              y={0}
              width={width}
              height={height}
              fillLinearGradientStartPoint={{ x: width * 0.3, y: 0 }}
              fillLinearGradientEndPoint={{ x: width * 0.7, y: height }}
              fillLinearGradientColorStops={[
                0, `rgba(255,255,255,${compositing.lightingOverlay * 0.3})`,
                0.5, 'rgba(255,255,255,0)',
                1, `rgba(0,0,0,${compositing.lightingOverlay * 0.2})`
              ]}
              globalCompositeOperation="soft-light"
              listening={false}
            />
          </Layer>
        )}

        {/* Color Tint Layer (warm/cool adjustment) */}
        {compositing.colorTint !== 0 && (
          <Layer>
            <Rect
              x={0}
              y={0}
              width={width}
              height={height}
              fill={
                compositing.colorTint > 0
                  ? `rgba(255, 180, 100, ${Math.abs(compositing.colorTint) * 0.15})` // Warm (orange)
                  : `rgba(100, 150, 255, ${Math.abs(compositing.colorTint) * 0.15})` // Cool (blue)
              }
              globalCompositeOperation="overlay"
              listening={false}
            />
          </Layer>
        )}
      </Stage>

      {/* Instructions overlay */}
      {!hasContent && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-zinc-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <p className="text-sm text-zinc-500">
              Generiere einen Hintergrund und entferne<br />den Produkt-Hintergrund zum Compositing
            </p>
          </div>
        </div>
      )}

      {/* Drag hint */}
      {productImg && !isDragging && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-zinc-800/80 backdrop-blur rounded-full text-xs text-zinc-400">
          Produkt ziehen zum Positionieren
        </div>
      )}
    </div>
  );
}
