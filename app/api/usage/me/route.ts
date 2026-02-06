import { NextResponse } from "next/server";
import { stackServerApp } from "@/lib/stack";
import { prisma } from "@/lib/db";

/**
 * GET /api/usage/me
 * Returns the current user's own usage data, grouped by day.
 * No admin check — every logged-in user can see their own usage.
 */
export async function GET() {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Nicht angemeldet" },
        { status: 401 }
      );
    }

    // Fetch all usage logs for this user (last 90 days)
    const since = new Date();
    since.setDate(since.getDate() - 90);

    const logs = await prisma.usageLog.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: since },
      },
      orderBy: { createdAt: "desc" },
    });

    // Group by day
    const dailyMap: Record<string, { date: string; costEur: number; calls: number }> = {};

    let totalCostEur = 0;
    let totalCalls = 0;

    for (const log of logs) {
      const day = log.createdAt.toISOString().split("T")[0]; // YYYY-MM-DD
      if (!dailyMap[day]) {
        dailyMap[day] = { date: day, costEur: 0, calls: 0 };
      }
      dailyMap[day].costEur += log.costEur;
      dailyMap[day].calls += 1;
      totalCostEur += log.costEur;
      totalCalls += 1;
    }

    // Sort days descending (most recent first)
    const days = Object.values(dailyMap).sort(
      (a, b) => b.date.localeCompare(a.date)
    );

    return NextResponse.json({
      totalCostEur: Math.round(totalCostEur * 1000) / 1000,
      totalCalls,
      days,
    });
  } catch (error) {
    console.error("Usage/me API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Fehler beim Laden" },
      { status: 500 }
    );
  }
}
