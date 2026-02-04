import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/lib/stack";
import { isAdmin, type UserServerMetadata } from "@/lib/permissions";
import { prisma } from "@/lib/db";

/**
 * GET /api/usage?from=2025-01-01&to=2025-02-01&userId=xxx
 * Admin-only endpoint: returns usage data grouped by user and operation.
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
    const userIdParam = searchParams.get("userId");

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
    if (userIdParam) {
      where.userId = userIdParam;
    }

    // Fetch raw usage logs
    const logs = await prisma.usageLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // Aggregate by user
    const userSummary: Record<
      string,
      {
        userEmail: string;
        totalCostEur: number;
        totalCalls: number;
        operations: Record<string, { count: number; costEur: number }>;
      }
    > = {};

    for (const log of logs) {
      if (!userSummary[log.userId]) {
        userSummary[log.userId] = {
          userEmail: log.userEmail,
          totalCostEur: 0,
          totalCalls: 0,
          operations: {},
        };
      }
      const entry = userSummary[log.userId];
      entry.totalCostEur += log.costEur;
      entry.totalCalls += 1;

      if (!entry.operations[log.operation]) {
        entry.operations[log.operation] = { count: 0, costEur: 0 };
      }
      entry.operations[log.operation].count += 1;
      entry.operations[log.operation].costEur += log.costEur;
    }

    // Calculate totals
    const grandTotalEur = Object.values(userSummary).reduce(
      (sum, u) => sum + u.totalCostEur,
      0
    );
    const grandTotalCalls = Object.values(userSummary).reduce(
      (sum, u) => sum + u.totalCalls,
      0
    );

    return NextResponse.json({
      period: {
        from: from.toISOString(),
        to: to.toISOString(),
      },
      grandTotalEur: Math.round(grandTotalEur * 1000) / 1000,
      grandTotalCalls,
      users: Object.entries(userSummary).map(([userId, data]) => ({
        userId,
        userEmail: data.userEmail,
        totalCostEur: Math.round(data.totalCostEur * 1000) / 1000,
        totalCalls: data.totalCalls,
        operations: Object.entries(data.operations).map(([op, d]) => ({
          operation: op,
          count: d.count,
          costEur: Math.round(d.costEur * 1000) / 1000,
        })),
      })),
      recentLogs: logs.slice(0, 50).map((log) => ({
        id: log.id,
        userEmail: log.userEmail,
        operation: log.operation,
        costEur: log.costEur,
        model: log.model,
        createdAt: log.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Usage API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Fehler beim Laden der Verbrauchsdaten" },
      { status: 500 }
    );
  }
}
