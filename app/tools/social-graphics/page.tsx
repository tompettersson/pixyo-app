"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useUser } from "@stackframe/stack";
import { Button } from "@/components/ui";
import {
  STYLE_PRESETS,
  getPresetsByMode,
  type StylePreset,
} from "@/lib/stylePresets";
import { UnsplashSearch } from "@/components/editor/UnsplashSearch";
import { ProfileSettings } from "@/components/editor/ProfileSettings";
import { CustomerSwitcher } from "@/components/editor/CustomerSwitcher";
import { DesignThumbnails } from "@/components/editor/DesignThumbnails";
import { AssetLibrary } from "@/components/editor/AssetLibrary";
import { SystemStatus } from "@/components/editor/SystemStatus";
import { FormatizerModal } from "@/components/formatizer/FormatizerModal";
import { useSaveDesign } from "@/hooks/useSaveDesign";
import { useEditorStore } from "@/store/useEditorStore";
import type { Customer } from "@/types/customer";
import type Konva from "konva";
import {
  OVERLAY_PRESETS,
  generateOverlay,
  getOverlayBlendMode,
  type OverlayType,
  type OverlayMode,
  type BlendMode,
} from "@/lib/overlayEffects";

// Lazy load react-konva
let Stage: typeof import("react-konva").Stage | null = null;
let Layer: typeof import("react-konva").Layer | null = null;
let Rect: typeof import("react-konva").Rect | null = null;
let Text: typeof import("react-konva").Text | null = null;
let Group: typeof import("react-konva").Group | null = null;
let KonvaImage: typeof import("react-konva").Image | null = null;

if (typeof window !== "undefined") {
  const konvaModule = require("react-konva");
  Stage = konvaModule.Stage;
  Layer = konvaModule.Layer;
  Rect = konvaModule.Rect;
  Text = konvaModule.Text;
  Group = konvaModule.Group;
  KonvaImage = konvaModule.Image;
}

// Layout constants (in pixels) - scaled for 1080x1080 canvas
const LAYOUT = {
  padding: {
    top: 72,
    right: 216,
    bottom: 72,
    left: 72,
  },
  taglineSize: 36,
  headlineSize: 112,
  headlineLineHeight: 1.05,
  bodySize: 32,
  buttonSize: 32,
  gapTaglineToHeadline: 20,
  gapHeadlineToBody: 24,
  gapBodyToButton: 16,
  buttonPaddingX: 48,
  buttonPaddingY: 20,
  buttonRadius: 16,
};

// Canvas dimensions
const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1080;

interface TemplateContent {
  tagline: string;
  headline: string;
  body: string;
  buttonText: string;
}

// Logo max dimensions - actual size determined by image aspect ratio
const LOGO_MAX_WIDTH = CANVAS_WIDTH * 0.35;
const LOGO_MAX_HEIGHT = CANVAS_HEIGHT * 0.15;

// Composition hint for AI
const COMPOSITION_DIRECTIVE = `Composition: Place the main subject slightly towards the bottom-right. IMPORTANT: Do NOT include any text, letters, words, watermarks, or typography in the image. The image must be completely text-free.`;

// Map our blend modes to Canvas globalCompositeOperation values
const blendModeToComposite: Record<BlendMode, GlobalCompositeOperation> = {
  normal: "source-over",
  multiply: "multiply",
  screen: "screen",
  "soft-light": "soft-light",
  overlay: "overlay",
};

// Dynamic Overlay component
function OverlayLayer({
  type,
  intensity,
  mode,
}: {
  type: OverlayType;
  intensity: number;
  mode: OverlayMode;
}) {
  const [overlayImage, setOverlayImage] = useState<HTMLImageElement | null>(
    null
  );
  const blendMode = getOverlayBlendMode(type, mode);

  useEffect(() => {
    if (type === "none" || intensity <= 0) {
      setOverlayImage(null);
      return;
    }

    const canvas = generateOverlay(
      type,
      CANVAS_WIDTH,
      CANVAS_HEIGHT,
      intensity,
      mode
    );
    if (canvas) {
      const img = new window.Image();
      img.src = canvas.toDataURL();
      img.onload = () => setOverlayImage(img);
    }
  }, [type, intensity, mode]);

  if (!overlayImage || !KonvaImage) return null;

  return (
    <KonvaImage
      image={overlayImage}
      x={0}
      y={0}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      globalCompositeOperation={blendModeToComposite[blendMode]}
    />
  );
}

export default function EditorPage() {
  // Protect this route - redirects to sign-in if not logged in
  const user = useUser({ or: "redirect" });

  const stageRef = useRef<Konva.Stage | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const productImageInputRef = useRef<HTMLInputElement>(null);

  // Get state from store
  const content = useEditorStore((state) => state.content);
  const setContent = useEditorStore((state) => state.setContent);
  const canvas = useEditorStore((state) => state.canvas);
  const setBackgroundColor = useEditorStore((state) => state.setBackgroundColor);
  // NEW: Get visual state from store (per-design isolation)
  const backgroundImageState = useEditorStore((state) => state.backgroundImageState);
  const setBackgroundImageState = useEditorStore((state) => state.setBackgroundImageState);
  const updateBackgroundTransform = useEditorStore((state) => state.updateBackgroundTransform);
  const designOverlay = useEditorStore((state) => state.designOverlay);
  const setDesignOverlay = useEditorStore((state) => state.setDesignOverlay);
  // Product image for Gemini Image-to-Image
  const productImageState = useEditorStore((state) => state.productImageState);
  const setProductImage = useEditorStore((state) => state.setProductImage);
  // Active design ID for background image upload
  const activeDesignId = useEditorStore((state) => state.design.activeDesignId);

  // Initialize manual save with stage reference (no auto-save)
  const { save: saveDesign, isSaving, isDirty } = useSaveDesign({
    stageRef,
  });

  // Warn user about unsaved changes on page leave
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "Du hast ungespeicherte Änderungen. Möchtest du wirklich die Seite verlassen?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);
  const [isClient, setIsClient] = useState(false);
  const [scale, setScale] = useState(1);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null);
  const [logoSize, setLogoSize] = useState({ width: 0, height: 0 });
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);

  // Resolve font family names: next/font/google uses hashed names,
  // Konva canvas needs the actual font-family from CSS variables
  const resolveFont = useCallback((familyName: string): string => {
    if (typeof window === "undefined") return familyName;
    const CSS_VAR_MAP: Record<string, string> = {
      Inter: "--font-inter",
      Poppins: "--font-poppins",
      "Space Grotesk": "--font-space-grotesk",
      "Bebas Neue": "--font-bebas-neue",
      "Playfair Display": "--font-playfair",
      Lora: "--font-lora",
      Oswald: "--font-oswald",
      "Cera Pro": "--font-cera-pro",
    };
    const varName = CSS_VAR_MAP[familyName];
    if (!varName) return familyName;
    const resolved = getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim();
    return resolved || familyName;
  }, []);

  // Local HTMLImageElement loaded from store's backgroundImageState.url
  const [backgroundImage, setBackgroundImage] =
    useState<HTMLImageElement | null>(null);

  // Image generation state
  const [userIdea, setUserIdea] = useState("");
  const [mode, setMode] = useState<"photo" | "illustration">("photo");
  const [selectedPreset, setSelectedPreset] = useState<StylePreset>(
    STYLE_PRESETS[0]
  );
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationLogId, setGenerationLogId] = useState<string | null>(null);


  // Unsplash state
  const [isUnsplashOpen, setIsUnsplashOpen] = useState(false);

  // Profile settings state
  const [isProfileSettingsOpen, setIsProfileSettingsOpen] = useState(false);

  // Profile and asset management
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [isSavingAsset, setIsSavingAsset] = useState(false);

  // Export state
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  // Formatizer state
  const [isFormatizerOpen, setIsFormatizerOpen] = useState(false);

  // Text generation state
  const [textBrief, setTextBrief] = useState("");
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [textGenerationError, setTextGenerationError] = useState<string | null>(null);

  // DERIVED from store: overlay settings
  const overlayType = designOverlay.type;
  const overlayMode = designOverlay.mode;
  const overlayIntensity = designOverlay.intensity;

  // DERIVED from store: background transform
  const bgScale = backgroundImageState?.transform.scale ?? 1;
  const bgPositionX = backgroundImageState?.transform.positionX ?? 0;
  const bgPositionY = backgroundImageState?.transform.positionY ?? 0;
  const bgFlipX = backgroundImageState?.transform.flipX ?? false;

  // DERIVED from store: photo credit
  const photoCredit = backgroundImageState?.credit ?? null;

  // Compute "cover" dimensions: fill canvas while preserving image aspect ratio
  const bgCoverDimensions = useMemo(() => {
    if (!backgroundImage) return { width: CANVAS_WIDTH, height: CANVAS_HEIGHT };
    const imgW = backgroundImage.naturalWidth || backgroundImage.width;
    const imgH = backgroundImage.naturalHeight || backgroundImage.height;
    if (!imgW || !imgH) return { width: CANVAS_WIDTH, height: CANVAS_HEIGHT };

    const canvasRatio = CANVAS_WIDTH / CANVAS_HEIGHT;
    const imgRatio = imgW / imgH;

    // Cover scale: smallest scale that fills the entire canvas
    const coverScale = imgRatio > canvasRatio
      ? CANVAS_HEIGHT / imgH
      : CANVAS_WIDTH / imgW;

    return {
      width: imgW * coverScale * bgScale,
      height: imgH * coverScale * bgScale,
    };
  }, [backgroundImage, bgScale]);

  // Text color based on overlay mode
  const textColor = overlayMode === "darken" ? "#ffffff" : "#111111";
  const buttonTextColor =
    overlayMode === "darken"
      ? backgroundImage
        ? "#000000"
        : canvas.backgroundColor
      : "#ffffff";
  const buttonBgColor = overlayMode === "darken" ? "#ffffff" : "#111111";

  // Get presets for current mode
  const presetsForMode = getPresetsByMode(mode);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load background image from store URL when design changes
  useEffect(() => {
    if (!backgroundImageState?.url) {
      setBackgroundImage(null);
      return;
    }

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = backgroundImageState.url;
    img.onload = () => setBackgroundImage(img);
    img.onerror = () => {
      console.error("Failed to load background image:", backgroundImageState.url);
      setBackgroundImage(null);
    };
  }, [backgroundImageState?.url]);

  // Load or create a default profile on mount
  useEffect(() => {
    const initializeProfile = async () => {
      try {
        const response = await fetch("/api/profiles");
        if (!response.ok) throw new Error("Failed to load profiles");
        const data = await response.json();

        if (data.profiles && data.profiles.length > 0) {
          // Use the most recently updated profile
          setCurrentProfileId(data.profiles[0].id);
        } else {
          // Create a default profile
          const createResponse = await fetch("/api/profiles", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: "Standard",
              logo: "/logos/pixyo.svg",
              colors: {
                dark: "#111111",
                light: "#ffffff",
                accent: "#4f46e5",
              },
              fonts: {
                headline: {
                  family: "Inter",
                  size: 112,
                  weight: "bold",
                  uppercase: false,
                },
                body: {
                  family: "Inter",
                  size: 32,
                  weight: "normal",
                },
              },
              layout: {
                padding: {
                  top: 72,
                  right: 216,
                  bottom: 72,
                  left: 72,
                },
                gaps: {
                  taglineToHeadline: 20,
                  headlineToBody: 24,
                  bodyToButton: 16,
                },
                button: {
                  radius: 16,
                  paddingX: 48,
                  paddingY: 20,
                },
              },
              systemPrompt: "Professional, modern, clean social media graphics",
            }),
          });

          if (createResponse.ok) {
            const newProfile = await createResponse.json();
            setCurrentProfileId(newProfile.profile.id);
          }
        }
      } catch (error) {
        console.error("Failed to initialize profile:", error);
      }
    };

    if (isClient) {
      initializeProfile();
    }
  }, [isClient]);

  // Load logo based on current customer and overlay mode
  useEffect(() => {
    if (!currentCustomer) return;

    // Select appropriate logo variant based on overlay mode
    // Naming: "dark" = logo FOR dark backgrounds (white logo), "light" = logo FOR light backgrounds (black logo)
    // darken mode = dark background = use "dark" variant (white logo)
    // lighten mode = light background = use "light" variant (black logo)
    const logoSrc = overlayMode === "darken"
      ? (currentCustomer.logoVariants?.dark || currentCustomer.logo)
      : (currentCustomer.logoVariants?.light || currentCustomer.logo);

    const img = new window.Image();
    img.src = logoSrc;
    img.onload = () => {
      // Calculate dimensions preserving aspect ratio
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      let width = LOGO_MAX_WIDTH;
      let height = width / aspectRatio;

      // If height exceeds max, scale down
      if (height > LOGO_MAX_HEIGHT) {
        height = LOGO_MAX_HEIGHT;
        width = height * aspectRatio;
      }

      setLogoSize({ width, height });
      setLogoImage(img);
    };
  }, [currentCustomer, overlayMode]);

  // Handle mode change
  const handleModeChange = (newMode: "photo" | "illustration") => {
    setMode(newMode);
    const firstPreset = STYLE_PRESETS.find((p) => p.mode === newMode);
    if (firstPreset) setSelectedPreset(firstPreset);
  };

  // Calculate scale
  const updateStageSize = useCallback(() => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth - 48;
    const containerHeight = containerRef.current.clientHeight - 48;
    const scaleX = containerWidth / CANVAS_WIDTH;
    const scaleY = containerHeight / CANVAS_HEIGHT;
    const newScale = Math.min(scaleX, scaleY, 1);
    setScale(newScale);
    setStageSize({
      width: CANVAS_WIDTH * newScale,
      height: CANVAS_HEIGHT * newScale,
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => updateStageSize(), 100);
    window.addEventListener("resize", updateStageSize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateStageSize);
    };
  }, [updateStageSize]);

  // Generate prompt with Claude
  const handleGeneratePrompt = async () => {
    if (!userIdea.trim()) return;
    setIsGeneratingPrompt(true);
    setGenerationError(null);
    try {
      const response = await fetch("/api/generate-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userIdea: userIdea.trim(),
          styleId: selectedPreset.id,
          mode,
          aspectRatio: "1:1",
        }),
      });
      if (!response.ok) throw new Error("Failed to generate prompt");
      const data = await response.json();
      const enhancedPrompt = `${data.prompt}\n\n${COMPOSITION_DIRECTIVE}`;
      setGeneratedPrompt(enhancedPrompt);
    } catch (error) {
      console.error("Prompt generation error:", error);
      setGenerationError("Prompt-Generierung fehlgeschlagen");
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  // Generate image - NOW SAVES TO STORE for per-design isolation
  const handleGenerateImage = async () => {
    const promptToUse = generatedPrompt || userIdea;
    if (!promptToUse.trim()) return;
    setIsGeneratingImage(true);
    setGenerationError(null);
    const finalPrompt = generatedPrompt
      ? promptToUse
      : `${promptToUse}\n\n${selectedPreset.promptDirectives}\n\n${COMPOSITION_DIRECTIVE}`;
    try {
      // Build request body with optional product image
      const requestBody: {
        prompt: string;
        aspectRatio: string;
        promptSource: "ai-improved" | "user-direct";
        productImage?: { data: string; mimeType: string };
      } = {
        prompt: finalPrompt,
        aspectRatio: "1:1",
        promptSource: generatedPrompt ? "ai-improved" : "user-direct",
      };

      // Include product image if uploaded (for Gemini Image-to-Image)
      if (productImageState) {
        requestBody.productImage = productImageState;
      }

      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) throw new Error("Failed to generate image");
      const data = await response.json();

      // Store generation log ID for download tracking
      if (data.generationLogId) {
        setGenerationLogId(data.generationLogId);
      }

      let imageUrl: string | null = null;
      if (data.imageBase64) {
        imageUrl = `data:image/png;base64,${data.imageBase64}`;
      } else if (data.images && data.images.length > 0) {
        imageUrl = data.images[0].url;
      }

      if (imageUrl) {
        // If we have an active design and the image is base64, upload to Blob first
        let finalUrl = imageUrl;
        if (activeDesignId && imageUrl.startsWith('data:')) {
          try {
            const uploadResponse = await fetch(`/api/designs/${activeDesignId}/background`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                imageData: imageUrl,
                source: 'GENERATED',
              }),
            });
            if (uploadResponse.ok) {
              const uploadData = await uploadResponse.json();
              finalUrl = uploadData.url;
            } else {
              console.warn('Failed to upload to Blob, using data URL as fallback');
            }
          } catch (uploadError) {
            console.warn('Blob upload error, using data URL as fallback:', uploadError);
          }
        }

        // Save to store for per-design isolation
        setBackgroundImageState({
          url: finalUrl,
          source: 'GENERATED',
          transform: { scale: 1, positionX: 0, positionY: 0, flipX: false },
        });
      }
    } catch (error) {
      console.error("Image generation error:", error);
      setGenerationError(
        "Bildgenerierung fehlgeschlagen. Bitte versuche es erneut."
      );
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Handle Unsplash image selection - NOW SAVES TO STORE
  const handleUnsplashSelect = (
    imageUrl: string,
    credit: { name: string; username: string; link: string }
  ) => {
    // Save to store for per-design isolation
    setBackgroundImageState({
      url: imageUrl,
      source: 'UNSPLASH',
      credit,
      transform: { scale: 1, positionX: 0, positionY: 0, flipX: false },
    });
  };

  // Generate text with Claude AI
  const handleGenerateText = async () => {
    if (!textBrief.trim()) return;
    setIsGeneratingText(true);
    setTextGenerationError(null);
    try {
      const response = await fetch("/api/generate-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: textBrief.trim(),
          customerName: currentCustomer?.name,
          systemPrompt: currentCustomer?.systemPrompt,
        }),
      });
      if (!response.ok) throw new Error("Failed to generate text");
      const data = await response.json();

      // Update content with generated text
      setContent({
        tagline: data.tagline,
        headline: data.headline,
        body: data.body,
      });
    } catch (error) {
      console.error("Text generation error:", error);
      setTextGenerationError("Textgenerierung fehlgeschlagen. Bitte versuche es erneut.");
    } finally {
      setIsGeneratingText(false);
    }
  };

  // Handle product image upload for Gemini Image-to-Image
  const handleProductImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setGenerationError('Nur PNG, JPEG oder WebP Bilder erlaubt');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setGenerationError('Bild darf maximal 5MB groß sein');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      // Extract just the base64 data without the data URL prefix
      const base64Data = base64.split(',')[1];
      setProductImage({
        data: base64Data,
        mimeType: file.type,
      });
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be selected again
    event.target.value = '';
  }, [setProductImage]);

  // Clear product image
  const handleClearProductImage = useCallback(() => {
    setProductImage(null);
    if (productImageInputRef.current) {
      productImageInputRef.current.value = '';
    }
  }, [setProductImage]);

  // Save current background image as asset
  const handleSaveAsset = async () => {
    const imageSource = backgroundImageState?.source;
    if (!backgroundImage || !currentProfileId || !imageSource) return;

    setIsSavingAsset(true);
    try {
      const meta: Record<string, any> = {};

      if (imageSource === "GENERATED") {
        meta.prompt = generatedPrompt || userIdea;
        meta.styleId = selectedPreset.id;
      } else if (imageSource === "UNSPLASH" && photoCredit) {
        meta.credit = photoCredit;
      }

      // For generated images, we need to get the base64 data
      let imageData: string | undefined;
      if (
        imageSource === "GENERATED" &&
        backgroundImage.src.startsWith("data:")
      ) {
        imageData = backgroundImage.src;
      }

      const response = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: currentProfileId,
          type: imageSource,
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          meta,
          imageData,
          url:
            imageSource === "UNSPLASH" ? backgroundImage.src : undefined,
        }),
      });

      if (!response.ok) throw new Error("Failed to save asset");

      // Success feedback could be added here (toast notification)
      console.log("Asset saved successfully");
    } catch (error) {
      console.error("Failed to save asset:", error);
    } finally {
      setIsSavingAsset(false);
    }
  };

  // Handle asset selection from library - NOW SAVES TO STORE
  const handleAssetSelect = (
    url: string,
    credit?: { name: string; username: string; link: string }
  ) => {
    // Save to store for per-design isolation
    if (credit) {
      setBackgroundImageState({
        url,
        source: 'UNSPLASH',
        credit,
        transform: { scale: 1, positionX: 0, positionY: 0, flipX: false },
      });
    } else {
      setBackgroundImageState({
        url,
        source: 'GENERATED',
        transform: { scale: 1, positionX: 0, positionY: 0, flipX: false },
      });
    }
  };

  // Export function with format support
  const handleExport = useCallback((format: "jpeg" | "png") => {
    if (!stageRef.current) return;

    const stage = stageRef.current;
    const mimeType = format === "jpeg" ? "image/jpeg" : "image/png";
    const quality = format === "jpeg" ? 0.85 : 1;
    const extension = format === "jpeg" ? "jpg" : "png";

    stage.toBlob({
      mimeType,
      quality,
      pixelRatio: 2, // 2x for Retina = 2400×2400
      callback: (blob: Blob | null) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `social-post-2400x2400.${extension}`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        setExportDropdownOpen(false);

        // Track download (fire-and-forget)
        if (generationLogId) {
          fetch("/api/track-download", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ generationLogId }),
          }).catch((err) => console.error("Download tracking failed:", err));
        }
      }
    });
  }, [generationLogId]);

  // Content area dimensions
  const contentWidth =
    CANVAS_WIDTH - LAYOUT.padding.left - LAYOUT.padding.right;

  // Calculate headline lines using actual text measurement
  const measureTextLines = useCallback((text: string, fontSize: number, maxWidth: number): number => {
    if (typeof window === 'undefined' || !text.trim()) return 1;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 1;

    ctx.font = `bold ${fontSize}px Inter, sans-serif`;

    // Split into words and simulate Konva's word wrap
    const words = text.split(' ');
    let lines = 1;
    let currentLineWidth = 0;
    const spaceWidth = ctx.measureText(' ').width;

    for (const word of words) {
      const wordWidth = ctx.measureText(word).width;

      if (currentLineWidth + wordWidth > maxWidth && currentLineWidth > 0) {
        lines++;
        currentLineWidth = wordWidth + spaceWidth;
      } else {
        currentLineWidth += wordWidth + spaceWidth;
      }
    }

    return lines;
  }, []);

  // Calculate Y positions
  let yPos = 0;
  const taglineY = yPos;
  yPos += LAYOUT.taglineSize * 1.2 + LAYOUT.gapTaglineToHeadline;
  const headlineY = yPos;
  const effectiveHeadlineSize = content.headlineSize ?? LAYOUT.headlineSize;
  const headlineLines = measureTextLines(content.headline, effectiveHeadlineSize, contentWidth);
  const headlineHeight =
    headlineLines * effectiveHeadlineSize * LAYOUT.headlineLineHeight;
  yPos += headlineHeight + LAYOUT.gapHeadlineToBody;
  const bodyY = yPos;
  const hasBody = content.body.trim().length > 0;
  const estimatedBodyLines = Math.ceil(
    (content.body.length * LAYOUT.bodySize * 0.5) / contentWidth
  );
  // Wenn Body leer ist, keine min-height - Button wandert nach oben
  const bodyHeight = hasBody
    ? Math.max(estimatedBodyLines * LAYOUT.bodySize * 1.4, LAYOUT.bodySize * 1.4)
    : 0;
  // Gap nur wenn Body vorhanden
  yPos += bodyHeight + (hasBody ? LAYOUT.gapBodyToButton : 0);
  const buttonY = yPos;

  if (
    !isClient ||
    !Stage ||
    !Layer ||
    !Rect ||
    !Text ||
    !Group ||
    !KonvaImage
  ) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  // Handle customer change to update profile-dependent state
  const handleCustomerChange = (customer: Customer) => {
    setCurrentProfileId(customer.id);
    setCurrentCustomer(customer);
    // Logo will be loaded by the useEffect that depends on currentCustomer
  };

  return (
    <div className="h-screen bg-zinc-950 text-zinc-100 flex flex-col overflow-hidden relative">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-zinc-800/50 flex-shrink-0 relative z-20">
        <div className="flex items-center gap-4">
          <a href="/" className="hover:opacity-80 transition-opacity">
            <img src="/logos/pixyo.svg" alt="Pixyo" className="h-8" />
          </a>
          <div className="h-6 w-px bg-zinc-800" />
          <h1 className="text-sm font-medium text-zinc-300">Social Media Creator</h1>
        </div>

        <a
          href="/"
          className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          Tools
        </a>
      </header>

      {/* Grain overlay for entire editor */}
      <div
        className="absolute inset-0 opacity-[0.012] pointer-events-none z-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Left Panel - Image Generation */}
        <aside className="w-80 bg-zinc-900 border-r border-zinc-800/50 p-4 pt-6 space-y-4 overflow-y-auto relative z-20">
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-800/50">
          <span className="text-xs text-zinc-500 uppercase tracking-wider">Kunde</span>
          <div className="flex items-center gap-1">
            <CustomerSwitcher
              onCustomerChange={handleCustomerChange}
              onSaveBeforeSwitch={saveDesign}
            />
            <button
              onClick={() => setIsProfileSettingsOpen(true)}
              className="p-2 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-all"
              title="Profil-Einstellungen"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* User Idea */}
        <div>
          <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">
            Deine Idee
          </label>
          <textarea
            value={userIdea}
            onChange={(e) => setUserIdea(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded bg-zinc-800/50 backdrop-blur border border-zinc-700/50 text-zinc-100
                       focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/50 text-sm resize-none
                       placeholder:text-zinc-600"
            placeholder="z.B. Ein Koi-Fisch in einem Teich bei Sonnenuntergang..."
          />
        </div>

        {/* Product Image Upload (optional) */}
        <div>
          <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">
            Produktbild (optional)
          </label>
          <input
            ref={productImageInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleProductImageUpload}
            className="hidden"
          />
          {productImageState ? (
            <div className="relative group">
              <div className="w-full aspect-square rounded bg-zinc-800/50 border border-zinc-700/50 overflow-hidden">
                <img
                  src={`data:${productImageState.mimeType};base64,${productImageState.data}`}
                  alt="Produktbild"
                  className="w-full h-full object-contain"
                />
              </div>
              <button
                onClick={handleClearProductImage}
                className="absolute top-2 right-2 p-1.5 rounded bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                title="Produktbild entfernen"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              onClick={() => productImageInputRef.current?.click()}
              className="w-full px-4 py-6 rounded bg-zinc-800/50 border border-dashed border-zinc-700/50
                         text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 transition-all
                         flex flex-col items-center justify-center gap-2"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs">Bild hochladen</span>
              <span className="text-xs text-zinc-600">PNG, JPEG, WebP • max. 5MB</span>
            </button>
          )}
          <p className="mt-1.5 text-xs text-zinc-600">
            Das Produkt wird unten rechts im generierten Bild platziert.
          </p>
        </div>

        {/* Mode Toggle */}
        <div>
          <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">
            Modus
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => handleModeChange("photo")}
              className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-all backdrop-blur
                ${
                  mode === "photo"
                    ? "bg-white/15 text-white border border-white/20"
                    : "bg-zinc-800/50 text-zinc-500 border border-zinc-700/50 hover:bg-zinc-700/50 hover:text-zinc-300"
                }`}
            >
              Foto
            </button>
            <button
              onClick={() => handleModeChange("illustration")}
              className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-all backdrop-blur
                ${
                  mode === "illustration"
                    ? "bg-white/15 text-white border border-white/20"
                    : "bg-zinc-800/50 text-zinc-500 border border-zinc-700/50 hover:bg-zinc-700/50 hover:text-zinc-300"
                }`}
            >
              Illustration
            </button>
          </div>
        </div>

        {/* Style Presets */}
        <div>
          <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">
            Stil
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {presetsForMode.map((preset) => (
              <button
                key={preset.id}
                onClick={() => setSelectedPreset(preset)}
                className={`px-3 py-2 rounded text-xs font-medium transition-all text-left backdrop-blur
                  ${
                    selectedPreset.id === preset.id
                      ? "bg-white/15 text-white border border-white/20"
                      : "bg-zinc-800/50 text-zinc-500 border border-zinc-700/50 hover:bg-zinc-700/50 hover:text-zinc-300"
                  }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Buttons */}
        <Button
          variant="secondary"
          className="w-full"
          onClick={handleGeneratePrompt}
          disabled={!userIdea.trim() || isGeneratingPrompt}
        >
          {isGeneratingPrompt ? "Generiere..." : "Prompt generieren"}
        </Button>

        {generatedPrompt && (
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">
              Generierter Prompt
            </label>
            <textarea
              value={generatedPrompt}
              onChange={(e) => setGeneratedPrompt(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 rounded bg-zinc-800/50 backdrop-blur border border-zinc-700/50 text-zinc-100 
                         focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/50 text-xs resize-none"
            />
          </div>
        )}

        <Button
          variant="primary"
          className="w-full"
          onClick={handleGenerateImage}
          disabled={
            (!userIdea.trim() && !generatedPrompt.trim()) || isGeneratingImage
          }
        >
          {isGeneratingImage ? "Generiere Bild..." : "Bild generieren"}
        </Button>

        {generationError && (
          <p className="text-xs text-red-400/80">{generationError}</p>
        )}
        {backgroundImage && (
          <p className="text-xs text-emerald-400/80">
            ✓ Hintergrundbild geladen
          </p>
        )}

        {/* Fallback Color */}
        {!backgroundImage && (
          <div className="space-y-2 pt-3 border-t border-zinc-800/50">
            <label className="block text-xs text-zinc-500 uppercase tracking-wider">
              Fallback-Farbe
            </label>
            <div className="flex gap-1.5">
              {[
                "#4f46e5",
                "#7c3aed",
                "#db2777",
                "#059669",
                "#d97706",
                "#1e293b",
              ].map((color) => (
                <button
                  key={color}
                  onClick={() => setBackgroundColor(color)}
                  className={`w-7 h-7 rounded border transition-all ${
                    canvas.backgroundColor === color
                      ? "border-white/50 scale-110"
                      : "border-zinc-700/50"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Unsplash Search */}
        <div className="space-y-2 pt-3 border-t border-zinc-800/50">
          <label className="block text-xs text-zinc-500 uppercase tracking-wider">
            Stockfotos
          </label>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => setIsUnsplashOpen(true)}
          >
            <svg
              className="w-4 h-4 mr-2"
              viewBox="0 0 32 32"
              fill="currentColor"
            >
              <path d="M10 9V0H22V9H32V22H22V32H10V22H0V9H10ZM22 22H10V9H22V22Z" />
            </svg>
            Unsplash durchsuchen
          </Button>
          {photoCredit && (
            <p className="text-xs text-zinc-500">
              📷 Foto von{" "}
              <a
                href={photoCredit.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:underline"
              >
                {photoCredit.name}
              </a>
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-3 border-t border-zinc-800/50">
          {backgroundImage && currentProfileId && (
            <Button
              variant="secondary"
              className="w-full text-xs"
              onClick={handleSaveAsset}
              disabled={isSavingAsset}
            >
              {isSavingAsset ? "Speichert..." : "Bild speichern"}
            </Button>
          )}
          <Button
            variant="ghost"
            className="w-full text-xs"
            onClick={() => {
              setBackgroundImageState(null);
            }}
            disabled={!backgroundImage}
          >
            Hintergrundbild entfernen
          </Button>
        </div>

        {/* Meine Bilder - Asset Library */}
        {currentProfileId && (
          <div className="pt-4 border-t border-zinc-800/50">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3 block">
              Meine Bilder
            </label>
            <AssetLibrary
              profileId={currentProfileId}
              onSelectAsset={(url, credit) => {
                // Bild laden
                const img = new window.Image();
                img.crossOrigin = "anonymous";
                img.onload = () => {
                  setBackgroundImage(img);
                  setBackgroundImageState({
                    url,
                    source: credit ? "UNSPLASH" : "GENERATED",
                    credit: credit || undefined,
                    transform: { scale: 1, positionX: 0, positionY: 0, flipX: false },
                  });
                };
                img.src = url;
              }}
            />
          </div>
        )}

        <div className="pt-3 border-t border-zinc-800/50">
          <a
            href="/editor/old"
            className="block text-center text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            → Erweiterter Editor
          </a>
        </div>
      </aside>

      {/* Center Panel - Canvas */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center p-6 bg-zinc-950"
      >
        <div
          className="shadow-2xl rounded-lg overflow-hidden"
          style={{ width: stageSize.width, height: stageSize.height }}
        >
          <Stage
            ref={stageRef}
            width={stageSize.width}
            height={stageSize.height}
            scaleX={scale}
            scaleY={scale}
          >
            <Layer>
              {/* Background */}
              {backgroundImage ? (
                <KonvaImage
                  image={backgroundImage}
                  x={bgFlipX ? CANVAS_WIDTH - bgPositionX : bgPositionX}
                  y={bgPositionY}
                  width={bgCoverDimensions.width}
                  height={bgCoverDimensions.height}
                  scaleX={bgFlipX ? -1 : 1}
                  offsetX={bgFlipX
                    ? -(bgCoverDimensions.width - CANVAS_WIDTH) / 2
                    : (bgCoverDimensions.width - CANVAS_WIDTH) / 2}
                  offsetY={(bgCoverDimensions.height - CANVAS_HEIGHT) / 2}
                />
              ) : (
                <Rect
                  x={0}
                  y={0}
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  fill={canvas.backgroundColor}
                />
              )}

              {/* Dynamic Overlay */}
              <OverlayLayer
                type={overlayType}
                intensity={overlayIntensity}
                mode={overlayMode}
              />

              {/* Content Container — fonts from customer profile */}
              <Group x={LAYOUT.padding.left} y={LAYOUT.padding.top}>
                <Text
                  x={0}
                  y={taglineY}
                  width={contentWidth}
                  text={content.tagline.toUpperCase()}
                  fontFamily={resolveFont(currentCustomer?.fonts?.headline?.family || "Inter")}
                  fontSize={LAYOUT.taglineSize}
                  fontStyle="bold"
                  fill={textColor}
                  opacity={0.9}
                />
                <Text
                  x={0}
                  y={headlineY}
                  width={contentWidth}
                  text={currentCustomer?.fonts?.headline?.uppercase ? content.headline.toUpperCase() : content.headline}
                  fontFamily={resolveFont(currentCustomer?.fonts?.headline?.family || "Inter")}
                  fontSize={effectiveHeadlineSize}
                  fontStyle="bold"
                  fill={textColor}
                  lineHeight={LAYOUT.headlineLineHeight}
                  wrap="word"
                />
                <Text
                  x={0}
                  y={bodyY}
                  width={contentWidth}
                  text={content.body}
                  fontFamily={resolveFont(currentCustomer?.fonts?.body?.family || "Inter")}
                  fontSize={LAYOUT.bodySize}
                  fontStyle="normal"
                  fill={textColor}
                  opacity={0.85}
                  lineHeight={1.5}
                  wrap="word"
                />
                {content.showButton && (
                  <Group x={0} y={buttonY}>
                    <Rect
                      x={0}
                      y={0}
                      width={
                        content.buttonText.length * LAYOUT.buttonSize * 0.7 +
                        LAYOUT.buttonPaddingX * 2
                      }
                      height={LAYOUT.buttonSize + LAYOUT.buttonPaddingY * 2}
                      fill={buttonBgColor}
                      cornerRadius={LAYOUT.buttonRadius}
                    />
                    <Text
                      x={LAYOUT.buttonPaddingX}
                      y={LAYOUT.buttonPaddingY}
                      text={content.buttonText.toUpperCase()}
                      fontFamily={resolveFont(currentCustomer?.fonts?.headline?.family || "Inter")}
                      fontSize={LAYOUT.buttonSize}
                      fontStyle="bold"
                      fill={buttonTextColor}
                    />
                  </Group>
                )}
              </Group>

              {/* Logo */}
              {logoImage && logoSize.width > 0 && (
                <KonvaImage
                  image={logoImage}
                  x={LAYOUT.padding.left}
                  y={CANVAS_HEIGHT - logoSize.height - LAYOUT.padding.bottom}
                  width={logoSize.width}
                  height={logoSize.height}
                />
              )}

              {/* Photo Credit */}
              {photoCredit && (
                <Text
                  x={CANVAS_WIDTH - LAYOUT.padding.right / 2}
                  y={CANVAS_HEIGHT - 32}
                  text={`📷 ${photoCredit.name} / Unsplash`}
                  fontFamily="Inter"
                  fontSize={18}
                  fill={textColor}
                  opacity={0.5}
                  align="right"
                  width={300}
                  offsetX={300}
                />
              )}
            </Layer>
          </Stage>
        </div>
      </div>

      {/* Right Panel - Content & Overlay Controls */}
      <aside className="w-80 bg-zinc-900 border-l border-zinc-800/50 p-4 space-y-4 overflow-y-auto overflow-x-hidden relative z-20">
        {/* Overlay Controls */}
        <div>
          <h3 className="text-xs text-zinc-500 mb-3 uppercase tracking-wider">
            Overlay-Effekt
          </h3>

          {/* Mode Toggle Pills */}
          <div className="flex gap-1 mb-4 p-1 bg-zinc-800/50 rounded-lg">
            <button
              onClick={() => setDesignOverlay({ mode: "darken" })}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all
                ${
                  overlayMode === "darken"
                    ? "bg-zinc-700 text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
            >
              {/* Moon Icon */}
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
              Abdunkeln
            </button>
            <button
              onClick={() => setDesignOverlay({ mode: "lighten" })}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all
                ${
                  overlayMode === "lighten"
                    ? "bg-zinc-700 text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
            >
              {/* Sun Icon */}
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
              Aufhellen
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5 mb-4">
            {OVERLAY_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => setDesignOverlay({ type: preset.id })}
                title={preset.description}
                className={`px-3 py-2 rounded text-xs font-medium transition-all text-left backdrop-blur relative group
                  ${
                    overlayType === preset.id
                      ? "bg-white/15 text-white border border-white/20"
                      : "bg-zinc-800/50 text-zinc-500 border border-zinc-700/50 hover:bg-zinc-700/50 hover:text-zinc-300"
                  }`}
              >
                {preset.label}
                {/* Tooltip */}
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-zinc-800 text-zinc-300 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-zinc-700">
                  {preset.description}
                </span>
              </button>
            ))}
          </div>

          {/* Intensity Slider */}
          {overlayType !== "none" && (
            <div>
              <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
                <span>Intensität</span>
                <span>{Math.round(overlayIntensity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={overlayIntensity}
                onChange={(e) =>
                  setDesignOverlay({ intensity: parseFloat(e.target.value) })
                }
                className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer
                           [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                           [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer
                           [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125"
              />
            </div>
          )}
        </div>

        {/* Background Image Controls */}
        {backgroundImage && (
          <div className="pt-4 border-t border-zinc-800/50">
            <h3 className="text-xs text-zinc-500 mb-3 uppercase tracking-wider">
              Hintergrund-Transformation
            </h3>

            {/* Scale Slider */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
                <span>Skalierung</span>
                <span>{Math.round(bgScale * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.05"
                value={bgScale}
                onChange={(e) => updateBackgroundTransform({ scale: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer
                           [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                           [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer
                           [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125"
              />
            </div>

            {/* Position X Slider */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
                <span>Position X</span>
                <span>{bgPositionX}px</span>
              </div>
              <input
                type="range"
                min={-CANVAS_WIDTH / 2}
                max={CANVAS_WIDTH / 2}
                step="10"
                value={bgPositionX}
                onChange={(e) => updateBackgroundTransform({ positionX: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer
                           [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                           [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer
                           [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125"
              />
            </div>

            {/* Position Y Slider */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
                <span>Position Y</span>
                <span>{bgPositionY}px</span>
              </div>
              <input
                type="range"
                min={-CANVAS_HEIGHT / 2}
                max={CANVAS_HEIGHT / 2}
                step="10"
                value={bgPositionY}
                onChange={(e) => updateBackgroundTransform({ positionY: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer
                           [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                           [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer
                           [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125"
              />
            </div>

            {/* Flip Button */}
            <button
              onClick={() => updateBackgroundTransform({ flipX: !bgFlipX })}
              className={`w-full px-3 py-1.5 mb-2 rounded text-xs font-medium transition-all backdrop-blur flex items-center justify-center gap-2
                ${bgFlipX
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-700/50 hover:text-zinc-300'
                }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Horizontal spiegeln
            </button>

            {/* Reset Button */}
            <button
              onClick={() => {
                updateBackgroundTransform({
                  scale: 1,
                  positionX: 0,
                  positionY: 0,
                  flipX: false,
                });
              }}
              className="w-full px-3 py-1.5 rounded text-xs font-medium transition-all backdrop-blur
                bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-700/50 hover:text-zinc-300"
            >
              Zurücksetzen
            </button>
          </div>
        )}

        {/* AI Text Generator */}
        <div className="pt-4 border-t border-zinc-800/50">
          <h3 className="text-xs text-zinc-500 mb-3 uppercase tracking-wider flex items-center gap-2">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
            </svg>
            KI-Textgenerator
          </h3>
          <div className="space-y-2">
            <textarea
              value={textBrief}
              onChange={(e) => setTextBrief(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded bg-zinc-800/50 backdrop-blur border border-zinc-700/50 text-zinc-100
                         focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/50 text-sm resize-none
                         placeholder:text-zinc-600"
              placeholder="Beschreibe kurz deine Grafik, z.B. 'Neue Sommerkollektion, Sale 30%'"
            />
            <button
              onClick={handleGenerateText}
              disabled={!textBrief.trim() || isGeneratingText}
              className="w-full px-3 py-2 rounded text-sm font-medium transition-all backdrop-blur
                bg-gradient-to-r from-violet-600 to-indigo-600 text-white border border-violet-500/30
                hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2"
            >
              {isGeneratingText ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generiere...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                  Texte generieren
                </>
              )}
            </button>
            {textGenerationError && (
              <p className="text-xs text-red-400/80">{textGenerationError}</p>
            )}
          </div>
        </div>

        {/* Content Controls */}
        <div className="pt-4 border-t border-zinc-800/50">
          <h3 className="text-xs text-zinc-500 mb-3 uppercase tracking-wider">
            Inhalte
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">
                Tagline
              </label>
              <input
                type="text"
                value={content.tagline}
                onChange={(e) =>
                  setContent({ tagline: e.target.value })
                }
                className="w-full px-3 py-2 rounded bg-zinc-800/50 backdrop-blur border border-zinc-700/50 text-zinc-100
                           focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/50 text-sm"
                placeholder="z.B. JETZT NEU"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">
                Überschrift
              </label>
              <textarea
                value={content.headline}
                onChange={(e) =>
                  setContent({ headline: e.target.value })
                }
                rows={2}
                className="w-full px-3 py-2 rounded bg-zinc-800/50 backdrop-blur border border-zinc-700/50 text-zinc-100
                           focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/50 text-sm resize-none"
                placeholder="Deine Hauptüberschrift"
              />
              {/* Headline font size slider */}
              <div className="mt-2">
                <div className="flex justify-between text-xs text-zinc-500 mb-1">
                  <span>Schriftgröße</span>
                  <span>{content.headlineSize ?? LAYOUT.headlineSize}px</span>
                </div>
                <input
                  type="range"
                  min="48"
                  max="160"
                  step="2"
                  value={content.headlineSize ?? LAYOUT.headlineSize}
                  onChange={(e) => setContent({ headlineSize: Number(e.target.value) })}
                  className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer
                             [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                             [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer
                             [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">
                Fließtext
              </label>
              <textarea
                value={content.body}
                onChange={(e) =>
                  setContent({ body: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 rounded bg-zinc-800/50 backdrop-blur border border-zinc-700/50 text-zinc-100 
                           focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/50 text-sm resize-none"
                placeholder="Dein Beschreibungstext..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs text-zinc-500 uppercase tracking-wider">
                  CTA-Button
                </label>
                <button
                  onClick={() => setContent({ showButton: !content.showButton })}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    content.showButton ? 'bg-emerald-500' : 'bg-zinc-700'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      content.showButton ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>
              {content.showButton && (
                <input
                  type="text"
                  value={content.buttonText}
                  onChange={(e) =>
                    setContent({ buttonText: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded bg-zinc-800/50 backdrop-blur border border-zinc-700/50 text-zinc-100
                             focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/50 text-sm"
                  placeholder="z.B. MEHR ERFAHREN"
                />
              )}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-zinc-800/50">
          <button
            onClick={() => saveDesign()}
            disabled={!isDirty || isSaving}
            className={`w-full px-4 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2
              ${isDirty
                ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }
              ${isSaving ? 'opacity-75' : ''}
            `}
          >
            {isSaving ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Speichern...
              </>
            ) : isDirty ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Speichern
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Gespeichert
              </>
            )}
          </button>
        </div>

        {/* Export Split-Button */}
        <div className="pt-4 border-t border-zinc-800/50">
          <div className="relative">
            <div className="flex">
              {/* Main Export Button (JPEG) */}
              <button
                onClick={() => handleExport("jpeg")}
                className="flex-1 px-4 py-2.5 rounded-l-lg bg-white text-zinc-900 font-medium text-sm
                           hover:bg-zinc-100 transition-colors"
              >
                Exportieren
              </button>
              {/* Dropdown Toggle */}
              <button
                onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                className="px-3 py-2.5 rounded-r-lg bg-white text-zinc-900 border-l border-zinc-200
                           hover:bg-zinc-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Dropdown Menu */}
            {exportDropdownOpen && (
              <>
                {/* Backdrop to close dropdown */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setExportDropdownOpen(false)}
                />
                <div className="absolute bottom-full left-0 right-0 mb-1 bg-zinc-800 rounded-lg border border-zinc-700 overflow-hidden shadow-xl z-50">
                  <button
                    onClick={() => handleExport("jpeg")}
                    className="w-full px-4 py-2.5 text-left text-sm text-zinc-100 hover:bg-zinc-700 transition-colors flex items-center justify-between"
                  >
                    <span>JPEG</span>
                    <span className="text-xs text-zinc-500">~200-500 KB</span>
                  </button>
                  <button
                    onClick={() => handleExport("png")}
                    className="w-full px-4 py-2.5 text-left text-sm text-zinc-100 hover:bg-zinc-700 transition-colors flex items-center justify-between border-t border-zinc-700"
                  >
                    <span>PNG</span>
                    <span className="text-xs text-zinc-500">~1-2 MB</span>
                  </button>
                </div>
              </>
            )}
          </div>
          <p className="text-xs text-zinc-600 mt-2 text-center">
            2400 × 2400 px (Retina)
          </p>
          {/* Formatizer: Export all formats */}
          <button
            onClick={() => setIsFormatizerOpen(true)}
            className="w-full mt-3 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-sm
                       font-medium hover:bg-zinc-700 transition-colors border border-zinc-700/50
                       flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            Alle Formate exportieren
          </button>
        </div>
      </aside>
      </div>

      {/* Design Thumbnails - Bottom Bar */}
      <div className="bg-zinc-900 flex">
        {/* Linker Spacer mit System Status */}
        <div className="w-80 flex-shrink-0 flex items-center pl-4">
          <SystemStatus />
        </div>
        {/* Thumbnails in der Mitte */}
        <div className="flex-1">
          <DesignThumbnails />
        </div>
        {/* Rechter Spacer (gleiche Breite wie rechtes Panel) */}
        <div className="w-80 flex-shrink-0" />
      </div>

      {/* Unsplash Search Modal */}
      <UnsplashSearch
        isOpen={isUnsplashOpen}
        onClose={() => setIsUnsplashOpen(false)}
        onSelectImage={handleUnsplashSelect}
      />

      {/* Profile Settings Modal */}
      <ProfileSettings
        isOpen={isProfileSettingsOpen}
        onClose={() => setIsProfileSettingsOpen(false)}
        currentProfileId={currentProfileId}
        onProfileChange={setCurrentProfileId}
      />

      {/* Formatizer Modal */}
      <FormatizerModal
        isOpen={isFormatizerOpen}
        onClose={() => setIsFormatizerOpen(false)}
        currentCustomer={currentCustomer}
      />

    </div>
  );
}
