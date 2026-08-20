/**
 * Persistent failure memory contract + atomic JSON adapter.
 *
 * The adapter is intentionally opt-in. Production serverless deployments must
 * provide a durable store (for example Drizzle/PostgreSQL) rather than relying
 * on the local filesystem.
 */

import { mkdirSync, readFileSync, randomUUID, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { IncidentFingerprint, IncidentResolutionStatus } from "./failureCorrelation";

export interface FailureMemoryRecord extends IncidentFingerprint {
  schemaVersion: 1;
}

export interface FailureMemoryStore {
  get(id: string): FailureMemoryRecord | undefined;
  upsert(record: FailureMemoryRecord): FailureMemoryRecord;
  updateResolution(id: string, status: IncidentResolutionStatus, resolution?: string): FailureMemoryRecord | undefined;
  recent(limit?: number): FailureMemoryRecord[];
}

function sanitizeRecord(record: IncidentFingerprint): FailureMemoryRecord {
  return {
    schemaVersion: 1,
    ...record,
    rootCause: record.rootCause.slice(0, 160),
    aiProvider: record.aiProvider?.slice(0, 80),
    previousResolution: record.previousResolution?.slice(0, 500),
    metadata: {
      taskId: record.metadata.taskId?.slice(0, 80),
      model: record.metadata.model?.slice(0, 120),
      attempt: record.metadata.attempt,
      toolContextEnabled: record.metadata.toolContextEnabled,
    },
  };
}

function readStore(file: string): FailureMemoryRecord[] {
  try {
    const parsed = JSON.parse(readFileSync(file, "utf8"));
    return Array.isArray(parsed?.records) ? parsed.records : [];
  } catch {
    return [];
  }
}

function atomicWrite(file: string, records: FailureMemoryRecord[]): void {
  mkdirSync(dirname(file), { recursive: true });
  const temp = `${file}.${process.pid}.${randomUUID()}.tmp`;
  try {
    writeFileSync(
      temp,
      JSON.stringify({ schemaVersion: 1, records }, null, 2) + "\n",
      { encoding: "utf8", flag: "wx" },
    );
    renameSync(temp, file);
  } finally {
    try {
      unlinkSync(temp);
    } catch {
      // renameSync already moved the file; nothing else to do.
    }
  }
}

export class JsonFailureMemoryStore implements FailureMemoryStore {
  private readonly file: string;
  private readonly maxRecords: number;

  constructor(file: string, maxRecords = 500) {
    this.file = resolve(file);
    this.maxRecords = Math.max(1, maxRecords);
  }

  get(id: string): FailureMemoryRecord | undefined {
    return readStore(this.file).find((record) => record.id === id);
  }

  upsert(record: FailureMemoryRecord): FailureMemoryRecord {
    const records = readStore(this.file);
    const normalized = sanitizeRecord(record);
    const index = records.findIndex((entry) => entry.id === normalized.id);
    if (index >= 0) records[index] = normalized;
    else records.push(normalized);
    records.sort((a, b) => b.lastSeen.localeCompare(a.lastSeen));
    atomicWrite(this.file, records.slice(0, this.maxRecords));
    return normalized;
  }

  updateResolution(
    id: string,
    status: IncidentResolutionStatus,
    resolution?: string,
  ): FailureMemoryRecord | undefined {
    const records = readStore(this.file);
    const index = records.findIndex((entry) => entry.id === id);
    if (index < 0) return undefined;
    records[index] = sanitizeRecord({
      ...records[index],
      resolutionStatus: status,
      ...(resolution ? { previousResolution: resolution } : {}),
    });
    atomicWrite(this.file, records.slice(0, this.maxRecords));
    return records[index];
  }

  recent(limit = 20): FailureMemoryRecord[] {
    return readStore(this.file)
      .sort((a, b) => b.lastSeen.localeCompare(a.lastSeen))
      .slice(0, Math.max(1, limit));
  }
}

export function createConfiguredFailureMemory(): FailureMemoryStore | undefined {
  const file = process.env.FLIXO_FAILURE_MEMORY_PATH?.trim();
  if (!file) return undefined;
  const max = Number(process.env.FLIXO_FAILURE_MEMORY_MAX_RECORDS ?? 500);
  return new JsonFailureMemoryStore(file, Number.isFinite(max) ? max : 500);
}
