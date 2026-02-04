import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerEnv } from "@/lib/env";
import { requireAuthForRoute } from "@/lib/permissions";
import { logUsage } from "@/lib/usage";
import { AI_COSTS_EUR, AI_MODELS } from "@/lib/costs";
import type { ApiError } from "@/types/api";

// Request validation schema
const requestSchema = z.object({
  productImage: z.object({
    data: z.string(), // Base64 encoded image data
    mimeType: z.string(),
  }),
});

// Analysis prompt for Gemini - SIMPLIFIED
// Focus on: focal length, product type, and scene suggestions
// The AI will see the actual product in the layout image for perspective matching
const ANALYSIS_PROMPT = `Analysiere dieses Produktbild für einen Hintergrund-Generator.

WICHTIG: Gib NUR ein valides JSON-Objekt zurück, keine Erklärungen.

## WAS WIR BRAUCHEN:

1. **BRENNWEITE** (wichtig für Hintergrund-Perspektive)
   - Schätze die verwendete Brennweite (35mm-Äquivalent)
   - Typisch für Produktfotos: 50-100mm
   - Starke Kompression = längere Brennweite (85-135mm)
   - Weiter Look = kürzere Brennweite (35-50mm)

2. **PRODUKTTYP** (für Szenen-Vorschläge)
   - Erkenne das Produkt SPEZIFISCH:
     - Audio: Subwoofer, Standlautsprecher, Regallautsprecher, Soundbar, Kopfhörer
     - Elektronik: TV, Monitor, Laptop
     - Küche: Kaffeemaschine, Mixer, Toaster
   - Erkenne die MARKE wenn sichtbar (Canton, Bose, Sony, etc.)

3. **PLATZIERUNG** (wo steht das Produkt typischerweise?)
   - floor = Boden (Subwoofer, Standlautsprecher)
   - table_height = Tisch/Schreibtisch
   - shelf = Regal
   - counter = Arbeitsplatte (Küchengeräte)

4. **PASSENDE RÄUME** (für Szenen-Vorschläge)
   - Welche Räume passen zum Produkt?
   - Deutsch und Englisch angeben

Antworte mit diesem VEREINFACHTEN JSON-Schema:
{
  "analysis_version": "1.0",
  "confidence_overall": "<low|medium|high>",
  "camera": {
    "focal_length": {
      "estimated_mm": <number 24-200>,
      "category": "<wide|normal|light_telephoto|telephoto>",
      "confidence": "<low|medium|high>"
    }
  },
  "product": {
    "category": "<audio|electronics|kitchen|furniture|fashion|sports|other>",
    "type": "<englisch, z.B. 'subwoofer', 'floor_standing_speaker'>",
    "type_german": "<deutsch, z.B. 'Subwoofer', 'Standlautsprecher'>",
    "brand": "<erkannte Marke oder 'unknown'>"
  },
  "placement": {
    "vertical_position": "<floor|low_furniture|table_height|shelf|counter|wall_mounted>",
    "surface_type": "<hardwood_floor|carpet|wood_furniture|glass|etc>"
  },
  "environment": {
    "primary_rooms": ["<englisch>"],
    "primary_rooms_german": ["<deutsch>"],
    "outdoor_suitable": <boolean>
  }
}`;

// Response type for the analysis - SIMPLIFIED
export interface ProductAnalysis {
  analysis_version: string;
  confidence_overall: "low" | "medium" | "high";
  camera: {
    focal_length: {
      estimated_mm: number;
      category: "wide" | "normal" | "light_telephoto" | "telephoto";
      confidence: "low" | "medium" | "high";
    };
  };
  product: {
    category: string;
    type: string;
    type_german: string;
    brand?: string;
  };
  placement: {
    vertical_position: "floor" | "low_furniture" | "table_height" | "shelf" | "counter" | "wall_mounted";
    surface_type: string;
  };
  environment: {
    primary_rooms: string[];
    primary_rooms_german: string[];
    outdoor_suitable: boolean;
  };
}

// Mock response for development (Subwoofer example)
function getMockAnalysis(): ProductAnalysis {
  return {
    analysis_version: "1.0",
    confidence_overall: "high",
    camera: {
      focal_length: {
        estimated_mm: 70,
        category: "normal",
        confidence: "high",
      },
    },
    product: {
      category: "audio",
      type: "subwoofer",
      type_german: "Subwoofer",
      brand: "Canton",
    },
    placement: {
      vertical_position: "floor",
      surface_type: "hardwood_floor",
    },
    environment: {
      primary_rooms: ["living_room", "home_theater"],
      primary_rooms_german: ["Wohnzimmer", "Heimkino"],
      outdoor_suitable: false,
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    // Auth + tool permission check
    const auth = await requireAuthForRoute("analyze-product");
    if (auth.error) return auth.error;

    // Parse and validate request body
    const body = await request.json();
    const validationResult = requestSchema.safeParse(body);

    if (!validationResult.success) {
      const error: ApiError = {
        error: "Validation Error",
        message: validationResult.error.issues.map((e) => e.message).join(", "),
        code: "VALIDATION_ERROR",
      };
      return NextResponse.json(error, { status: 400 });
    }

    const { productImage } = validationResult.data;

    // Check for mock mode or missing API key
    const isMockMode =
      process.env.NEXT_PUBLIC_MOCK_AI === "true" || !process.env.GOOGLE_API_KEY;

    if (isMockMode) {
      // Simulate API delay
      await new Promise((r) => setTimeout(r, 1500));
      return NextResponse.json({ analysis: getMockAnalysis() });
    }

    const env = getServerEnv();
    // Use Gemini Flash for faster analysis (it's a text extraction task)
    const model = "gemini-2.0-flash";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GOOGLE_API_KEY}`;

    console.log("Analyzing product image...");

    // Build the request
    const requestBody = {
      contents: [
        {
          parts: [
            { text: ANALYSIS_PROMPT },
            {
              inline_data: {
                mime_type: productImage.mimeType,
                data: productImage.data,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1, // Low temperature for consistent JSON output
        maxOutputTokens: 2048,
      },
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      throw new Error(`API request failed: ${response.status}`);
    }

    const result = await response.json();

    // Extract text from response
    let analysisText: string | null = null;

    if (result.candidates && result.candidates.length > 0) {
      const candidate = result.candidates[0];
      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if (part.text) {
            analysisText = part.text;
            break;
          }
        }
      }
    }

    if (!analysisText) {
      console.warn("No analysis text in response:", JSON.stringify(result, null, 2));
      throw new Error("Keine Analyse-Daten in der Antwort erhalten");
    }

    // Parse JSON from response (handle potential markdown code blocks)
    let analysis: ProductAnalysis;
    try {
      // Remove markdown code blocks if present
      let jsonStr = analysisText.trim();
      if (jsonStr.startsWith("```json")) {
        jsonStr = jsonStr.slice(7);
      } else if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.slice(3);
      }
      if (jsonStr.endsWith("```")) {
        jsonStr = jsonStr.slice(0, -3);
      }
      jsonStr = jsonStr.trim();

      analysis = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse analysis JSON:", analysisText);
      throw new Error("Analyse-Antwort konnte nicht geparst werden");
    }

    console.log("Product analysis complete:", analysis.product.type_german);

    // Log usage (fire-and-forget)
    logUsage({
      userId: auth.user.id,
      userEmail: auth.user.primaryEmail ?? "unknown",
      operation: "analyze-product",
      costEur: AI_COSTS_EUR["analyze-product"],
      model: AI_MODELS["analyze-product"],
    });

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Analyze product error:", error);

    const apiError: ApiError = {
      error: "Internal Server Error",
      message:
        error instanceof Error
          ? error.message
          : "Produktanalyse fehlgeschlagen",
      code: "INTERNAL_ERROR",
    };

    return NextResponse.json(apiError, { status: 500 });
  }
}
