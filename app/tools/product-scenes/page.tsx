'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { useUser } from '@stackframe/stack';
import Link from 'next/link';
import { useProductScenesStore, type GeneratedScene, type ProductAnalysis } from '@/store/useProductScenesStore';
import { ProductUpload } from '@/components/product-scenes/ProductUpload';
import { BackgroundPrompt } from '@/components/product-scenes/BackgroundPrompt';
import { ReferenceImageUpload } from '@/components/product-scenes/ReferenceImageUpload';
import { CompositingCanvas } from '@/components/product-scenes/CompositingCanvas';
import { FloorPlanEditor } from '@/components/product-scenes/FloorPlanEditor';
import { useBackgroundRemoval } from '@/hooks/useBackgroundRemoval';

// Zoom levels
const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

// Canvas dimensions
const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 1024;

export default function ProductScenesPage() {
  // Protect this route
  useUser({ or: 'redirect' });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [canvasScale, setCanvasScale] = useState(0.6);

  // Pan & Zoom state
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Generation step tracking (for loading UI)
  const [generationStep, setGenerationStep] = useState<1 | 2>(1);

  // Canvas view tab: 'edit' (compositing canvas) or 'result' (generated/harmonized scene)
  const [canvasViewTab, setCanvasViewTab] = useState<'edit' | 'result'>('edit');

  // Floor plan layout (description + image for AI)
  const [floorPlanLayout, setFloorPlanLayout] = useState<string>('');
  const [floorPlanImage, setFloorPlanImage] = useState<string | null>(null);

  // Background removal hook
  const { removeBackground, isRemoving: isRemovingBg, error: bgRemovalError, progress: bgRemovalProgress } = useBackgroundRemoval();

  // Store state
  const mode = useProductScenesStore((state) => state.mode);
  const setMode = useProductScenesStore((state) => state.setMode);
  const productImage = useProductScenesStore((state) => state.productImage);
  const productImages = useProductScenesStore((state) => state.productImages);
  const productAnalysis = useProductScenesStore((state) => state.productAnalysis);
  const setProductAnalysis = useProductScenesStore((state) => state.setProductAnalysis);
  const isAnalyzing = useProductScenesStore((state) => state.isAnalyzing);
  const setIsAnalyzing = useProductScenesStore((state) => state.setIsAnalyzing);
  const backgroundPrompt = useProductScenesStore((state) => state.backgroundPrompt);
  const referenceImage = useProductScenesStore((state) => state.referenceImage);
  const isGenerating = useProductScenesStore((state) => state.isGenerating);
  const setIsGenerating = useProductScenesStore((state) => state.setIsGenerating);
  const setIsRemovingBackground = useProductScenesStore((state) => state.setIsRemovingBackground);
  const setGenerationError = useProductScenesStore((state) => state.setGenerationError);
  const generationError = useProductScenesStore((state) => state.generationError);
  const generatedScenes = useProductScenesStore((state) => state.generatedScenes);
  const activeSceneId = useProductScenesStore((state) => state.activeSceneId);
  const addGeneratedScene = useProductScenesStore((state) => state.addGeneratedScene);
  const setActiveScene = useProductScenesStore((state) => state.setActiveScene);
  const aspectRatio = useProductScenesStore((state) => state.aspectRatio);
  const setAspectRatio = useProductScenesStore((state) => state.setAspectRatio);
  const imageSize = useProductScenesStore((state) => state.imageSize);
  const setImageSize = useProductScenesStore((state) => state.setImageSize);
  const productScaleLevel = useProductScenesStore((state) => state.productScaleLevel);
  const adjustProductScale = useProductScenesStore((state) => state.adjustProductScale);
  const lensType = useProductScenesStore((state) => state.lensType);
  const setLensType = useProductScenesStore((state) => state.setLensType);

  // Compositing state
  const compositing = useProductScenesStore((state) => state.compositing);
  const setProductWithoutBg = useProductScenesStore((state) => state.setProductWithoutBg);
  const setGeneratedBackground = useProductScenesStore((state) => state.setGeneratedBackground);
  const setProductTransform = useProductScenesStore((state) => state.setProductTransform);
  const setShadowSettings = useProductScenesStore((state) => state.setShadowSettings);
  const setColorTint = useProductScenesStore((state) => state.setColorTint);

  // Get active scene
  const activeScene = generatedScenes.find((s) => s.id === activeSceneId);

  // Calculate canvas dimensions based on aspect ratio
  const getCanvasDimensions = useCallback(() => {
    const ratioMap: Record<string, { width: number; height: number }> = {
      '1:1': { width: 1024, height: 1024 },
      '4:3': { width: 1024, height: 768 },
      '16:9': { width: 1024, height: 576 },
      '9:16': { width: 576, height: 1024 },
    };
    return ratioMap[aspectRatio] || ratioMap['1:1'];
  }, [aspectRatio]);

  // Update canvas scale on resize
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const container = containerRef.current;
      const { width, height } = getCanvasDimensions();
      const maxWidth = container.clientWidth - 64;
      const maxHeight = container.clientHeight - 100;
      const scaleX = maxWidth / width;
      const scaleY = maxHeight / height;
      setCanvasScale(Math.min(scaleX, scaleY, 1));
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [getCanvasDimensions]);

  // Track generation steps for loading UI
  useEffect(() => {
    if (isGenerating) {
      setGenerationStep(1);
      // After ~25 seconds, switch to step 2 (feedback loop)
      const timer = setTimeout(() => {
        setGenerationStep(2);
      }, 25000);
      return () => clearTimeout(timer);
    } else {
      setGenerationStep(1);
    }
  }, [isGenerating]);

  // ============================================
  // PIXEL-PERFECT: Auto-set product when image uploaded
  // In compositing mode, uploaded images are already transparent
  // ============================================
  useEffect(() => {
    if (mode === 'compositing' && productImage) {
      // Automatically set the product for compositing canvas
      setProductWithoutBg(productImage.previewUrl);
    }
  }, [mode, productImage, setProductWithoutBg]);

  // ============================================
  // PRODUCT ANALYSIS: Auto-analyze product image after upload
  // Extracts camera params, product type, placement suggestions
  // ============================================
  const analyzeProduct = useCallback(async () => {
    if (!productImage) return;

    setIsAnalyzing(true);
    setGenerationError(null);

    try {
      const response = await fetch('/api/analyze-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productImage: {
            data: productImage.data,
            mimeType: productImage.mimeType,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Analyse fehlgeschlagen');
      }

      const data = await response.json();
      setProductAnalysis(data.analysis);
      console.log('Product analysis complete:', data.analysis.product.type_german);
    } catch (error) {
      console.error('Product analysis error:', error);
      // Don't show error to user - analysis is optional
      // Generation can still work without it
    } finally {
      setIsAnalyzing(false);
    }
  }, [productImage, setProductAnalysis, setIsAnalyzing, setGenerationError]);

  // Auto-trigger analysis when product image changes
  useEffect(() => {
    if (productImage && !productAnalysis) {
      analyzeProduct();
    }
  }, [productImage, productAnalysis, analyzeProduct]);

  // ============================================
  // ONESHOT MODE: Generate scene with AI
  // Supports multi-view: 1-3 product images for better fidelity
  // Supports floor plan: 2D room layout for precise positioning
  // ============================================
  const handleGenerateOneshot = useCallback(async () => {
    if (productImages.length === 0 || !backgroundPrompt.trim()) return;

    setIsGenerating(true);
    setGenerationError(null);

    try {
      // Build request with multi-view support
      const requestBody: {
        productImages: Array<{ data: string; mimeType: string; label?: string }>;
        backgroundPrompt: string;
        aspectRatio: string;
        imageSize: string;
        productScaleLevel: number;
        referenceImage?: { data: string; mimeType: string };
        productAnalysis?: ProductAnalysis;
        floorPlanImage?: { data: string; mimeType: string };
        floorPlanDescription?: string;
      } = {
        // Send all product images (1-3) for multi-view
        productImages: productImages.map((img) => ({
          data: img.data,
          mimeType: img.mimeType,
          label: img.label,
        })),
        backgroundPrompt: backgroundPrompt.trim(),
        aspectRatio,
        imageSize,
        productScaleLevel,
      };

      // Include product analysis for intelligent placement
      if (productAnalysis) {
        requestBody.productAnalysis = productAnalysis;
      }

      if (referenceImage) {
        requestBody.referenceImage = {
          data: referenceImage.data,
          mimeType: referenceImage.mimeType,
        };
      }

      // Include floor plan for room layout reference
      // Now that product images are compressed, there's room for the floor plan
      if (floorPlanImage && floorPlanLayout) {
        requestBody.floorPlanImage = {
          data: floorPlanImage.split(',')[1], // Remove data URL prefix
          mimeType: 'image/jpeg',
        };
        requestBody.floorPlanDescription = floorPlanLayout;
        console.log('Including floor plan image + description');
      } else if (floorPlanLayout) {
        // Fallback: text description only
        requestBody.floorPlanDescription = floorPlanLayout;
        console.log('Including floor plan description (text only)');
      }

      console.log(`Generating scene with ${productImages.length} product image(s)${floorPlanImage ? ' + floor plan' : ''}`);

      const response = await fetch('/api/generate-product-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        // Handle both JSON and text error responses
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const error = await response.json();
          throw new Error(error.error || error.message || 'Generierung fehlgeschlagen');
        } else {
          const errorText = await response.text();
          console.error('API error (non-JSON):', errorText);
          throw new Error(`Server-Fehler: ${response.status}`);
        }
      }

      const data = await response.json();

      const scene: GeneratedScene = {
        id: `scene_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        url: data.image.url,
        prompt: backgroundPrompt,
        createdAt: new Date(),
        mode: 'oneshot',
      };

      addGeneratedScene(scene);
      setZoomLevel(1);
    } catch (error) {
      console.error('Scene generation error:', error);
      setGenerationError(
        error instanceof Error ? error.message : 'Generierung fehlgeschlagen. Bitte versuche es erneut.'
      );
    } finally {
      setIsGenerating(false);
    }
  }, [productImages, backgroundPrompt, referenceImage, aspectRatio, imageSize, productScaleLevel, productAnalysis, floorPlanImage, floorPlanLayout, setIsGenerating, setGenerationError, addGeneratedScene]);

  // ============================================
  // COMPOSITING MODE: Step 1 - Remove background
  // ============================================
  const handleRemoveBackground = useCallback(async () => {
    if (!productImage) return;

    setIsRemovingBackground(true);
    setGenerationError(null);

    try {
      const resultUrl = await removeBackground(productImage.previewUrl);
      setProductWithoutBg(resultUrl);
    } catch (error) {
      console.error('Background removal error:', error);
      setGenerationError(
        error instanceof Error ? error.message : 'Hintergrundentfernung fehlgeschlagen'
      );
    } finally {
      setIsRemovingBackground(false);
    }
  }, [productImage, removeBackground, setProductWithoutBg, setIsRemovingBackground, setGenerationError]);

  // ============================================
  // COMPOSITING MODE: Step 2 - Generate background only
  // Sends LAYOUT IMAGE (product on neutral bg) so AI sees exact position
  // ============================================
  const handleGenerateBackground = useCallback(async () => {
    if (!backgroundPrompt.trim()) return;

    setIsGenerating(true);
    setGenerationError(null);

    try {
      // Build request with analysis data if available
      const requestBody: {
        backgroundPrompt: string;
        aspectRatio: string;
        lensType: string;
        layoutImage?: { data: string; mimeType: string };
        productImage?: { data: string; mimeType: string };
        referenceImage?: { data: string; mimeType: string };
        productPlacement?: { x: number; y: number; scale: number };
        productAnalysis?: ProductAnalysis;
      } = {
        backgroundPrompt: backgroundPrompt.trim(),
        aspectRatio,
        // Use analyzed lens type if available, otherwise default
        lensType: productAnalysis?.camera.focal_length.category === 'wide' ? 'wide'
          : productAnalysis?.camera.focal_length.category === 'telephoto' || productAnalysis?.camera.focal_length.category === 'light_telephoto' ? 'tele'
          : 'normal',
        productPlacement: {
          x: compositing.productTransform.x,
          y: compositing.productTransform.y,
          scale: compositing.productTransform.scale,
        },
      };

      // Include full analysis if available
      if (productAnalysis) {
        requestBody.productAnalysis = productAnalysis;
      }

      // Try to get layout image (product on neutral background)
      // This shows Google the EXACT position where product will be placed
      const exportLayoutFn = (window as any).__exportLayoutImage;
      if (exportLayoutFn) {
        const layoutDataUrl = exportLayoutFn();
        if (layoutDataUrl) {
          const layoutBase64 = layoutDataUrl.split(',')[1];
          requestBody.layoutImage = {
            data: layoutBase64,
            mimeType: 'image/png',
          };
          console.log('Using layout image for precise positioning');
        }
      }

      // Fallback: send product image
      if (!requestBody.layoutImage && productImage) {
        requestBody.productImage = {
          data: productImage.data,
          mimeType: productImage.mimeType,
        };
      }

      if (referenceImage) {
        requestBody.referenceImage = {
          data: referenceImage.data,
          mimeType: referenceImage.mimeType,
        };
      }

      const response = await fetch('/api/generate-background', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Hintergrund-Generierung fehlgeschlagen');
      }

      const data = await response.json();

      // IMPORTANT: Set both background AND product for compositing
      // In Pixel-Perfect mode, the uploaded image IS the transparent product
      setGeneratedBackground(data.image.url);

      if (productImage) {
        // Always set the product - this is the transparent PNG/WebP
        setProductWithoutBg(productImage.previewUrl);
        console.log('Compositing: Background + Product set');
      }
    } catch (error) {
      console.error('Background generation error:', error);
      setGenerationError(
        error instanceof Error ? error.message : 'Hintergrund-Generierung fehlgeschlagen'
      );
    } finally {
      setIsGenerating(false);
    }
  }, [backgroundPrompt, aspectRatio, lensType, productImage, referenceImage, compositing.productTransform, productAnalysis, setGeneratedBackground, setProductWithoutBg, setIsGenerating, setGenerationError]);

  // ============================================
  // COMPOSITING MODE: Save composite as scene
  // ============================================
  const handleSaveComposite = useCallback((dataUrl: string) => {
    const scene: GeneratedScene = {
      id: `scene_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      url: dataUrl,
      prompt: backgroundPrompt,
      createdAt: new Date(),
      mode: 'compositing',
    };
    addGeneratedScene(scene);
  }, [backgroundPrompt, addGeneratedScene]);

  // ============================================
  // COMPOSITING MODE: Harmonize - Color/Shadow integration
  // Takes canvas screenshot, sends to AI for polish
  // ============================================
  const [isHarmonizing, setIsHarmonizing] = useState(false);

  const handleHarmonize = useCallback(async () => {
    // Use the global export function from CompositingCanvas (full resolution)
    const exportFn = (window as any).__exportCompositeFullRes;
    if (!exportFn) {
      setGenerationError('Export-Funktion nicht verfügbar');
      return;
    }

    const dataUrl = exportFn();
    if (!dataUrl) {
      setGenerationError('Canvas-Export fehlgeschlagen');
      return;
    }

    setIsHarmonizing(true);
    setGenerationError(null);

    try {
      // dataUrl is already full resolution from Konva
      const base64Data = dataUrl.split(',')[1];

      const response = await fetch('/api/harmonize-composite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          compositeImage: {
            data: base64Data,
            mimeType: 'image/png',
          },
          aspectRatio,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Harmonisierung fehlgeschlagen');
      }

      const data = await response.json();

      // Add harmonized result as new scene
      const scene: GeneratedScene = {
        id: `scene_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        url: data.image.url,
        prompt: `${backgroundPrompt} (harmonisiert)`,
        createdAt: new Date(),
        mode: 'compositing',
      };
      addGeneratedScene(scene);

    } catch (error) {
      console.error('Harmonize error:', error);
      setGenerationError(
        error instanceof Error ? error.message : 'Harmonisierung fehlgeschlagen'
      );
    } finally {
      setIsHarmonizing(false);
    }
  }, [aspectRatio, backgroundPrompt, addGeneratedScene, setGenerationError]);

  // Export function
  const handleExport = useCallback((format: 'jpeg' | 'png') => {
    if (!activeScene) return;

    const link = document.createElement('a');
    link.download = `product-scene.${format === 'jpeg' ? 'jpg' : 'png'}`;

    if (activeScene.url.startsWith('data:')) {
      link.href = activeScene.url;
      link.click();
    } else {
      fetch(activeScene.url)
        .then((res) => res.blob())
        .then((blob) => {
          link.href = URL.createObjectURL(blob);
          link.click();
          URL.revokeObjectURL(link.href);
        });
    }

    setExportDropdownOpen(false);
  }, [activeScene]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoomLevel as typeof ZOOM_LEVELS[number]);
    if (currentIndex < ZOOM_LEVELS.length - 1) {
      setZoomLevel(ZOOM_LEVELS[currentIndex + 1]);
    }
  }, [zoomLevel]);

  const handleZoomOut = useCallback(() => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoomLevel as typeof ZOOM_LEVELS[number]);
    if (currentIndex > 0) {
      setZoomLevel(ZOOM_LEVELS[currentIndex - 1]);
    }
  }, [zoomLevel]);

  const handleResetView = useCallback(() => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  }, []);

  // Pan handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
  }, [panPosition]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -1 : 1;
    const currentIndex = ZOOM_LEVELS.indexOf(zoomLevel as typeof ZOOM_LEVELS[number]);
    const newIndex = Math.max(0, Math.min(ZOOM_LEVELS.length - 1, currentIndex + delta));
    if (newIndex !== currentIndex) {
      setZoomLevel(ZOOM_LEVELS[newIndex]);
    }
  }, [zoomLevel]);

  // Reset pan when switching scenes
  useEffect(() => {
    setPanPosition({ x: 0, y: 0 });
  }, [activeSceneId]);

  // Auto-switch to result tab when a new scene is generated in compositing mode
  useEffect(() => {
    if (mode === 'compositing' && activeSceneId && generatedScenes.length > 0) {
      setCanvasViewTab('result');
    }
  }, [activeSceneId, mode, generatedScenes.length]);

  const canvasDimensions = getCanvasDimensions();

  return (
    <div className="h-screen bg-zinc-950 text-zinc-100 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-zinc-800/50 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <img src="/logos/pixyo.svg" alt="Pixyo" className="h-8" />
          </Link>
          <div className="h-6 w-px bg-zinc-800" />
          <h1 className="text-sm font-medium text-zinc-300">Product Scenes</h1>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-2 bg-zinc-900 rounded-lg p-1">
          <button
            onClick={() => setMode('oneshot')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              mode === 'oneshot'
                ? 'bg-violet-600 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            KI-Generierung
          </button>
          <button
            onClick={() => setMode('floorplan')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              mode === 'floorplan'
                ? 'bg-blue-600 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Raumplaner
          </button>
        </div>

        <Link
          href="/"
          className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          Tools
        </Link>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Controls */}
        <aside className="w-80 bg-zinc-900 border-r border-zinc-800/50 p-4 space-y-6 overflow-y-auto flex-shrink-0">
          {/* Mode Info */}
          {mode === 'compositing' && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-xs text-emerald-300 leading-relaxed">
                <strong>Pixel-Perfekt Modus:</strong> Das Produkt bleibt 100% unverändert. Hintergrund wird separat generiert und darunter gelegt.
              </p>
            </div>
          )}
          {mode === 'floorplan' && (
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-xs text-blue-300 leading-relaxed">
                <strong>Raumplaner:</strong> Konfiguriere einen Raum von oben. Das Layout wird an die KI übergeben für präzise Möbel-/Produktplatzierung.
              </p>
            </div>
          )}

          {/* Product Upload */}
          <div>
            <h2 className="text-xs text-zinc-500 mb-3 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold">1</span>
              Produktbild
            </h2>
            <ProductUpload />

            {/* Pixel-Perfect Status */}
            {mode === 'compositing' && productImage && (
              <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Produkt bereit (Transparenz erkannt)
              </div>
            )}

            {/* Analysis Status & Results */}
            {productImage && (
              <div className="mt-3">
                {isAnalyzing ? (
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Analysiere Produktbild...
                  </div>
                ) : productAnalysis ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <svg className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Analyse abgeschlossen
                    </div>
                    {/* Simplified Analysis Pills - only essential info */}
                    <div className="flex flex-wrap gap-1.5">
                      {/* Product Type + Brand */}
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-violet-500/20 text-violet-300 text-[10px] font-medium">
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4" />
                        </svg>
                        {productAnalysis.product.brand && productAnalysis.product.brand !== 'unknown'
                          ? `${productAnalysis.product.brand} ${productAnalysis.product.type_german}`
                          : productAnalysis.product.type_german}
                      </span>
                      {/* Lens - the key info for perspective matching */}
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-medium">
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        </svg>
                        ~{productAnalysis.camera.focal_length.estimated_mm}mm
                      </span>
                    </div>
                    {/* Suggested Rooms for scene ideas */}
                    {productAnalysis.environment.primary_rooms_german.length > 0 && (
                      <p className="text-[10px] text-zinc-500">
                        Passt zu: {productAnalysis.environment.primary_rooms_german.slice(0, 2).join(', ')}
                      </p>
                    )}
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Background Prompt */}
          <div className="pt-4 border-t border-zinc-800/50">
            <h2 className="text-xs text-zinc-500 mb-3 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold">2</span>
              Hintergrund
            </h2>
            {mode === 'oneshot' ? (
              <BackgroundPrompt onGenerate={handleGenerateOneshot} />
            ) : (
              <BackgroundPrompt onGenerate={handleGenerateBackground} />
            )}
          </div>

          {/* Reference Image */}
          <div className="pt-4 border-t border-zinc-800/50">
            <h2 className="text-xs text-zinc-500 mb-3 uppercase tracking-wider flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              Referenzbild (optional)
            </h2>
            <ReferenceImageUpload />
          </div>

          {/* Floor Plan Status (when exported from Raumplaner) */}
          {floorPlanImage && floorPlanLayout && (
            <div className="pt-4 border-t border-zinc-800/50">
              <h2 className="text-xs text-zinc-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
                Raumplaner Layout
              </h2>
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-xs text-blue-400 font-medium">Layout bereit für KI</span>
                </div>

                {/* Floor Plan Image Thumbnail */}
                <div className="mb-3 rounded-lg overflow-hidden border border-zinc-700/50 bg-zinc-900">
                  <img
                    src={floorPlanImage}
                    alt="Raumplaner Layout"
                    className="w-full h-auto"
                  />
                </div>

                {/* Text Description (collapsible) */}
                <details className="group">
                  <summary className="text-xs text-zinc-500 cursor-pointer hover:text-zinc-400 flex items-center gap-1">
                    <svg className="w-3 h-3 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Textbeschreibung anzeigen
                  </summary>
                  <p className="mt-2 text-xs text-zinc-400 whitespace-pre-line bg-zinc-800/50 p-2 rounded">{floorPlanLayout}</p>
                </details>

                <button
                  onClick={() => {
                    setFloorPlanImage(null);
                    setFloorPlanLayout('');
                  }}
                  className="mt-3 text-xs text-zinc-500 hover:text-red-400 transition-colors flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Layout entfernen
                </button>
              </div>
            </div>
          )}

          {/* Compositing Controls - Available as soon as product is uploaded */}
          {mode === 'compositing' && productImage && (
            <div className="pt-4 border-t border-zinc-800/50 space-y-4">
              <h2 className="text-xs text-zinc-500 uppercase tracking-wider">
                Produkt-Positionierung
              </h2>
              <p className="text-xs text-zinc-600 -mt-2">
                Ziehe das Produkt im Vorschau-Bereich oder nutze den Slider
              </p>

              {/* Scale */}
              <div>
                <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
                  <span>Größe</span>
                  <span>{Math.round(compositing.productTransform.scale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1"
                  step="0.05"
                  value={compositing.productTransform.scale}
                  onChange={(e) => setProductTransform({ scale: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer
                             [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                             [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                />
              </div>

              {/* Shadow */}
              <div>
                <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
                  <span>Schatten</span>
                  <span>{Math.round(compositing.shadowIntensity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={compositing.shadowIntensity}
                  onChange={(e) => setShadowSettings({ intensity: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer
                             [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                             [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                />
              </div>

              {/* Color Tint */}
              <div>
                <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
                  <span>Farbtemperatur</span>
                  <span>
                    {compositing.colorTint === 0 ? 'Neutral' :
                     compositing.colorTint > 0 ? 'Warm' : 'Kühl'}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="-1"
                    max="1"
                    step="0.1"
                    value={compositing.colorTint}
                    onChange={(e) => setColorTint(parseFloat(e.target.value))}
                    className="w-full h-1.5 rounded-lg appearance-none cursor-pointer
                               [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                               [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                    style={{
                      background: 'linear-gradient(to right, #6b9fff, #a3a3a3, #ffb366)'
                    }}
                  />
                  {/* Center marker */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-3 bg-zinc-500/50 pointer-events-none" />
                </div>
              </div>
            </div>
          )}

          {/* Aspect Ratio & Resolution */}
          <div className="pt-4 border-t border-zinc-800/50 space-y-4">
            {/* Aspect Ratio */}
            <div>
              <h2 className="text-xs text-zinc-500 mb-2 uppercase tracking-wider">
                Seitenverhältnis
              </h2>
              <div className="grid grid-cols-4 gap-1.5">
                {(['1:1', '4:3', '16:9', '9:16'] as const).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`px-2 py-2 rounded-lg text-xs font-medium transition-all
                      ${aspectRatio === ratio
                        ? 'bg-white/10 text-white border border-white/20'
                        : 'bg-zinc-800/50 text-zinc-500 border border-zinc-700/50 hover:bg-zinc-700/50'
                      }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            {/* Resolution */}
            <div>
              <h2 className="text-xs text-zinc-500 mb-2 uppercase tracking-wider">
                Auflösung
              </h2>
              <div className="grid grid-cols-3 gap-1.5">
                {(['1K', '2K', '4K'] as const).map((size) => {
                  // Estimated cost per generation (rough Gemini pricing)
                  const costMap = { '1K': '~$0.02', '2K': '~$0.04', '4K': '~$0.08' };
                  return (
                    <button
                      key={size}
                      onClick={() => setImageSize(size)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex flex-col items-center
                        ${imageSize === size
                          ? 'bg-white/10 text-white border border-white/20'
                          : 'bg-zinc-800/50 text-zinc-500 border border-zinc-700/50 hover:bg-zinc-700/50'
                        }`}
                    >
                      <span>{size}</span>
                      <span className="text-[9px] opacity-60">{costMap[size]}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-zinc-600 mt-1.5 text-center">
                Geschätzte Kosten pro Generierung
              </p>
            </div>
          </div>

          {/* Product Scale (Oneshot mode only) */}
          {mode === 'oneshot' && (
            <div className="pt-4 border-t border-zinc-800/50">
              <h2 className="text-xs text-zinc-500 mb-3 uppercase tracking-wider">
                Produktgröße im Bild
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => adjustProductScale(-1)}
                  disabled={productScaleLevel <= -2}
                  className="p-2 rounded-lg bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700 hover:text-white
                             disabled:opacity-30 disabled:hover:bg-zinc-800/50 disabled:hover:text-zinc-400 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <div className="flex-1 text-center">
                  <div className="flex items-center justify-center gap-1">
                    {[-2, -1, 0, 1, 2].map((level) => (
                      <div
                        key={level}
                        className={`w-2 h-2 rounded-full transition-all ${
                          level === productScaleLevel
                            ? 'bg-violet-500 scale-125'
                            : level < productScaleLevel
                              ? 'bg-zinc-600'
                              : 'bg-zinc-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-zinc-500 mt-1.5">
                    {productScaleLevel === 0 ? 'Standard' :
                     productScaleLevel < 0 ? `Kleiner (${productScaleLevel})` :
                     `Größer (+${productScaleLevel})`}
                  </p>
                </div>
                <button
                  onClick={() => adjustProductScale(1)}
                  disabled={productScaleLevel >= 2}
                  className="p-2 rounded-lg bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700 hover:text-white
                             disabled:opacity-30 disabled:hover:bg-zinc-800/50 disabled:hover:text-zinc-400 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Error Display */}
          {(generationError || bgRemovalError) && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-xs text-red-400">{generationError || bgRemovalError}</p>
            </div>
          )}
        </aside>

        {/* Center - Canvas Preview */}
        <div ref={containerRef} className="flex-1 flex flex-col relative bg-zinc-950 overflow-hidden">
          {/* Canvas Area */}
          {mode === 'floorplan' ? (
            <FloorPlanEditor
              onExportLayout={(description, imageDataUrl) => {
                setFloorPlanLayout(description);
                setFloorPlanImage(imageDataUrl);

                // Show confirmation to user
                if (description && imageDataUrl) {
                  console.log('Floor plan exported for AI:', description);
                  // Auto-switch to oneshot mode to generate
                  setMode('oneshot');
                }
              }}
            />
          ) : mode === 'compositing' ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Pill Tabs: Bearbeiten | Ergebnis */}
              {(compositing.generatedBackground || generatedScenes.length > 0) && (
                <div className="flex justify-center pt-4 pb-2">
                  <div className="flex items-center bg-zinc-900 rounded-full p-1 border border-zinc-800">
                    <button
                      onClick={() => setCanvasViewTab('edit')}
                      className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all ${
                        canvasViewTab === 'edit'
                          ? 'bg-emerald-600 text-white shadow-lg'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Bearbeiten
                    </button>
                    <button
                      onClick={() => setCanvasViewTab('result')}
                      disabled={generatedScenes.length === 0}
                      className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all ${
                        canvasViewTab === 'result'
                          ? 'bg-emerald-600 text-white shadow-lg'
                          : 'text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400'
                      }`}
                    >
                      Ergebnis
                    </button>
                  </div>
                </div>
              )}

              {/* Canvas Content */}
              <div className="flex-1 flex items-center justify-center p-8 relative">
                {canvasViewTab === 'edit' ? (
                  <CompositingCanvas
                    width={canvasDimensions.width}
                    height={canvasDimensions.height}
                    scale={canvasScale}
                    onExport={handleSaveComposite}
                  />
                ) : (
                  /* Result View - Show latest generated/harmonized scene */
                  activeScene ? (
                    <div className="relative max-w-full max-h-full">
                      <img
                        src={activeScene.url}
                        alt="Generiertes Ergebnis"
                        className="max-w-full max-h-[calc(100vh-280px)] object-contain rounded-lg shadow-2xl"
                      />
                      {/* Harmonized badge */}
                      {activeScene.prompt.includes('harmonisiert') && (
                        <div className="absolute top-3 right-3 px-2 py-1 bg-amber-500/90 text-white text-xs font-medium rounded-full">
                          Harmonisiert
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-zinc-500 text-sm">Noch kein Ergebnis generiert</p>
                  )
                )}

                {/* Loading Overlay for Compositing Mode */}
                {(isGenerating || isHarmonizing) && (
                  <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-sm flex items-center justify-center rounded-lg">
                    <div className="text-center max-w-xs">
                      <svg className="w-16 h-16 animate-spin mx-auto mb-6 text-emerald-500" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <p className="text-emerald-400 font-medium">
                        {isHarmonizing ? 'Harmonisiere...' : 'Generiere Hintergrund...'}
                      </p>
                      <p className="text-xs text-zinc-500 mt-3">
                        {isHarmonizing
                          ? 'Die KI passt Farben, Schatten und Spiegelungen an'
                          : 'Die KI erstellt den Hintergrund mit Platz für das Produkt'}
                      </p>
                      <p className="text-xs text-zinc-600 mt-4">Ca. 20-40 Sekunden</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons (only in edit mode with background) */}
              {canvasViewTab === 'edit' && compositing.productWithoutBg && compositing.generatedBackground && (
                <div className="px-8 pb-4 flex gap-2 justify-center">
                  {/* Save as Scene */}
                  <button
                    onClick={() => {
                      const exportFn = (window as any).__exportCompositeFullRes;
                      if (exportFn) {
                        const dataUrl = exportFn();
                        if (dataUrl) handleSaveComposite(dataUrl);
                      }
                    }}
                    className="px-5 py-2.5 rounded-lg bg-zinc-700 text-white font-medium text-sm
                               hover:bg-zinc-600 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Speichern
                  </button>

                  {/* Harmonize - AI Color/Shadow Integration */}
                  <button
                    onClick={handleHarmonize}
                    disabled={isHarmonizing}
                    className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600
                               text-white font-medium text-sm hover:from-amber-500 hover:to-orange-500
                               transition-all flex items-center gap-2
                               disabled:opacity-50 disabled:cursor-not-allowed"
                    title="KI harmonisiert Farben, Schatten und Spiegelungen"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Harmonisieren
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Full-size Image Viewer with Pan & Zoom */}
              <div
                ref={imageContainerRef}
                className={`flex-1 overflow-hidden ${activeScene ? 'cursor-grab' : ''} ${isDragging ? 'cursor-grabbing' : ''}`}
                onMouseDown={activeScene ? handleMouseDown : undefined}
                onMouseMove={activeScene ? handleMouseMove : undefined}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={activeScene ? handleWheel : undefined}
              >
                {activeScene ? (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{
                      transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`,
                      transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                    }}
                  >
                    <img
                      src={activeScene.url}
                      alt="Generierte Szene"
                      className="max-w-full max-h-full object-contain select-none"
                      draggable={false}
                    />
                  </div>
                ) : productImage ? (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950">
                    <div className="text-center p-8">
                      <img
                        src={productImage.previewUrl}
                        alt="Produkt"
                        className="max-w-[50%] max-h-[60vh] mx-auto object-contain mb-6 drop-shadow-2xl"
                      />
                      <p className="text-sm text-zinc-500">
                        Beschreibe einen Hintergrund und klicke auf &quot;Szene generieren&quot;
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-zinc-800/50 flex items-center justify-center">
                        <svg className="w-10 h-10 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <p className="text-sm text-zinc-500">Lade ein Produktbild hoch, um zu starten</p>
                    </div>
                  </div>
                )}

                {/* Loading Overlay */}
                {isGenerating && (
                  <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center max-w-xs">
                      {/* Spinner */}
                      <svg className="w-16 h-16 animate-spin mx-auto mb-6 text-violet-500" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>

                      <p className="text-violet-400 font-medium">Generiere Szene...</p>
                      <p className="text-xs text-zinc-500 mt-3">Die KI erstellt das Bild mit dem neuen Hintergrund</p>
                      <p className="text-xs text-zinc-600 mt-4">Ca. 20-40 Sekunden</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Floating Zoom Controls */}
              {activeScene && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-zinc-900/90 backdrop-blur-sm rounded-full px-2 py-1.5 border border-zinc-700/50 shadow-xl">
                  <button
                    onClick={handleZoomOut}
                    disabled={zoomLevel <= ZOOM_LEVELS[0]}
                    className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-700/50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <button
                    onClick={handleResetView}
                    className="px-3 py-1 rounded-full text-zinc-300 text-xs font-medium hover:bg-zinc-700/50 transition-colors min-w-[50px]"
                  >
                    {Math.round(zoomLevel * 100)}%
                  </button>
                  <button
                    onClick={handleZoomIn}
                    disabled={zoomLevel >= ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
                    className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-700/50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <div className="w-px h-5 bg-zinc-700 mx-1" />
                  <button
                    onClick={handleResetView}
                    className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-colors"
                    title="Ansicht zurücksetzen"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Pan hint */}
              {activeScene && zoomLevel > 1 && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-zinc-900/80 backdrop-blur-sm rounded-full text-xs text-zinc-400 border border-zinc-700/50">
                  Klicken und ziehen zum Verschieben
                </div>
              )}
            </>
          )}

        </div>

        {/* Right Panel - Results & Export */}
        <aside className="w-72 bg-zinc-900 border-l border-zinc-800/50 p-4 space-y-4 overflow-y-auto flex-shrink-0">
          {/* Export */}
          {activeScene && (
            <div>
              <h2 className="text-xs text-zinc-500 mb-3 uppercase tracking-wider">Exportieren</h2>
              <div className="relative">
                <div className="flex">
                  <button onClick={() => handleExport('png')}
                    className="flex-1 px-4 py-2.5 rounded-l-lg bg-white text-zinc-900 font-medium text-sm hover:bg-zinc-100">
                    Download
                  </button>
                  <button onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                    className="px-3 py-2.5 rounded-r-lg bg-white text-zinc-900 border-l border-zinc-200 hover:bg-zinc-100">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                {exportDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setExportDropdownOpen(false)} />
                    <div className="absolute bottom-full left-0 right-0 mb-1 bg-zinc-800 rounded-lg border border-zinc-700 overflow-hidden shadow-xl z-50">
                      <button onClick={() => handleExport('png')} className="w-full px-4 py-2.5 text-left text-sm text-zinc-100 hover:bg-zinc-700">PNG</button>
                      <button onClick={() => handleExport('jpeg')} className="w-full px-4 py-2.5 text-left text-sm text-zinc-100 hover:bg-zinc-700 border-t border-zinc-700">JPEG</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Generated Scenes */}
          <div className="pt-4 border-t border-zinc-800/50">
            <h2 className="text-xs text-zinc-500 mb-3 uppercase tracking-wider">Generierte Szenen</h2>
            {generatedScenes.length === 0 ? (
              <p className="text-xs text-zinc-600 text-center py-4">Noch keine Szenen generiert</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {generatedScenes.map((scene) => (
                  <button
                    key={scene.id}
                    onClick={() => { setActiveScene(scene.id); setZoomLevel(1); }}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all
                      ${scene.id === activeSceneId ? 'border-violet-500 ring-2 ring-violet-500/30' : 'border-zinc-700/50 hover:border-zinc-600'}`}
                  >
                    <img src={scene.url} alt={scene.prompt} className="w-full h-full object-cover" />
                    {/* Mode indicator */}
                    <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${scene.mode === 'compositing' ? 'bg-emerald-500' : 'bg-violet-500'}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="pt-4 border-t border-zinc-800/50">
            <h2 className="text-xs text-zinc-500 mb-3 uppercase tracking-wider">Tipps</h2>
            <ul className="space-y-2 text-xs text-zinc-500">
              {mode === 'compositing' ? (
                <>
                  <li className="flex gap-2"><span className="text-emerald-400">•</span>Produkt bleibt 100% unverändert</li>
                  <li className="flex gap-2"><span className="text-emerald-400">•</span>Ziehe das Produkt zum Positionieren</li>
                  <li className="flex gap-2"><span className="text-emerald-400">•</span>Passe Schatten für Realismus an</li>
                </>
              ) : (
                <>
                  <li className="flex gap-2"><span className="text-violet-400">•</span>Optimierter Prompt für Produkttreue</li>
                  <li className="flex gap-2"><span className="text-violet-400">•</span>Logo/Text werden geschützt</li>
                  <li className="flex gap-2"><span className="text-violet-400">•</span>Beste Integration in Szene</li>
                </>
              )}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
