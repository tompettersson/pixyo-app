'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Rect, Group, Text, Line, Circle, Wedge, Arrow } from 'react-konva';
import { useFloorPlanStore } from '@/store/useFloorPlanStore';
import { FloorPlanElement, CameraPosition } from '@/types/floorplan';
import Konva from 'konva';

const CANVAS_PADDING = 40;
const GRID_SIZE_METERS = 0.5; // 50cm grid

interface FloorPlanCanvasProps {
  width: number;
  height: number;
}

export function FloorPlanCanvas({ width, height }: FloorPlanCanvasProps) {
  const stageRef = useRef<Konva.Stage>(null);

  const roomWidth = useFloorPlanStore((s) => s.roomWidth);
  const roomHeight = useFloorPlanStore((s) => s.roomHeight);
  const elements = useFloorPlanStore((s) => s.elements);
  const selectedElementId = useFloorPlanStore((s) => s.selectedElementId);
  const gridEnabled = useFloorPlanStore((s) => s.gridEnabled);
  const showLabels = useFloorPlanStore((s) => s.showLabels);
  const camera = useFloorPlanStore((s) => s.camera);

  const selectElement = useFloorPlanStore((s) => s.selectElement);
  const updateElement = useFloorPlanStore((s) => s.updateElement);
  const removeElement = useFloorPlanStore((s) => s.removeElement);
  const updateCamera = useFloorPlanStore((s) => s.updateCamera);
  const rotateCamera = useFloorPlanStore((s) => s.rotateCamera);

  // Export canvas as image (for AI integration)
  // Using pixelRatio 1 to keep file size reasonable for API
  useEffect(() => {
    (window as any).__exportFloorPlanImage = () => {
      if (!stageRef.current) return null;
      // Deselect element before export for clean image
      selectElement(null);
      // Small delay to let deselection render
      return new Promise<string>((resolve) => {
        setTimeout(() => {
          // Export as JPEG with quality 0.8 to reduce size
          const dataUrl = stageRef.current?.toDataURL({
            pixelRatio: 1,
            mimeType: 'image/jpeg',
            quality: 0.8,
          });
          resolve(dataUrl || '');
        }, 50);
      });
    };
    return () => {
      delete (window as any).__exportFloorPlanImage;
    };
  }, [selectElement]);

  // Calculate scale to fit room in canvas
  const availableWidth = width - CANVAS_PADDING * 2;
  const availableHeight = height - CANVAS_PADDING * 2;
  const scale = Math.min(availableWidth / roomWidth, availableHeight / roomHeight);

  const roomPixelWidth = roomWidth * scale;
  const roomPixelHeight = roomHeight * scale;
  const offsetX = (width - roomPixelWidth) / 2;
  const offsetY = (height - roomPixelHeight) / 2;

  // Convert meters to pixels
  const metersToPixels = useCallback((meters: number) => meters * scale, [scale]);

  // Convert normalized position (0-1) to pixel position
  const normalizedToPixel = useCallback(
    (normalized: number, dimension: 'x' | 'y') => {
      const roomDimension = dimension === 'x' ? roomPixelWidth : roomPixelHeight;
      const offset = dimension === 'x' ? offsetX : offsetY;
      return normalized * roomDimension + offset;
    },
    [roomPixelWidth, roomPixelHeight, offsetX, offsetY]
  );

  // Convert pixel position to normalized (0-1)
  const pixelToNormalized = useCallback(
    (pixel: number, dimension: 'x' | 'y') => {
      const roomDimension = dimension === 'x' ? roomPixelWidth : roomPixelHeight;
      const offset = dimension === 'x' ? offsetX : offsetY;
      return Math.max(0, Math.min(1, (pixel - offset) / roomDimension));
    },
    [roomPixelWidth, roomPixelHeight, offsetX, offsetY]
  );

  // Grid lines
  const gridLines: React.ReactNode[] = [];
  if (gridEnabled) {
    const gridSizePixels = metersToPixels(GRID_SIZE_METERS);

    // Vertical lines
    for (let x = 0; x <= roomWidth; x += GRID_SIZE_METERS) {
      const pixelX = offsetX + x * scale;
      gridLines.push(
        <Line
          key={`v-${x}`}
          points={[pixelX, offsetY, pixelX, offsetY + roomPixelHeight]}
          stroke="#3f3f46"
          strokeWidth={x % 1 === 0 ? 1 : 0.5}
          opacity={0.5}
        />
      );
    }

    // Horizontal lines
    for (let y = 0; y <= roomHeight; y += GRID_SIZE_METERS) {
      const pixelY = offsetY + y * scale;
      gridLines.push(
        <Line
          key={`h-${y}`}
          points={[offsetX, pixelY, offsetX + roomPixelWidth, pixelY]}
          stroke="#3f3f46"
          strokeWidth={y % 1 === 0 ? 1 : 0.5}
          opacity={0.5}
        />
      );
    }
  }

  // Handle stage click to deselect
  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) {
      selectElement(null);
    }
  };

  // Handle keyboard delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementId) {
        // Don't delete if user is typing in an input
        if ((e.target as HTMLElement)?.tagName?.toLowerCase() === 'input') return;
        if ((e.target as HTMLElement)?.tagName?.toLowerCase() === 'textarea') return;

        removeElement(selectedElementId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, removeElement]);

  return (
    <Stage
      ref={stageRef}
      width={width}
      height={height}
      onClick={handleStageClick}
      style={{ backgroundColor: '#18181b' }}
    >
      <Layer>
        {/* Room background */}
        <Rect
          x={offsetX}
          y={offsetY}
          width={roomPixelWidth}
          height={roomPixelHeight}
          fill="#27272a"
          stroke="#52525b"
          strokeWidth={2}
        />

        {/* Grid */}
        {gridLines}

        {/* Room dimensions labels */}
        <Text
          x={offsetX + roomPixelWidth / 2}
          y={offsetY - 20}
          text={`${roomWidth}m`}
          fontSize={12}
          fill="#71717a"
          align="center"
          offsetX={15}
        />
        <Text
          x={offsetX - 25}
          y={offsetY + roomPixelHeight / 2}
          text={`${roomHeight}m`}
          fontSize={12}
          fill="#71717a"
          rotation={-90}
          offsetY={10}
        />

        {/* Elements */}
        {elements.map((element) => (
          <FloorPlanElementComponent
            key={element.id}
            element={element}
            isSelected={element.id === selectedElementId}
            metersToPixels={metersToPixels}
            normalizedToPixel={normalizedToPixel}
            pixelToNormalized={pixelToNormalized}
            showLabels={showLabels}
            onSelect={() => selectElement(element.id)}
            onUpdate={(updates) => updateElement(element.id, updates)}
          />
        ))}

        {/* Camera */}
        {camera && (
          <CameraComponent
            camera={camera}
            normalizedToPixel={normalizedToPixel}
            pixelToNormalized={pixelToNormalized}
            onUpdate={updateCamera}
            onRotate={() => rotateCamera(45)}
          />
        )}
      </Layer>
    </Stage>
  );
}

interface FloorPlanElementComponentProps {
  element: FloorPlanElement;
  isSelected: boolean;
  metersToPixels: (m: number) => number;
  normalizedToPixel: (n: number, d: 'x' | 'y') => number;
  pixelToNormalized: (p: number, d: 'x' | 'y') => number;
  showLabels: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<FloorPlanElement>) => void;
}

function FloorPlanElementComponent({
  element,
  isSelected,
  metersToPixels,
  normalizedToPixel,
  pixelToNormalized,
  showLabels,
  onSelect,
  onUpdate,
}: FloorPlanElementComponentProps) {
  const pixelWidth = metersToPixels(element.width);
  const pixelHeight = metersToPixels(element.height);
  const pixelX = normalizedToPixel(element.x, 'x');
  const pixelY = normalizedToPixel(element.y, 'y');

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const newX = pixelToNormalized(e.target.x() + pixelWidth / 2, 'x');
    const newY = pixelToNormalized(e.target.y() + pixelHeight / 2, 'y');
    onUpdate({ x: newX, y: newY });
  };

  const isArchitecture = element.category === 'architecture';

  return (
    <Group
      x={pixelX - pixelWidth / 2}
      y={pixelY - pixelHeight / 2}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={handleDragEnd}
    >
      {/* Element shape */}
      <Rect
        width={pixelWidth}
        height={pixelHeight}
        fill={element.color + (isArchitecture ? 'ff' : '80')}
        stroke={isSelected ? '#a78bfa' : element.color}
        strokeWidth={isSelected ? 3 : 1}
        cornerRadius={isArchitecture ? 0 : 4}
      />

      {/* Product marker */}
      {element.isProductPosition && (
        <Circle
          x={pixelWidth / 2}
          y={pixelHeight / 2}
          radius={Math.min(pixelWidth, pixelHeight) / 3}
          stroke="#22c55e"
          strokeWidth={2}
          dash={[4, 4]}
        />
      )}

      {/* Icon + Label inside element */}
      <Text
        x={4}
        y={pixelHeight / 2 - 8}
        text={element.icon}
        fontSize={16}
        verticalAlign="middle"
      />
      {/* Label next to icon */}
      {showLabels && (
        <Text
          x={24}
          y={pixelHeight / 2 - 6}
          text={element.label}
          fontSize={11}
          fill="#ffffff"
          fontStyle="bold"
          shadowColor="#000000"
          shadowBlur={3}
          shadowOpacity={0.8}
        />
      )}

      {/* Fallback: Label below if element is too narrow */}
      {showLabels && pixelWidth < 80 && (
        <Text
          x={-20}
          y={pixelHeight + 6}
          width={pixelWidth + 40}
          text={element.label}
          fontSize={10}
          fill="#d4d4d8"
          align="center"
          shadowColor="#000000"
          shadowBlur={2}
          shadowOpacity={0.9}
        />
      )}

      {/* Selection handles */}
      {isSelected && (
        <>
          <Rect
            x={-4}
            y={-4}
            width={8}
            height={8}
            fill="#a78bfa"
            cornerRadius={2}
          />
          <Rect
            x={pixelWidth - 4}
            y={-4}
            width={8}
            height={8}
            fill="#a78bfa"
            cornerRadius={2}
          />
          <Rect
            x={-4}
            y={pixelHeight - 4}
            width={8}
            height={8}
            fill="#a78bfa"
            cornerRadius={2}
          />
          <Rect
            x={pixelWidth - 4}
            y={pixelHeight - 4}
            width={8}
            height={8}
            fill="#a78bfa"
            cornerRadius={2}
          />
        </>
      )}
    </Group>
  );
}

// Camera component - shows photographer's viewpoint
interface CameraComponentProps {
  camera: CameraPosition;
  normalizedToPixel: (n: number, d: 'x' | 'y') => number;
  pixelToNormalized: (p: number, d: 'x' | 'y') => number;
  onUpdate: (updates: Partial<CameraPosition>) => void;
  onRotate: () => void;
}

function CameraComponent({
  camera,
  normalizedToPixel,
  pixelToNormalized,
  onUpdate,
  onRotate,
}: CameraComponentProps) {
  const pixelX = normalizedToPixel(camera.x, 'x');
  const pixelY = normalizedToPixel(camera.y, 'y');
  const cameraSize = 24;

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const newX = pixelToNormalized(e.target.x(), 'x');
    const newY = pixelToNormalized(e.target.y(), 'y');
    onUpdate({ x: newX, y: newY });
  };

  // Calculate view cone end points
  const viewDistance = 60; // pixels
  const viewAngle = 60; // degrees (field of view)
  const rotationRad = (camera.rotation - 90) * (Math.PI / 180); // -90 because 0 should point up
  const leftAngle = rotationRad - (viewAngle / 2) * (Math.PI / 180);
  const rightAngle = rotationRad + (viewAngle / 2) * (Math.PI / 180);

  return (
    <Group
      x={pixelX}
      y={pixelY}
      draggable
      onDragEnd={handleDragEnd}
      onClick={onRotate}
      onTap={onRotate}
    >
      {/* View cone (field of view) */}
      <Wedge
        x={0}
        y={0}
        radius={viewDistance}
        angle={viewAngle}
        rotation={camera.rotation - 90 - viewAngle / 2}
        fill="#f59e0b20"
        stroke="#f59e0b"
        strokeWidth={1}
        dash={[4, 4]}
      />

      {/* Camera body */}
      <Circle
        x={0}
        y={0}
        radius={cameraSize / 2}
        fill="#f59e0b"
        stroke="#ffffff"
        strokeWidth={2}
      />

      {/* Camera icon */}
      <Text
        x={-8}
        y={-8}
        text="📷"
        fontSize={16}
      />

      {/* Direction indicator arrow */}
      <Arrow
        points={[0, 0, Math.cos(rotationRad) * 35, Math.sin(rotationRad) * 35]}
        stroke="#f59e0b"
        strokeWidth={3}
        fill="#f59e0b"
        pointerLength={8}
        pointerWidth={8}
      />

      {/* Label */}
      <Text
        x={-25}
        y={cameraSize / 2 + 4}
        text="Kamera"
        fontSize={10}
        fill="#f59e0b"
        width={50}
        align="center"
        fontStyle="bold"
      />
    </Group>
  );
}
