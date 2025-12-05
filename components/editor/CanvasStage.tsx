'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import type { TextLayer, LogoLayer, BackgroundLayer } from '@/types/layers';

// Lazy load react-konva only on client
let Stage: typeof import('react-konva').Stage | null = null;
let KonvaLayer: typeof import('react-konva').Layer | null = null;
let Rect: typeof import('react-konva').Rect | null = null;
let Text: typeof import('react-konva').Text | null = null;
let Image: typeof import('react-konva').Image | null = null;
let Transformer: typeof import('react-konva').Transformer | null = null;
let Group: typeof import('react-konva').Group | null = null;

if (typeof window !== 'undefined') {
  const konvaModule = require('react-konva');
  Stage = konvaModule.Stage;
  KonvaLayer = konvaModule.Layer;
  Rect = konvaModule.Rect;
  Text = konvaModule.Text;
  Image = konvaModule.Image;
  Transformer = konvaModule.Transformer;
  Group = konvaModule.Group;
}

// Hook to load image
function useImage(src: string | undefined): HTMLImageElement | null {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!src) {
      setImage(null);
      return;
    }

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setImage(img);
    img.onerror = () => setImage(null);
    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return image;
}

// Background layer component
function BackgroundLayerComponent({ layer }: { layer: BackgroundLayer }) {
  const image = useImage(layer.src);
  
  if (!image || !Image) return null;
  
  return (
    <Image
      image={image}
      x={layer.x}
      y={layer.y}
      width={layer.width}
      height={layer.height}
      scaleX={layer.scaleX}
      scaleY={layer.scaleY}
      opacity={layer.opacity}
    />
  );
}

// Text layer component
function TextLayerComponent({ 
  layer, 
  isSelected,
  onSelect,
  onDragEnd,
  onTransformEnd,
}: { 
  layer: TextLayer;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
  onTransformEnd: (updates: Partial<TextLayer>) => void;
}) {
  const textRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected && trRef.current && textRef.current) {
      trRef.current.nodes([textRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  if (!layer.visible || !Text || !Transformer) return null;

  return (
    <>
      <Text
        ref={textRef}
        text={layer.text}
        x={layer.x}
        y={layer.y}
        fontFamily={layer.fontFamily}
        fontSize={layer.fontSize}
        fontStyle={layer.fontWeight}
        fill={layer.fill}
        align={layer.align}
        opacity={layer.opacity}
        rotation={layer.rotation}
        draggable={!layer.locked}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e: any) => {
          onDragEnd(e.target.x(), e.target.y());
        }}
        onTransformEnd={() => {
          const node = textRef.current;
          if (!node) return;
          
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          
          // Reset scale and update font size
          node.scaleX(1);
          node.scaleY(1);
          
          onTransformEnd({
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            fontSize: Math.round(layer.fontSize * Math.max(scaleX, scaleY)),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox: any, newBox: any) => {
            if (newBox.width < 20 || newBox.height < 20) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
}

// Logo layer component
function LogoLayerComponent({ 
  layer, 
  isSelected,
  onSelect,
  onDragEnd,
  onTransformEnd,
}: { 
  layer: LogoLayer;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
  onTransformEnd: (updates: Partial<LogoLayer>) => void;
}) {
  const imageRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const image = useImage(layer.src);

  useEffect(() => {
    if (isSelected && trRef.current && imageRef.current) {
      trRef.current.nodes([imageRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  if (!image || !layer.visible || !Group || !Image || !Rect || !Transformer) return null;

  // Calculate background dimensions
  const bgPadding = layer.backgroundPadding;
  const bgWidth = layer.width * layer.scaleX + bgPadding * 2;
  const bgHeight = layer.height * layer.scaleY + bgPadding * 2;

  return (
    <Group
      x={layer.x}
      y={layer.y}
      draggable={!layer.locked}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e: any) => {
        onDragEnd(e.target.x(), e.target.y());
      }}
    >
      {/* Background shape */}
      {layer.backgroundShape !== 'none' && (
        <Rect
          x={-bgPadding}
          y={-bgPadding}
          width={bgWidth}
          height={bgHeight}
          fill={layer.backgroundColor || '#000000'}
          cornerRadius={
            layer.backgroundShape === 'pill' ? bgHeight / 2 :
            layer.backgroundShape === 'circle' ? Math.max(bgWidth, bgHeight) / 2 :
            layer.backgroundShape === 'rect' ? 8 : 0
          }
          opacity={layer.opacity}
        />
      )}
      <Image
        ref={imageRef}
        image={image}
        width={layer.width}
        height={layer.height}
        scaleX={layer.scaleX}
        scaleY={layer.scaleY}
        opacity={layer.opacity}
        rotation={layer.rotation}
        onTransformEnd={() => {
          const node = imageRef.current;
          if (!node) return;
          
          onTransformEnd({
            scaleX: node.scaleX(),
            scaleY: node.scaleY(),
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox: any, newBox: any) => {
            if (newBox.width < 20 || newBox.height < 20) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </Group>
  );
}

export function CanvasStage() {
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  const [isClient, setIsClient] = useState(false);

  const {
    canvas,
    layers,
    selectedLayerId,
    overlayOpacity,
    selectLayer,
    updateLayer,
    setBackgroundImage,
  } = useEditorStore();

  // Ensure we're on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Calculate scale to fit canvas in container
  const updateStageSize = useCallback(() => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth - 48; // padding
    const containerHeight = containerRef.current.clientHeight - 48;

    const scaleX = containerWidth / canvas.width;
    const scaleY = containerHeight / canvas.height;
    const newScale = Math.min(scaleX, scaleY, 1);

    setScale(newScale);
    setStageSize({
      width: canvas.width * newScale,
      height: canvas.height * newScale,
    });
  }, [canvas.width, canvas.height]);

  useEffect(() => {
    updateStageSize();
    window.addEventListener('resize', updateStageSize);
    return () => window.removeEventListener('resize', updateStageSize);
  }, [updateStageSize]);

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result as string;
        const img = new window.Image();
        img.onload = () => {
          setBackgroundImage(src, img.width, img.height);
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
    }
  }, [setBackgroundImage]);

  // Handle click on empty area
  const handleStageClick = (e: any) => {
    if (e.target === e.target.getStage()) {
      selectLayer(null);
    }
  };

  // Export function - exposed via ref
  const exportCanvas = useCallback(async (): Promise<Blob | null> => {
    if (!stageRef.current) return null;

    // Deselect all to hide transformer
    selectLayer(null);

    // Wait a tick for React to update
    await new Promise((r) => setTimeout(r, 50));

    return new Promise((resolve) => {
      stageRef.current?.toBlob({
        pixelRatio: 2,
        mimeType: 'image/png',
        callback: (blob: Blob | null) => resolve(blob),
      });
    });
  }, [selectLayer]);

  // Store export function in window for access from ExportControls
  useEffect(() => {
    (window as unknown as { exportCanvas: typeof exportCanvas }).exportCanvas = exportCanvas;
  }, [exportCanvas]);

  // Show placeholder on server or before client hydration
  if (!isClient || !Stage || !KonvaLayer || !Rect) {
    return (
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center p-6 bg-zinc-950"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="text-center text-zinc-500">
          <p className="text-lg mb-2">Loading canvas...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 flex items-center justify-center p-6 bg-zinc-950"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <div
        className="relative shadow-2xl"
        style={{
          width: stageSize.width,
          height: stageSize.height,
        }}
      >
        <Stage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          scaleX={scale}
          scaleY={scale}
          onClick={handleStageClick}
          onTap={handleStageClick}
        >
          <KonvaLayer>
            {/* Canvas background */}
            <Rect
              x={0}
              y={0}
              width={canvas.width}
              height={canvas.height}
              fill={canvas.backgroundColor}
            />

            {/* Background image layer */}
            {layers.filter((l) => l.type === 'background').map((layer) => (
              <BackgroundLayerComponent
                key={layer.id}
                layer={layer as BackgroundLayer}
              />
            ))}

            {/* Darkening overlay */}
            {overlayOpacity > 0 && (
              <Rect
                x={0}
                y={0}
                width={canvas.width}
                height={canvas.height}
                fill="#000000"
                opacity={overlayOpacity / 100}
                listening={false}
              />
            )}

            {/* Other layers */}
            {layers.filter((l) => l.type !== 'background').map((layer) => {
              if (layer.type === 'text') {
                return (
                  <TextLayerComponent
                    key={layer.id}
                    layer={layer as TextLayer}
                    isSelected={selectedLayerId === layer.id}
                    onSelect={() => selectLayer(layer.id)}
                    onDragEnd={(x, y) => updateLayer(layer.id, { x, y })}
                    onTransformEnd={(updates) => updateLayer(layer.id, updates)}
                  />
                );
              }
              if (layer.type === 'logo') {
                return (
                  <LogoLayerComponent
                    key={layer.id}
                    layer={layer as LogoLayer}
                    isSelected={selectedLayerId === layer.id}
                    onSelect={() => selectLayer(layer.id)}
                    onDragEnd={(x, y) => updateLayer(layer.id, { x, y })}
                    onTransformEnd={(updates) => updateLayer(layer.id, updates)}
                  />
                );
              }
              return null;
            })}
          </KonvaLayer>
        </Stage>

        {/* Drop zone indicator */}
        {layers.filter((l) => l.type === 'background').length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-zinc-500">
              <p className="text-lg mb-2">📷 Drop an image here</p>
              <p className="text-sm">or generate one with AI</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
