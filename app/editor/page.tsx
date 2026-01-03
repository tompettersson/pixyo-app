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
import { AssetLibrary } from "@/components/editor/AssetLibrary";
import { ProfileSettings } from "@/components/editor/ProfileSettings";
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

// Logo dimensions
const LOGO_WIDTH = CANVAS_WIDTH * 0.375;
const LOGO_ASPECT_RATIO = 306 / 102;
const LOGO_HEIGHT = LOGO_WIDTH / LOGO_ASPECT_RATIO;

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

  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [scale, setScale] = useState(1);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null);
  const [backgroundImage, setBackgroundImage] =
    useState<HTMLImageElement | null>(null);

  // Content state
  const [content, setContent] = useState<TemplateContent>({
    tagline: "JETZT NEU",
    headline: "Deine große Überschrift hier",
    body: "Hier kommt dein Fließtext. Er kann mehrere Zeilen umfassen und wird automatisch umgebrochen.",
    buttonText: "MEHR ERFAHREN",
  });

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

  // Fallback background color
  const [bgColor, setBgColor] = useState("#4f46e5");

  // Unsplash state
  const [isUnsplashOpen, setIsUnsplashOpen] = useState(false);
  const [photoCredit, setPhotoCredit] = useState<{
    name: string;
    username: string;
    link: string;
  } | null>(null);

  // Profile settings state
  const [isProfileSettingsOpen, setIsProfileSettingsOpen] = useState(false);

  // Overlay state
  const [overlayType, setOverlayType] = useState<OverlayType>("gradient");
  const [overlayMode, setOverlayMode] = useState<OverlayMode>("darken");
  const [overlayIntensity, setOverlayIntensity] = useState(0.7);

  // Background image transformation state
  const [bgScale, setBgScale] = useState(1);
  const [bgPositionX, setBgPositionX] = useState(0);
  const [bgPositionY, setBgPositionY] = useState(0);

  // Profile and asset management
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [isSavingAsset, setIsSavingAsset] = useState(false);
  const [currentImageSource, setCurrentImageSource] = useState<
    "GENERATED" | "UNSPLASH" | null
  >(null);

  // Text color based on overlay mode
  const textColor = overlayMode === "darken" ? "#ffffff" : "#111111";
  const buttonTextColor =
    overlayMode === "darken"
      ? backgroundImage
        ? "#000000"
        : bgColor
      : "#ffffff";
  const buttonBgColor = overlayMode === "darken" ? "#ffffff" : "#111111";

  // Get presets for current mode
  const presetsForMode = getPresetsByMode(mode);

  useEffect(() => {
    setIsClient(true);
  }, []);

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

  // Load logo based on overlay mode
  useEffect(() => {
    const img = new window.Image();
    img.src =
      overlayMode === "darken"
        ? "/logos/HanakoKoiLogo-white.svg"
        : "/logos/HanakoKoiLogo-black.svg";
    img.onload = () => setLogoImage(img);
  }, [overlayMode]);

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

  // Generate image
  const handleGenerateImage = async () => {
    const promptToUse = generatedPrompt || userIdea;
    if (!promptToUse.trim()) return;
    setIsGeneratingImage(true);
    setGenerationError(null);
    const finalPrompt = generatedPrompt
      ? promptToUse
      : `${promptToUse}\n\n${selectedPreset.promptDirectives}\n\n${COMPOSITION_DIRECTIVE}`;
    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: finalPrompt, aspectRatio: "1:1" }),
      });
      if (!response.ok) throw new Error("Failed to generate image");
      const data = await response.json();
      if (data.imageBase64) {
        const img = new window.Image();
        img.src = `data:image/png;base64,${data.imageBase64}`;
        img.onload = () => {
          setBackgroundImage(img);
          setPhotoCredit(null);
          setCurrentImageSource("GENERATED");
        };
      } else if (data.images && data.images.length > 0) {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.src = data.images[0].url;
        img.onload = () => {
          setBackgroundImage(img);
          setPhotoCredit(null);
          setCurrentImageSource("GENERATED");
        };
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

  // Handle Unsplash image selection
  const handleUnsplashSelect = (
    imageUrl: string,
    credit: { name: string; username: string; link: string }
  ) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      setBackgroundImage(img);
      setPhotoCredit(credit);
      setCurrentImageSource("UNSPLASH");
    };
  };

  // Save current background image as asset
  const handleSaveAsset = async () => {
    if (!backgroundImage || !currentProfileId || !currentImageSource) return;

    setIsSavingAsset(true);
    try {
      const meta: Record<string, any> = {};

      if (currentImageSource === "GENERATED") {
        meta.prompt = generatedPrompt || userIdea;
        meta.styleId = selectedPreset.id;
      } else if (currentImageSource === "UNSPLASH" && photoCredit) {
        meta.credit = photoCredit;
      }

      // For generated images, we need to get the base64 data
      let imageData: string | undefined;
      if (
        currentImageSource === "GENERATED" &&
        backgroundImage.src.startsWith("data:")
      ) {
        imageData = backgroundImage.src;
      }

      const response = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: currentProfileId,
          type: currentImageSource,
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          meta,
          imageData,
          url:
            currentImageSource === "UNSPLASH" ? backgroundImage.src : undefined,
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

  // Handle asset selection from library
  const handleAssetSelect = (
    url: string,
    credit?: { name: string; username: string; link: string }
  ) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    img.onload = () => {
      setBackgroundImage(img);
      if (credit) {
        setPhotoCredit(credit);
        setCurrentImageSource("UNSPLASH");
      } else {
        setPhotoCredit(null);
        setCurrentImageSource("GENERATED");
      }
    };
  };

  // Export function
  const handleExport = async () => {
    if (!stageRef.current) return;
    const dataUrl = stageRef.current.toDataURL({ pixelRatio: 2 });
    const link = document.createElement("a");
    link.download = "social-post.png";
    link.href = dataUrl;
    link.click();
  };

  // Content area dimensions
  const contentWidth =
    CANVAS_WIDTH - LAYOUT.padding.left - LAYOUT.padding.right;

  // Calculate Y positions
  let yPos = 0;
  const taglineY = yPos;
  yPos += LAYOUT.taglineSize * 1.2 + LAYOUT.gapTaglineToHeadline;
  const headlineY = yPos;
  const avgCharWidth = LAYOUT.headlineSize * 0.55;
  const charsPerLine = Math.floor(contentWidth / avgCharWidth);
  const estimatedHeadlineLines = Math.max(
    1,
    Math.ceil(content.headline.length / charsPerLine)
  );
  const headlineHeight =
    estimatedHeadlineLines * LAYOUT.headlineSize * LAYOUT.headlineLineHeight;
  yPos += headlineHeight + LAYOUT.gapHeadlineToBody;
  const bodyY = yPos;
  const estimatedBodyLines = Math.ceil(
    (content.body.length * LAYOUT.bodySize * 0.5) / contentWidth
  );
  const bodyHeight = Math.max(
    estimatedBodyLines * LAYOUT.bodySize * 1.4,
    LAYOUT.bodySize * 1.4 * 3
  );
  yPos += bodyHeight + LAYOUT.gapBodyToButton;
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

  return (
    <div className="h-screen bg-zinc-950 text-zinc-100 flex overflow-hidden relative">
      {/* Grain overlay for entire editor */}
      <div
        className="absolute inset-0 opacity-[0.012] pointer-events-none z-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Left Panel - Image Generation */}
      <aside className="w-80 bg-zinc-900/80 backdrop-blur-xl border-r border-zinc-800/50 p-4 space-y-4 overflow-y-auto relative z-10">
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-800/50">
          <img src="/logos/pixyo.svg" alt="Pixyo" className="h-8" />
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
                  onClick={() => setBgColor(color)}
                  className={`w-7 h-7 rounded border transition-all ${
                    bgColor === color
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
              setBackgroundImage(null);
              setPhotoCredit(null);
              setCurrentImageSource(null);
            }}
            disabled={!backgroundImage}
          >
            Hintergrundbild entfernen
          </Button>
        </div>

        {/* Asset Library */}
        {currentProfileId && (
          <div className="pt-3 border-t border-zinc-800/50">
            <AssetLibrary
              profileId={currentProfileId}
              onSelectAsset={handleAssetSelect}
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
                  x={bgPositionX}
                  y={bgPositionY}
                  width={CANVAS_WIDTH * bgScale}
                  height={CANVAS_HEIGHT * bgScale}
                  offsetX={(CANVAS_WIDTH * bgScale - CANVAS_WIDTH) / 2}
                  offsetY={(CANVAS_HEIGHT * bgScale - CANVAS_HEIGHT) / 2}
                />
              ) : (
                <Rect
                  x={0}
                  y={0}
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  fill={bgColor}
                />
              )}

              {/* Dynamic Overlay */}
              <OverlayLayer
                type={overlayType}
                intensity={overlayIntensity}
                mode={overlayMode}
              />

              {/* Content Container */}
              <Group x={LAYOUT.padding.left} y={LAYOUT.padding.top}>
                <Text
                  x={0}
                  y={taglineY}
                  width={contentWidth}
                  text={content.tagline.toUpperCase()}
                  fontFamily="Inter"
                  fontSize={LAYOUT.taglineSize}
                  fontStyle="bold"
                  fill={textColor}
                  opacity={0.9}
                />
                <Text
                  x={0}
                  y={headlineY}
                  width={contentWidth}
                  text={content.headline}
                  fontFamily="Inter"
                  fontSize={LAYOUT.headlineSize}
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
                  fontFamily="Inter"
                  fontSize={LAYOUT.bodySize}
                  fontStyle="normal"
                  fill={textColor}
                  opacity={0.85}
                  lineHeight={1.5}
                  wrap="word"
                />
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
                    fontFamily="Inter"
                    fontSize={LAYOUT.buttonSize}
                    fontStyle="bold"
                    fill={buttonTextColor}
                  />
                </Group>
              </Group>

              {/* Logo */}
              {logoImage && (
                <KonvaImage
                  image={logoImage}
                  x={LAYOUT.padding.left}
                  y={CANVAS_HEIGHT - LOGO_HEIGHT - LAYOUT.padding.bottom}
                  width={LOGO_WIDTH}
                  height={LOGO_HEIGHT}
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
      <aside className="w-80 bg-zinc-900/80 backdrop-blur-xl border-l border-zinc-800/50 p-4 space-y-4 overflow-y-auto relative z-10">
        {/* Overlay Controls */}
        <div>
          <h3 className="text-xs text-zinc-500 mb-3 uppercase tracking-wider">
            Overlay-Effekt
          </h3>

          {/* Mode Toggle Pills */}
          <div className="flex gap-1 mb-4 p-1 bg-zinc-800/50 rounded-lg">
            <button
              onClick={() => setOverlayMode("darken")}
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
              onClick={() => setOverlayMode("lighten")}
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
                onClick={() => setOverlayType(preset.id)}
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
                  setOverlayIntensity(parseFloat(e.target.value))
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
                onChange={(e) => setBgScale(parseFloat(e.target.value))}
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
                onChange={(e) => setBgPositionX(parseFloat(e.target.value))}
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
                onChange={(e) => setBgPositionY(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer
                           [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                           [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer
                           [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125"
              />
            </div>

            {/* Reset Button */}
            <button
              onClick={() => {
                setBgScale(1);
                setBgPositionX(0);
                setBgPositionY(0);
              }}
              className="w-full px-3 py-1.5 rounded text-xs font-medium transition-all backdrop-blur
                bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-700/50 hover:text-zinc-300"
            >
              Zurücksetzen
            </button>
          </div>
        )}

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
                  setContent({ ...content, tagline: e.target.value })
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
                  setContent({ ...content, headline: e.target.value })
                }
                rows={2}
                className="w-full px-3 py-2 rounded bg-zinc-800/50 backdrop-blur border border-zinc-700/50 text-zinc-100 
                           focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/50 text-sm resize-none"
                placeholder="Deine Hauptüberschrift"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">
                Fließtext
              </label>
              <textarea
                value={content.body}
                onChange={(e) =>
                  setContent({ ...content, body: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 rounded bg-zinc-800/50 backdrop-blur border border-zinc-700/50 text-zinc-100 
                           focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/50 text-sm resize-none"
                placeholder="Dein Beschreibungstext..."
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">
                Button-Text
              </label>
              <input
                type="text"
                value={content.buttonText}
                onChange={(e) =>
                  setContent({ ...content, buttonText: e.target.value })
                }
                className="w-full px-3 py-2 rounded bg-zinc-800/50 backdrop-blur border border-zinc-700/50 text-zinc-100 
                           focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/50 text-sm"
                placeholder="z.B. MEHR ERFAHREN"
              />
            </div>
          </div>
        </div>

        {/* Export */}
        <div className="pt-4 border-t border-zinc-800/50">
          <Button variant="primary" className="w-full" onClick={handleExport}>
            Export PNG
          </Button>
          <p className="text-xs text-zinc-600 mt-2 text-center">
            2160 × 2160 px
          </p>
        </div>
      </aside>

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
    </div>
  );
}
