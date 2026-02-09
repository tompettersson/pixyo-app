import { NextResponse } from "next/server";
import { stackServerApp } from "@/lib/stack";

// Tool IDs matching the homepage tool cards
export type ToolId = "social-graphics" | "product-scenes" | "banner-konfigurator";

// Map API route names to their parent tool
const TOOL_ROUTES: Record<string, ToolId> = {
  // Product Scenes
  "analyze-product": "product-scenes",
  "generate-product-scene": "product-scenes",
  "generate-product-scene-vertex": "product-scenes",
  "generate-background": "product-scenes",
  "harmonize-composite": "product-scenes",
  "generate-scene-prompts": "product-scenes",
  // Social Graphics
  "generate-prompt": "social-graphics",
  "generate-image": "social-graphics",
  "generate-text": "social-graphics",
};

// Server metadata shape from Stack Auth
export interface UserServerMetadata {
  allowedTools?: ToolId[];
  role?: "admin" | "user";
}

/**
 * Check if a user has access to a specific tool.
 * No metadata = full access (backwards compatibility for existing users like Tom).
 */
export function hasToolAccess(
  serverMetadata: UserServerMetadata | null | undefined,
  toolId: ToolId
): boolean {
  // No metadata → allow everything (backwards compat)
  if (!serverMetadata || !serverMetadata.allowedTools) {
    return true;
  }
  return serverMetadata.allowedTools.includes(toolId);
}

/**
 * Check if a user is admin.
 */
export function isAdmin(
  serverMetadata: UserServerMetadata | null | undefined
): boolean {
  return serverMetadata?.role === "admin";
}

/**
 * Get the tool ID for a given API route name.
 */
export function getToolForRoute(routeName: string): ToolId | null {
  return TOOL_ROUTES[routeName] ?? null;
}

/**
 * Auth + tool permission check for API routes.
 * Returns the authenticated user or an error response.
 */
export async function requireAuthForRoute(
  routeName: string
): Promise<{
  user: { id: string; primaryEmail: string | null };
  error?: undefined;
} | {
  user?: undefined;
  error: NextResponse;
}> {
  // Get current user from Stack Auth
  const user = await stackServerApp.getUser();

  if (!user) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized", message: "Nicht angemeldet", code: "UNAUTHORIZED" },
        { status: 401 }
      ),
    };
  }

  // Check tool permission
  const toolId = getToolForRoute(routeName);
  if (toolId) {
    const serverMetadata = user.serverMetadata as UserServerMetadata | null;
    if (!hasToolAccess(serverMetadata, toolId)) {
      return {
        error: NextResponse.json(
          {
            error: "Forbidden",
            message: "Kein Zugang zu diesem Tool",
            code: "FORBIDDEN",
          },
          { status: 403 }
        ),
      };
    }
  }

  return {
    user: {
      id: user.id,
      primaryEmail: user.primaryEmail,
    },
  };
}
