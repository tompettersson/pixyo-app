import { prisma } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";

/**
 * Log an AI API usage event. Fire-and-forget: errors are logged but don't block.
 */
export function logUsage(params: {
  userId: string;
  userEmail: string;
  operation: string;
  costEur: number;
  model: string;
  meta?: Prisma.InputJsonValue;
}): void {
  // Fire-and-forget – don't await
  prisma.usageLog
    .create({
      data: {
        userId: params.userId,
        userEmail: params.userEmail,
        operation: params.operation,
        costEur: params.costEur,
        model: params.model,
        meta: params.meta ?? undefined,
      },
    })
    .catch((err) => {
      console.error("Failed to log usage:", err);
    });
}
