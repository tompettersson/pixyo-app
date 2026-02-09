import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/lib/stack";
import { isAdmin, type UserServerMetadata } from "@/lib/permissions";
import { prisma } from "@/lib/db";

/**
 * GET /api/admin/generations?from=2025-01-01&to=2025-02-01&tool=social-graphics
 * Admin-only endpoint: returns GenerationLog aggregations and recent entries.
 */
export async function GET(request: NextRequest) {
  try {
    // Auth check
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Nicht angemeldet" },
        { status: 401 }
      );
    }

    // Admin check
    const serverMetadata = user.serverMetadata as UserServerMetadata | null;
    if (!isAdmin(serverMetadata)) {
      return NextResponse.json(
        { error: "Forbidden", message: "Nur für Admins" },
        { status: 403 }
      );
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");
    const toolParam = searchParams.get("tool");

    // Default: current month
    const now = new Date();
    const from = fromParam
      ? new Date(fromParam)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const to = toParam
      ? new Date(toParam)
      : new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Build filter
    const where: Record<string, unknown> = {
      createdAt: {
        gte: from,
        lt: to,
      },
    };
    if (toolParam) {
      where.tool = toolParam;
    }

    // Fetch all matching logs
    const logs = await prisma.generationLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // --- Aggregation ---
    const totalGenerations = logs.length;
    const totalDownloads = logs.filter((l) => l.downloaded).length;
    const downloadRate =
      totalGenerations > 0
        ? Math.round((totalDownloads / totalGenerations) * 1000) / 10
        : 0;

    // By tool
    const byTool: Record<
      string,
      { generations: number; downloads: number; rate: number }
    > = {};
    for (const log of logs) {
      if (!byTool[log.tool]) {
        byTool[log.tool] = { generations: 0, downloads: 0, rate: 0 };
      }
      byTool[log.tool].generations += 1;
      if (log.downloaded) {
        byTool[log.tool].downloads += 1;
      }
    }
    for (const key of Object.keys(byTool)) {
      const entry = byTool[key];
      entry.rate =
        entry.generations > 0
          ? Math.round((entry.downloads / entry.generations) * 1000) / 10
          : 0;
    }

    // By prompt source
    const byPromptSource: Record<
      string,
      { generations: number; downloads: number; rate: number }
    > = {};
    for (const log of logs) {
      if (!byPromptSource[log.promptSource]) {
        byPromptSource[log.promptSource] = {
          generations: 0,
          downloads: 0,
          rate: 0,
        };
      }
      byPromptSource[log.promptSource].generations += 1;
      if (log.downloaded) {
        byPromptSource[log.promptSource].downloads += 1;
      }
    }
    for (const key of Object.keys(byPromptSource)) {
      const entry = byPromptSource[key];
      entry.rate =
        entry.generations > 0
          ? Math.round((entry.downloads / entry.generations) * 1000) / 10
          : 0;
    }

    return NextResponse.json({
      period: {
        from: from.toISOString(),
        to: to.toISOString(),
      },
      summary: {
        totalGenerations,
        totalDownloads,
        downloadRate,
        byTool,
        byPromptSource,
      },
      logs: logs.slice(0, 100).map((log) => ({
        id: log.id,
        userId: log.userId,
        tool: log.tool,
        prompt: log.prompt,
        promptSource: log.promptSource,
        downloaded: log.downloaded,
        downloadedAt: log.downloadedAt?.toISOString() ?? null,
        meta: log.meta,
        createdAt: log.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Generations API error:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Fehler beim Laden der Generierungsdaten",
      },
      { status: 500 }
    );
  }
}
