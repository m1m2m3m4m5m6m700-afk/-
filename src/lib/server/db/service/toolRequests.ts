/**
 * Tool request service — SERVER-ONLY.
 *
 * Persists tool requests to the `tool_requests` table and lists them for the
 * admin surface. No fabricated requests are ever returned — an empty table
 * yields an empty list.
 */

import { desc, eq } from "drizzle-orm";
import { getDb } from "../client";
import { toolRequests } from "../schema";
import type { ToolRequestDTO } from "../types";
import { DbServiceError } from "./conversations";

export interface CreateToolRequestInput {
  toolName: string;
  description: string;
  requester: string;
}

export async function createToolRequest(input: CreateToolRequestInput): Promise<ToolRequestDTO> {
  if (!input.toolName || input.toolName.trim().length === 0) {
    throw new DbServiceError("validation", "Tool name is required.");
  }
  if (!input.requester || input.requester.trim().length === 0) {
    throw new DbServiceError("validation", "Requester is required.");
  }
  const db = getDb();
  const [created] = await db
    .insert(toolRequests)
    .values({
      toolName: input.toolName.trim(),
      description: input.description?.trim() ?? "",
      requester: input.requester.trim(),
      status: "pending",
    })
    .returning();
  if (!created) throw new DbServiceError("db_error", "Failed to create tool request.");
  return toDTO(created);
}

export async function listToolRequests(): Promise<ToolRequestDTO[]> {
  const db = getDb();
  const rows = await db.select().from(toolRequests).orderBy(desc(toolRequests.createdAt));
  return rows.map(toDTO);
}

export async function updateToolRequestStatus(id: string, status: string): Promise<ToolRequestDTO> {
  const db = getDb();
  const [updated] = await db
    .update(toolRequests)
    .set({ status: status as (typeof toolRequests.$inferSelect)["status"] })
    .where(eq(toolRequests.id, id))
    .returning();
  if (!updated) throw new DbServiceError("not_found", "Tool request not found.");
  return toDTO(updated);
}

function toDTO(r: typeof toolRequests.$inferSelect): ToolRequestDTO {
  return {
    id: r.id,
    toolName: r.toolName,
    description: r.description,
    requester: r.requester,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
  };
}
